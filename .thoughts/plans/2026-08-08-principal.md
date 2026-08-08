# Plan: Principal

Status: Approved by the user on 2026-08-08. Direct Validator enforcement was selected after the sponsor supplied the pinned CCP guides.

## Inputs

- Accepted product spec: `.thoughts/specs/2026-08-07-principal.md`.
- Accepted visual direction: `design.doc.md`.
- Approved 90-second proof: `demo/90-second-script.md`.
- Cleanverse research: `research/domain-knowledge.md` and `research/cleanverse-v5.6-integration.md`.
- Authoritative sponsor API source: the supplied Cleanverse Cooperate API guide v5.6.
- Current Monad facts: testnet chain ID `10143`, MON gas, configurable RPC and explorer URLs.
- Published judging weights: Concept 20, CVI and CVA Integration Depth 30, Build Quality 25, UX and Demo 15, Scalability 10.
- Current workspace: research, spec, design, application, and demo artifacts exist. Product code, Git history, GitHub remote, and valid GitHub authentication do not exist yet.
- Local tools: Node 24.14.1, pnpm 10.33.1, Foundry 1.7.1, Git 2.53.0, and GitHub CLI 2.96.0.

No separate project quality profile exists. The accepted spec, `AGENTS.md`, and this plan intentionally serve as the binding quality profile. They require strict secret isolation, deterministic contract rules, unit and invariant tests, real Cleanverse UAT calls, a real Monad testnet run, accessibility checks, and a reproducible build.

## Technical Direction

Use one Next.js 16 App Router application with TypeScript for the product UI and secret-safe server Route Handlers. Use viem for typed Monad reads, wallet writes, receipt tracking, and any EIP-712 signing. Use Foundry for the Solidity workspace, deployment scripts, unit tests, fuzz tests, and invariants. Use OpenZeppelin Contracts 5.x for `Ownable`, `EIP712`, `ECDSA`, nonce handling, and safe token operations where the final architecture needs them.

Context7 confirms that Next.js Route Handlers can read non-public environment variables and validate JSON on the server. It also confirms viem's custom-chain, contract simulation, typed write, receipt, and typed-data flows. OpenZeppelin 5.x supplies the required ownership and replay-protection primitives, while Foundry supplies unit, fuzz, invariant, and RPC-backed deployment workflows.

The repository remains compact:

```text
app/                          Product page and server Route Handlers
components/                   Contract Passport, action, result, timeline
lib/cleanverse/               AES client, schemas, response normalization
lib/monad/                    Chain config, ABIs, reads, writes, receipts
contracts/src/                PrincipalRegistry, PrincipalVault, interfaces
contracts/test/               Unit, fuzz, invariant, integration fixtures
contracts/script/             Monad deployment and configuration scripts
e2e/                          Browser tests for the one-page judge path
fixtures/real-demo/           Sanitized captures from real successful runs
public/brand/                 Approved Cleanverse and Principal assets
```

The direct onchain Cleanverse Validator path is selected. The pinned guide supplies the permissionless `complianceVerify` interface plus registrar-only `registerV2` and `registerApass` methods. The relay fallback is no longer part of the planned build.

## Assumptions

- Principal remains a single-chain Monad product with one vault, one principal, one A-Token, one transfer action, one cap, one expiry, and one passport nonce.
- The vault is a non-proxy contract. Its runtime code is bound by hash.
- The vault exposes `owner()` so Cleanverse can validate the registration signature. An owner change makes the existing Principal passport invalid.
- Cleanverse UAT credentials will be placed only in ignored server-side environment files by the user.
- The deployer will use a Foundry encrypted keystore or a browser wallet. A raw private key will not be committed or placed in client code.
- A blocked onchain attempt should emit a reason-coded event without moving value when the final Cleanverse interface permits that design.
- Sanitized replay fixtures may support offline presentation only after they are captured from real UAT and Monad transactions. They must be visibly labeled as replay evidence.

## Open Questions

1. Does Cleanverse automatically react to a registered pool's `owner()` change?
2. Which sandbox wallet may be safely frozen and reactivated for the demonstration?
3. The v5.6 API guide and pinned Validator guide phrase the registration signature differently. Which exact byte sequence does the live endpoint accept?

## Prototype Reintegration Gate

There is no high-fidelity prototype or mock application to reintegrate. `design.doc.md` is the accepted binding design source. No simulated Cleanverse behavior may ship as the judged integration. Local mock contracts and response fixtures are allowed only in automated tests. Offline replay must use sanitized records captured from real successful integrations and must be labeled.

## Phase 0: Repository, Security, and Capability Gates

### Goal

Create the public, judge-visible build history safely and resolve the sponsor capabilities that determine whether Principal can be built as specified.

### Files or Areas

- `.gitignore`, `.env.example`, repository settings, GitHub issues, research notes, `log.md`, and `handoff.md`.

### Work

- Create `.gitignore` before any local credential file. Ignore `.env*` except `.env.example`, Foundry broadcast secrets, local keystores, recordings with private data, and build output.
- Add `.env.example` with names only for Cleanverse UAT, Monad RPC, explorer, deployed addresses, and an optional demo-mutation gate.
- Initialize Git, restore `gh` authentication, create the public `principal-cleanverse` repository, and push the accepted research, spec, design, and demo artifacts as the first build-window checkpoint.
- Create lightweight GitHub issues before feature work:
- Architecture decision: direct Validator call with registrar-backed pool CVI.
  - Secure Cleanverse v5.6 client.
  - Principal registry and vault enforcement.
  - Contract Passport product surface.
  - Real Monad and Cleanverse integration proof.
  - Demo resilience and submission package.
- Save the sponsor response and pinned-guide findings, then close the architecture issue through the commit that implements the selected direct boundary.
- Configure credentials locally without printing them. Validate that the Base64-decoded AES key is 16, 24, or 32 bytes.
- Run read-only probes for the Monad A-Token list and the selected principal's A-Pass record. Record only safe, sanitized evidence.
- Confirm testnet MON is available before deployment.

### Real Integration Path

All capability probes use `https://uatapi.cleanverse.com/api/cooperate` and the actual issued API ID. Monad checks use the configured official testnet RPC. No write endpoint runs in this phase.

### Mock/Simulation Policy

No mocks decide capability. A missing role, token, contract ABI, or pool-holding path remains a blocker.

### Checks

- `git status` shows a clean repository after the checkpoint commit.
- `gh auth status` succeeds and the public remote is reachable.
- Secret scan finds no API ID, AES key, private key, email address, or `.env.local` in tracked files.
- Read-only Cleanverse probes classify top-level codes correctly and never treat HTTP 200 alone as success.
- Live Monad chain ID is `10143`.

### Acceptance Criteria Covered

- Acceptance criterion 10, repository clarity and secret hygiene.
- Prerequisites for criteria 1 through 5.

### Stop Condition

Stop before application code if GitHub authentication or the public remote is unavailable. Stop Principal entirely if Cleanverse confirms that a registered contract cannot hold the selected A-Token or that current principal state cannot affect the protected path. Present the agreed CleanGas fallback to the user rather than inserting a fake adapter.

## Phase 1: Secure Cleanverse v5.6 Client

### Goal

Build one typed server-only integration layer that makes Cleanverse response semantics safe and testable.

### Files or Areas

- `lib/cleanverse/`, `app/api/cleanverse/`, server tests, `.env.example`, and sanitized API fixtures.

### Work

- Implement AES/CBC/PKCS5-compatible encryption with the Base64-decoded API key and the sponsor-required zero IV.
- Implement a bounded fetch client with request IDs, timeouts, redacted logs, and normalized failures.
- Add exact operations needed by Principal:
  - `query_deposit_atoken_list`
  - `query_apass`
  - `validator/is_register`
  - `validator/verify`
  - `validator/register`
  - `verify_apass`
  - `update_status`, guarded for the configured demo principal
  - `query_txs` for evidence
- Represent API transport success, Cleanverse business code, Validator `valid`, and nested A-Pass verification code as separate typed fields.
- Make all deny, timeout, malformed, paused, and ambiguous states fail closed.
- Keep `update_status` out of the public default path. Enable it only for the configured demo principal, with a fresh wallet-signed challenge and an explicit server flag.
- Add server Route Handlers that expose only the fields the interface needs. Never return the AES key, raw KYC data, or unnecessary identity attributes.

### Real Integration Path

After unit tests pass, run real read-only requests against Cleanverse UAT. Run `validator/register` only after the vault exists, its `owner()` behavior is verified, and the owner signs the documented lowercase `monad<contract_address>` message.

### Mock/Simulation Policy

Unit tests use local response fixtures for every outcome. At least one real success and one real policy denial must be captured before the judged path is marked integrated. Fixtures cannot be used as the live product response.

### Checks

- Known AES round-trip and fixed test-vector checks.
- Invalid Base64 key and invalid key-length rejection.
- Missing environment variable rejection.
- HTTP timeout, non-JSON response, top-level `0001`, `0002`, `12027`, and `valid: false` cases.
- `verify_apass` accepts nested code `4` only.
- Route input rejects missing fields, unsupported chain, malformed address, wrong A-Token, oversized amount, and extra mutation targets.
- Logs and test snapshots contain no secrets or PII.

### Acceptance Criteria Covered

- Criteria 1, 3, 4, and 5 integration prerequisites.
- Criterion 10 secret and fixture separation.

### Stop Condition

Stop if the live endpoint shapes differ materially from v5.6, the API role blocks required operations, or sensitive data cannot be kept server-side. Update research and ask the user before changing the core flow.

## Phase 2: Principal Contracts and Deterministic Enforcement

### Goal

Implement the smallest onchain mechanism that binds verified control, exact code, and one narrow A-Token transfer authority.

### Files or Areas

- `contracts/src/`, `contracts/test/`, `contracts/script/`, contract ABIs, and shared reason-code definitions.

### Work

- Implement `PrincipalRegistry` with one passport record containing passport ID, principal, vault, runtime code hash, chain ID, A-Token, permitted selector, amount cap, expiry, nonce, and active state.
- Require principal authorization for registration and replacement. Consume nonces so an old authorization cannot be replayed.
- Implement a non-proxy `PrincipalVault` with `owner()`, a fixed registry, and no alternate token withdrawal path.
- Before a transfer, check passport active state, expiry, vault address, runtime code hash, current owner, A-Token, transfer selector, amount cap, passport nonce, and Cleanverse decision.
- Emit safe evidence for permitted and rejected attempts. Use stable machine reason codes and plain-language mappings in the web app.
- Use custom errors for malformed or unauthorized administration.

#### Selected direct Validator branch

- Add the documented Validator interface and verified proxy address on Monad.
- Grant `PrincipalRegistry` the Validator's `REGISTER_ROLE` through the Cleanverse API.
- Have the registry call `registerV2(vault, rule)` and `registerApass(vault, aToken)` so the vault receives the CVI required to hold CVA.
- Call `complianceVerify(vault, principal)` inside the protected transfer for current principal eligibility.
- Let the real CVA enforce vault and recipient eligibility during its own transfer hook.
- Catch a rejected CVA transfer only if the token behavior safely permits a reason-coded rejection event without moving value.

### Real Integration Path

The selected branch must compile against the sponsor-provided interface or use real UAT decisions. The A-Token address comes from the live Monad token-list response and never from an example in the guide.

### Mock/Simulation Policy

Mock Validator and mock A-Token contracts exist only under `contracts/test`. They cover all branches and adversarial behavior. No mock address appears in production configuration or submitted evidence.

### Checks

- Unit tests: valid registration, unauthorized registration, replayed nonce, replacement, revocation, expiry, controller mismatch, wrong vault, wrong asset, wrong selector, cap exceeded, stale decision, wrong chain, wrong signer, and valid transfer.
- Recipient and principal denial tests move no A-Token.
- Fuzz amounts around zero, cap, cap plus one, and token balance.
- Invariant: the vault's A-Token balance can decrease only through the protected transfer path and only after every required condition passed.
- Invariant: a consumed passport or action nonce cannot authorize a second transfer.
- Malicious token return values and reentrancy behavior are tested before selecting the call pattern.
- `forge fmt --check`, `forge build`, full `forge test`, fuzz, and invariant suites pass.

### Acceptance Criteria Covered

- Criteria 2, 6, 7, and 8.
- Contract portion of criteria 4 and 5.

### Stop Condition

Stop before deployment if the published Validator address does not expose the documented interface on Monad, any invariant fails, or the selected A-Token cannot be handled without adding an unsafe escape path.

## Phase 3: Real Monad and Cleanverse Hero Path

### Goal

Prove the entire product claim with real sponsor state and real Monad transactions before building the final interface around it.

### Files or Areas

- Deployment scripts, network configuration, sanitized `fixtures/real-demo/`, deployment records, `handoff.md`, and GitHub issue evidence.

### Work

- Deploy `PrincipalRegistry` and `PrincipalVault` to Monad testnet from an encrypted Foundry keystore.
- Verify bytecode and record addresses, deployment transaction hashes, chain ID, compiler settings, and runtime code hash.
- Have the principal wallet sign the exact Cleanverse registration message.
- Register the vault through `validator/register` and wait for the write transaction to confirm before another rule mutation.
- Query registration state and rules back from Cleanverse.
- Acquire the live test A-Token through the sponsor-supported path. Call the faucet only when needed and record the cooldown.
- Prove that the vault can hold the A-Token.
- Register the Principal passport.
- Execute one eligible transfer and record starting and ending balances, Cleanverse decisions, contract events, and Monad receipt.
- Freeze the configured principal through `update_status`, if permitted, wait for confirmation, and query the new A-Pass state.
- Retry the identical transfer and prove unchanged balances with `PRINCIPAL_INELIGIBLE` or the final equivalent reason.
- Reactivate the demo principal after evidence capture if the sponsor flow and user approval permit it.

### Real Integration Path

Every result in the hero path comes from Cleanverse UAT and Monad testnet. The exact same recipient, amount, vault, A-Token, and passport are used before and after the identity change.

### Mock/Simulation Policy

No mocks participate. If the sandbox lacks `update_status`, use a real Validator pool pause only if it changes the protected path honestly and the user approves the revised wording. Local passport revocation remains a separate test and cannot be described as a Cleanverse identity freeze.

### Checks

- Receipt status and expected event for deployment, registration, passport registration, permitted transfer, identity update, and blocked retry.
- Before and after balances prove movement on success and zero movement on denial.
- Explorer links resolve to the expected chain and addresses.
- `query_txs` evidence agrees with Monad receipts where Cleanverse has indexed the transaction.
- Re-run controller mismatch and local revocation on testnet if they do not consume scarce sponsor resources.
- Record all real results and untestable gaps in `handoff.md`.

### Acceptance Criteria Covered

- Criteria 1 through 8 on the real judge path.

### Stop Condition

Stop and report the exact failed boundary if the vault cannot register, hold A-Token, verify current identity, or block the second transfer. Do not continue to UI work while the core claim is unproven.

## Phase 4: Contract Passport Product Surface

### Goal

Turn the proven hero path into the approved one-page Contract Passport without adding product breadth.

### Files or Areas

- `app/`, `components/`, `lib/monad/`, `public/brand/`, component tests, and `e2e/`.

### Work

- Implement the compact top bar, dominant passport, linear relationship strip, adjacent transfer action, result panel, and evidence timeline from `design.doc.md`.
- Read passport and event data from Monad. Read current Cleanverse status through server routes.
- Use wallet connection only for actions that need the principal's signature or transaction.
- Simulate the contract call before prompting for a write. Show the authoritative onchain outcome after the receipt.
- Keep active, expired, revoked, controller mismatch, principal failure, recipient failure, and cap failure visually and textually distinct.
- Link contracts and successful transactions to the configurable Monad explorer.
- Add copy and expand controls for long addresses and hashes.
- Use official Cleanverse assets only within their permitted role and preserve Principal's approved identity.

### Real Integration Path

Default product mode reads the deployed Monad contracts and Cleanverse UAT. The UI must expose whether a value came from onchain state, Cleanverse UAT, or sanitized replay evidence.

### Mock/Simulation Policy

Component tests may use fixtures. The judged online path cannot show generated success data. Offline replay is read-only, visibly labeled, and populated only from Phase 3 captures.

### Checks

- Component tests for every state and reason-code mapping.
- Browser flow for connect, preflight, permitted transfer, frozen state, blocked retry, timeline insertion, and explorer links.
- Wrong wallet, rejected signature, malformed recipient, zero amount, cap plus one, expired passport, API timeout, RPC timeout, and stale receipt states.
- Keyboard navigation, visible focus, accessible status labels, WCAG AA contrast, mobile stacking, long-value wrapping, and reduced motion.
- `pnpm lint`, type check, unit tests, browser tests, and production build pass.

### Acceptance Criteria Covered

- Criterion 9.
- Interface and evidence portions of criteria 2, 4, 5, and 10.

### Stop Condition

Stop feature work if the one-page flow needs navigation, hides the failed condition, or cannot tell the approved story in 90 seconds. Cut presentation complexity before adding another screen or feature.

## Phase 5: Integrated QA, Failure-Proofing, and Submission

### Goal

Make the project reproducible, defensible, and safe to judge even when live infrastructure fails.

### Files or Areas

- `.github/workflows/`, `README.md`, demo assets, replay fixtures, deployment records, submission summary, `log.md`, and `handoff.md`.

### Work

- Add GitHub Actions for frontend lint, type checks, unit tests, production build, Foundry formatting, compilation, unit tests, fuzz tests, and invariants. Keep secret-backed UAT and Monad mutation tests manual.
- Write a 30-second quick start that runs local development without secrets in read-only replay mode and clearly explains how to enable real UAT mode.
- Document the direct Validator, Principal registry, vault, and CVA transfer-hook trust boundaries.
- Create sanitized screenshots for active, permitted, frozen, and blocked states.
- Record the full real demo video and keep an offline copy.
- Capture sanitized UAT responses, Monad receipts, contract ABIs, deployed addresses, and balance proofs for replay mode.
- Write the one-page summary and submission email using only claims proved by the audit.
- Close each GitHub issue with the commit that completes it.

### Real Integration Path

The final online demo runs against the deployed Monad contracts and Cleanverse UAT. The video and replay bundle are evidence from that real path.

### Mock/Simulation Policy

Replay mode is a presentation fallback, never a claimed live execution. It cannot create transactions or change status.

### Checks

- Fresh clone setup succeeds from the README.
- Full local test matrix and CI pass.
- Real hero run succeeds once more before recording.
- Secret scan covers tracked files and Git history.
- No API key, private key, raw PII, personal email, or unsafe mutation control appears in the client bundle or repository.
- Demo script remains within 90 seconds and each beat maps to a judging criterion.
- One-page summary names the exact CVI and CVA integration points and Monad deployment.

### Acceptance Criteria Covered

- Criteria 9 and 10.
- Final proof for all earlier criteria.

### Stop Condition

Do not submit while CI is failing, the real hero path lacks evidence, a secret is exposed, the demo depends only on live internet, or the written claims exceed what was tested.

## Verification Checkpoint

Before declaring Principal complete, run a formal verification audit against the accepted spec, this plan, `design.doc.md`, the approved demo, and the judging rubric.

The audit must produce:

- A criterion-by-criterion matrix for all 10 acceptance criteria.
- A rubric map showing which tested evidence supports each scored dimension.
- Test command output and testnet transaction references.
- A real-versus-fixture inventory.
- A security and secret-scan result.
- An explicit list of untested claims, if any.
- A demo failure-recovery rehearsal result.

Any failed acceptance criterion reopens its owning GitHub issue. Principal is complete only when every required criterion passes or the user explicitly removes that claim from the submitted scope.

## Handoff Notes

- The first implementation action after approval is repository and secret hygiene, followed by GitHub history and issues. Contract or frontend code cannot start first.
- The sponsor response and pinned guides select direct Validator enforcement.
- If the contract cannot hold the live Monad A-Token, Principal is blocked. Return to the user with the CleanGas fallback rather than weakening the claim.
- Log the result of every real UAT mutation, Monad transaction, automated test phase, and untestable gap in `handoff.md`.
- Commit after each meaningful slice with its GitHub issue reference.
