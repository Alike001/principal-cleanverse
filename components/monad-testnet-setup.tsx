"use client";

import { useState } from "react";
import { addMonadTestnet, type Eip1193Provider, monadTestnet } from "@/lib/principal/monad";
import { CheckIcon, ExternalIcon } from "./icons";

type SetupState = "idle" | "adding" | "added" | "unavailable" | "failed";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function MonadTestnetSetup() {
  const [state, setState] = useState<SetupState>("idle");

  async function handleAddNetwork() {
    if (!window.ethereum) {
      setState("unavailable");
      return;
    }

    setState("adding");
    try {
      await addMonadTestnet(window.ethereum);
      setState("added");
    } catch {
      setState("failed");
    }
  }

  const message = state === "added"
    ? "Monad Testnet was added in your wallet."
    : state === "unavailable"
      ? "Install an EVM wallet extension, then return to add Monad Testnet."
      : state === "failed"
        ? "Your wallet did not add the network. Try again or use the official Monad guide."
        : "This adds the network only. It does not connect an account to Principal.";

  return <section className="testnet-setup" aria-labelledby="testnet-setup-title">
    <div>
      <p>Testnet setup</p>
      <h2 id="testnet-setup-title">Add Monad Testnet.</h2>
      <p>Testnet MON pays gas. Network setup never connects an account or grants Principal authority.</p>
    </div>
    <div className="testnet-setup-actions">
      <button type="button" className="workspace-button" onClick={handleAddNetwork} disabled={state === "adding"}>
        {state === "adding" ? "Adding Monad Testnet" : "Add Monad Testnet"}
      </button>
      <a className="button button-secondary" href={monadTestnet.faucetUrl} target="_blank" rel="noreferrer">
        Get testnet MON <ExternalIcon size={16} />
      </a>
      <p className={`testnet-message ${state}`}><CheckIcon size={16} /> {message}</p>
    </div>
  </section>;
}
