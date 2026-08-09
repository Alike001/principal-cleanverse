// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script} from "forge-std/Script.sol";

import {CleanverseMonad} from "../src/CleanverseMonad.sol";
import {IAPassComplianceValidator} from "../src/interfaces/IAPassComplianceValidator.sol";
import {PrincipalRegistry} from "../src/PrincipalRegistry.sol";

/// @notice Deploys the role-holding Principal factory and its one immutable vault before Cleanverse grants REGISTER_ROLE.
contract DeployPrincipal is Script {
    error WrongChain(uint256 actual, uint256 expected);

    event PrincipalFactoryDeployed(address indexed registry, address indexed principal);

    function run() external returns (PrincipalRegistry registry) {
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
        registry.createVault();
        vm.stopBroadcast();

        emit PrincipalFactoryDeployed(address(registry), principal);
    }
}
