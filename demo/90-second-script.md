# Principal Rough 90-Second Demo Script

Status: Approved by the user on 2026-08-08. This is the Phase 4 scope gate, not the final polished pitch.

## Core moment

The exact same CVA transfer succeeds while the contract's verified principal is active, then fails after that principal is frozen through Cleanverse. The passport, broken trust edge, reason code, and unchanged asset balance make the result visible on one screen.

## Script

### 0 to 10 seconds

Show the Principal Contract Passport already open.

Say: "Verified assets are moved by smart contracts, but the contract itself rarely proves which verified organization controls it. Principal gives that contract revocable authority tied to a live Cleanverse identity."

Rubric proof: Concept and Problem Definition.

### 10 to 25 seconds

Point to the single passport and its intact relationship strip:

`Verified principal -> PrincipalVault -> CVA transfer`

Show the verified principal address, exact vault address, runtime code hash, selected A-Token, one transfer permission, amount cap, expiry, nonce, and Cleanverse Validator registration evidence.

Say: "This passport binds one A-Pass principal to this exact contract code and this narrow transfer mandate. Cleanverse has also registered the vault as a Validator pool through an owner signature."

Rubric proof: Depth of CVI and CVA Integration, Build Quality.

### 25 to 42 seconds

In the adjacent action form, keep the eligible recipient and amount already filled. Select `Test authorized transfer`.

The preflight shows:

- Passport active.
- Principal currently eligible for this registered vault.
- Recipient eligible for this A-Token.
- Controller, code hash, action, cap, expiry, and nonce match.

Say: "Principal rechecks the live Cleanverse identity and asset rules together with its own contract mandate before value can move."

Rubric proof: Depth of CVI and CVA Integration, UX and Demo.

### 42 to 55 seconds

Show `Transfer permitted`, the updated A-Token balance, and the Monad transaction link inserted into the evidence timeline.

Say: "Every condition passed, so the vault executed the transfer on Monad and recorded inspectable evidence."

Rubric proof: Build Quality, UX and Demo.

### 55 to 68 seconds

Trigger the approved sandbox A-Pass freeze for the same principal. Wait for the Cleanverse transaction confirmation before continuing.

The passport changes to `Identity frozen`, and the first relationship edge breaks while the successful transfer remains visible below.

Say: "Now the controlling identity is frozen through Cleanverse. The contract's authority changes immediately with it."

Rubric proof: Depth of CVI and CVA Integration.

### 68 to 82 seconds

Retry the unchanged recipient and amount.

Show `Transfer blocked`, reason `PRINCIPAL_INELIGIBLE`, the Cleanverse decision reference, and unchanged vault and recipient balances. Insert the blocked attempt below the earlier success.

Say: "The same action is now blocked, no CVA moved, and the reason is deterministic and visible."

Rubric proof: Depth of CVI and CVA Integration, Build Quality, UX and Demo.

### 82 to 90 seconds

Return focus to the passport and evidence timeline.

Say: "Principal gives Cleanverse vaults, escrows, routers, and smart accounts accountable authority that ends when their verified principal or mandate ends."

Rubric proof: Scalability Potential.

## Scope check

This story fits in 90 seconds because it proves one relationship and one state transition. No feature cut is required.

The pinned guide now supplies the direct Validator interface, and Cleanverse support supplied address `0xaC7e5179C2C7f03f209136886c172eb34F161792` plus confirmation that the issued account has the requested permissions. The build must verify that address and interface on Monad before deployment. The vault must receive pool CVI through the documented `registerApass` flow before it can hold CVA.

## Demo-day fallback assets to prepare later

- A prerecorded version of the full 90-second flow.
- Screenshots of active, permitted, frozen, and blocked states.
- Cached, clearly labeled copies of real successful Cleanverse responses and Monad receipts.
- A local read-only replay mode that shows those real captured records when venue internet, Cleanverse UAT, or Monad RPC is unavailable.
