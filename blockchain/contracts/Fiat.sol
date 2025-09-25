// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./hts-precompile/HederaTokenService.sol";
import "./hts-precompile/IHederaTokenService.sol";
import "./hts-precompile/ExpiryHelper.sol";
import "./hts-precompile/KeyHelper.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {FiatInterface} from "./interfaces/FiatInterface.sol";

/// @title Fiat Contract
/// @notice Creates and manages HTS tokens for fiat currencies (NGN, CEDI, RAND, etc.)
contract Fiat is
    HederaTokenService,
    KeyHelper,
    ExpiryHelper,
    FiatInterface,
    Ownable
{
    error TokenAlreadyCreated();
    error TokenCreationFailed(int256 responseCode);
    error TokenMintFailed(int256 responseCode);
    error TokenTransferFailed(int256 responseCode);

    address public underlying;
    int32 public decimals = 2;

    event TokenCreated(address indexed tokenAddress);
    event TokensMinted(address indexed to, int64 amount);

    constructor() Ownable(msg.sender) {}

    /// @dev Creates a fungible token using HTS precompile
    function createUnderlying(
        string memory name,
        string memory symbol,
        int64 autoRenewPeriod
    ) external payable onlyOwner {
        if (underlying != address(0)) revert TokenAlreadyCreated();

        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](3);

        // Supply key - contract can mint/burn
        keys[0] = getSingleKey(
            KeyType.SUPPLY,
            KeyValueType.CONTRACT_ID,
            address(this)
        );

        // Admin key - contract can update token properties
        keys[1] = getSingleKey(
            KeyType.ADMIN,
            KeyValueType.CONTRACT_ID,
            address(this)
        );

        // Pause key - contract can pause token
        keys[2] = getSingleKey(
            KeyType.PAUSE,
            KeyValueType.CONTRACT_ID,
            address(this)
        );

        // Token details
        IHederaTokenService.HederaToken memory token;
        token.name = name;
        token.symbol = symbol;
        token.treasury = address(this);
        token.tokenSupplyType = true; // finite supply
        token.tokenKeys = keys;
        token.freezeDefault = false;
        token.expiry = createAutoRenewExpiry(address(this), autoRenewPeriod);
        token.memo = "Mavuno Fiat Token";
        token.maxSupply = 10_000_000_000;

        // Call HTS to create the token
        (int256 responseCode, address tokenAddress) = createFungibleToken(
            token,
            0, // initial supply
            decimals
        );

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert TokenCreationFailed(responseCode);
        }

        underlying = tokenAddress;
        emit TokenCreated(tokenAddress);
    }

    /// @notice Mint tokens
    function mint(address to, int64 amount) external {
        // Mint to treasury first
        (int256 responseCode, , ) = mintToken(
            underlying,
            amount,
            new bytes[](0)
        );
        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert TokenMintFailed(responseCode);
        }

        // Transfer from treasury to recipient
        int256 transferResponse = transferToken(
            underlying,
            address(this),
            to,
            amount
        );
        if (transferResponse != HederaResponseCodes.SUCCESS) {
            revert TokenTransferFailed(transferResponse);
        }

        emit TokensMinted(to, amount);
    }
}
