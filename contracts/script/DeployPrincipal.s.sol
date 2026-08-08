// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script} from "forge-std/Script.sol";

import {CleanverseMonad} from "../src/CleanverseMonad.sol";
import {IAPassComplianceValidator} from "../src/interfaces/IAPassComplianceValidator.sol";
import {PrincipalRegistry} from "../src/PrincipalRegistry.sol";
import {PrincipalVault} from "../src/PrincipalVault.sol";

/// @notice Deploys the only Principal registry and vault for the approved Monad proof.
contract DeployPrincipal is Script {
    error WrongChain(uint256 actual, uint256 expected);

    event PrincipalDeployed(address indexed registry, address indexed vault, address indexed principal);

    function run() external returns (PrincipalRegistry registry, PrincipalVault vault) {
        if (block.chainid != CleanverseMonad.CHAIN_ID) {
            revert WrongChain(block.chainid, CleanverseMonad.CHAIN_ID);
        }

        address principal = vm.envAddress("DEMO_PRINCIPAL_ADDRESS");
        vm.startBroadcast();
        registry = new PrincipalRegistry(
            principal,
            IAPassComplianceValidator(CleanverseMonad.VALIDATOR),
            CleanverseMonad.AUSDC,
            CleanverseMonad.CHAIN_ID
        );
        vault = new PrincipalVault(principal, registry, CleanverseMonad.AUSDC);
        vm.stopBroadcast();

        emit PrincipalDeployed(address(registry), address(vault), principal);
    }
}
