// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockCVA is ERC20 {
    bool public failTransfers;

    constructor() ERC20("Mock Cleanverse aUSDC", "maUSDC") {}

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }

    function setFailTransfers(bool value) external {
        failTransfers = value;
    }

    function transfer(address to, uint256 value) public override returns (bool) {
        if (failTransfers) return false;
        return super.transfer(to, value);
    }
}
