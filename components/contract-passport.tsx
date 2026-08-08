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
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("1.00");
  const [expanded, setExpanded] = useState(false);
  const [cviState, setCviState] = useState<"registered" | "unavailable">("registered");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("Verified snapshot loaded");

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

  function preventTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  const recipientState = recipient.trim() ? "Recipient format will be checked before any transfer" : "Add a recipient to prepare a future preflight";

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#passport" aria-label="Principal home"><Mark /><span>Principal</span></a>
        <div className="topbar-right">
          <span className="network"><i />Monad testnet</span>
          <span className="principal-hint">Active CVI principal</span>
          <a className="docs-link" href="https://docs.cleanverse.com" target="_blank" rel="noreferrer">Docs <ExternalIcon size={14} /></a>
        </div>
      </header>

      <section className="workspace" aria-label="Principal contract passport">
        <article className="passport" id="passport">
          <div className="passport-header">
            <div>
              <p className="passport-kicker">Contract passport</p>
              <h1>Principal</h1>
              <p className="passport-subtitle">Revocable authority for a verified asset contract.</p>
            </div>
            <div className="passport-header-meta">
              <span className="passport-id">{principalPassport.passportId}</span>
              <div className="status status-blocked"><BlockIcon size={16} />{principalPassport.state}</div>
            </div>
          </div>

          <p className="status-explanation">{principalPassport.statusDetail}</p>

          <dl className="passport-grid">
            <PassportField label="Verified principal" tone={cviState === "registered" ? "blue" : "muted"}><span className="inline-icon"><PersonIcon size={16} />{cviState === "registered" ? principalPassport.principal : "CVI state unavailable"}</span></PassportField>
            <PassportField label="Vault"><CopyValue label="vault address" display={principalPassport.vault} value={principalPassport.vaultAddress} /></PassportField>
            <PassportField label="Registry"><CopyValue label="registry address" display={principalPassport.registry} value={principalPassport.registryAddress} /></PassportField>
            <PassportField label="Runtime code hash"><span className="muted-value">{principalPassport.codeHash}</span></PassportField>
            <PassportField label="CVA"><span className="inline-icon"><AssetIcon size={16} />{principalPassport.asset}</span></PassportField>
            <PassportField label="Permitted action"><span>{principalPassport.authority}</span></PassportField>
            <PassportField label="Amount cap"><span className="mono">{principalPassport.cap}</span></PassportField>
            <PassportField label="Expiry"><span>{principalPassport.expiry}</span></PassportField>
            <PassportField label="Nonce"><span className="mono">{principalPassport.nonce}</span></PassportField>
          </dl>

          <div className="relationship" aria-label="Authority relationship">
            <div className="relationship-node is-verified"><PersonIcon size={19} /><span><strong>Verified principal</strong><small>{cviState === "registered" ? "CVI active" : "Read unavailable"}</small></span></div>
            <ArrowIcon className="relationship-arrow" size={20} />
            <div className="relationship-node is-verified"><VaultIcon size={19} /><span><strong>PrincipalVault</strong><small>Deployed</small></span></div>
            <span className="relationship-break" aria-label="Broken relationship due to pending pool registration"><BlockIcon size={18} /></span>
            <div className="relationship-node is-blocked"><AssetIcon size={19} /><span><strong>CVA transfer</strong><small>Pool not registered</small></span></div>
          </div>

          <div className="passport-footer"><span>Chain: {principalPassport.chain}</span><button type="button" className="text-button" onClick={() => setExpanded(!expanded)}>{expanded ? "Hide evidence details" : "Show evidence details"}</button></div>
          {expanded && <div className="passport-details"><p>The registry and vault are on Monad testnet. The Cleanverse Validator has not accepted the vault as a registered pool, so Principal refuses to attempt a CVA transfer.</p></div>}
        </article>

        <aside className="action-panel" aria-label="Transfer preflight">
          <div className="action-heading"><p>Authorized transfer</p><h2>Preflight</h2><span>Available after pool registration</span></div>
          <form onSubmit={preventTransfer}>
            <label htmlFor="recipient">Recipient</label>
            <input id="recipient" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="0x… recipient address" autoComplete="off" />
            <label htmlFor="amount">Amount</label>
            <div className="amount-field"><input id="amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /><span>aUSDC</span></div>
            <button className="primary-action" type="submit" disabled>Transfer unavailable</button>
          </form>

          <section className="preflight-summary" aria-labelledby="preflight-title">
            <div className="preflight-title"><h3 id="preflight-title">Deterministic preflight</h3><button type="button" className="icon-button" onClick={refreshStatus} disabled={isRefreshing} aria-label="Refresh Cleanverse CVI state"><RefreshIcon size={16} /></button></div>
            <ul>
              <li className={cviState === "registered" ? "verified" : "blocked"}><StateIcon state={cviState === "registered" ? "verified" : "blocked"} /><span>Principal CVI <small>{cviState === "registered" ? "active" : "not confirmed"}</small></span></li>
              <li className="verified"><CheckIcon size={16} /><span>Vault deployment <small>confirmed</small></span></li>
              <li className="verified"><CheckIcon size={16} /><span>Registrar role <small>confirmed</small></span></li>
              <li className="blocked"><BlockIcon size={16} /><span>Validator pool <small>registration blocked</small></span></li>
              <li className="muted"><span className="dot" /><span>{recipientState}</span></li>
            </ul>
            <p className="refresh-message" aria-live="polite">{isRefreshing ? "Refreshing Cleanverse status…" : refreshMessage}</p>
          </section>

          <div className="result-block result-blocked"><BlockIcon size={20} /><div><strong>Transfer blocked</strong><p>Pool registration must succeed before Principal can check the recipient or move aUSDC.</p><code>CCP_POOL_NOT_REGISTERED</code></div></div>
        </aside>
      </section>

      <section className="evidence-section" aria-labelledby="evidence-title">
        <div className="section-heading"><div><p>Evidence timeline</p><h2 id="evidence-title">What Principal has proved</h2></div><span>Verified snapshot · Aug 9, 2026</span></div>
        <ol className="timeline">
          {principalPassport.evidence.map((item) => <li key={item.title} className={item.state}>
            <span className="timeline-marker"><StateIcon state={item.state} /></span>
            <div><h3>{item.title}</h3><p>{item.detail}</p>{item.href ? <a href={item.href} target="_blank" rel="noreferrer">{item.reference} <ExternalIcon size={13} /></a> : <code>{item.reference}</code>}</div>
          </li>)}
        </ol>
      </section>
    </main>
  );
}
