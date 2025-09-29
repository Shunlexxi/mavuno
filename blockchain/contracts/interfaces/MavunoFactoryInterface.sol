// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface MavunoFactoryInterface {
    error InvalidAddress();
    error PoolAlreadyExists();
    error InvalidFiatToken();

    event PoolCreated(address indexed fiat, address pool, uint256 poolIndex);
    event OracleUpdated(address indexed newOracle);
    event ControllerUpdated(address indexed newController);
    event RegistryUpdated(address indexed newRegistry);

    function createPool(address fiat) external returns (address pool);
}
