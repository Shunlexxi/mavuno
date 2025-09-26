// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface LendingPoolInterface {
    event Supplied(address indexed lp, int64 amount, uint256 lpMinted);
    event Withdrawn(address indexed lp, int64 amount, uint256 lpBurned);
    event Borrowed(address indexed farmer, int64 amount, int64 newPrincipal);
    event Repaid(
        address indexed farmer,
        int64 amount,
        int64 remainingPrincipal,
        int64 interestPaid
    );

    function repay(
        int64 amount,
        address behalfOf
    ) external returns (int64 remainingPrincipal);

    function supply(int64 amount, address behalfOf) external;

    function withdraw(int64 amount) external;

    function withdrawable(address account) external view returns (uint256);

    function outstanding(address farmer) external view returns (int64);

    function borrow(int64 amount) external returns (bool);

    function borrowable(address farmer) external view returns (uint256);

    function healthFactorLTV(address farmer) external view returns (uint256);

    function liquidate(address farmer) external;

    function activatePledge() external;

    function deactivatePledge() external;
}
