// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IPrincipalRegistry} from "./interfaces/IPrincipalRegistry.sol";

/// @notice A deliberately narrow CVA vault with a single Principal-gated transfer route.
contract PrincipalVault is Ownable {
    using SafeERC20 for IERC20;

    error InvalidAddress();

    IPrincipalRegistry public immutable registry;
    address public immutable asset;

    event TransferPermitted(
        uint256 indexed passportId, address indexed principal, address indexed recipient, uint256 amount
    );
    event TransferBlocked(
        uint256 indexed passportId,
        address indexed principal,
        address indexed recipient,
        uint256 amount,
        IPrincipalRegistry.Decision decision
    );

    constructor(address initialOwner, IPrincipalRegistry registry_, address asset_) Ownable(initialOwner) {
        if (address(registry_) == address(0) || asset_ == address(0)) revert InvalidAddress();
        registry = registry_;
        asset = asset_;
    }

    /// @notice Moves CVA only after the registry checks mandate, controller, and live Cleanverse eligibility.
    function transferWithinMandate(address recipient, uint256 amount, uint256 passportId)
        external
        onlyOwner
        returns (bool)
    {
        IPrincipalRegistry.Decision decision = registry.evaluate(passportId, address(this), recipient, amount);
        if (decision != IPrincipalRegistry.Decision.PERMITTED) {
            emit TransferBlocked(passportId, msg.sender, recipient, amount, decision);
            return false;
        }

        IERC20(asset).safeTransfer(recipient, amount);
        emit TransferPermitted(passportId, msg.sender, recipient, amount);
        return true;
    }
}
