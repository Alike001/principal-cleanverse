// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockCVA is ERC20 {
    constructor() ERC20("Mock Cleanverse aUSDC", "maUSDC") {}

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }
}
