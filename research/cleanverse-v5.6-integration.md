# Cleanverse v5.6 Integration Notes For Principal

## Source status

These notes are based on the post-registration Cleanverse Cooperate API integration guide v5.6 supplied on 2026-08-08, the official Cleanverse media kit, and current Monad developer resources. Context7 was checked first and had no Cleanverse documentation entry. The live Cleanverse docs host was also unavailable to the research browser, so the supplied v5.6 guide is the authoritative Cleanverse API source for this build.

The official media-kit files are preserved under `assets/cleanverse-media-kit/`. The four-page overview was read in full. It defines the core trust model as CVI, CVA, and programmed governance interlocking before value moves.

On 2026-08-08, Cleanverse support confirmed that the issued account has the requested permissions and pointed to two pinned CCP integration guides. Both guides were read in full. The Compliance Validator address supplied in the pinned message is `0xaC7e5179C2C7f03f209136886c172eb34F161792`. Full findings and source hashes are recorded in `.thoughts/research/2026-08-08-cleanverse-ccp-contract-guides.md`.

## Environment and authentication

- Sandbox base URL: `https://uatapi.cleanverse.com/api/cooperate`.
- Production base URL: `https://api.cleanverse.com/api/cooperate`.
- Every request requires the `api-id` header.
- The Base64-encoded `api-key` is local AES key material for encrypted request bodies. It must never be sent as a header, exposed in the browser, logged, or committed.
- Encrypted writes use AES/CBC/PKCS5Padding with a fixed 16-byte zero IV because that is the sponsor protocol. Requests send `{ "data": "<Base64 ciphertext>" }`.
- Several reads use plain JSON, including Validator `is_register`, `rules`, `verify`, and `is_paused`.
- HTTP 200 only means the API call completed. The client must inspect the top-level `code`, then inspect fields such as `data.valid` or `data.code` for the actual policy result.

## Exact Cleanverse primitives that fit Principal

### Validator contract registration

`POST /validator/register` registers a smart contract or pool with Cleanverse Validator Compliance.

The encrypted plaintext binds:

- `chain`
- `contract_address`
- one initial compliance `rule`
- `owner_signature`

The signature is EIP-191 `personal_sign` over the lowercase chain slug concatenated directly with the lowercase contract address. Cleanverse verifies that the signer matches `owner()` on the submitted contract. This is the strongest sponsor-native foundation for Principal because it proves that an owner authorized a specific deployed contract to become a compliance pool.

What it does not prove by itself:

- The guide does not bind deployed bytecode hash.
- The guide does not describe automatic invalidation after an `owner()` change.
- The guide does not define a narrow action selector, amount cap, expiry, or nonce.
- The guide does not expose the Monad Validator contract address or ABI needed for a direct contract-to-Validator read.

Principal remains useful as the missing capability layer around this registration primitive.

### Live principal eligibility

`POST /validator/verify` accepts plain JSON with `chain`, registered `contract_address`, and `user_address`. A successful API call returns top-level code `0000`, while `data.valid` is the actual eligibility result. `valid: false` is a completed policy decision, not an API error.

The pool must be unpaused. A paused pool may return code `12027` instead of a Boolean policy result. Principal must fail closed on that response.

`POST /query_apass` returns the principal's current A-Pass status, tier, sub-tier, group, sub-group, country tags, KYC hash, and expiration. Status `1` is active and status `2` is frozen.

`POST /update_status` can activate or freeze an A-Pass in sandbox when the issued API role permits it. This is the real status-change operation needed for the valid-then-blocked demo.

### Recipient and A-Token eligibility

`POST /verify_apass` accepts `chain`, `atoken`, and `address`. The nested verification result is:

- `1`: A-Token not found.
- `2`: recipient has no A-Pass.
- `3`: A-Pass exists but the A-Token transfer is not allowed because it is expired, frozen, or fails policy.
- `4`: recipient has a valid A-Pass and the transfer is allowed.

Principal must treat only nested code `4` as eligible. The endpoint returns a registration link when the recipient lacks A-Pass.

`POST /query_deposit_atoken_list` is the live source of truth for the current Monad origin token, A-Token, AccessCore, and A-Pass addresses. Static examples must not be hardcoded.

### Test assets and evidence

`POST /faucet` can request sandbox origin tokens or A-Tokens to a deposit address. The faucet can enforce a long cooldown, so it must not be called repeatedly during development or on demo day.

`POST /query_txs` returns indexed transaction evidence for a wallet and supports token, hash, type, and time filters.

Validator mutations and A-Pass status updates return transaction hashes. Those hashes can anchor Principal's evidence timeline.

### Live Monad CVA inventory

A real read-only `query_deposit_atoken_list` request succeeded on 2026-08-08 with top-level code `0000` and returned one supported Monad pair:

- Origin token: `usdc`, address `0x534b2f3A21130d7a60830c2Df862319e593943A3`.
- CVA: `ausdc`, address `0xaC0893567D43C3E7e6e35a72803df05416C1f20D`, 6 decimals.
- AccessCore: `0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC`.
- A-Pass contract: `0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9`.

These values came from the live UAT response for `chain: monad` and replace all static token examples for the selected build.

## Selected technical mechanism

1. Deploy one `PrincipalRegistry` that can receive Cleanverse `REGISTER_ROLE` and one non-proxy `PrincipalVault` whose `owner()` returns the verified principal wallet.
2. Grant the registry `REGISTER_ROLE` through `POST /validator/grant` using the documented owner signature.
3. Have the registry call Validator `registerV2(vault, rule)` and `registerApass(vault, aToken)` so the vault becomes a registered pool and receives the CVI required to hold CVA.
4. Register one Principal passport binding the principal, vault, runtime bytecode hash, A-Token, transfer selector, amount cap, expiry, and nonce.
5. Before a protected transfer, have the vault call `complianceVerify(vault, principal)` directly and check every local passport invariant.
6. Transfer the real CVA only after those checks pass. The CVA contract then applies its own automatic checks to the vault and recipient.
7. Freeze the same principal through the real sandbox `update_status` path, retry the same transfer, and prove that no CVA moves.

## Onchain enforcement decision

Direct Validator enforcement is selected. The pinned guide documents the permissionless view `complianceVerify(address poolAddress, address userAddress) returns (bool)` and shows contracts calling it within their business methods. It also documents `registerV2` and `registerApass` for registrar contracts. The relay fallback is removed from the planned build.

Read-only Monad checks confirmed that the published address is an EIP-1967 proxy whose implementation serves the documented `isRegistered` and `getRulesV2` views. An unregistered `complianceVerify` call reverted, which is the expected fail-closed behavior.

## Monad configuration

Current official Monad developer resources report:

- Testnet chain ID: `10143`.
- Native gas token: `MON`.
- Current developer-portal RPC: `https://rpc.testnet.monad.xyz`.
- Current developer-portal explorer: `https://testnet.monadscan.com`.
- Official testnet faucet: `https://faucet.monad.xyz`.

The wallet-add page still lists legacy alternatives `https://testnet-rpc.monad.xyz/` and `https://testnet.monadexplorer.com/`. On 2026-08-08, the current RPC hostname did not resolve from the build environment while the legacy RPC completed Validator bytecode, storage, and view calls. Use the working legacy RPC as the current build default and keep RPC and explorer settings configurable.

Monad does not use ETH for gas. The build needs testnet MON. Bridged test ETH does not replace MON as the native fee token unless a bridge or swap explicitly converts it to MON.

## Remaining blockers before implementation

1. Grant the Principal registry `REGISTER_ROLE`, then prove `registerV2` and `registerApass` on Monad testnet.
2. Test whether the registered vault can hold and transfer the selected CVA after `registerApass`.
3. Confirm whether Validator registration or transfer policy changes automatically when the vault owner changes.
4. Select a safe test wallet for the freeze and reactivation demonstration.
5. Acquire testnet MON for the deployer wallet before any Monad deployment.

## Submission requirements received after registration

- Build window: 2026-08-08 00:00 UTC through 2026-08-09 23:59 UTC.
- Submission deadline: 2026-08-09 23:59 UTC.
- Submit one email to `isaac@cleanverse.com` per team.
- Required: public GitHub repository with commits during the build window, demo video, and one-page summary covering problem, solution, CVI or CVA integration, and deployed chains.
- Recommended: live demo URL or testnet deployment.
- Judging weights remain Concept 20, CVI and CVA Integration 30, Build Quality 25, UX and Demo 15, Scalability 10.

Git was initialized after technical-plan approval. GitHub CLI device authentication, the public remote, issues, and the first checkpoint commit remain required because a single final bulk upload would violate the sponsor's commit-history requirement.
