// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {HederaTokenService} from "./hts-precompile/HederaTokenService.sol";
import {FiatInterface} from "./interfaces/FiatInterface.sol";
import {OracleInterface} from "./interfaces/OracleInterface.sol";
import {FarmerRegistryInterface} from "./interfaces/FarmerRegistryInterface.sol";
import {PledgeManagerInterface} from "./interfaces/PledgeManagerInterface.sol";
import {HederaResponseCodes} from "./hts-precompile/HederaResponseCodes.sol";

/// @title LendingPool
/// @notice Single pool for a fiat HTS token (NGN, CEDI, RAND). Supplies/borrows are in the fiat token (HTS ERC20-wrapped).
/// Collateral is pledged in native HBAR (via PledgeManager). Oracle converts between HBAR wei and fiat smallest units.
contract LendingPool is ReentrancyGuard, Ownable {
    OracleInterface public oracle;
    FiatInterface public fiat; // HTS wrapped contract representing fiat
    FarmerRegistryInterface public registry;

    int64 public totalSupplied; // tokens supplied by LPs (in token smallest unit)
    int64 public totalBorrowed; // tokens currently lent out (sum of principals)

    // LP -> supplied token amount
    mapping(address => int64) public supplied;

    // Borrower single position (no multiple loan structs)
    // principal is in fiat smallest units
    mapping(address => int64) public farmerPrincipal;
    // timestamp when the farmer's current position started (or last principal update)
    mapping(address => uint256) public farmerBorrowedAt;

    /// @dev loan-to-value ratio expressed in basis points (e.g., 7000 = 70.00% LTV)
    int64 public loanToValueBp = 7_000;

    /// @dev pool interest rate applied to farmer positions (bps per year)
    int64 public borrowRateBp = 800; // 8.00% p.a.

    event Supplied(address indexed lp, int64 amount);
    event WithdrawnSupply(address indexed lp, int64 amount);
    event Borrowed(address indexed farmer, int64 amount, int64 newPrincipal);
    event Repaid(
        address indexed farmer,
        int64 amount,
        int64 remainingPrincipal,
        int64 interestPaid
    );

    int64 public constant MAX_BPS = 10_000;
    int64 public constant LIQUIDATION_BPS = 9_600; // 96.00%

    constructor(
        address _pledgeManager,
        address _oracle,
        address _fiat
    ) Ownable(_pledgeManager) {
        require(_pledgeManager != address(0), "zero-pledge-manager");
        require(_oracle != address(0), "zero-oracle");
        require(_fiat != address(0), "zero-fiat");

        oracle = OracleInterface(_oracle);
        fiat = FiatInterface(_fiat);

        fiat.associateToken(address(this));
    }

    /* ========== LP (liquidity provider) functions ========== */

    /// @notice LP supplies fiat HTS tokens to the pool. Caller must `approve` the pool beforehand.
    function supply(int64 amount) external nonReentrant {
        require(amount > 0, "supply-zero");
        // transfer tokens into pool
        fiat.transferToken(msg.sender, address(this), amount);
        supplied[msg.sender] += amount;
        totalSupplied += amount;
        emit Supplied(msg.sender, amount);
    }

    /// @notice LP withdraws supplied fiat tokens if pool has free liquidity (not lent out).
    function withdrawSupply(int64 amount) external nonReentrant {
        require(supplied[msg.sender] >= amount, "insufficient-supplied");
        int64 freeLiquidity = totalSupplied - totalBorrowed;
        require(freeLiquidity >= amount, "insufficient-free-liquidity");

        supplied[msg.sender] -= amount;
        totalSupplied -= amount;

        fiat.transferToken(address(this), msg.sender, amount);

        emit WithdrawnSupply(msg.sender, amount);
    }

    /* ========== Borrowing / Repayment (farmer flows) ========== */

    /// @notice Returns accrued interest (in fiat smallest units) for a given principal and timestamp.
    function _accruedInterest(
        int64 principal,
        uint256 fromTimestamp
    ) internal view returns (int64) {
        if (principal <= 0) return int64(0);
        uint256 duration = block.timestamp - fromTimestamp; // seconds
        if (duration == 0) return int64(0);
        // interest = principal * rateBp * durationSec / (365 days * MAX_BPS)
        uint256 p = uint256(uint64(principal));
        uint256 numer = p * uint256(uint64(borrowRateBp)) * duration;
        uint256 denom = 365 days * uint256(uint64(MAX_BPS));
        uint256 interest = numer / denom;
        require(interest <= type(uint64).max, "interest-overflow");
        return int64(uint64(interest));
    }

    /// @notice Compute outstanding (principal + accrued interest) for farmer.
    function outstanding(address farmer) public view returns (int64) {
        int64 principal = farmerPrincipal[farmer];
        if (principal <= 0) return int64(0);
        int64 interest = _accruedInterest(principal, farmerBorrowedAt[farmer]);
        // safe to add because interest is derived from principal and limited
        return principal + interest;
    }

    /// @notice Borrow fiat tokens. Borrow amount specified in fiat token smallest units (e.g., kobo).
    /// Borrowable amount = loanToValue * pledgedFiat - outstanding (principal + accrued interest)
    function borrow(int64 amount) external nonReentrant returns (bool) {
        require(amount > 0, "zero-amount");

        // Ensure pool has enough token liquidity
        int64 freeLiquidity = totalSupplied - totalBorrowed;
        require(freeLiquidity >= amount, "insufficient-pool-liquidity");

        address pledgeManager = registry.getManager(msg.sender);
        require(pledgeManager != address(0), "invalid-pledge-manager");

        require(
            address(this) == PledgeManagerInterface(pledgeManager).pool(),
            "unpledged-pool"
        );

        // Get total pledged HBAR wei for farmer
        uint256 totalPledged = PledgeManagerInterface(pledgeManager)
            .totalSupply();
        require(totalPledged > 0, "no-pledge");

        uint256 fiatPerHbar = oracle.fiatPerHbar(address(fiat));
        require(fiatPerHbar > 0, "oracle-zero");

        // pledgedFiat = pledged * fiatPerHbar
        uint256 pledgedFiat = (totalPledged * fiatPerHbar) /
            uint256(uint64(MAX_BPS));
        require(pledgedFiat > 0, "pledged-fiat-zero");

        // max borrow allowed by LTV
        uint256 maxBorrowable = (pledgedFiat * uint256(uint64(loanToValueBp))) /
            uint256(uint64(MAX_BPS));

        // outstanding owed by farmer (principal + accrued interest)
        int64 out = outstanding(msg.sender);
        uint256 outstandingUint = uint256(uint64(out));

        // compute remaining borrow capacity (in fiat smallest units)
        if (outstandingUint >= maxBorrowable) {
            revert("no-borrow-capacity");
        }
        uint256 remainingCapacity = maxBorrowable - outstandingUint;
        require(
            uint256(uint64(amount)) <= remainingCapacity,
            "exceeds-borrow-capacity"
        );

        // Now update farmer position: consolidate accrued interest into principal, then add new amount
        int64 prevPrincipal = farmerPrincipal[msg.sender];
        int64 accrued = _accruedInterest(
            prevPrincipal,
            farmerBorrowedAt[msg.sender]
        );

        // new principal = previous principal + accrued + amount
        // cast to uint256 for arithmetic then back to int64
        uint256 newPrincipalU256 = uint256(uint64(prevPrincipal)) +
            uint256(uint64(accrued)) +
            uint256(uint64(amount));
        require(newPrincipalU256 <= type(uint64).max, "principal-overflow");
        int64 newPrincipal = int64(uint64(newPrincipalU256));

        farmerPrincipal[msg.sender] = newPrincipal;
        farmerBorrowedAt[msg.sender] = block.timestamp;

        // update pool totals: only increase by borrowed amount (interest is not newly minted)
        totalBorrowed += amount;

        // transfer fiat tokens to farmer
        fiat.transferToken(address(this), msg.sender, amount);

        emit Borrowed(msg.sender, amount, newPrincipal);
        return true;
    }

    /// @notice Repay loan in fiat tokens. Borrower must `approve` the pool and call this with `amount` to repay.
    /// Partial repay allowed. Payments are applied to interest first, then principal.
    function repay(
        int64 amount
    ) external nonReentrant returns (int64 remainingPrincipal) {
        require(amount > 0, "zero-amount");

        int64 principal = farmerPrincipal[msg.sender];
        require(principal > 0, "no-outstanding-loan");

        // compute accrued interest since farmerBorrowedAt
        int64 interest = _accruedInterest(
            principal,
            farmerBorrowedAt[msg.sender]
        );

        // transfer tokens from caller to pool (must approve)
        fiat.transferToken(msg.sender, address(this), amount);

        uint256 pay = uint256(uint64(amount));

        // First, pay interest
        if (pay <= uint256(uint64(interest))) {
            // payment covers part or all of interest; principal unchanged, update borrowedAt to now (accrual restarts)
            uint256 outstandingBefore = uint256(uint64(principal)) +
                uint256(uint64(interest));
            uint256 outstandingAfter = outstandingBefore - pay;
            require(outstandingAfter <= type(uint64).max, "overflow-after-pay");
            int64 newPrincipal = int64(uint64(outstandingAfter));

            farmerPrincipal[msg.sender] = newPrincipal;
            farmerBorrowedAt[msg.sender] = block.timestamp;

            // totalBorrowed should be reduced by the principal portion paid
            emit Repaid(msg.sender, amount, newPrincipal, int64(uint64(pay)));
            return newPrincipal;
        } else {
            // pay covers full interest and some principal
            uint256 payLeft = pay - uint256(uint64(interest)); // amount to reduce principal
            // convert principal to uint256
            uint256 principalU = uint256(uint64(principal));
            if (payLeft >= principalU) {
                // full repay
                // reduce totalBorrowed by principal
                totalBorrowed -= principal;
                farmerPrincipal[msg.sender] = int64(0);
                farmerBorrowedAt[msg.sender] = 0;
                emit Repaid(msg.sender, amount, 0, interest);
                return 0;
            } else {
                // partial principal repay
                uint256 newPrincipalU = principalU - payLeft;
                require(
                    newPrincipalU <= type(uint64).max,
                    "overflow-new-principal"
                );
                int64 newPrincipal = int64(uint64(newPrincipalU));
                farmerPrincipal[msg.sender] = newPrincipal;
                farmerBorrowedAt[msg.sender] = block.timestamp;

                // reduce totalBorrowed by principal portion repaid
                // principal portion repaid = payLeft
                int64 principalRepaid = int64(uint64(payLeft));
                totalBorrowed -= principalRepaid;

                emit Repaid(msg.sender, amount, newPrincipal, interest);
                return newPrincipal;
            }
        }
    }

    function _computeLtv(address farmer) internal view returns (uint256) {
        int64 debt = outstanding(farmer);
        if (debt <= 0) return 0;

        address pledgeManager = registry.getManager(farmer);
        if (pledgeManager == address(0)) return 0;

        uint256 pledgedHbar = PledgeManagerInterface(pledgeManager)
            .totalSupply();
        if (pledgedHbar == 0) return type(uint256).max; // no collateral → infinite LTV

        uint256 fiatPerHbar = oracle.fiatPerHbar(address(fiat));
        require(fiatPerHbar > 0, "oracle-zero");

        uint256 collateralValueFiat = pledgedHbar * fiatPerHbar;

        return uint256((uint64(debt) * uint64(MAX_BPS))) / collateralValueFiat;
    }

    function checkAndLiquidate(address farmer) external nonReentrant {
        uint256 ltvBps = _computeLtv(farmer);
        require(ltvBps >= 9_600, "ltv-below-threshold");

        int64 debt = outstanding(farmer);
        require(debt > 0, "no-debt");

        address pledgeManager = registry.getManager(farmer);
        require(pledgeManager != address(0), "invalid-pledge-manager");

        fiat.transferToken(msg.sender, address(this), debt);

        farmerPrincipal[farmer] = 0;
        farmerBorrowedAt[farmer] = 0;
        totalBorrowed -= debt;

        PledgeManagerInterface(pledgeManager).liquidate(msg.sender);

        emit Repaid(farmer, debt, 0, 0);
    }

    /* ========== Admin / Gov ========== */

    /// @notice Admin (owner) can set oracle
    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "zero-address");
        oracle = OracleInterface(_oracle);
    }

    /// @notice Admin set loan-to-value (bps). e.g., 7000 = 70%
    function setLoanToValueBp(int64 bps) external onlyOwner {
        require(bps > 0 && bps <= int64(MAX_BPS), "invalid-bps");
        loanToValueBp = bps;
    }

    /// @notice Admin set pool interest rate (bps per year)
    function setBorrowRateBp(int64 bps) external onlyOwner {
        require(bps >= 0 && bps <= MAX_BPS, "invalid-rate"); // allow reasonable rates
        borrowRateBp = bps;
    }

    /// @notice View free token liquidity
    function idleLiquidity() external view returns (int64) {
        return totalSupplied - totalBorrowed;
    }

    /* ========== Safety / receive ========== */

    // allow contract to receive native HBAR if needed (e.g., future features)
    receive() external payable {}
}
