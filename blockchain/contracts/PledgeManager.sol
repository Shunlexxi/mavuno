// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {PledgeManagerInterface} from "./interfaces/PledgeManagerInterface.sol";

/// @title PledgeManager (per-farmer, LP-token based)
/// @notice Manages pledges of HBAR for a single farmer via LP tokens.
contract PledgeManager is
    PledgeManagerInterface,
    ReentrancyGuard,
    Ownable,
    ERC20,
    ERC20Burnable
{
    address public farmer;
    address public pool;
    bool public active = true;

    constructor(
        address _farmer,
        address _pool
    ) Ownable(_pool) ERC20("Farmer Pledge LP", "fLP") {
        require(_farmer != address(0), "zero-farmer");
        farmer = _farmer;
        pool = _pool;
    }

    /// @notice Pledge HBAR -> receive LP tokens
    function pledge() external payable nonReentrant {
        require(msg.value > 0, "pledge-zero");
        _mint(msg.sender, msg.value);
        emit Pledged(msg.sender, msg.value);
    }

    /// @notice Withdraw pledge
    function withdraw(uint256 amount) external nonReentrant {
        require(!active, "active-pledge");
        require(amount > 0, "no-request");

        _burn(msg.sender, amount);

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "transfer-failed");

        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Called by LendingPool after verifying unhealthy LTV
    /// @param liquidator The address that triggered liquidation
    function liquidate(address liquidator) external nonReentrant onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "no-collateral");

        // Burn all LP supply
        _burn(address(this), totalSupply());

        (bool sent, ) = payable(liquidator).call{value: bal}("");
        require(sent, "transfer-failed");

        emit Liquidated(farmer, liquidator, bal);
    }

    function setActive(bool _active) external onlyOwner {
        active = _active;
    }

    receive() external payable {}
}
