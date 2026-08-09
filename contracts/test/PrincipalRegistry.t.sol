// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";

import {IAPassComplianceValidator} from "../src/interfaces/IAPassComplianceValidator.sol";
import {IPrincipalRegistry} from "../src/interfaces/IPrincipalRegistry.sol";
import {PrincipalRegistry} from "../src/PrincipalRegistry.sol";
import {PrincipalVault} from "../src/PrincipalVault.sol";
import {MockCVA} from "./mocks/MockCVA.sol";
import {MockValidator} from "./mocks/MockValidator.sol";

contract PrincipalRegistryTest is Test {
    address internal constant PRINCIPAL = address(0xB0B);
    address internal constant RECIPIENT = address(0xCAFE);
    address internal constant OTHER = address(0xD00D);

    uint128 internal constant CAP = 100e6;

    MockValidator internal validator;
    MockCVA internal token;
    PrincipalRegistry internal registry;
    PrincipalVault internal vault;

    function setUp() external {
        validator = new MockValidator();
        token = new MockCVA();
        registry = new PrincipalRegistry(PRINCIPAL, validator, address(token), block.chainid);
        vm.prank(PRINCIPAL);
        vault = registry.createVault();
        token.mint(address(vault), 1_000e6);

        vm.prank(PRINCIPAL);
        registry.registerCleanversePoolRule(address(vault), _rule());
        vm.prank(PRINCIPAL);
        registry.registerVaultCvi(address(vault));
        validator.setEligible(address(vault), PRINCIPAL, true);
        validator.setEligible(address(vault), RECIPIENT, true);
    }

    function test_registeredPassportBindsControllerCodeAssetAndNonce() external {
        uint256 passportId = _registerPassport();
        PrincipalRegistry.Passport memory passport = registry.getPassport(passportId);

        assertEq(passport.principal, PRINCIPAL);
        assertEq(passport.vault, address(vault));
        assertEq(passport.runtimeCodeHash, address(vault).codehash);
        assertEq(passport.asset, address(token));
        assertEq(passport.amountCap, CAP);
        assertEq(passport.nonce, 0);
        assertTrue(passport.active);
    }

    function test_factoryCreatesTheOnlyVaultAndInitiatesValidatorRegistration() external {
        assertEq(registry.factoryVault(), address(vault));
        assertEq(vault.owner(), PRINCIPAL);
        assertEq(address(vault.registry()), address(registry));
        assertEq(vault.asset(), address(token));
        assertEq(validator.lastRegisterV2Caller(), address(registry));
    }

    function test_factoryCannotCreateOrRegisterAnotherVault() external {
        vm.prank(PRINCIPAL);
        vm.expectRevert(abi.encodeWithSelector(PrincipalRegistry.VaultAlreadyCreated.selector, address(vault)));
        registry.createVault();

        PrincipalVault externalVault = new PrincipalVault(PRINCIPAL, registry, address(token));
        vm.prank(PRINCIPAL);
        vm.expectRevert(
            abi.encodeWithSelector(
                PrincipalRegistry.UnexpectedFactoryVault.selector, address(externalVault), address(vault)
            )
        );
        registry.registerCleanversePoolRule(address(externalVault), _rule());
    }

    function test_permittedTransferMovesOnlyTheAuthorizedAmount() external {
        uint256 passportId = _registerPassport();

        vm.prank(PRINCIPAL);
        bool moved = vault.transferWithinMandate(RECIPIENT, 25e6, passportId);

        assertTrue(moved);
        assertEq(token.balanceOf(RECIPIENT), 25e6);
        assertEq(token.balanceOf(address(vault)), 975e6);
    }

    function test_principalIneligibilityBlocksWithoutMovingFunds() external {
        uint256 passportId = _registerPassport();
        validator.setEligible(address(vault), PRINCIPAL, false);

        vm.prank(PRINCIPAL);
        bool moved = vault.transferWithinMandate(RECIPIENT, 25e6, passportId);

        assertFalse(moved);
        assertEq(token.balanceOf(RECIPIENT), 0);
        assertEq(
            uint256(registry.evaluate(passportId, address(vault), RECIPIENT, 25e6)),
            uint256(IPrincipalRegistry.Decision.PRINCIPAL_INELIGIBLE)
        );
    }

    function test_recipientIneligibilityBlocksWithoutMovingFunds() external {
        uint256 passportId = _registerPassport();
        validator.setEligible(address(vault), RECIPIENT, false);

        vm.prank(PRINCIPAL);
        bool moved = vault.transferWithinMandate(RECIPIENT, 25e6, passportId);

        assertFalse(moved);
        assertEq(token.balanceOf(RECIPIENT), 0);
        assertEq(
            uint256(registry.evaluate(passportId, address(vault), RECIPIENT, 25e6)),
            uint256(IPrincipalRegistry.Decision.RECIPIENT_INELIGIBLE)
        );
    }

    function test_amountAboveCapBlocksWithoutMovingFunds() external {
        uint256 passportId = _registerPassport();

        vm.prank(PRINCIPAL);
        bool moved = vault.transferWithinMandate(RECIPIENT, CAP + 1, passportId);

        assertFalse(moved);
        assertEq(token.balanceOf(RECIPIENT), 0);
    }

    function test_zeroAmountBlocksWithoutMovingFunds() external {
        uint256 passportId = _registerPassport();

        vm.prank(PRINCIPAL);
        bool moved = vault.transferWithinMandate(RECIPIENT, 0, passportId);

        assertFalse(moved);
        assertEq(token.balanceOf(RECIPIENT), 0);
        assertEq(token.balanceOf(address(vault)), 1_000e6);
        assertEq(
            uint256(registry.evaluate(passportId, address(vault), RECIPIENT, 0)),
            uint256(IPrincipalRegistry.Decision.AMOUNT_CAP_EXCEEDED)
        );
    }

    function test_capAppliesToEachTransferRatherThanCumulativeSpend() external {
        uint256 passportId = _registerPassport();

        vm.startPrank(PRINCIPAL);
        bool firstMoved = vault.transferWithinMandate(RECIPIENT, 60e6, passportId);
        bool secondMoved = vault.transferWithinMandate(RECIPIENT, 60e6, passportId);
        vm.stopPrank();

        assertTrue(firstMoved);
        assertTrue(secondMoved);
        assertEq(token.balanceOf(RECIPIENT), 120e6);
        assertEq(token.balanceOf(address(vault)), 880e6);
    }

    function testFuzz_permittedAmountsAtOrBelowCapMoveExactly(uint128 amount) external {
        uint256 passportId = _registerPassport();
        amount = uint128(bound(amount, 1, CAP));

        vm.prank(PRINCIPAL);
        bool moved = vault.transferWithinMandate(RECIPIENT, amount, passportId);

        assertTrue(moved);
        assertEq(token.balanceOf(RECIPIENT), amount);
        assertEq(token.balanceOf(address(vault)), 1_000e6 - amount);
    }

    function testFuzz_amountsAboveCapNeverMoveFunds(uint128 extra) external {
        uint256 passportId = _registerPassport();
        extra = uint128(bound(extra, 1, type(uint128).max - CAP));

        vm.prank(PRINCIPAL);
        bool moved = vault.transferWithinMandate(RECIPIENT, uint256(CAP) + extra, passportId);

        assertFalse(moved);
        assertEq(token.balanceOf(RECIPIENT), 0);
        assertEq(token.balanceOf(address(vault)), 1_000e6);
    }

    function test_expiredPassportBlocksWithoutMovingFunds() external {
        uint256 passportId = _registerPassport();
        vm.warp(block.timestamp + 2 days);

        vm.prank(PRINCIPAL);
        bool moved = vault.transferWithinMandate(RECIPIENT, 25e6, passportId);

        assertFalse(moved);
        assertEq(token.balanceOf(RECIPIENT), 0);
    }

    function test_revokedPassportBlocksWithoutMovingFunds() external {
        uint256 passportId = _registerPassport();

        vm.prank(PRINCIPAL);
        registry.revokePassport(passportId);
        vm.prank(PRINCIPAL);
        bool moved = vault.transferWithinMandate(RECIPIENT, 25e6, passportId);

        assertFalse(moved);
        assertEq(token.balanceOf(RECIPIENT), 0);
    }

    function test_controllerChangeInvalidatesExistingPassport() external {
        uint256 passportId = _registerPassport();

        vm.prank(PRINCIPAL);
        vault.transferOwnership(OTHER);
        vm.prank(OTHER);
        bool moved = vault.transferWithinMandate(RECIPIENT, 25e6, passportId);

        assertFalse(moved);
        assertEq(token.balanceOf(RECIPIENT), 0);
        assertEq(
            uint256(registry.evaluate(passportId, address(vault), RECIPIENT, 25e6)),
            uint256(IPrincipalRegistry.Decision.CONTROLLER_MISMATCH)
        );
    }

    function test_validatorFailureFailsClosedWithoutMovingFunds() external {
        uint256 passportId = _registerPassport();
        validator.setShouldRevert(true);

        vm.prank(PRINCIPAL);
        bool moved = vault.transferWithinMandate(RECIPIENT, 25e6, passportId);

        assertFalse(moved);
        assertEq(token.balanceOf(RECIPIENT), 0);
        assertEq(
            uint256(registry.evaluate(passportId, address(vault), RECIPIENT, 25e6)),
            uint256(IPrincipalRegistry.Decision.VALIDATOR_UNAVAILABLE)
        );
    }

    function test_nonControllerCannotRegisterPassport() external {
        vm.prank(OTHER);
        vm.expectRevert(
            abi.encodeWithSelector(PrincipalRegistry.VaultControllerMismatch.selector, address(vault), OTHER, PRINCIPAL)
        );
        registry.registerPassport(address(vault), CAP, uint64(block.timestamp + 1 days));
    }

    function test_replacementConsumesNonceAndInvalidatesPriorPassport() external {
        uint256 first = _registerPassport();
        vm.prank(PRINCIPAL);
        uint256 second = registry.registerPassport(address(vault), CAP, uint64(block.timestamp + 2 days));

        assertFalse(registry.getPassport(first).active);
        assertTrue(registry.getPassport(second).active);
        assertEq(registry.getPassport(second).nonce, 1);
    }

    function _registerPassport() private returns (uint256) {
        vm.prank(PRINCIPAL);
        return registry.registerPassport(address(vault), CAP, uint64(block.timestamp + 1 days));
    }

    function _rule() private pure returns (IAPassComplianceValidator.RuleV2 memory) {
        return IAPassComplianceValidator.RuleV2({
            allowedGroup: bytes2(0),
            allowedSubGroup: bytes2(0),
            minTier: 0,
            minSubTier: 0,
            isBlackList: false,
            countryBitmap: 0
        });
    }
}
