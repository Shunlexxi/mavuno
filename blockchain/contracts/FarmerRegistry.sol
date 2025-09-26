// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {FarmerRegistryInterface} from "./interfaces/FarmerRegistryInterface.sol";
import {PledgeManager} from "./PledgeManager.sol";

/// @title FarmerRegistry
/// @notice Registers farmer wallets to off-chain profile pointers (IPFS) and auto-deploys a PledgeManager per farmer.
contract FarmerRegistry is FarmerRegistryInterface, Ownable {
    event FarmerRegistered(
        address indexed farmer,
        address pool,
        string profileUri,
        address manager
    );
    event FarmerUpdated(address indexed farmer, string profileUri);

    address[] public allManagers;
    mapping(address => string) public profileUri; // farmer wallet => profile URI IPFS
    mapping(address => address) public farmerToManager; // farmer => pledge manager

    constructor() Ownable(msg.sender) {}

    /// @notice Register or update a farmer's on-chain profile pointer.
    function registerFarmer(
        string calldata _profileUri,
        address pool
    ) external {
        bool notRegistered = bytes(profileUri[msg.sender]).length == 0;
        profileUri[msg.sender] = _profileUri;

        if (notRegistered) {
            // Deploy new PledgeManager for this farmer
            PledgeManager manager = new PledgeManager(msg.sender, pool);
            farmerToManager[msg.sender] = address(manager);
            allManagers.push(address(manager));

            emit FarmerRegistered(
                msg.sender,
                pool,
                _profileUri,
                address(manager)
            );
        } else {
            emit FarmerUpdated(msg.sender, _profileUri);
        }
    }

    /// @notice Get a farmer's PledgeManager
    function getManager(address farmer) external view returns (address) {
        return farmerToManager[farmer];
    }

    /// @notice Admin can set/update a farmer (without triggering new PledgeManager)
    function adminSetFarmer(
        address farmer,
        string calldata _profileUri
    ) external onlyOwner {
        profileUri[farmer] = _profileUri;
        emit FarmerUpdated(farmer, _profileUri);
    }

    /// @notice Get IPFS profile URI for a farmer
    function getProfileUri(
        address farmer
    ) external view returns (string memory) {
        return profileUri[farmer];
    }

    /// @notice Get list of all deployed PledgeManagers
    function getAllManagers() external view returns (address[] memory) {
        return allManagers;
    }
}
