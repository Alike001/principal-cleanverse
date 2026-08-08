// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {CleanverseMonad} from "../src/CleanverseMonad.sol";
import {IAPassComplianceValidator} from "../src/interfaces/IAPassComplianceValidator.sol";

contract ValidatorInterfaceTest is Test {
    function test_usesPublishedMonadValidator() external pure {
        assertEq(CleanverseMonad.CHAIN_ID, 10_143);
        assertEq(CleanverseMonad.VALIDATOR, 0xaC7e5179C2C7f03f209136886c172eb34F161792);
    }

    function test_preservesPublishedRuleTupleLayout() external pure {
        IAPassComplianceValidator.RuleV2 memory rule = IAPassComplianceValidator.RuleV2({
            allowedGroup: hex"4142", allowedSubGroup: bytes2(0), minTier: 1, minSubTier: 0, poolCountryBitmap: 0
        });

        bytes memory encoded = abi.encode(rule);
        assertEq(encoded.length, 160, "RuleV2 must remain five ABI words");
    }

    function test_usesExpectedComplianceVerificationSelector() external pure {
        assertEq(
            IAPassComplianceValidator.complianceVerify.selector, bytes4(keccak256("complianceVerify(address,address)"))
        );
    }
}
