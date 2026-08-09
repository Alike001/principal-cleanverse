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
      <h1 id="docs-title">Inspect authority before an asset moves.</h1>
      <p>Principal shows the controller, factory, vault, and current rule result for one Cleanverse asset on Monad.</p>
    </section>

    <section className="docs-grid" aria-label="Principal documentation">
      <article>
        <span>01</span>
        <h2>What you can check</h2>
        <p>See who controls the factory, which vault it created, and the Cleanverse asset it is configured to handle.</p>
      </article>
      <article>
        <span>02</span>
        <h2>Live testnet state</h2>
        <p>The principal, factory, and vault are live. A 0.05 aUSDC transfer was permitted through Passport #1 and returned from the vault on Monad.</p>
      </article>
      <article>
        <span>03</span>
        <h2>Open the workspace</h2>
        <p>Review the controller, vault, rule state, and transfer decision. Inspection never needs a wallet connection.</p>
        <a href="/workspace">Open workspace <ArrowIcon size={16} /></a>
      </article>
      <article id="public-evidence">
        <span>04</span>
        <h2>Public evidence</h2>
        <p>Review the source and deployed factory. Cleanverse API docs need a private access code, so this page documents Principal itself.</p>
        <div className="docs-links"><a href="https://github.com/Alike001/principal-cleanverse" target="_blank" rel="noreferrer">Source code <ExternalIcon size={15} /></a><a href="https://testnet.monadscan.com/address/0xcf145f0730989137cce3b94863490e6ac0f84c8b" target="_blank" rel="noreferrer">Factory on Monad <ExternalIcon size={15} /></a></div>
      </article>
    </section>

    <MonadTestnetSetup />
  </main>;
}
