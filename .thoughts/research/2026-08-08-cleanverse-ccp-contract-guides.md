# Reality Research: Cleanverse CCP Contract Guides

## Scope

Determine whether Principal can use the Cleanverse Compliance Validator directly on Monad and whether a Principal vault can receive the CVI required to hold and transfer CVA. This brief records the sponsor reply and the two pinned integration guides without designing beyond their documented behavior.

## Sources Checked

- Cleanverse support reply received by the user on 2026-08-08: the issued account has the necessary permissions, every CVA holder requires CVI, and the pinned Compliance Validator guide is the integration reference.
- Pinned message: Compliance Validator contract address `0xaC7e5179C2C7f03f209136886c172eb34F161792`.
- `Cleanverse Compliance Protocol (CCP) CVA Integration Guide .pdf`, 12 pages, SHA-256 `4ffd57c4bdfceb31007cc34bd68327b05e9aaabb2548f75351439df200719352`.
- `Cleanverse_Compliance_Protocol_CCP_Integration_Guide_For_CVI_Compliance.pdf`, 14 pages, SHA-256 `7db2c24ff52047ce526172d4e6895448700bf7f8c3e85828ba48215970d25703`.
- Cleanverse Cooperate API guide v5.6 supplied earlier in the session.

Both PDFs were read completely from `/home/ali/Downloads/Telegram Desktop/`. Their extracted text and rendered opening pages were inspected so that tables and interface signatures omitted by plain-text extraction were still covered.

## Verified Facts

### Validator behavior

- The pinned Validator guide names the interface `IAPassComplianceValidator`.
- `complianceVerify(address poolAddress, address userAddress) external view returns (bool)` requires no special calling permission.
- The guide explicitly shows business contracts calling `complianceVerify(address(this), user)` inside their own transaction paths.
- Pool rule fields within one `RuleV2` use AND logic. Multiple rules use OR logic.
- The documented `RuleV2` fields are `allowedGroup`, `allowedSubGroup`, `minTier`, `minSubTier`, and `poolCountryBitmap`.
- The country bitmap uses zero for no country restriction and otherwise uses a bitwise match.

### Registration and CVA holding

- `registerV2(address poolAddress, RuleV2 rule)` registers a pool and its initial rule.
- `registerApass(address poolAddress, address aTokenAddress)` registers CVI for a CVA vault.
- The three-argument overload also registers a fee address: `registerApass(address poolAddress, address aTokenAddress, address feeAddress)`.
- `registerV2` and `registerApass` require `REGISTER_ROLE`.
- The guide's factory pattern obtains `REGISTER_ROLE` through `POST /api/cooperate/validator/grant`, then calls both functions directly onchain.
- The guide states that CVA pools must call `registerApass` so the pool and optional fee address receive the CVI required to hold and transfer CVA.
- The sponsor separately confirmed that holding CVA always requires CVI.
- Once the pool has the required CVI, the CVA contract performs its own transfer compliance checks automatically.

### Single-contract and factory modes

- Single-contract mode registers one contract through `POST /api/cooperate/validator/register` and lets that contract call `complianceVerify` directly.
- Factory mode grants one registrar contract `REGISTER_ROLE`, allowing it to register one or more pools and their CVA-specific A-Pass state.
- Business contracts may manage their own rules through `setRuleV2FromContract`, `addRuleV2FromContract`, and `removeRuleV2FromContract` after registration.
- `getRulesV2(address poolAddress)` returns the registered rules.

### CVA transfer behavior

- The CVA guide describes CVA as an ERC-20-compatible asset whose transfers are gated by CVI and RuleV2.
- Its template calls `policy.canTransfer(token, from, to, amount)` before every ERC-20 state update.
- A transfer that fails policy reverts with `TransferNotAllowed` in the template.
- The template is based on OpenZeppelin Contracts 5 and Solidity `0.8.24`.

### API role and address

- Cleanverse support confirmed that the issued account has the necessary permissions requested in the support question.
- The pinned message provides the Compliance Validator address `0xaC7e5179C2C7f03f209136886c172eb34F161792`.

### Monad read-only verification

- On 2026-08-08, `eth_getCode` against `https://testnet-rpc.monad.xyz` returned deployed EIP-1967 proxy bytecode for the published Validator address.
- The EIP-1967 implementation slot resolves to `0x68ce853d660444ffd98d6d5d98ac8ad58241d5a9`.
- The implementation contains 13,961 bytes of runtime bytecode.
- `isRegistered(0x0000000000000000000000000000000000000000)` returned `false`.
- `getRulesV2(0x0000000000000000000000000000000000000000)` returned an empty array.
- `complianceVerify` against the unregistered zero pool reverted with selector `0x739f4185`, which confirms the selector is routed through the deployed implementation and that unregistered pools fail closed.
- The current developer-portal hostname `https://rpc.testnet.monad.xyz` did not resolve from the build environment. The legacy official hostname `https://testnet-rpc.monad.xyz` completed every read above and is now the configured default while remaining environment-configurable.

## Inferences

- Principal can use a direct onchain Validator design and does not need the proposed EIP-712 relay for current CVI decisions.
- A Principal registrar contract can potentially receive `REGISTER_ROLE`, call `registerV2` for the vault, and call `registerApass` so the vault can hold the selected CVA.
- The Principal registry can remain the passport authority while also acting as the Cleanverse registrar, keeping the implementation to one registry and one vault.
- The vault's protected transfer can check the controlling principal through `complianceVerify(vault, principal)`, while the CVA contract independently checks the vault and recipient during `transfer`.

These are implementation inferences and still require a real Monad testnet proof.

## Unknowns And Questions

1. The guide does not publish events, role identifiers, pause methods, account-freeze methods, or the full deployed ABI.
2. The exact synthetic CVI fields assigned to a pool by `registerApass` are not described.
3. The guide says the registration signature rule is `keccak256(chain + contract_address)`, while the v5.6 API guide says EIP-191 `personal_sign` over the lowercase concatenated string. The v5.6 request example and live sandbox response must decide the exact signing procedure.
4. The live Monad A-Token address and RuleV2 configuration remain unknown until `query_deposit_atoken_list` is called with the issued API ID.
5. Automatic behavior after a vault `owner()` change is not documented.
6. A safe test wallet for the freeze and reactivation demonstration has not been selected.

## Not Included

- No contract or API mutation was run.
- No state-changing contract or API call was made.
- No relay implementation was approved or retained as the planned architecture.
- No claim was made that Cleanverse CVI proves legal ownership, custody, or regulatory approval.
