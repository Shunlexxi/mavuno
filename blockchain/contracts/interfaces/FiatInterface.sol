// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/// @title FiatInterface
interface FiatInterface {
    function underlying() external view returns (address);

    function associateToken(address account) external;

    function transferToken(address from, address to, int64 amount) external;
}
