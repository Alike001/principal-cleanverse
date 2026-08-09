import { ContractPassport } from "@/components/contract-passport";
import { ArrowIcon, Mark } from "@/components/icons";

export default function WorkspacePage() {
  return <main>
    <header className="workspace-site-header">
      <a className="site-brand" href="/"><Mark /><span>Principal</span></a>
      <div className="workspace-site-actions"><a className="workspace-back-link" href="/"><ArrowIcon size={16} />Back to product</a></div>
    </header>
    <ContractPassport />
  </main>;
}
