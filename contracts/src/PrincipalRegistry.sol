// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IAPassComplianceValidator} from "./interfaces/IAPassComplianceValidator.sol";
import {IPrincipalRegistry} from "./interfaces/IPrincipalRegistry.sol";
import {IPrincipalVault} from "./interfaces/IPrincipalVault.sol";

/// @notice Binds a Cleanverse-verified controller to exact vault bytecode and one asset mandate.
contract PrincipalRegistry is Ownable, IPrincipalRegistry {
    error UnsupportedChain(uint256 actual, uint256 expected);
    error InvalidAddress();
    error InvalidExpiry(uint64 expiry, uint256 currentTimestamp);
    error VaultNotRegistered(address vault);
    error VaultAssetMismatch(address vault, address expectedAsset, address actualAsset);
    error VaultControllerMismatch(address vault, address expectedController, address actualController);
    error VaultReadFailed(address vault);

    struct Passport {
        address principal;
        address vault;
        bytes32 runtimeCodeHash;
        address asset;
        uint128 amountCap;
        uint64 expiry;
        uint64 nonce;
        uint256 chainId;
        bool active;
    }

    IAPassComplianceValidator public immutable validator;
    address public immutable asset;
    uint256 public immutable expectedChainId;
    uint256 public nextPassportId = 1;

    mapping(uint256 passportId => Passport) private passports;
    mapping(address principal => uint64 nonce) public nextNonce;
    mapping(address vault => uint256 passportId) public activePassportForVault;

    event CleanversePoolRuleRegistered(address indexed vault, bytes32 indexed ruleHash);
    event CleanverseVaultCviRegistered(address indexed vault, address indexed asset);
    event PassportRegistered(
        uint256 indexed passportId,
        address indexed principal,
        address indexed vault,
        bytes32 runtimeCodeHash,
        address asset,
        uint128 amountCap,
        uint64 expiry,
        uint64 nonce
    );
    event PassportRevoked(uint256 indexed passportId, address indexed principal);

    constructor(address initialOwner, IAPassComplianceValidator validator_, address asset_, uint256 expectedChainId_)
        Ownable(initialOwner)
    {
        if (address(validator_) == address(0) || asset_ == address(0)) revert InvalidAddress();
        validator = validator_;
        asset = asset_;
        expectedChainId = expectedChainId_;
    }

    /// @notice Registers the pool's RuleV2 through this registry's Cleanverse REGISTER_ROLE.
    /// @dev This is intentionally separate from registerVaultCvi so both real Validator writes can confirm independently.
    function registerCleanversePoolRule(address vault, IAPassComplianceValidator.RuleV2 calldata rule)
        external
        onlyOwner
    {
        if (vault.code.length == 0) revert InvalidAddress();
        validator.registerV2(vault, rule);
        emit CleanversePoolRuleRegistered(vault, keccak256(abi.encode(rule)));
    }

    /// @notice Gives an already registered pool the CVI required to hold the configured CVA.
    function registerVaultCvi(address vault) external onlyOwner {
        if (!validator.isRegistered(vault)) revert VaultNotRegistered(vault);
        validator.registerApass(vault, asset);
        emit CleanverseVaultCviRegistered(vault, asset);
    }

    /// @notice A vault controller creates a fresh passport. A prior vault passport becomes inactive.
    function registerPassport(address vault, uint128 amountCap, uint64 expiry) external returns (uint256 passportId) {
        _requireExpectedChain();
        if (amountCap == 0 || vault.code.length == 0) revert InvalidAddress();
        if (expiry <= block.timestamp) revert InvalidExpiry(expiry, block.timestamp);
        if (!validator.isRegistered(vault)) revert VaultNotRegistered(vault);

        address controller = _vaultOwner(vault);
        if (controller != msg.sender) revert VaultControllerMismatch(vault, msg.sender, controller);

        address vaultAsset = _vaultAsset(vault);
        if (vaultAsset != asset) revert VaultAssetMismatch(vault, asset, vaultAsset);

        uint256 priorPassportId = activePassportForVault[vault];
        if (priorPassportId != 0) passports[priorPassportId].active = false;

        passportId = nextPassportId++;
        uint64 nonce = nextNonce[msg.sender]++;
        passports[passportId] = Passport({
            principal: msg.sender,
            vault: vault,
            runtimeCodeHash: vault.codehash,
            asset: asset,
            amountCap: amountCap,
            expiry: expiry,
            nonce: nonce,
            chainId: block.chainid,
            active: true
        });
        activePassportForVault[vault] = passportId;

        emit PassportRegistered(passportId, msg.sender, vault, vault.codehash, asset, amountCap, expiry, nonce);
    }

    function revokePassport(uint256 passportId) external {
        Passport storage passport = passports[passportId];
        if (passport.principal != msg.sender) {
            revert VaultControllerMismatch(passport.vault, passport.principal, msg.sender);
        }
        passport.active = false;
        if (activePassportForVault[passport.vault] == passportId) activePassportForVault[passport.vault] = 0;
        emit PassportRevoked(passportId, msg.sender);
    }

    /// @notice Returns a deterministic reason instead of trusting a frontend or an opaque score.
    function evaluate(uint256 passportId, address vault, address recipient, uint256 amount)
        external
        view
        returns (Decision)
    {
        Passport storage passport = passports[passportId];
        if (passport.principal == address(0)) return Decision.PASSPORT_NOT_FOUND;
        if (!passport.active) return Decision.PASSPORT_INACTIVE;
        if (block.chainid != passport.chainId || block.chainid != expectedChainId) return Decision.WRONG_CHAIN;
        if (block.timestamp > passport.expiry) return Decision.PASSPORT_EXPIRED;
        if (passport.vault != vault) return Decision.VAULT_MISMATCH;
        if (vault.codehash != passport.runtimeCodeHash) return Decision.CODE_MISMATCH;
        if (_vaultOwnerOrZero(vault) != passport.principal) return Decision.CONTROLLER_MISMATCH;
        if (_vaultAssetOrZero(vault) != passport.asset) return Decision.ASSET_MISMATCH;
        if (amount == 0 || amount > passport.amountCap) return Decision.AMOUNT_CAP_EXCEEDED;

        try validator.complianceVerify(vault, passport.principal) returns (bool principalEligible) {
            if (!principalEligible) return Decision.PRINCIPAL_INELIGIBLE;
        } catch {
            return Decision.VALIDATOR_UNAVAILABLE;
        }

        try validator.complianceVerify(passport.asset, recipient) returns (bool recipientEligible) {
            if (!recipientEligible) return Decision.RECIPIENT_INELIGIBLE;
        } catch {
            return Decision.VALIDATOR_UNAVAILABLE;
        }

        return Decision.PERMITTED;
    }

    function getPassport(uint256 passportId) external view returns (Passport memory) {
        return passports[passportId];
    }

    function _requireExpectedChain() private view {
        if (block.chainid != expectedChainId) revert UnsupportedChain(block.chainid, expectedChainId);
    }

    function _vaultOwner(address vault) private view returns (address controller) {
        controller = _vaultOwnerOrZero(vault);
        if (controller == address(0)) revert VaultReadFailed(vault);
    }

    function _vaultAsset(address vault) private view returns (address vaultAsset) {
        vaultAsset = _vaultAssetOrZero(vault);
        if (vaultAsset == address(0)) revert VaultReadFailed(vault);
    }

    function _vaultOwnerOrZero(address vault) private view returns (address) {
        try IPrincipalVault(vault).owner() returns (address controller) {
            return controller;
        } catch {
            return address(0);
        }
    }

    function _vaultAssetOrZero(address vault) private view returns (address) {
        try IPrincipalVault(vault).asset() returns (address vaultAsset) {
            return vaultAsset;
        } catch {
            return address(0);
        }
    }
}
