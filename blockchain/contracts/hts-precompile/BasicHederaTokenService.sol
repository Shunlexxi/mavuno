// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.5.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "./HederaResponseCodes.sol";
import "./IHederaTokenService.sol";

abstract contract BasicHederaTokenService {
    address constant precompileAddress = address(0x167);

    function associateToken(
        address account,
        address token
    ) internal returns (int responseCode) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.associateToken.selector,
                account,
                token
            )
        );
        responseCode = success
            ? abi.decode(result, (int32))
            : HederaResponseCodes.UNKNOWN;
    }

    /**********************
     * ABI v1 calls       *
     **********************/

    /// Transfers tokens where the calling account/contract is implicitly the first entry in the token transfer list,
    /// where the amount is the value needed to zero balance the transfers. Regular signing rules apply for sending
    /// (positive amount) or receiving (negative amount)
    /// @param token The token to transfer to/from
    /// @param sender The sender for the transaction
    /// @param receiver The receiver of the transaction
    /// @param amount Non-negative value to send. a negative value will result in a failure.
    function transferToken(
        address token,
        address sender,
        address receiver,
        int64 amount
    ) internal returns (int responseCode) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(
                IHederaTokenService.transferToken.selector,
                token,
                sender,
                receiver,
                amount
            )
        );
        responseCode = success
            ? abi.decode(result, (int32))
            : HederaResponseCodes.UNKNOWN;
    }
}
