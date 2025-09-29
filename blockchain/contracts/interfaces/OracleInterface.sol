// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/// @title OracleInterface
/// @notice Simple oracle interface for HBAR <-> fiat (smallest units) price quotations
interface OracleInterface {
    event PriceUpdated(
        address indexed fiat,
        uint256 newPrice,
        uint256 timestamp
    );

    /// @notice returns how many fiat smallest units (e.g., kobo) one hbar wei (1e-18 hbar) equals.
    function fiatPerHbar(address fiat) external view returns (uint256);
}
