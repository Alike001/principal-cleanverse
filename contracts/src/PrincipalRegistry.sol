// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IAPassComplianceValidator} from "./interfaces/IAPassComplianceValidator.sol";
import {IPrincipalRegistry} from "./interfaces/IPrincipalRegistry.sol";
import {IPrincipalVault} from "./interfaces/IPrincipalVault.sol";
import {PrincipalVault} from "./PrincipalVault.sol";

/// @notice Binds a Cleanverse-verified controller to exact vault bytecode and one asset mandate.
contract PrincipalRegistry is Ownable, IPrincipalRegistry {
    error UnsupportedChain(uint256 actual, uint256 expected);
    error InvalidAddress();
    error InvalidExpiry(uint64 expiry, uint256 currentTimestamp);
    error VaultNotRegistered(address vault);
    error VaultAlreadyCreated(address vault);
    error UnexpectedFactoryVault(address vault, address expectedVault);
    error VaultAssetMismatch(address vault, address expectedAsset, address actualAsset);
    error VaultControllerMismatch(address vault, address expectedController, address actualController);
    error VaultReadFailed(address vault);
    error UnauthorizedVaultConsumer(address caller, address expectedVault);

    struct Passport {
        address principal;
        address vault;
        bytes32 runtimeCodeHash;
        address asset;
        uint128 totalAllowance;
        uint128 spent;
        uint64 expiry;
        uint64 nonce;
        uint256 chainId;
        bool active;
    }

    IAPassComplianceValidator public immutable validator;
    address public immutable asset;
    uint256 public immutable expectedChainId;
    address public factoryVault;
    uint256 public nextPassportId = 1;

    mapping(uint256 passportId => Passport) private passports;
    mapping(address principal => uint64 nonce) public nextNonce;
    mapping(address vault => uint256 passportId) public activePassportForVault;

    event CleanversePoolRuleRegistered(address indexed vault, bytes32 indexed ruleHash);
    event CleanverseVaultCviRegistered(address indexed vault, address indexed asset);
    event VaultCreated(address indexed vault, address indexed principal, address indexed asset);
    event PassportRegistered(
        uint256 indexed passportId,
        address indexed principal,
        address indexed vault,
        bytes32 runtimeCodeHash,
        address asset,
        uint128 totalAllowance,
        uint64 expiry,
        uint64 nonce
    );
    event PassportRevoked(uint256 indexed passportId, address indexed principal);
    event PassportAllowanceConsumed(
        uint256 indexed passportId, address indexed vault, address indexed recipient, uint128 amount, uint128 spent
    );

    constructor(address initialOwner, IAPassComplianceValidator validator_, address asset_, uint256 expectedChainId_)
        Ownable(initialOwner)
    {
        if (address(validator_) == address(0) || asset_ == address(0)) revert InvalidAddress();
        validator = validator_;
        asset = asset_;
        expectedChainId = expectedChainId_;
    }

    /// @notice Creates the single immutable pool that this role-holding factory may register with Cleanverse.
    /// @dev The Validator requires registerV2 to be initiated by the factory that created the pool.
    function createVault() external onlyOwner returns (PrincipalVault vault) {
        if (factoryVault != address(0)) revert VaultAlreadyCreated(factoryVault);

        vault = new PrincipalVault(owner(), IPrincipalRegistry(address(this)), asset);
        factoryVault = address(vault);
        emit VaultCreated(address(vault), owner(), asset);
    }

    /// @notice Registers the pool's RuleV2 through this registry's Cleanverse REGISTER_ROLE.
    /// @dev This is intentionally separate from registerVaultCvi so both real Validator writes can confirm independently.
    function registerCleanversePoolRule(address vault, IAPassComplianceValidator.RuleV2 calldata rule)
        external
        onlyOwner
    {
        _requireFactoryVault(vault);
        validator.registerV2(vault, rule);
        emit CleanversePoolRuleRegistered(vault, keccak256(abi.encode(rule)));
    }

    /// @notice Gives an already registered pool the CVI required to hold the configured CVA.
    function registerVaultCvi(address vault) external onlyOwner {
        _requireFactoryVault(vault);
        if (!validator.isRegistered(vault)) revert VaultNotRegistered(vault);
        validator.registerApass(vault, asset);
        emit CleanverseVaultCviRegistered(vault, asset);
    }

    /// @notice A vault controller creates a fresh passport. A prior vault passport becomes inactive.
    function registerPassport(address vault, uint128 totalAllowance, uint64 expiry)
        external
        returns (uint256 passportId)
    {
        _requireExpectedChain();
        if (totalAllowance == 0) revert InvalidAddress();
        _requireFactoryVault(vault);
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
            totalAllowance: totalAllowance,
            spent: 0,
            expiry: expiry,
            nonce: nonce,
            chainId: block.chainid,
            active: true
        });
        activePassportForVault[vault] = passportId;

        emit PassportRegistered(passportId, msg.sender, vault, vault.codehash, asset, totalAllowance, expiry, nonce);
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
        return _evaluate(passportId, vault, recipient, amount);
    }

    /// @notice Atomically consumes a Passport's remaining allowance before the vault transfers CVA.
    /// @dev If the subsequent CVA transfer reverts, this state update reverts with it.
    function consumeAllowance(uint256 passportId, address recipient, uint256 amount)
        external
        returns (Decision decision)
    {
        if (msg.sender != factoryVault) revert UnauthorizedVaultConsumer(msg.sender, factoryVault);
        if (amount > type(uint128).max) return Decision.AMOUNT_CAP_EXCEEDED;
        decision = _evaluate(passportId, msg.sender, recipient, amount);
        if (decision != Decision.PERMITTED) return decision;

        Passport storage passport = passports[passportId];
        // Safe after the explicit uint128 upper bound above.
        // forge-lint: disable-next-line(unsafe-typecast)
        uint128 consumed = uint128(amount);
        passport.spent += consumed;
        emit PassportAllowanceConsumed(passportId, msg.sender, recipient, consumed, passport.spent);
    }

    function _evaluate(uint256 passportId, address vault, address recipient, uint256 amount)
        private
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
        if (amount == 0 || amount > type(uint128).max) return Decision.AMOUNT_CAP_EXCEEDED;
        if (amount > uint256(passport.totalAllowance) - passport.spent) return Decision.ALLOWANCE_EXHAUSTED;

        try validator.complianceVerify(vault, passport.principal) returns (bool principalEligible) {
            if (!principalEligible) return Decision.PRINCIPAL_INELIGIBLE;
        } catch {
            return Decision.VALIDATOR_UNAVAILABLE;
        }

        // The CCP Validator verifies registered pools. CVA independently enforces recipient CVI during safeTransfer.
        try validator.complianceVerify(vault, recipient) returns (bool recipientEligible) {
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

    function _requireFactoryVault(address vault) private view {
        if (vault == address(0) || vault != factoryVault || vault.code.length == 0) {
            revert UnexpectedFactoryVault(vault, factoryVault);
        }
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
