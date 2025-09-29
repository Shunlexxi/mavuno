// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/// @title FarmerRegistryInterface
interface FarmerRegistryInterface {
    event FarmerRegistered(
        address indexed farmer,
        address pool,
        string profileUri,
        address manager
    );
    event FarmerUpdated(address indexed farmer, string profileUri);

    function getManager(address farmer) external view returns (address);

    function getProfileUri(
        address farmer
    ) external view returns (string memory);

    function getAllManagers() external view returns (address[] memory);
}
