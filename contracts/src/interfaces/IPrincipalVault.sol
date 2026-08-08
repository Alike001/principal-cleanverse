// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IPrincipalVault {
    function owner() external view returns (address);

    function asset() external view returns (address);
}
