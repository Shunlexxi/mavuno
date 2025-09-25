// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {BasicHederaTokenService} from "./hts-precompile/BasicHederaTokenService.sol";
import {FiatInterface} from "./interfaces/FiatInterface.sol";
import {OracleInterface} from "./interfaces/OracleInterface.sol";
import {FarmerRegistryInterface} from "./interfaces/FarmerRegistryInterface.sol";
import {LendingPoolInterface} from "./interfaces/LendingPoolInterface.sol";
import {InterestLib} from "./libs/InterestLib.sol";
import {PledgeManagerInterface} from "./interfaces/PledgeManagerInterface.sol";
import {LendingPoolLogic} from "./libs/LendingPoolLogic.sol";
import {HederaResponseCodes} from "./hts-precompile/HederaResponseCodes.sol";

contract LendingPool is
    ReentrancyGuard,
    Ownable,
    BasicHederaTokenService,
    ERC20,
    LendingPoolInterface
{
    using LendingPoolLogic for LendingPoolLogic.PoolState;
    using LendingPoolLogic for LendingPoolLogic.BorrowerPosition;

    OracleInterface public oracle;
    FiatInterface public fiat;
    FarmerRegistryInterface public registry;

    int64 public totalSupplied;
    int64 public totalBorrowed;

    mapping(address => LendingPoolLogic.BorrowerPosition)
        public farmerPositions;

    int64 public loanToValueBp = 7_000;
    int64 public borrowRateBp = 800;
    int64 public constant MAX_BPS = 10_000;
    int64 public constant LIQUIDATION_BPS = 9_600;

    constructor(
        address _controller,
        address _oracle,
        address _fiat,
        address _registry
    ) Ownable(_controller) ERC20("LendingPool LP", "pLP") {
        if (
            _oracle == address(0) ||
            _fiat == address(0) ||
            _registry == address(0)
        ) {
            revert LendingPoolLogic.ZeroAddress();
        }

        oracle = OracleInterface(_oracle);
        fiat = FiatInterface(_fiat);
        registry = FarmerRegistryInterface(_registry);

        associateToken(address(this), fiat.underlying());
    }

    /* ========== LP Functions ========== */

    function supply(int64 amount, address behalfOf) external nonReentrant {
        if (amount <= 0) revert LendingPoolLogic.ZeroAmount();
        if (behalfOf == address(0)) revert LendingPoolLogic.ZeroAccount();

        uint256 minted = LendingPoolLogic.calculateLPTokens(
            amount,
            totalSupply(),
            totalSupplied
        );
        transferToken(fiat.underlying(), msg.sender, address(this), amount);

        totalSupplied += amount;
        _mint(behalfOf, minted);

        emit Supplied(behalfOf, amount, minted);
    }

    function withdrawSupply(int64 amount) external nonReentrant {
        uint256 lpToBurn = LendingPoolLogic.calculateWithdrawal(
            amount,
            totalSupply(),
            totalSupplied,
            totalBorrowed
        );

        if (balanceOf(msg.sender) < lpToBurn)
            revert LendingPoolLogic.InsufficientLPBalance();

        _burn(msg.sender, lpToBurn);
        totalSupplied -= amount;
        transferToken(fiat.underlying(), address(this), msg.sender, amount);

        emit WithdrawnSupply(msg.sender, amount, lpToBurn);
    }

    /* ========== Borrowing / Repayment ========== */

    function outstanding(address farmer) public view returns (int64) {
        LendingPoolLogic.BorrowerPosition storage position = farmerPositions[
            farmer
        ];
        if (position.principal <= 0) return int64(0);

        return
            position.principal +
            InterestLib.accruedInterest(
                position.principal,
                position.borrowedAt,
                borrowRateBp,
                MAX_BPS
            );
    }

    function borrow(int64 amount) external nonReentrant returns (bool) {
        uint256 maxBorrowable = borrowable(msg.sender);
        int64 currentOutstanding = outstanding(msg.sender);

        LendingPoolLogic.validateBorrow(
            amount,
            totalSupplied,
            totalBorrowed,
            maxBorrowable,
            currentOutstanding
        );

        int64 newPrincipal = farmerPositions[msg.sender].updateBorrowerPosition(
            amount,
            borrowRateBp,
            MAX_BPS
        );

        totalBorrowed += amount;
        transferToken(fiat.underlying(), address(this), msg.sender, amount);

        emit Borrowed(msg.sender, amount, newPrincipal);
        return true;
    }

    function borrowable(address farmer) public view returns (uint256) {
        return
            LendingPoolLogic.calculateBorrowable(
                farmer,
                registry,
                oracle,
                fiat,
                loanToValueBp,
                MAX_BPS
            );
    }

    function repay(
        int64 amount,
        address behalfOf
    ) external nonReentrant returns (int64) {
        LendingPoolLogic.BorrowerPosition storage position = farmerPositions[
            behalfOf
        ];
        int64 remainingPrincipal = position.processRepayment(
            amount,
            borrowRateBp,
            MAX_BPS,
            totalBorrowed
        );

        totalBorrowed -= amount;
        transferToken(fiat.underlying(), msg.sender, address(this), amount);
        emit Repaid(behalfOf, amount, remainingPrincipal, 0); // interest paid is calculated internally
        return remainingPrincipal;
    }

    function healthFactorLTV(address farmer) public view returns (uint256) {
        return
            LendingPoolLogic.calculateHealthFactor(
                farmer,
                farmerPositions[farmer],
                registry,
                oracle,
                fiat,
                borrowRateBp,
                MAX_BPS
            );
    }

    function liquidate(address farmer) external nonReentrant {
        LendingPoolLogic.BorrowerPosition storage position = farmerPositions[
            farmer
        ];
        int64 debt = LendingPoolLogic.validateLiquidation(
            farmer,
            position,
            registry,
            oracle,
            fiat,
            LIQUIDATION_BPS,
            borrowRateBp,
            MAX_BPS
        );

        transferToken(fiat.underlying(), msg.sender, address(this), debt);

        position.principal = 0;
        position.borrowedAt = 0;
        totalBorrowed -= debt;

        PledgeManagerInterface(registry.getManager(farmer)).liquidate(
            msg.sender
        );
        emit Repaid(farmer, debt, 0, 0);
    }

    function activatePledge() external {
        address pledgeManager = registry.getManager(msg.sender);
        if (pledgeManager == address(0))
            revert LendingPoolLogic.InvalidPledgeManager();
        PledgeManagerInterface(pledgeManager).setActive(true);
    }

    function deactivatePledge() external {
        if (outstanding(msg.sender) != 0) revert LendingPoolLogic.InDebt();

        address pledgeManager = registry.getManager(msg.sender);
        if (pledgeManager == address(0))
            revert LendingPoolLogic.InvalidPledgeManager();
        PledgeManagerInterface(pledgeManager).setActive(false);
    }

    /* ========== Admin Functions ========== */

    function setOracle(address _oracle) external onlyOwner {
        if (_oracle == address(0)) revert LendingPoolLogic.ZeroAddress();
        oracle = OracleInterface(_oracle);
    }

    function setLoanToValueBp(int64 bps) external onlyOwner {
        if (bps <= 0 || bps > MAX_BPS) revert LendingPoolLogic.ZeroAmount();
        loanToValueBp = bps;
    }

    function setBorrowRateBp(int64 bps) external onlyOwner {
        if (bps < 0 || bps > MAX_BPS) revert LendingPoolLogic.ZeroAmount();
        borrowRateBp = bps;
    }

    receive() external payable {}

    function decimals() public view override returns (uint8) {
        return uint8(int8(fiat.decimals()));
    }
}
