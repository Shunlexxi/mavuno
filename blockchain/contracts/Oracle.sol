// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {OracleInterface} from "./interfaces/OracleInterface.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Oracle
contract Oracle is OracleInterface, Ownable {
    mapping(address => uint256) public fiatPerHbar;

    constructor() Ownable(msg.sender) {}

    function setfiatPerHbar(address fiat, uint256 hbar) external onlyOwner {
        fiatPerHbar[fiat] = hbar;
        emit PriceUpdated(fiat, hbar, block.timestamp);
    }
}
