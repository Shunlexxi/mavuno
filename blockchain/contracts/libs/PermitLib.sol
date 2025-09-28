// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

library PermitLib {
    error InvalidSignature();
    error SignatureExpired();

    // Example typehash for a Borrow permit:
    // keccak256("Borrow(address borrower,int64 amount,uint256 nonce,uint256 deadline)")
    bytes32 internal constant BORROW_TYPEHASH =
        keccak256(
            "Borrow(address borrower,int64 amount,uint256 nonce,uint256 deadline)"
        );

    /// @notice Validates a borrow permit signature
    /// @param domainSeparator Contract-specific domain separator (EIP-712)
    /// @param borrower The borrower’s address (who signed)
    /// @param amount The borrow amount (signed off-chain)
    /// @param nonce Unique nonce to prevent replay
    /// @param deadline Expiry timestamp
    /// @param v,r,s Signature parts
    function validateBorrowPermit(
        bytes32 domainSeparator,
        address borrower,
        int64 amount,
        uint256 nonce,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal view {
        if (block.timestamp > deadline) revert SignatureExpired();

        // EIP-712 struct hash
        bytes32 structHash = keccak256(
            abi.encode(BORROW_TYPEHASH, borrower, amount, nonce, deadline)
        );

        // Full digest per EIP-712
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, structHash)
        );

        // Recover signer
        address recovered = ecrecover(digest, v, r, s);
        if (recovered == address(0) || recovered != borrower) {
            revert InvalidSignature();
        }
    }
}
