// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {OracleInterface} from "./interfaces/OracleInterface.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Oracle
contract Oracle is OracleInterface, Ownable {
    mapping(address => uint256) public _prices;

    event PriceUpdated(
        address indexed fiat,
        uint256 newPrice,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    function fiatPerHbar(address fiat) external view returns (uint256) {
        return _prices[fiat];
    }

    function setfiatPerHbar(address fiat, uint256 hbar) external onlyOwner {
        _prices[fiat] = hbar;
        emit PriceUpdated(fiat, hbar, block.timestamp);
    }
}
