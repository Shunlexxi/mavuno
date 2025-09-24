// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

library InterestLib {
    error InterestOverflow();
    error InvalidDuration();

    /// @notice Returns accrued interest (in fiat smallest units) for a given principal and timestamp.
    function accruedInterest(
        int64 principal,
        uint256 fromTimestamp,
        int64 borrowRateBp,
        int64 bps
    ) internal view returns (int64 interest) {
        if (principal <= 0) return int64(0);
        if (fromTimestamp > block.timestamp) revert InvalidDuration();

        uint256 duration = block.timestamp - fromTimestamp; // seconds
        if (duration == 0) return int64(0);

        // interest = principal * rateBp * durationSec / (365 days * MAX_BPS)
        uint256 p = uint256(uint64(principal));
        uint256 numer = p * uint256(uint64(borrowRateBp)) * duration;
        uint256 denom = 365 days * uint256(uint64(bps));
        uint256 interestUint = numer / denom;

        if (interestUint > type(uint64).max) revert InterestOverflow();
        return int64(uint64(interestUint));
    }

    function mulDiv(
        uint256 x,
        uint256 y,
        uint256 denominator
    ) internal pure returns (uint256 result) {
        return (x * y) / denominator;
    }
}
