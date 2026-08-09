"use client";

import { FormEvent, useState } from "react";
import { principalPassport, type EvidenceItem } from "@/lib/principal/passport";
import { ArrowIcon, AssetIcon, BlockIcon, CheckIcon, CopyIcon, ExternalIcon, Mark, PersonIcon, RefreshIcon, VaultIcon } from "./icons";

function StateIcon({ state }: { state: EvidenceItem["state"] | "blocked" | "verified" }) {
  return state === "verified" ? <CheckIcon size={16} /> : <BlockIcon size={16} />;
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
  const [recipient, setRecipient] = useState(principalPassport.vaultAddress);
  const [amount, setAmount] = useState("0.05");
  const [expanded, setExpanded] = useState(false);
  const [cviState, setCviState] = useState<"snapshot" | "registered" | "unavailable">("snapshot");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("Historical CVI proof is shown. Refresh to check the optional Cleanverse route.");
  const [preflight, setPreflight] = useState<{
    state: "idle" | "checking" | "complete" | "error";
    decision?: string;
    permitted?: boolean;
    message: string;
  }>({ state: "idle", message: "Enter a recipient and amount to query the active Passport #2 on Monad." });

  async function refreshStatus() {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/cleanverse/monad", { cache: "no-store" });
      if (!response.ok) throw new Error("unavailable");
      const data: { principalCvi?: "registered" | "not_registered" } = await response.json();
      if (data.principalCvi === "registered") {
        setCviState("registered");
        setRefreshMessage("Live Cleanverse CVI check confirmed");
      } else {
        setCviState("unavailable");
        setRefreshMessage("Live CVI check did not confirm an active principal");
      }
    } catch {
      setCviState("unavailable");
      setRefreshMessage("Live status is unavailable. The snapshot does not grant authority.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function runPreflight(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreflight({ state: "checking", message: "Querying the deployed Principal contract through eth_call." });
    try {
      const response = await fetch("/api/principal/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient, amount }),
      });
      const data: { error?: string; decision?: string; permitted?: boolean } = await response.json();
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

  const recipientState = recipient.trim() ? "Recipient ready for a read-only check" : "Add a recipient to run the preflight";
  const resultTone = preflight.state === "complete" && preflight.permitted
    ? "result-verified"
    : preflight.state === "idle" || preflight.state === "checking"
      ? "result-neutral"
      : "result-blocked";

  return (
    <section className="workspace-shell" id="workspace" aria-labelledby="workspace-surface-title">
      <div className="workspace-heading"><div><p>Principal workspace</p><h2 id="workspace-surface-title">Contract Passport</h2></div><span><i />Monad testnet</span></div>
      <section className="workspace" aria-label="Principal contract passport">
        <article className="passport" id="passport">
          <div className="passport-header">
            <div>
              <p className="passport-kicker">Contract passport</p>
              <div className="passport-product-title"><Mark size={32} /><h1>Principal</h1></div>
              <p className="passport-subtitle">Revocable authority for a verified asset contract.</p>
            </div>
            <div className="passport-header-meta">
              <span className="passport-id">Passport: {principalPassport.passportId}</span>
              <div className="status status-historical"><CheckIcon size={16} />{principalPassport.state}</div>
            </div>
          </div>

          <p className="status-explanation status-explanation-historical">{principalPassport.statusDetail} The live preflight is the source of truth for a current permit or block.</p>

          <dl className="passport-grid">
            <PassportField label="Verified principal" tone={cviState === "registered" ? "blue" : "muted"}><span className="inline-icon"><PersonIcon size={16} />{cviState === "unavailable" ? "CVI state unavailable" : principalPassport.principal}</span></PassportField>
            <PassportField label="Vault"><CopyValue label="vault address" display={principalPassport.vault} value={principalPassport.vaultAddress} /></PassportField>
            <PassportField label="Factory"><CopyValue label="factory address" display={principalPassport.registry} value={principalPassport.registryAddress} /></PassportField>
            <PassportField label="Runtime code hash"><span className="muted-value">{principalPassport.codeHash}</span></PassportField>
            <PassportField label="CVA"><span className="inline-icon"><AssetIcon size={16} />{principalPassport.asset}</span></PassportField>
            <PassportField label="Permitted action"><span>{principalPassport.authority}</span></PassportField>
            <PassportField label="Per-transfer cap"><span className="mono">{principalPassport.cap}</span></PassportField>
            <PassportField label="Expiry"><span>{principalPassport.expiry}</span></PassportField>
            <PassportField label="Nonce"><span className="mono">{principalPassport.nonce}</span></PassportField>
          </dl>

          <div className="relationship" aria-label="Authority relationship">
            <div className={`relationship-node ${cviState === "registered" ? "is-verified" : "is-historical"}`}><PersonIcon size={19} /><span><strong>Verified principal</strong><small>{cviState === "registered" ? "CVI active" : cviState === "snapshot" ? "Recorded proof" : "Read unavailable"}</small></span></div>
            <ArrowIcon className="relationship-arrow" size={20} />
            <div className="relationship-node is-verified"><VaultIcon size={19} /><span><strong>PrincipalVault</strong><small>Deployed</small></span></div>
            <ArrowIcon className="relationship-arrow" size={20} />
            <div className="relationship-node is-verified"><AssetIcon size={19} /><span><strong>CVA transfer</strong><small>0.05 aUSDC proven</small></span></div>
          </div>

          <div className="passport-footer"><span>Chain: {principalPassport.chain}</span><button type="button" className="text-button" onClick={() => setExpanded(!expanded)}>{expanded ? "Hide evidence details" : "Show evidence details"}</button></div>
          {expanded && <div className="passport-details"><p>The recorded evidence shows that the factory created this vault, held the Cleanverse registrar role, registered the vault's RuleV2 pool and CVI, and issued Passport #1. Passport #2 renewed the same mandate. The live preflight checks the deployed contract. The amount cap applies to each transfer call until the passport expires or is revoked.</p></div>}
        </article>

        <aside className="action-panel" aria-label="Transfer preflight">
          <div className="action-heading"><p>Authority inspector</p><h2>Live preflight</h2><span>Read-only Monad eth_call, no wallet required</span></div>
          <form onSubmit={runPreflight}>
            <label htmlFor="recipient">Recipient</label>
            <input id="recipient" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="0x… recipient address" autoComplete="off" />
            <label htmlFor="amount">Amount</label>
            <div className="amount-field"><input id="amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /><span>aUSDC</span></div>
            <button className="primary-action" type="submit" disabled={preflight.state === "checking"}>{preflight.state === "checking" ? "Checking authority" : "Check authority"}</button>
          </form>

          <section className="preflight-summary" aria-labelledby="preflight-title">
            <div className="preflight-title"><h3 id="preflight-title">Deterministic preflight</h3><button type="button" className="icon-button" onClick={refreshStatus} disabled={isRefreshing} aria-label="Refresh Cleanverse CVI state"><RefreshIcon size={16} /></button></div>
            <ul>
              <li className={cviState === "registered" ? "verified" : cviState === "snapshot" ? "historical" : "blocked"}><StateIcon state={cviState === "unavailable" ? "blocked" : "verified"} /><span>Principal CVI <small>{cviState === "registered" ? "live confirmed" : cviState === "snapshot" ? "recorded proof" : "not confirmed"}</small></span></li>
              <li className="historical"><CheckIcon size={16} /><span>Factory vault <small>recorded proof</small></span></li>
              <li className="historical"><CheckIcon size={16} /><span>Registrar role <small>recorded proof</small></span></li>
              <li className="historical"><CheckIcon size={16} /><span>Validator pool <small>recorded proof</small></span></li>
              <li className="historical"><CheckIcon size={16} /><span>Per-transfer cap <small>{principalPassport.cap}</small></span></li>
              <li className="muted"><span className="dot" /><span>{recipientState}</span></li>
            </ul>
            <p className="refresh-message" aria-live="polite">{isRefreshing ? "Refreshing Cleanverse status…" : refreshMessage}</p>
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
