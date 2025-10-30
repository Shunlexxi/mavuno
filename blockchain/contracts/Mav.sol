// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./hts-precompile/HederaTokenService.sol";
import "./hts-precompile/IHederaTokenService.sol";
import "./hts-precompile/ExpiryHelper.sol";
import "./hts-precompile/KeyHelper.sol";

contract Mav is HederaTokenService, KeyHelper, ExpiryHelper {
    address public underlying;

    function create(int64 autoRenewPeriod) external payable {
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

        IHederaTokenService.HederaToken memory token;
        token.name = "Mavuno Token";
        token.symbol = "MAV";
        token.treasury = address(this);
        token.tokenSupplyType = true; // finite supply
        token.tokenKeys = keys;
        token.freezeDefault = false;
        token.expiry = createAutoRenewExpiry(address(this), autoRenewPeriod);
        token.memo = "";
        token.maxSupply = 10_000_000_000;

        (, address tokenAddress) = createFungibleToken(
            token,
            0, // initial supply
            8
        );

        underlying = tokenAddress;
    }

    function mint(address to, int64 amount) external {
        mintToken(underlying, amount, new bytes[](0));
        transferToken(underlying, address(this), to, amount);
    }
}
