// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/// @title FiatInterface
interface FiatInterface {
    event TokenCreated(address indexed tokenAddress);
    event TokensMinted(address indexed to, int64 amount);
    event TokensBurned(address indexed from, int64 amount);

    function underlying() external view returns (address);

    function decimals() external view returns (int32);

    function mint(address to, int64 amount) external;

    function burn(address from, int64 amount) external;
}
