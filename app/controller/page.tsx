import { ArrowIcon, Mark } from "@/components/icons";
import { PassportIssuer } from "@/components/passport-issuer";

export default function ControllerPage() {
  return <main>
    <header className="workspace-site-header">
      <a className="site-brand" href="/"><Mark /><span>Principal</span></a>
      <div className="workspace-site-actions"><a className="workspace-back-link" href="/workspace"><ArrowIcon size={16} />Back to inspector</a><a className="workspace-back-link" href="/"><ArrowIcon size={16} />Back to product</a></div>
    </header>
    <section className="controller-shell" aria-labelledby="controller-title">
      <div className="controller-intro">
        <p>Owner-only controls</p>
        <h1 id="controller-title">Manage a Contract Passport</h1>
        <p>These controls change live Monad state. Inspecting a Passport and running a preflight never requires a wallet, use the workspace for those read-only checks.</p>
        <a className="workspace-text-link" href="/workspace">Open the read-only inspector <ArrowIcon size={16} /></a>
      </div>
      <PassportIssuer />
    </section>
  </main>;
}
