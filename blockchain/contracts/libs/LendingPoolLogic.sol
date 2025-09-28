// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {OracleInterface} from "../interfaces/OracleInterface.sol";
import {FiatInterface} from "../interfaces/FiatInterface.sol";
import {FarmerRegistryInterface} from "../interfaces/FarmerRegistryInterface.sol";
import {PledgeManagerInterface} from "../interfaces/PledgeManagerInterface.sol";
import {InterestLib} from "../libs/InterestLib.sol";

library LendingPoolLogic {
    error ZeroAmount();
    error ZeroAccount();
    error InsufficientLiquidity();
    error NoLPSupply();
    error InsufficientLPBalance();
    error InvalidPledgeManager();
    error UnpledgedPool();
    error OracleZero();
    error NoBorrowCapacity();
    error ExceedsBorrowCapacity();
    error PrincipalOverflow();
    error NoOutstandingLoan();
    error OverflowAfterPay();
    error OverflowNewPrincipal();
    error LTVBelowThreshold();
    error NoDebt();
    error InDebt();
    error ZeroAddress();

    struct BorrowerPosition {
        int64 principal;
        uint256 borrowedAt;
    }

    struct PoolState {
        int64 totalSupplied;
        int64 totalBorrowed;
        int64 loanToValueBp;
        int64 borrowRateBp;
        int64 MAX_BPS;
        int64 LIQUIDATION_BPS;
    }

    function calculateLPTokens(
        int64 amount,
        uint256 lpTotalSupply,
        int64 totalSupplied
    ) internal pure returns (uint256 minted) {
        if (amount <= 0) revert ZeroAmount();

        uint256 underlyingPool = uint256(uint64(totalSupplied));
        uint256 amountUint = uint256(uint64(amount));

        if (underlyingPool == 0 || lpTotalSupply == 0) {
            minted = amountUint;
        } else {
            minted = (amountUint * lpTotalSupply) / underlyingPool;
            if (minted == 0) revert ZeroAmount();
        }
    }

    function calculateWithdrawal(
        int64 amount,
        uint256 lpTotalSupply,
        int64 totalSupplied,
        int64 totalBorrowed
    ) internal pure returns (uint256 lpToBurn) {
        if (amount <= 0) revert ZeroAmount();

        int64 freeLiquidity = totalSupplied - totalBorrowed;
        if (freeLiquidity < amount) revert InsufficientLiquidity();

        if (lpTotalSupply == 0) revert NoLPSupply();

        uint256 denominator = uint256(uint64(totalSupplied));
        if (denominator == 0) revert ZeroAmount();

        lpToBurn = (uint256(uint64(amount)) * lpTotalSupply) / denominator;
        if (lpToBurn == 0) revert ZeroAmount();
    }

    function calculateWithdrawalLP(
        uint256 lpAmount,
        uint256 lpTotalSupply,
        int64 totalSupplied
    ) internal pure returns (uint256 amount) {
        if (lpAmount <= 0) revert ZeroAmount();
        if (lpTotalSupply == 0) revert NoLPSupply();

        uint256 numerator = lpAmount * uint256(uint64(totalSupplied));
        amount = numerator / lpTotalSupply;

        if (amount == 0) revert ZeroAmount();
    }

    function calculateBorrowable(
        address farmer,
        FarmerRegistryInterface registry,
        OracleInterface oracle,
        FiatInterface fiat,
        int64 loanToValueBp,
        int64 MAX_BPS
    ) internal view returns (uint256) {
        address pledgeManager = registry.getManager(farmer);
        if (pledgeManager == address(0)) revert InvalidPledgeManager();

        if (!PledgeManagerInterface(pledgeManager).active()) return 0;

        uint256 totalPledged = PledgeManagerInterface(pledgeManager)
            .totalSupply();
        if (totalPledged == 0) return 0;

        uint256 fiatPerHbar = oracle.fiatPerHbar(address(fiat));
        if (fiatPerHbar == 0) return 0;

        uint256 pledgedFiat = (totalPledged * fiatPerHbar) /
            uint256(uint64(MAX_BPS));
        if (pledgedFiat == 0) return 0;

        return
            (pledgedFiat * uint256(uint64(loanToValueBp))) /
            uint256(uint64(MAX_BPS));
    }

    function validateBorrow(
        int64 amount,
        int64 totalSupplied,
        int64 totalBorrowed,
        uint256 maxBorrowable,
        int64 outstandingDebt
    ) internal pure {
        if (amount <= 0) revert ZeroAmount();

        int64 freeLiquidity = totalSupplied - totalBorrowed;
        if (freeLiquidity < amount) revert InsufficientLiquidity();

        if (maxBorrowable == 0) revert NoBorrowCapacity();

        uint256 outstandingUint = uint256(uint64(outstandingDebt));
        if (outstandingUint >= maxBorrowable) revert NoBorrowCapacity();

        uint256 remainingCapacity = maxBorrowable - outstandingUint;
        if (uint256(uint64(amount)) > remainingCapacity)
            revert ExceedsBorrowCapacity();
    }

    function updateBorrowerPosition(
        BorrowerPosition storage position,
        int64 amount,
        int64 borrowRateBp,
        int64 MAX_BPS
    ) internal returns (int64 newPrincipal) {
        int64 accrued = InterestLib.accruedInterest(
            position.principal,
            position.borrowedAt,
            borrowRateBp,
            MAX_BPS
        );

        uint256 newPrincipalU256 = uint256(uint64(position.principal)) +
            uint256(uint64(accrued)) +
            uint256(uint64(amount));

        if (newPrincipalU256 > type(uint64).max) revert PrincipalOverflow();

        newPrincipal = int64(uint64(newPrincipalU256));
        position.principal = newPrincipal;
        position.borrowedAt = block.timestamp;
    }

    function processRepayment(
        BorrowerPosition storage position,
        int64 amount,
        int64 borrowRateBp,
        int64 MAX_BPS
    )
        internal
        returns (
            int64 remainingPrincipal,
            int64 interestPaid,
            int64 principalRepaid
        )
    {
        if (amount <= 0) revert ZeroAmount();
        if (position.principal <= 0) revert NoOutstandingLoan();

        // compute interest owed (non-negative)
        int64 interest = InterestLib.accruedInterest(
            position.principal,
            position.borrowedAt,
            borrowRateBp,
            MAX_BPS
        );

        uint256 pay = uint256(uint64(amount));
        uint256 interestUint = uint256(uint64(interest));
        uint256 principalUint = uint256(uint64(position.principal));

        if (pay <= interestUint) {
            // payment covers partial or all interest only
            // principal remains unchanged (but borrowedAt updated)
            interestPaid = int64(uint64(pay));
            remainingPrincipal = position.principal; // principal unchanged
            principalRepaid = 0;
            position.borrowedAt = block.timestamp;
        } else {
            // pay covers interest and some principal
            interestPaid = int64(uint64(interestUint));
            uint256 payLeft = pay - interestUint;

            if (payLeft >= principalUint) {
                // full principal repaid
                principalRepaid = int64(uint64(principalUint));
                remainingPrincipal = 0;
                position.principal = 0;
                position.borrowedAt = 0;
            } else {
                // partial principal repaid
                uint256 newPrincipalU = principalUint - payLeft;
                if (newPrincipalU > type(uint64).max)
                    revert OverflowNewPrincipal();
                remainingPrincipal = int64(uint64(newPrincipalU));
                position.principal = remainingPrincipal;
                position.borrowedAt = block.timestamp;
                principalRepaid = int64(uint64(payLeft));
            }
        }
    }

    function calculateLtvBps(
        address farmer,
        BorrowerPosition storage position,
        FarmerRegistryInterface registry,
        OracleInterface oracle,
        FiatInterface fiat,
        int64 borrowRateBp,
        int64 MAX_BPS
    ) internal view returns (uint256) {
        int64 debt = position.principal > 0
            ? position.principal +
                InterestLib.accruedInterest(
                    position.principal,
                    position.borrowedAt,
                    borrowRateBp,
                    MAX_BPS
                )
            : int64(0);

        if (debt <= 0) return type(uint256).max;

        address pledgeManager = registry.getManager(farmer);
        if (pledgeManager == address(0)) return 0;

        uint256 totalPledged = PledgeManagerInterface(pledgeManager)
            .totalSupply();
        if (totalPledged == 0) return type(uint256).max;

        uint256 fiatPerHbar = oracle.fiatPerHbar(address(fiat));
        if (fiatPerHbar == 0) revert OracleZero();

        uint256 collateralValueFiat = (totalPledged * fiatPerHbar) /
            uint256(uint64(MAX_BPS));
        if (collateralValueFiat == 0) return type(uint256).max;

        return
            (uint256(uint64(debt)) * uint256(uint64(MAX_BPS))) /
            collateralValueFiat;
    }

    function validateLiquidation(
        address farmer,
        BorrowerPosition storage position,
        FarmerRegistryInterface registry,
        OracleInterface oracle,
        FiatInterface fiat,
        int64 LIQUIDATION_BPS,
        int64 borrowRateBp,
        int64 MAX_BPS
    ) internal view returns (int64 debt) {
        uint256 ltvBps = calculateLtvBps(
            farmer,
            position,
            registry,
            oracle,
            fiat,
            borrowRateBp,
            MAX_BPS
        );

        // Only liquidate if LTV exceeds (>=) liquidation threshold
        if (ltvBps < uint256(uint64(LIQUIDATION_BPS)))
            revert LTVBelowThreshold();

        // compute debt (principal + accrued interest at borrowRateBp)
        debt = position.principal > 0
            ? position.principal +
                InterestLib.accruedInterest(
                    position.principal,
                    position.borrowedAt,
                    borrowRateBp,
                    MAX_BPS
                )
            : int64(0);

        if (debt <= 0) revert NoDebt();

        address pledgeManager = registry.getManager(farmer);
        if (pledgeManager == address(0)) revert InvalidPledgeManager();
    }
}
