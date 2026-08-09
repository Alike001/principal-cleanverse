// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IPrincipalRegistry {
    enum Decision {
        PERMITTED,
        PASSPORT_NOT_FOUND,
        PASSPORT_INACTIVE,
        PASSPORT_EXPIRED,
        VAULT_MISMATCH,
        CODE_MISMATCH,
        CONTROLLER_MISMATCH,
        ASSET_MISMATCH,
        AMOUNT_CAP_EXCEEDED,
        PRINCIPAL_INELIGIBLE,
        RECIPIENT_INELIGIBLE,
        VALIDATOR_UNAVAILABLE,
        WRONG_CHAIN,
        ALLOWANCE_EXHAUSTED
    }

    function evaluate(uint256 passportId, address vault, address recipient, uint256 amount)
        external
        view
        returns (Decision);

    function consumeAllowance(uint256 passportId, address recipient, uint256 amount) external returns (Decision);
}
