# Spec: Principal

## Objective

Build a Cleanverse-native contract identity layer on Monad that binds one CVI-verified principal to one exact smart contract and one narrow CVA authority. The system must prove that a contract remains controlled by the verified principal and remains inside its approved mandate each time it attempts the protected action.

The product story is:

> Smart contracts move institutional assets without proving who controls them. Principal gives each contract revocable authority backed by a verified CVI principal.

## Scope Reductions

### Original direction

The broad concept included a multi-chain contract passport standard, nested organizational delegation, proxy-upgrade tracking, arbitrary capability policies, contract discovery, an SDK, webhooks, audit analytics, recovery workflows, Safe integration, and several reference protocols.

This scope contained too many independent products and would weaken the central proof.

### First cut

The first cut reduced Principal to a Monad-only reference system with:

- One passport registry.
- One enforcement gate.
- One verified principal per contract.
- Contract address and code binding.
- Allowed assets, function selectors, limits, and expiry.
- One reference vault.
- One small operator console.
- Real Cleanverse sandbox checks and a real Monad testnet deployment.

Removed at this cut:

- Multi-chain synchronization.
- Nested delegation and organizational role trees.
- Public SDK and package distribution.
- Webhooks and analytics.
- Contract discovery.
- Support for arbitrary third-party protocols.
- Automated proxy history and upgrade governance.
- Safe and paymaster integrations.

### Second cut, selected scope

The final selected scope is one complete hero flow:

1. One CVI-verified organization wallet registers one immutable `PrincipalVault` on Monad.
2. The passport binds the principal, vault address, deployed bytecode hash, one CVA asset, one permitted transfer action, one amount cap, one expiry, and one nonce.
3. The vault receives test CVA through the real sponsor-supported contract registration or eligibility path.
4. A transfer succeeds only while the passport, principal CVI, recipient eligibility, ownership binding, code binding, limit, and expiry are all valid.
5. The same transfer is rejected after the principal loses eligibility, the passport is revoked, or the vault controller changes.
6. The interface shows the active passport, the attempted action, and the reason-coded outcome.

No second contract type, second chain, general SDK, policy editor, analytics product, or proxy-upgrade system belongs in this version.

## Background And Current Reality

Cleanverse describes CVI as a wallet-bound verified identity and CVA as a verified asset controlled by programmable compliance rules. DeFi applications execute through vaults, escrows, pools, routers, and smart accounts, but the public Cleanverse package focuses on user wallets and payment flows.

Several current hackathon applications describe manual registration of every pool or escrow that must hold CVA. One application tries to infer whether a spender contract has a verified controlling entity. This indicates an unresolved distinction between an eligible human wallet and accountable software controlled by that human or organization.

Production regulated-token systems separate identity, compliance, token, and privileged administration. Production RWA protocols also use guardians, transfer hooks, immutable cores, and narrow extension points. Principal applies those lessons to contract accountability without trying to reproduce a full tokenization platform.

The post-registration v5.6 API guide and pinned CCP contract guides now define the required CVI, CVA, RuleV2, Validator, and registration interfaces. Their actual behavior and published address still require Monad testnet and Cleanverse UAT verification.

## Users

Primary user:

- A Cleanverse protocol developer building a vault, escrow, router, or other contract that must hold or move CVA.

Secondary users:

- An institution that needs to prove which verified entity controls a contract.
- A compliance reviewer who needs a clear record of why a contract action was accepted or rejected.
- A Cleanverse ecosystem engineer evaluating a reusable contract-identity primitive.

## Goals

- Make the verified controller of a CVA-handling contract explicit and machine-checkable.
- Bind the authority to exact deployed software and a narrow action mandate.
- Re-check identity and mandate validity when the protected action is attempted.
- Invalidate authority when the principal, controller, passport, code, limit, or expiry no longer matches.
- Enforce the decision inside the transaction path that moves CVA.
- Demonstrate a real successful action and real blocked actions on Monad testnet.
- Produce deterministic, reason-coded outcomes that a judge can understand without reading the contracts.

## Non-goals

- Replacing Cleanverse CVI or performing identity verification ourselves.
- Claiming that a passport proves legal ownership of a company or asset.
- Supporting arbitrary tokens or unrestricted contract calls.
- Creating a general-purpose identity and access management platform.
- Supporting multiple principals, organizational hierarchies, nested delegation, or weighted roles.
- Supporting proxy upgrades in the selected scope.
- Building a multi-chain registry.
- Building an agent mandate product.
- Building a contract risk score or monitoring dashboard.
- Storing PII onchain or in the frontend.
- Shipping an SDK, CLI, webhook service, or package registry in the selected scope.
- Adding wallet recovery, insurance, custody, lending, issuance, or dispute resolution.

## Requirements

### Passport registration

- A currently eligible CVI principal must be able to register a passport for one compatible vault it controls.
- Registration must bind the principal address, vault address, current deployed bytecode hash, supported chain, permitted CVA, permitted action, maximum amount, expiry, and nonce.
- A passport must have a unique identifier and an explicit active or revoked state.
- Registering or replacing a passport must require authorization from the bound principal.
- Old passport nonces must not be reusable.

### Contract and controller binding

- The enforcement path must confirm that the calling vault matches the registered address.
- The enforcement path must confirm that the deployed bytecode hash still matches the passport.
- The vault must expose a controller or principal binding that can be compared with the passport.
- A controller change must invalidate the existing passport until a new passport is issued by an eligible principal.

### Cleanverse enforcement

- The protected action must verify the principal's current CVI eligibility through the sponsor-documented onchain validator or attestation path.
- The action must use a real test CVA and the sponsor-supported contract eligibility path.
- The recipient must pass the applicable Cleanverse or CVA eligibility check before value moves.
- The action must fail closed when identity or policy state is unavailable, stale, ambiguous, or invalid.
- No frontend-only check may be treated as enforcement.

### Capability enforcement

- The selected version supports one CVA asset and one transfer action.
- The requested amount must not exceed the passport cap.
- The passport must be active and unexpired.
- Every authorization must be bound to the correct chain, vault, passport nonce, and action.
- A rejected policy decision must move no CVA.

### Outcomes and evidence

- A permitted action must record the passport identifier, principal, vault, recipient, amount, and Cleanverse decision reference that can be safely disclosed.
- A policy rejection should produce a persistent reason-coded outcome without moving value when the contract design permits it.
- Malformed calls and unauthorized administrative calls may revert with explicit custom errors.
- The interface must distinguish at least active, expired, revoked, controller mismatch, identity failure, recipient failure, and amount-cap failure.
- Raw PII must never appear in events, contract storage, logs, or the client.

### Interface

- The selected interface contains one passport summary, one action form, and one outcome timeline.
- A judge must be able to identify the verified principal, contract, mandate, current status, and last outcome without navigating to another page.
- The interface must link successful Monad transactions and contract addresses to the relevant explorer.
- Blocked actions must explain the failed condition in plain language.

### Testing and proof

- Unit tests must cover valid registration, unauthorized registration, replayed nonce, expiry, revocation, controller mismatch, bytecode mismatch where testable, amount-cap failure, ineligible principal, ineligible recipient, and valid transfer.
- Invariant or fuzz tests must prove that CVA cannot leave the vault through the protected path unless every required condition passes.
- The real judge path must use the Cleanverse sandbox and Monad testnet. Local mocks may support unit tests but cannot replace the real integration proof.
- Test results and any sponsor-interface limitation must be recorded in `handoff.md` during the build.

## Acceptance Criteria

Principal is complete when all of the following are true:

1. A real eligible sandbox CVI principal registers a passport for the deployed Monad testnet vault.
2. The passport visibly binds the exact vault, code hash, CVA, transfer capability, cap, expiry, and nonce.
3. The vault receives and holds real sponsor-provided test CVA using the documented contract eligibility flow.
4. A permitted transfer to an eligible recipient succeeds on Monad testnet and produces inspectable evidence.
5. The same action is rejected after a real sandbox identity-status change, if the sandbox exposes that operation.
6. Passport revocation and controller mismatch independently block the action and move no CVA.
7. Expiry, amount-cap failure, ineligible recipient, unauthorized registration, and nonce replay are covered by passing automated tests.
8. No alternative exposed vault function can move CVA without passing Principal enforcement.
9. The successful and blocked paths can be explained and demonstrated in under 90 seconds.
10. The repository clearly distinguishes real sponsor integration from local test fixtures and contains no hardcoded credentials or private information.

If the sandbox cannot support contract-held CVA, current principal-state verification, or an authentic status change, the core claim cannot be proven. Principal must then be treated as blocked and the agreed fallback should be evaluated rather than replaced with a fake adapter.

## Constraints

- Current event registration closes on 2026-08-07 at 23:59 UTC.
- The build must use the exact interfaces provided after registration.
- Sponsor documentation and sandbox behavior override applicant descriptions and older public package examples.
- Cleanverse secrets must remain server-side and in ignored environment files.
- The project cannot claim legal identity, custody, regulated issuance, or compliance advice beyond what Cleanverse actually returns.
- Monad configuration and deployed addresses must come from current official sources.
- UX and demo are scored, but the interface remains limited to the hero proof.
- Git was initialized after plan approval. GitHub CLI authentication, a public remote, and issue history must be completed before feature implementation.

## Stories Needed

- A protocol developer registers a verified contract passport.
- A verified contract performs its allowed CVA action.
- A revoked or ineligible principal loses contract authority.
- A changed controller invalidates an old passport.
- A compliance reviewer inspects the action and reason-coded outcome.
- A judge understands the problem, valid action, invalidation event, and blocked action in one short demonstration.

## Post-registration Integration Findings

- Cleanverse v5.6 provides Validator Compliance endpoints that register a pool contract through an EIP-191 signature from its onchain `owner()`.
- `validator/verify` checks a live user A-Pass against a registered contract's rules and returns a separate `valid` Boolean.
- `query_apass` exposes current A-Pass status and expiry. `update_status` provides a real activate or freeze operation when the API role permits it.
- `verify_apass` checks one recipient against one A-Token. Only nested result code `4` permits transfer.
- `query_deposit_atoken_list` is the live source of current A-Token, origin token, AccessCore, and A-Pass addresses for Monad.
- The pinned Validator guide documents direct `complianceVerify(pool, user)` calls with no caller permission, registrar-only `registerV2` and `registerApass`, and contract-managed RuleV2 methods.
- Cleanverse supplied Validator address `0xaC7e5179C2C7f03f209136886c172eb34F161792`. Read-only Monad calls confirmed its proxy bytecode, implementation bytecode, `isRegistered`, and `getRulesV2` behavior.
- A CVA vault must receive CVI through `registerApass(pool, aToken)` before it can hold or transfer CVA.
- Cleanverse support confirmed that the issued account has the requested permissions.
- A live UAT query returned Monad `ausdc` at `0xaC0893567D43C3E7e6e35a72803df05416C1f20D` with 6 decimals, backed by origin `usdc` at `0x534b2f3A21130d7a60830c2Df862319e593943A3`.
- Current Monad testnet uses chain ID `10143` and MON for gas. Current RPC and explorer values must remain configurable because official pages expose both current and legacy URLs.

Full endpoint analysis is saved in [`research/cleanverse-v5.6-integration.md`](../../research/cleanverse-v5.6-integration.md).

## Remaining Open Questions

1. Does Cleanverse registration or transfer eligibility react automatically when the registered contract's `owner()` changes?
2. What exact ERC-20-compatible transfer behavior and custom errors does the selected Monad A-Token expose?
3. Which exact signature bytes does the live grant endpoint accept where the v5.6 and pinned-guide wording differs?
4. Which issued test wallet can safely be frozen and reactivated during the demo without affecting other builders?

## Source References

- [`research/domain-knowledge.md`](../../research/domain-knowledge.md)
- [`research/cleanverse-v5.6-integration.md`](../../research/cleanverse-v5.6-integration.md)
- [Cleanverse Build: Trusted Assets Hackathon](https://cleanverse.com/hackathon)
- [Cleanverse architecture](https://cleanverse.com/how-it-works)
- [Cleanverse ClevrPay public repository](https://github.com/cleanverseorg/clevrpay)
- [ERC-3643 reference implementation](https://github.com/ERC-3643/ERC-3643)
- [Centrifuge Protocol](https://github.com/centrifuge/protocol-v3)
- [Monad documentation](https://docs.monad.xyz/)
