"use client";

import { FormEvent, useEffect, useState } from "react";
import { principalDeployment } from "@/lib/principal/deployment";
import { createPassportLink } from "@/lib/principal/passport-link";
import { principalPassport, type EvidenceItem } from "@/lib/principal/passport";
import { formatUnixTimestamp } from "@/lib/principal/time";
import { ArrowIcon, AssetIcon, BlockIcon, CheckIcon, CopyIcon, ExternalIcon, Mark, PersonIcon, RefreshIcon, VaultIcon } from "./icons";

type LivePassport = {
  registry: string;
  passportId: string;
  principal: string;
  vault: string;
  runtimeCodeHash: string;
  asset: string;
  totalAllowance: string;
  spent: string | null;
  expiry: string;
  nonce: string;
  chainId: string;
  active: boolean;
};

function StateIcon({ state }: { state: EvidenceItem["state"] | "blocked" | "verified" }) {
  return state === "verified" ? <CheckIcon size={16} /> : <BlockIcon size={16} />;
}

function shorten(value: string, head = 6, tail = 4) {
  return value.length > head + tail + 1 ? `${value.slice(0, head)}…${value.slice(-tail)}` : value;
}

function formatUnits(value: string, suffix = "aUSDC per transfer") {
  const units = BigInt(value);
  const whole = units / 1_000_000n;
  const fraction = (units % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "");
  return `${whole}${fraction ? `.${fraction}` : ""} ${suffix}`;
}

function remainingAllowance(passport: LivePassport) {
  if (passport.spent === null) return null;
  return (BigInt(passport.totalAllowance) - BigInt(passport.spent)).toString();
}

function CopyValue({ value, display, label }: { value: string; display: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard?.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return <button className="copy-value" type="button" onClick={copy} aria-label={`Copy ${label}`}><span>{copied ? "Copied" : display}</span><CopyIcon size={14} /></button>;
}

function PassportField({ label, children, tone }: { label: string; children: React.ReactNode; tone?: "blue" | "muted" }) {
  return <div className={`passport-field ${tone ? `field-${tone}` : ""}`}><dt>{label}</dt><dd>{children}</dd></div>;
}

export function ContractPassport() {
  const [registry, setRegistry] = useState<string>(principalDeployment.factoryAddress);
  const [passportId, setPassportId] = useState<string>(String(principalDeployment.passportId));
  const [recipient, setRecipient] = useState(principalPassport.vaultAddress);
  const [amount, setAmount] = useState("0.40");
  const [expanded, setExpanded] = useState(false);
  const [livePassport, setLivePassport] = useState<LivePassport | null>(null);
  const [loadState, setLoadState] = useState<{ state: "idle" | "loading" | "error"; message: string }>({
    state: "idle",
    message: "Load any deployed Principal registry and passport ID from Monad.",
  });
  const [preflight, setPreflight] = useState<{
    state: "idle" | "checking" | "complete" | "error";
    decision?: string;
    permitted?: boolean;
    message: string;
  }>({ state: "idle", message: "Enter a recipient and amount to query the selected Passport on Monad." });

  async function loadPassportByTarget(nextRegistry: string, nextPassportId: string) {
    setLoadState({ state: "loading", message: "Reading the Passport tuple from Monad." });
    setPreflight({ state: "idle", message: "Load complete. Enter a recipient and amount to run a live check." });
    try {
      const response = await fetch("/api/principal/passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registry: nextRegistry, passportId: nextPassportId }),
      });
      const data: LivePassport & { error?: string } = await response.json();
      if (!response.ok || !data.vault || !data.passportId) {
        setLoadState({ state: "error", message: data.error || "Passport lookup is unavailable." });
        return;
      }
      setLivePassport(data);
      setRegistry(data.registry);
      setPassportId(data.passportId);
      setRecipient(data.vault);
      setLoadState({ state: "idle", message: data.principal === "0x0000000000000000000000000000000000000000" ? "No Passport exists at this ID." : "Live Passport loaded from Monad." });
    } catch {
      setLoadState({ state: "error", message: "Passport lookup is unavailable. No authority is assumed." });
    }
  }

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const linkedRegistry = query.get("registry");
    const linkedPassport = query.get("passport");
    if (!linkedRegistry || !linkedPassport) return;
    setRegistry(linkedRegistry);
    setPassportId(linkedPassport);
    void loadPassportByTarget(linkedRegistry, linkedPassport);
  }, []);

  const isHistoricalDefault = !livePassport;
  const passport = livePassport;
  const displayRegistry = passport?.registry || principalPassport.registryAddress;
  const displayVault = passport?.vault || principalPassport.vaultAddress;
  const displayPassportId = passport?.passportId || String(principalDeployment.passportId);
  const recipientState = recipient.trim() ? "Recipient ready for a read-only check" : "Add a recipient to run the preflight";
  const resultTone = preflight.state === "complete" && preflight.permitted
    ? "result-verified"
    : preflight.state === "idle" || preflight.state === "checking"
      ? "result-neutral"
      : "result-blocked";

  async function loadPassport() {
    await loadPassportByTarget(registry, passportId);
  }

  async function copyPassportLink() {
    try {
      await navigator.clipboard?.writeText(createPassportLink(window.location.origin, displayRegistry, displayPassportId));
      setLoadState({ state: "idle", message: "Share link copied. It opens this exact registry and Passport live from Monad." });
    } catch {
      setLoadState({ state: "error", message: "Could not copy the share link. Your Passport remains unchanged." });
    }
  }

  async function runPreflight(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreflight({ state: "checking", message: "Loading the Passport and querying the deployed Principal contract through eth_call." });
    try {
      const response = await fetch("/api/principal/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registry, passportId, recipient, amount }),
      });
      const data: { error?: string; decision?: string; permitted?: boolean; vault?: string } = await response.json();
      if (!response.ok || !data.decision) {
        setPreflight({ state: "error", message: data.error || "Live preflight is unavailable." });
        return;
      }
      setPreflight({
        state: "complete",
        decision: data.decision,
        permitted: data.permitted === true,
        message: data.permitted
          ? "The deployed passport permits this call under its current onchain state."
          : "The deployed passport blocks this call. No transaction was sent.",
      });
    } catch {
      setPreflight({ state: "error", message: "Live preflight is unavailable. No authority is assumed." });
    }
  }

  return (
    <section className="workspace-shell" id="workspace" aria-labelledby="workspace-surface-title">
      <div className="workspace-heading"><div><p>Principal workspace</p><h2 id="workspace-surface-title">Contract Passport</h2></div><span><i />Monad testnet</span></div>
      <section className="workspace" aria-label="Principal contract passport">
        <article className="passport" id="passport">
          <div className="passport-header">
            <div>
              <p className="passport-kicker">Contract passport</p>
              <div className="passport-product-title"><Mark size={32} /><h1>Principal</h1></div>
              <p className="passport-subtitle">Inspect the authority bound to any deployed Principal passport.</p>
            </div>
            <div className="passport-header-meta">
              <span className="passport-id">Passport: #{displayPassportId}</span>
              <div className={`status ${isHistoricalDefault ? "status-historical" : passport?.active ? "status-verified" : ""}`}><CheckIcon size={16} />{isHistoricalDefault ? principalPassport.state : passport?.active ? "Live active passport" : "Live inactive passport"}</div>
            </div>
          </div>

          <p className={`status-explanation ${isHistoricalDefault ? "status-explanation-historical" : passport?.active ? "status-explanation-verified" : ""}`}>
            {isHistoricalDefault ? `${principalPassport.statusDetail} Load another passport to replace this reviewed snapshot with a fresh Monad read.` : "This Passport tuple was loaded directly from Monad. The preflight reloads it before every decision."}
          </p>

          <dl className="passport-grid">
            <PassportField label="Verified principal" tone="muted"><span className="inline-icon"><PersonIcon size={16} />{passport ? shorten(passport.principal) : principalPassport.principal}</span></PassportField>
            <PassportField label="Vault"><CopyValue label="vault address" display={shorten(displayVault)} value={displayVault} /></PassportField>
            <PassportField label="Factory"><CopyValue label="factory address" display={shorten(displayRegistry)} value={displayRegistry} /></PassportField>
            <PassportField label="Runtime code hash"><span className="muted-value">{passport ? shorten(passport.runtimeCodeHash, 8, 6) : principalPassport.codeHash}</span></PassportField>
            <PassportField label="CVA"><span className="inline-icon"><AssetIcon size={16} />{passport ? shorten(passport.asset) : principalPassport.asset}</span></PassportField>
            <PassportField label="Permitted action"><span>{passport ? passport.spent === null ? "CVA transfer calls, per-call capped" : "CVA transfer calls, cumulatively bounded" : principalPassport.authority}</span></PassportField>
            <PassportField label={passport && passport.spent !== null ? "Total allowance" : "Per-transfer cap"}><span className="mono">{passport ? formatUnits(passport.totalAllowance, passport.spent === null ? "aUSDC per transfer" : "aUSDC total") : principalPassport.cap}</span></PassportField>
            {passport && passport.spent !== null && <PassportField label="Remaining allowance"><span className="mono">{formatUnits(remainingAllowance(passport) || "0", "aUSDC available")}</span></PassportField>}
            <PassportField label="Expiry"><span>{passport ? formatUnixTimestamp(passport.expiry) : principalPassport.expiry}</span></PassportField>
            <PassportField label="Nonce"><span className="mono">{passport?.nonce || principalPassport.nonce}</span></PassportField>
          </dl>

          <div className="relationship" aria-label="Authority relationship">
            <div className="relationship-node is-historical"><PersonIcon size={19} /><span><strong>Verified principal</strong><small>{passport ? "Live Passport tuple" : "Recorded proof"}</small></span></div>
            <ArrowIcon className="relationship-arrow" size={20} />
            <div className="relationship-node is-verified"><VaultIcon size={19} /><span><strong>PrincipalVault</strong><small>{passport ? "Bound by Passport" : "Deployed"}</small></span></div>
            <ArrowIcon className="relationship-arrow" size={20} />
            <div className="relationship-node is-verified"><AssetIcon size={19} /><span><strong>CVA transfer</strong><small>{passport ? "Preflighted live" : "0.60 aUSDC proven"}</small></span></div>
          </div>

          <div className="passport-footer"><span>Chain: Monad testnet</span><div><button type="button" className="text-button" onClick={copyPassportLink}>Copy inspection link</button><button type="button" className="text-button" onClick={() => setExpanded(!expanded)}>{expanded ? "Hide evidence details" : "Show evidence details"}</button></div></div>
          {expanded && <div className="passport-details"><p>The recorded evidence shows that the factory created this vault, held the Cleanverse registrar role, registered the vault's RuleV2 pool and CVI, and issued Passport #1. A loaded Passport is read directly from its registry. The preflight then re-reads that tuple before evaluating current authority.</p></div>}
        </article>

        <aside className="action-panel" aria-label="Passport inspector">
          <div className="action-heading"><p>Authority inspector</p><h2>Live preflight</h2><span>Read-only Monad eth_call, no wallet required</span></div>
          <div className="passport-locator">
            <label htmlFor="registry">Principal registry</label>
            <input id="registry" value={registry} onChange={(event) => setRegistry(event.target.value)} placeholder="0x… registry address" autoComplete="off" />
            <label htmlFor="passport-id">Passport ID</label>
            <input id="passport-id" inputMode="numeric" value={passportId} onChange={(event) => setPassportId(event.target.value)} placeholder="1" autoComplete="off" />
            <button className="secondary-action" type="button" onClick={() => void loadPassport()} disabled={loadState.state === "loading"}>{loadState.state === "loading" ? "Loading Passport" : "Load Passport"}</button>
            <p className={`inspector-message ${loadState.state}`} aria-live="polite">{loadState.message}</p>
          </div>
          <form onSubmit={runPreflight}>
            <label htmlFor="recipient">Recipient</label>
            <input id="recipient" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="0x… recipient address" autoComplete="off" />
            <label htmlFor="amount">Amount</label>
            <div className="amount-field"><input id="amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /><span>aUSDC</span></div>
            <button className="primary-action" type="submit" disabled={preflight.state === "checking"}>{preflight.state === "checking" ? "Checking authority" : "Check authority"}</button>
          </form>

          <section className="preflight-summary" aria-labelledby="preflight-title">
            <div className="preflight-title"><h3 id="preflight-title">Deterministic preflight</h3><RefreshIcon size={16} /></div>
            <ul>
              <li className="verified"><CheckIcon size={16} /><span>Registry source <small>Monad contract read</small></span></li>
              <li className={passport ? "verified" : "historical"}><StateIcon state="verified" /><span>Passport tuple <small>{passport ? "loaded live" : "reviewed default"}</small></span></li>
              <li className={passport ? "verified" : "historical"}><StateIcon state="verified" /><span>Vault binding <small>{passport ? shorten(displayVault) : "recorded proof"}</small></span></li>
              <li className="historical"><CheckIcon size={16} /><span>Cleanverse lifecycle <small>public evidence below</small></span></li>
              <li className="muted"><span className="dot" /><span>{recipientState}</span></li>
            </ul>
          </section>

          <div className={`result-block ${resultTone}`}>
            {preflight.state === "complete" && preflight.permitted ? <CheckIcon size={20} /> : preflight.state === "idle" || preflight.state === "checking" ? <RefreshIcon size={20} /> : <BlockIcon size={20} />}
            <div>
              <strong>{preflight.state === "complete" ? preflight.permitted ? "Authority permitted" : "Authority blocked" : preflight.state === "error" ? "Preflight unavailable" : "Ready for live evaluation"}</strong>
              <p>{preflight.message}</p>
              <code>{preflight.decision || (preflight.state === "error" ? "RPC_UNAVAILABLE" : "NO_TRANSACTION_SENT")}</code>
            </div>
          </div>
        </aside>
      </section>

      <section className="evidence-section" id="evidence" aria-labelledby="evidence-title">
        <div className="section-heading"><div><p>Evidence timeline</p><h2 id="evidence-title">Recorded testnet proof</h2></div><span>Historical snapshot · Aug 9, 2026</span></div>
        <ol className="timeline">
          {principalPassport.evidence.map((item) => <li key={item.title} className={item.state}>
            <span className="timeline-marker"><StateIcon state={item.state} /></span>
            <div><h3>{item.title}</h3><p>{item.detail}</p>{item.href ? <a href={item.href} target="_blank" rel="noreferrer">{item.reference} <ExternalIcon size={13} /></a> : <code>{item.reference}</code>}</div>
          </li>)}
        </ol>
      </section>
    </section>
  );
}
