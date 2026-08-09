// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IAPassComplianceValidator} from "../../src/interfaces/IAPassComplianceValidator.sol";

contract MockValidator is IAPassComplianceValidator {
    mapping(address pool => bool) public registered;
    mapping(address pool => mapping(address user => bool)) public eligible;
    bool public shouldRevert;
    address public lastRegisterV2Caller;

    function setEligible(address pool, address user, bool value) external {
        eligible[pool][user] = value;
    }

    function setShouldRevert(bool value) external {
        shouldRevert = value;
    }

    function registerV2(address poolAddress, RuleV2 calldata) external {
        lastRegisterV2Caller = msg.sender;
        registered[poolAddress] = true;
    }

    function registerApass(address, address) external {}

    function registerApass(address, address, address) external {}

    function setRuleV2FromRegistrar(address, RuleV2 calldata) external {}

    function setRuleV2FromContract(RuleV2 calldata) external {}

    function addRuleV2FromContract(RuleV2 calldata) external {}

    function removeRuleV2FromContract(uint256) external {}

    function getRulesV2(address) external pure returns (RuleV2[] memory rules) {
        rules = new RuleV2[](0);
    }

    function isRegistered(address poolAddress) external view returns (bool) {
        return registered[poolAddress];
    }

    function complianceVerify(address poolAddress, address userAddress) external view returns (bool) {
        if (shouldRevert) revert("validator unavailable");
        return eligible[poolAddress][userAddress];
    }
}
