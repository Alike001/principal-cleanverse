Note to AI agent: this is a different product from the reference UIs above. Copy only visual direction — not their content, features, or copy.

# Principal Design Direction

## References

### Stripe Identity

- Reference: https://stripe.com/identity and https://docs.stripe.com/identity/review-tools
- Borrow the immediate status-first reading order. A reviewer should see whether the passport is active before reading its evidence.
- Borrow the separation between the short verification summary and the detailed reason for a failed check.
- Do not copy Stripe's payment-dashboard structure, navigation, content, or illustration style.

### GitHub artifact attestations

- Reference: https://docs.github.com/en/enterprise-cloud%40latest/actions/concepts/security/artifact-attestations
- Borrow the provenance pattern that links one trusted source to one exact artifact through immutable identifiers.
- Present principal address, vault address, code hash, chain, and passport nonce as evidence fields rather than decorative metadata.
- Do not copy GitHub's repository layout, syntax styling, or developer terminology.

### Vercel deployment details

- Reference: https://vercel.com/docs/deployments/overview
- Borrow the strong single-object summary, one dominant state label, concise metadata, and chronological technical evidence below it.
- Use progressive disclosure for raw hashes and transaction details while leaving the human-readable result visible.
- Do not copy Vercel's project navigation, deployment content, or dark theme.

### Datadog Service Map

- Reference: https://docs.datadoghq.com/tracing/services/services_map/
- Borrow the restrained use of relationships and health states to explain how one source affects another.
- Use a small linear relationship strip for principal to vault to capability, with a broken edge when authority fails. Do not turn the product into a free-form network map.
- Do not copy Datadog's monitoring dashboard, charts, analytics density, or node graph.

## Brand Basics

Principal should feel like institutional infrastructure expressed through a precise digital credential. The tone is serious, calm, and evidentiary. It should communicate that every claim can be inspected without looking like a bank portal or a generic crypto dashboard.

### Color system

- Canvas: warm ivory `#F4F1E8`.
- Passport surface: soft paper `#FBFAF6`.
- Primary ink: carbon `#151719`.
- Secondary ink: slate `#5F6468`.
- Hairlines and inactive borders: stone `#D7D2C7`.
- Identity accent: authority blue `#2457D6`.
- Verified and permitted: civic green `#16865C`.
- Warning and expiry: ochre `#B36A16`.
- Revoked and blocked: vermilion `#C94331`.
- Selected field tint: pale blue `#E9EEFC`.

Status colors must always appear with a word and an icon. Never communicate pass or failure through color alone.

### Typography

- Use a restrained editorial serif such as Instrument Serif for the Principal wordmark, passport title, and the verified organization name.
- Use Inter or Geist for interface labels, explanations, buttons, and outcome messages.
- Use IBM Plex Mono for wallet addresses, contract addresses, hashes, nonces, amounts, and transaction identifiers.
- Keep display typography sparse. One serif focal point per screen is enough.
- Use sentence case throughout. Avoid uppercase interface copy except for very short machine labels such as CVI and CVA.

### Shape and material

- Passport panels use 16px corners, a fine stone border, and a soft neutral shadow.
- Controls use 8px to 10px corners so the credential remains the most distinctive object.
- Use generous paper-like whitespace, thin rules, small typographic labels, and a subtle security-line texture only inside the passport header.
- Avoid glass effects, glowing borders, noisy grain, and metallic gradients.

### Icon and mark direction

- The application icon should be a sharp, minimal monogram built from a capital `P` and one small verification cut or seal.
- Use carbon and authority blue on the warm ivory field, with a version that remains legible at 32px.
- Do not use shields, padlocks, fingerprints, passports with a globe, coins, chain links, or generic checkmark badges.

## Layout

Principal is a single dashboard-first product surface with no marketing homepage in the core judge path. A judge should land directly on the active contract passport and understand the principal, contract, mandate, and current outcome without navigating.

### Desktop structure

- Use a compact top bar containing the Principal mark, Monad network status, connected principal address, and one documentation link.
- The main workspace uses a 7-column to 5-column split at wide desktop sizes.
- The left side holds the dominant contract passport. It begins with organization name, active status, passport ID, and expiry. The body shows the verified principal, vault, code hash, CVA, permitted transfer, cap, and nonce.
- A thin relationship strip inside the passport reads `Verified principal -> PrincipalVault -> CVA transfer`. Each checkpoint has a named state. A failed state breaks the relevant edge and identifies the cause.
- The right side holds the only action form. It contains recipient, amount, a clear `Test authorized transfer` action, and a compact preflight summary.
- The result appears directly below the action. Permitted and blocked outcomes use equally strong presentation, with a plain-language headline followed by reason code and safe technical evidence.
- A full-width evidence timeline sits below both columns. It shows registration, successful transfer, invalidation event, and blocked attempt in chronological order.

### Passport hierarchy

1. Current state: Active, expired, revoked, controller mismatch, identity failure, recipient failure, or cap exceeded.
2. Verified organization and principal address.
3. Bound contract address and code hash.
4. Narrow authority: one CVA, one transfer action, one amount cap, one expiry.
5. Passport ID, nonce, chain, issuance time, and explorer links.

Long values should show a readable prefix and suffix with copy and expand actions. Human-readable labels must remain visible beside every shortened identifier.

### Demo state transition

- The interface must support a clear before-and-after sequence on the same page.
- In the valid state, the relationship strip remains intact and the action result reads `Transfer permitted` with the transaction reference.
- After revocation, identity loss, expiry, or controller change, the passport changes state in place. The relevant relationship edge breaks and the same action reads `Transfer blocked` with the exact failed condition.
- Preserve the previous successful event in the timeline so the judge can compare both states without relying on memory.
- Motion should be limited to a 180ms to 240ms state transition, a short edge-break animation, and timeline insertion. Respect reduced-motion preferences.

### Responsive behavior

- At tablet widths, stack the action panel below the passport and keep the evidence timeline last.
- At mobile widths, preserve the same hierarchy in one column. Do not hide passport evidence behind tabs.
- Addresses and hashes may wrap or collapse into an explicit details control, but status, principal, vault, mandate, cap, expiry, and last outcome must remain immediately visible.

### Accessibility and copy

- Meet WCAG AA contrast for normal text and controls.
- Use visible keyboard focus rings in authority blue.
- Pair all icons with labels or accessible names.
- Explain blocked outcomes in plain language first, then show the reason code and technical reference.
- Never display raw PII from CVI or imply that Principal proves legal ownership, regulatory approval, or asset custody.

## Anti-patterns

- No standard SaaS hero, feature grid, pricing section, testimonial strip, or oversized call to action in the judge path.
- No generic purple gradient, neon Web3 palette, star field, glowing orb, or dark cyberpunk theme.
- No card-grid dashboard filled with analytics, balances, charts, or metrics outside the selected hero flow.
- No wallet-first consumer layout that makes the verified contract look secondary.
- No stock shield, padlock, fingerprint, chain-link, robot, or coin illustrations.
- No fake live-feed data, decorative compliance score, risk meter, or AI-generated verdict.
- No hidden failure reason, color-only status, toast-only result, or success state that disappears before comparison.
- No free-form trust graph. The relationship strip must remain linear and limited to the principal, vault, and permitted action.
- No excessive serif text, security-document ornament, or passport metaphor that reduces scan speed.
- No raw PII, secret, full credential payload, or unsupported legal and compliance claim.
