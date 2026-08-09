"use client";

import { useState } from "react";
import { authorityChecks, authorityNodes, type AuthorityNode } from "@/lib/principal/authority";
import { ArrowIcon, AssetIcon, BlockIcon, CheckIcon, ExternalIcon, Mark, PersonIcon, VaultIcon } from "./icons";

function GraphNodeButton({ node, active, onSelect }: { node: AuthorityNode; active: boolean; onSelect: (node: AuthorityNode) => void }) {
  const details = authorityNodes[node];
  const Icon = node === "principal" ? PersonIcon : node === "asset" ? AssetIcon : VaultIcon;
  return <button type="button" className={`graph-node graph-node-${node} ${active ? "is-active" : ""} ${details.state}`} onClick={() => onSelect(node)} aria-pressed={active}>
    <span className="graph-node-icon"><Icon size={21} /></span>
    <span><strong>{details.title}</strong><small>{details.state === "verified" ? "Reviewed evidence" : "Registration pending"}</small></span>
  </button>;
}

export function PrincipalLanding() {
  const [selected, setSelected] = useState<AuthorityNode>("asset");
  const selectedNode = authorityNodes[selected];

  return <>
    <header className="site-header">
      <a className="site-brand" href="#top" aria-label="Principal home"><Mark /><span>Principal</span></a>
      <nav className="site-nav" aria-label="Primary navigation">
        <a href="#how-it-works">How it works</a><a href="#protocol">Protocol</a><a href="#evidence">Evidence</a><a href="https://docs.cleanverse.com" target="_blank" rel="noreferrer">Docs</a>
      </nav>
      <a className="workspace-button" href="/workspace">Open workspace <ArrowIcon size={16} /></a>
    </header>

    <main id="top">
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="hero-context">Principal for Cleanverse on Monad</p>
          <h1 id="hero-title">Authority,<br />made inspectable.</h1>
          <p>Principal binds a verified controller, a factory-created vault, and one Cleanverse asset before authority can be used.</p>
          <div className="hero-actions"><a className="button button-primary" href="/workspace">Open workspace <ArrowIcon size={17} /></a><a className="button button-secondary" href="#how-it-works">How it works</a></div>
          <div className="hero-proof-row"><p className="hero-proof"><CheckIcon size={17} /> Read-only workspace, no wallet connection required</p><a href="https://testnet.monadscan.com/address/0x2683f26DDc6c2aF920Ee844150000a59FBBd4291" target="_blank" rel="noreferrer">View Monad testnet proof <ExternalIcon size={14} /></a></div>
        </div>

        <div className="graph-wrap" aria-label="Principal authority graph">
          <div className="graph-topline"><span>Authority graph</span><span className="mono">Monad testnet</span></div>
          <div className="graph-canvas">
            <GraphNodeButton node="principal" active={selected === "principal"} onSelect={setSelected} />
            <span className="graph-line line-principal-factory" aria-hidden="true" />
            <GraphNodeButton node="factory" active={selected === "factory"} onSelect={setSelected} />
            <span className="graph-line line-factory-vault" aria-hidden="true" />
            <GraphNodeButton node="vault" active={selected === "vault"} onSelect={setSelected} />
            <span className="graph-line graph-line-blocked line-vault-asset" aria-hidden="true"><BlockIcon size={17} /></span>
            <GraphNodeButton node="asset" active={selected === "asset"} onSelect={setSelected} />
          </div>
          <div className={`graph-inspector ${selectedNode.state}`}><span>{selectedNode.state === "verified" ? <CheckIcon size={16} /> : <BlockIcon size={16} />}</span><div><strong>{selectedNode.title}</strong><p>{selectedNode.detail}</p></div></div>
        </div>
      </section>

      <section className="method-section" id="how-it-works" aria-labelledby="method-title">
        <div className="section-intro"><p>How it works</p><h2 id="method-title">Authority becomes a chain of facts.</h2></div>
        <ol className="method-rail">
          <li><span>01</span><h3>Declare</h3><p>A verified principal controls the factory that starts the authority path.</p><code>principal.cvi</code></li>
          <li><span>02</span><h3>Bind</h3><p>The factory creates one immutable vault and makes its code checkable.</p><code>factory → vault</code></li>
          <li><span>03</span><h3>Verify</h3><p>Cleanverse rules determine whether the pool can hold and move the CVA.</p><code>validator.registerV2</code></li>
          <li><span>04</span><h3>Decide</h3><p>The vault only acts when the deterministic authority checks succeed.</p><code>evaluate()</code></li>
        </ol>
      </section>

      <section className="decision-section" id="protocol" aria-labelledby="decision-title">
        <div><p>Deterministic decision path</p><h2 id="decision-title">The transfer path has no hidden judgment.</h2><a href="/workspace">Inspect the real workspace <ArrowIcon size={16} /></a></div>
        <div className="decision-table" role="table" aria-label="Current authority decision">
          {authorityChecks.map((check) => <div role="row" key={check.label}><span role="cell">{check.label}</span><span role="cell">{check.value}</span><b className={check.state} role="cell">{check.state === "verified" ? <CheckIcon size={15} /> : <BlockIcon size={15} />}{check.state === "verified" ? "Verified" : "Blocked"}</b></div>)}
          <div className="decision-total" role="row"><span role="cell">Current transfer decision</span><b role="cell">Blocked until pool registration</b></div>
        </div>
      </section>

      <section className="workspace-intro" aria-labelledby="workspace-title"><div><p>Product workspace</p><h2 id="workspace-title">Inspect the authority, then act.</h2></div><div><p>The separate workspace keeps every live claim narrow: the verified principal, deployed factory and vault, Cleanverse CVA target, and the current pool-registration block.</p><a className="workspace-text-link" href="/workspace">Open the read-only workspace <ArrowIcon size={16} /></a></div></section>
    </main>
  </>;
}
