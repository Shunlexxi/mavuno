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
    /// @notice Pledge manager (shared across all pools)
    address public pledgeManager;

    /// @notice Oracle (shared across all pools)
    address public oracle;

    /// @notice All pools deployed, indexed by Fiat address
    mapping(address => address) public fiatToPool;

    /// @notice List of deployed pool addresses for iteration
    address[] public allPools;

    event PoolCreated(address indexed fiat, address pool);
    event OracleUpdated(address indexed newOracle);
    event PledgeManagerUpdated(address indexed newPledgeManager);

    constructor(address _pledgeManager, address _oracle) Ownable(msg.sender) {
        require(_pledgeManager != address(0), "invalid-pledge-manager");
        require(_oracle != address(0), "invalid-oracle");
        pledgeManager = _pledgeManager;
        oracle = _oracle;
    }

    /// @notice Create a new LendingPool for an HTS fiat token (NGN, CEDI, RAND, etc.)
    /// @param fiat Address of the Fiat (HTS Wrapped token)
    function createPool(
        address fiat
    ) external onlyOwner returns (address pool) {
        require(fiat != address(0), "invalid-fiat");
        require(fiatToPool[fiat] == address(0), "pool-exists");

        LendingPool lp = new LendingPool(pledgeManager, oracle, fiat);

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

    /// @notice Update pledge manager for future pools
    function setPledgeManager(address _pledgeManager) external onlyOwner {
        require(_pledgeManager != address(0), "invalid-pledge-manager");
        pledgeManager = _pledgeManager;
        emit PledgeManagerUpdated(_pledgeManager);
    }
}
