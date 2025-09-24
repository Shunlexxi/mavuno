// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title PledgeManagerInterface
/// @notice Interface for LP-token based pledge managers
interface PledgeManagerInterface is IERC20 {
    event Pledged(address indexed pledger, uint256 amount);
    event WithdrawalRequested(
        address indexed pledger,
        uint256 amount,
        uint256 unlockAt
    );
    event WithdrawalCancelled(address indexed pledger);
    event Withdrawn(address indexed pledger, uint256 amount);
    event Liquidated(
        address indexed farmer,
        address indexed liquidator,
        uint256 collateralSeized
    );

    function farmer() external view returns (address);

    function pool() external view returns (address);

    function active() external view returns (bool);

    function pledge() external payable;

    function withdraw(uint256 amount) external;

    function liquidate(address liquidator) external;

    function setActive(bool enabled) external;
}
