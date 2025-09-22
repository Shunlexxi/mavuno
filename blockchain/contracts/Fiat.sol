// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./hts-precompile/HederaTokenService.sol";
import "./hts-precompile/IHederaTokenService.sol";
import "./hts-precompile/ExpiryHelper.sol";
import "./hts-precompile/KeyHelper.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {FiatInterface} from "./interfaces/FiatInterface.sol";

/// @title Fiat Contract
/// @notice Shows how to create and associate a token using HederaTokenService
contract Fiat is
    HederaTokenService,
    KeyHelper,
    ExpiryHelper,
    FiatInterface,
    Ownable
{
    address public underlying;
    int32 public decimals = 2;

    constructor() Ownable(msg.sender) {}

    /// @dev Creates a fungible token using HTS precompile
    function createUnderlying(
        string memory name,
        string memory symbol,
        int64 autoRenewPeriod
    ) external payable {
        require(underlying == address(0), "Token already created");

        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](1);

        // Set this contract as supply for the token
        keys[0] = getSingleKey(
            KeyType.SUPPLY,
            KeyValueType.CONTRACT_ID,
            address(this)
        );

        // Token details
        IHederaTokenService.HederaToken memory token;
        token.name = name;
        token.symbol = symbol;
        token.treasury = address(this); // contract holds treasury
        token.tokenSupplyType = true; // finite supply
        token.tokenKeys = keys;
        token.freezeDefault = false;
        token.expiry = createAutoRenewExpiry(address(this), autoRenewPeriod); // Contract auto-renews the token

        // Call HTS to create the token
        (int256 responseCode, address tokenAddress) = createFungibleToken(
            token,
            0,
            decimals
        );
        require(
            responseCode == HederaResponseCodes.SUCCESS,
            "Token creation failed"
        );

        underlying = tokenAddress;
    }

    // Associates a token to a user account
    function associateToken(address account) external {
        int256 responseCode = associateToken(account, underlying);
        require(
            responseCode == HederaResponseCodes.SUCCESS,
            "Association failed"
        );
    }

    // Transfers tokens from account to user
    function transferToken(address from, address to, int64 amount) external {
        int256 responseCode = transferToken(underlying, from, to, amount);
        require(responseCode == HederaResponseCodes.SUCCESS, "Transfer failed");
    }

    // Transfers tokens from treasury to user
    function mintToken(
        int64 amount,
        bytes[] memory metadata
    ) external onlyOwner {
        (int responseCode, , ) = mintToken(underlying, amount, metadata);
        require(responseCode == HederaResponseCodes.SUCCESS, "Mint failed");

        int256 responseCode2 = transferToken(
            underlying,
            address(this),
            msg.sender,
            amount
        );
        require(
            responseCode2 == HederaResponseCodes.SUCCESS,
            "Transfer failed"
        );
    }
}
