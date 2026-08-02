// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IdentityRegistry
 * @notice On-chain registry mapping EVM accounts to Cleanverse identity credentials.
 * @dev Reference implementation for the CleanFlow MVP. Not part of the web app runtime —
 *      identity checks in the UI are handled by the Cleanverse CVI mock (lib/cleanverse).
 */
contract IdentityRegistry {
    struct Identity {
        bytes32 cvvHash; // hash of the Cleanverse verified-identity credential
        uint256 kycLevel; // 0 = none, 1 = basic, 2 = enhanced
        bool verified;
        uint64 verifiedAt;
        bool revoked;
    }

    address public immutable admin;

    mapping(address => Identity) public identities;
    mapping(bytes32 => bool) public credentialSpent;

    event IdentityVerified(address indexed account, bytes32 cvvHash, uint256 kycLevel);
    event IdentityRevoked(address indexed account);

    error NotAdmin();
    error AlreadyRevoked();
    error CredentialUsed();

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    /// @notice Record a verified identity. `cvvHash` is a digest of the CVI credential.
    function verifyIdentity(
        address account,
        bytes32 cvvHash,
        uint256 kycLevel,
        bytes32 credentialId
    ) external onlyAdmin {
        if (credentialSpent[credentialId]) revert CredentialUsed();
        credentialSpent[credentialId] = true;

        identities[account] = Identity({
            cvvHash: cvvHash,
            kycLevel: kycLevel,
            verified: true,
            verifiedAt: uint64(block.timestamp),
            revoked: false
        });

        emit IdentityVerified(account, cvvHash, kycLevel);
    }

    function revokeIdentity(address account) external onlyAdmin {
        Identity storage identity = identities[account];
        if (!identity.verified || identity.revoked) revert AlreadyRevoked();
        identity.revoked = true;
        emit IdentityRevoked(account);
    }

    function isVerified(address account) external view returns (bool) {
        Identity memory identity = identities[account];
        return identity.verified && !identity.revoked;
    }

    function kycLevelOf(address account) external view returns (uint256) {
        return identities[account].kycLevel;
    }
}
