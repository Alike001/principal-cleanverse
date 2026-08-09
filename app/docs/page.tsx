import { ArrowIcon, ExternalIcon, Mark } from "@/components/icons";
import { MonadTestnetSetup } from "@/components/monad-testnet-setup";

export default function DocsPage() {
  return <main>
    <header className="workspace-site-header">
      <a className="site-brand" href="/"><Mark /><span>Principal</span></a>
      <a className="workspace-back-link" href="/"><ArrowIcon size={16} />Back to product</a>
    </header>

    <section className="docs-hero" aria-labelledby="docs-title">
      <p>Principal documentation</p>
      <h1 id="docs-title">Everything a tester needs, in one place.</h1>
      <p>Principal is a public, read-only way to inspect whether a controller has authority to move a Cleanverse verified asset on Monad.</p>
    </section>

    <section className="docs-grid" aria-label="Principal documentation">
      <article>
        <span>01</span>
        <h2>What Principal proves</h2>
        <p>A verified principal controls the factory. The factory created the vault. The vault has one configured Cleanverse CVA target and follows deterministic authority checks.</p>
      </article>
      <article>
        <span>02</span>
        <h2>Current testnet state</h2>
        <p>The principal, factory, and vault are deployed and verified. Validator pool registration is blocked, so no CVA transfer is presented as complete.</p>
      </article>
      <article>
        <span>03</span>
        <h2>Use the workspace</h2>
        <p>Open the workspace to inspect the controller, vault, rule state, and transfer decision. Browsing it never asks for a wallet connection.</p>
        <a href="/workspace">Open workspace <ArrowIcon size={16} /></a>
      </article>
      <article>
        <span>04</span>
        <h2>Public evidence</h2>
        <p>The source and deployed factory are public. Sponsor API documentation is intentionally not linked here because it requires a private access code.</p>
        <div className="docs-links"><a href="https://github.com/Alike001/principal-cleanverse" target="_blank" rel="noreferrer">Source code <ExternalIcon size={15} /></a><a href="https://testnet.monadscan.com/address/0x2683f26DDc6c2aF920Ee844150000a59FBBd4291" target="_blank" rel="noreferrer">Factory on Monad <ExternalIcon size={15} /></a></div>
      </article>
    </section>

    <MonadTestnetSetup />
  </main>;
}
