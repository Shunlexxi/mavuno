// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LendingPool} from "./LendingPool.sol";
import {OracleInterface} from "./interfaces/OracleInterface.sol";
import {FiatInterface} from "./interfaces/FiatInterface.sol";
import {FarmerRegistryInterface} from "./interfaces/FarmerRegistryInterface.sol";

/// @title MavunoFactory
/// @notice Deploys and manages LendingPool contracts for different HTS fiat tokens (NGN, CEDI, RAND, etc.)
contract MavunoFactory is Ownable {
    error InvalidAddress();
    error PoolAlreadyExists();
    error InvalidFiatToken();

    /// @notice Controller (shared across all pools)
    address public controller;

    /// @notice Oracle (shared across all pools)
    address public oracle;

    /// @notice FarmerRegistry (shared across all pools)
    address public registry;

    /// @notice All pools deployed, indexed by Fiat address
    mapping(address => address) public fiatToPool;

    /// @notice List of deployed pool addresses for iteration
    address[] public allPools;

    event PoolCreated(address indexed fiat, address pool, uint256 poolIndex);
    event OracleUpdated(address indexed newOracle);
    event ControllerUpdated(address indexed newController);
    event RegistryUpdated(address indexed newRegistry);

    constructor(
        address _controller,
        address _oracle,
        address _registry
    ) Ownable(_controller) {
        if (
            _controller == address(0) ||
            _oracle == address(0) ||
            _registry == address(0)
        ) {
            revert InvalidAddress();
        }

        controller = _controller;
        oracle = _oracle;
        registry = _registry;
    }

    /// @notice Create a new LendingPool for an HTS fiat token (NGN, CEDI, RAND, etc.)
    /// @param fiat Address of the Fiat (HTS Wrapped token)
    function createPool(
        address fiat
    ) external onlyOwner returns (address pool) {
        if (fiat == address(0)) revert InvalidAddress();
        if (fiatToPool[fiat] != address(0)) revert PoolAlreadyExists();

        // Basic validation that the fiat address is a contract
        if (fiat.code.length == 0) revert InvalidFiatToken();

        LendingPool lp = new LendingPool(controller, oracle, fiat, registry);
        pool = address(lp);

        fiatToPool[fiat] = pool;
        allPools.push(pool);

        emit PoolCreated(fiat, pool, allPools.length - 1);
    }

    /// @notice Get pool address for a specific fiat token
    function getPool(address fiat) external view returns (address) {
        return fiatToPool[fiat];
    }

    /// @notice Update oracle for future pools
    function setOracle(address _oracle) external onlyOwner {
        if (_oracle == address(0)) revert InvalidAddress();
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    /// @notice Update controller for future pools
    function setController(address _controller) external onlyOwner {
        if (_controller == address(0)) revert InvalidAddress();
        controller = _controller;
        emit ControllerUpdated(_controller);
    }

    /// @notice Update registry for future pools
    function setRegistry(address _registry) external onlyOwner {
        if (_registry == address(0)) revert InvalidAddress();
        registry = _registry;
        emit RegistryUpdated(_registry);
    }
}
