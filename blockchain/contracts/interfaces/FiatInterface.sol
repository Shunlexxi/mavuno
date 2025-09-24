// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/// @title FiatInterface
interface FiatInterface {
    function underlying() external view returns (address);

    function decimals() external view returns (int32);
}
