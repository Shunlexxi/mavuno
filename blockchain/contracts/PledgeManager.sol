// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {PledgeManagerInterface} from "./interfaces/PledgeManagerInterface.sol";

/// @title PledgeManager (per-farmer, LP-token based)
/// @notice Manages pledges of HBAR for a single farmer via LP tokens.
contract PledgeManager is
    PledgeManagerInterface,
    ReentrancyGuard,
    Ownable,
    ERC20
{
    error ZeroAddress();
    error ZeroAmount();
    error ActivePledge();
    error TransferFailed();
    error NoCollateral();
    error NotFarmer();
    error InsufficientBalance();

    address public immutable farmer;
    address public immutable pool;
    bool public active = true;

    constructor(
        address _farmer,
        address _pool
    ) Ownable(_pool) ERC20("Farmer Pledge LP", "fLP") {
        if (_farmer == address(0) || _pool == address(0)) revert ZeroAddress();

        farmer = _farmer;
        pool = _pool;
    }

    /// @notice Pledge HBAR -> receive LP tokens
    function pledge(address behalfOf) external payable nonReentrant {
        if (msg.value == 0) revert ZeroAmount();
        if (behalfOf == address(0)) revert ZeroAddress();

        _mint(behalfOf, msg.value);
        emit Pledged(behalfOf, msg.value);
    }

    /// @notice Withdraw pledge - only allowed when pledge is inactive
    function withdraw(uint256 amount) external nonReentrant {
        if (active) revert ActivePledge();
        if (amount == 0) revert ZeroAmount();
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance();

        _burn(msg.sender, amount);

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Called by LendingPool after verifying unhealthy LTV
    /// @param liquidator The address that triggered liquidation
    function liquidate(address liquidator) external nonReentrant onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoCollateral();

        if (liquidator == address(0)) revert ZeroAddress();

        _burn(address(this), totalSupply());

        // Transfer all collateral to liquidator
        (bool success, ) = payable(liquidator).call{value: balance}("");
        if (!success) revert TransferFailed();

        // Deactivate the pledge after liquidation
        active = false;

        emit Liquidated(farmer, liquidator, balance);
    }

    /// @notice Emergency withdrawal for farmer (only when no active loans)
    function emergencyWithdraw() external nonReentrant {
        if (msg.sender != farmer) revert NotFarmer();
        if (active) revert ActivePledge();

        uint256 farmerBalance = balanceOf(farmer);
        if (farmerBalance == 0) revert ZeroAmount();

        uint256 collateralShare = (address(this).balance * farmerBalance) /
            totalSupply();

        _burn(farmer, farmerBalance);

        (bool success, ) = farmer.call{value: collateralShare}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(farmer, collateralShare);
    }

    /// @notice Set active status (only pool can call this)
    function setActive(bool _active) external onlyOwner {
        active = _active;
        emit ActiveStatusChanged(_active);
    }

    receive() external payable {}
}
