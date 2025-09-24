// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LendingPool} from "./LendingPool.sol";
import {OracleInterface} from "./interfaces/OracleInterface.sol";
import {FiatInterface} from "./interfaces/FiatInterface.sol";
import {PledgeManager} from "./PledgeManager.sol";

/// @title MavunoFactory
/// @notice Deploys and manages LendingPool contracts for different HTS fiat tokens (NGN, CEDI, RAND, etc.)
contract MavunoFactory is Ownable {
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

    event PoolCreated(address indexed fiat, address pool);
    event OracleUpdated(address indexed newOracle);
    event ControllerUpdated(address indexed newController);

    constructor(
        address _controller,
        address _oracle,
        address _registry
    ) Ownable(msg.sender) {
        require(_controller != address(0), "invalid-controller");
        require(_oracle != address(0), "invalid-oracle");
        require(_registry != address(0), "invalid-registry");

        controller = _controller;
        oracle = _oracle;
        registry = _registry;
    }

    /// @notice Create a new LendingPool for an HTS fiat token (NGN, CEDI, RAND, etc.)
    /// @param fiat Address of the Fiat (HTS Wrapped token)
    function createPool(
        address fiat
    ) external onlyOwner returns (address pool) {
        require(fiat != address(0), "invalid-fiat");
        require(fiatToPool[fiat] == address(0), "pool-exists");

        LendingPool lp = new LendingPool(controller, oracle, fiat, registry);

        pool = address(lp);
        fiatToPool[fiat] = pool;
        allPools.push(pool);

        emit PoolCreated(fiat, pool);
    }

    /// @notice Returns number of deployed pools
    function allPoolsLength() external view returns (uint256) {
        return allPools.length;
    }

    /// @notice Update oracle for future pools
    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "invalid-oracle");
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    /// @notice Update controller for future pools
    function setPledgeManager(address _controller) external onlyOwner {
        require(_controller != address(0), "invalid-pledge-manager");
        controller = _controller;
        emit ControllerUpdated(_controller);
    }
}
