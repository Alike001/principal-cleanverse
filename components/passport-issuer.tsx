"use client";

import { FormEvent, useState } from "react";
import { principalDeployment } from "@/lib/principal/deployment";
import {
  connectPassportIssuer,
  PassportIssuerInputError,
  preflightPassportRevocation,
  preflightPassportIssuance,
  readActivePassportId,
  submitPassportIssuance,
  waitForTransactionReceipt,
  type PassportIssuerPreflight,
} from "@/lib/principal/passport-issuer";
import type { Eip1193Provider } from "@/lib/principal/monad";
import { CheckIcon, ExternalIcon, RefreshIcon } from "./icons";

type IssuerState = "idle" | "connecting" | "connected" | "checking" | "ready" | "submitting" | "submitted" | "error";

declare global {
  interface Window { ethereum?: Eip1193Provider; }
}

function shorten(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function messageFor(error: unknown) {
  if (error instanceof PassportIssuerInputError) return error.message;
  return "Your wallet or Monad RPC could not complete that step. No passport was changed.";
}

export function PassportIssuer() {
  const [registry, setRegistry] = useState<string>(principalDeployment.factoryAddress);
  const [vault, setVault] = useState<string>(principalDeployment.vaultAddress);
  const [amountCap, setAmountCap] = useState<string>(principalDeployment.totalAllowance);
  const [expiry, setExpiry] = useState("");
  const [account, setAccount] = useState("");
  const [preflight, setPreflight] = useState<PassportIssuerPreflight | null>(null);
  const [state, setState] = useState<IssuerState>("idle");
  const [message, setMessage] = useState("Connect the vault controller. This never asks for a private key.");
  const [transactionHash, setTransactionHash] = useState("");
  const [issuedPassportId, setIssuedPassportId] = useState<bigint | null>(null);
  const [revokePassportId, setRevokePassportId] = useState(String(principalDeployment.passportId));
  const [revokeData, setRevokeData] = useState<string | null>(null);
  const [revokeState, setRevokeState] = useState<"idle" | "checking" | "ready" | "submitting" | "submitted" | "error">("idle");
  const [revokeMessage, setRevokeMessage] = useState("Revocation permanently makes the selected Passport inactive.");

  function provider() {
    if (!window.ethereum) throw new PassportIssuerInputError("Install an EVM wallet extension to issue a passport.");
    return window.ethereum;
  }

  async function connect() {
    setState("connecting");
    setPreflight(null);
    setTransactionHash("");
    try {
      const connected = await connectPassportIssuer(provider());
      setAccount(connected);
      setState("connected");
      setMessage(`Connected ${shorten(connected)} on Monad Testnet. Validate the exact vault before issuing.`);
    } catch (error) {
      setState("error");
      setMessage(messageFor(error));
    }
  }

  async function validate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) {
      setState("error");
      setMessage("Connect the vault controller before validating an issuance.");
      return;
    }
    setState("checking");
    setPreflight(null);
    try {
      const result = await preflightPassportIssuance(provider(), { registry, vault, account, amountCap, expiry });
      setPreflight(result);
      setState("ready");
      setMessage("Preflight passed. Your wallet will show the final transaction before anything changes onchain.");
    } catch (error) {
      setState("error");
      setMessage(messageFor(error));
    }
  }

  async function issue() {
    if (!preflight) return;
    setState("submitting");
    try {
      const txHash = await submitPassportIssuance(provider(), { account, registry, data: preflight.data });
      setTransactionHash(txHash);
      await waitForTransactionReceipt(provider(), txHash);
      const passportId = await readActivePassportId(provider(), registry, vault);
      setIssuedPassportId(passportId);
      setState("submitted");
      setMessage(`Passport #${passportId.toString()} is now the active passport for this vault.`);
    } catch (error) {
      setState("error");
      setMessage(messageFor(error));
    }
  }

  async function validateRevocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) {
      setRevokeState("error");
      setRevokeMessage("Connect the Passport controller before validating revocation.");
      return;
    }
    setRevokeState("checking");
    setRevokeData(null);
    try {
      const result = await preflightPassportRevocation(provider(), { registry, account, passportId: revokePassportId });
      setRevokeData(result.data);
      setRevokeState("ready");
      setRevokeMessage(`Monad simulated revocation using ${result.estimatedGas.toString()} gas units. Your wallet will ask for separate confirmation.`);
    } catch (error) {
      setRevokeState("error");
      setRevokeMessage(messageFor(error));
    }
  }

  async function revoke() {
    if (!revokeData) return;
    setRevokeState("submitting");
    try {
      const txHash = await submitPassportIssuance(provider(), { account, registry, data: revokeData });
      await waitForTransactionReceipt(provider(), txHash);
      setRevokeState("submitted");
      setRevokeMessage(`Passport #${revokePassportId} is inactive. Load it in the inspector above to verify the final onchain state.`);
    } catch (error) {
      setRevokeState("error");
      setRevokeMessage(messageFor(error));
    }
  }

  const canIssue = state === "ready" && Boolean(preflight);
  return <section className="issuer-section" aria-labelledby="passport-issuer-title">
    <div className="issuer-intro">
      <p>Passport lifecycle</p>
      <h2 id="passport-issuer-title">Issue or renew a Passport</h2>
      <p>Vault controllers can create a fresh, limited authority record without exposing a key to Principal. A new Passport makes the vault’s previous active Passport inactive.</p>
      <div className="issuer-safety"><CheckIcon size={16} /><span>Connect is wallet-controlled. Validation is read-only. Issuance needs a separate wallet confirmation.</span></div>
    </div>
    <div className="issuer-card">
      <div className="issuer-connection"><div><span>Vault controller</span><strong>{account ? shorten(account) : "Not connected"}</strong></div><button className="secondary-action" type="button" onClick={connect} disabled={state === "connecting" || state === "submitting"}>{state === "connecting" ? "Connecting wallet" : account ? "Reconnect wallet" : "Connect wallet"}</button></div>
      <form onSubmit={validate}>
        <div className="issuer-fields">
          <label htmlFor="issuer-registry">Principal registry<input id="issuer-registry" value={registry} onChange={(event) => { setRegistry(event.target.value); setPreflight(null); }} autoComplete="off" /></label>
          <label htmlFor="issuer-vault">Factory vault<input id="issuer-vault" value={vault} onChange={(event) => { setVault(event.target.value); setPreflight(null); }} autoComplete="off" /></label>
          <label htmlFor="issuer-cap">Total allowance<input id="issuer-cap" value={amountCap} onChange={(event) => { setAmountCap(event.target.value); setPreflight(null); }} inputMode="decimal" autoComplete="off" /><small>aUSDC, cumulative across every permitted transfer</small></label>
          <label htmlFor="issuer-expiry">Expiry<input id="issuer-expiry" type="datetime-local" value={expiry} onChange={(event) => { setExpiry(event.target.value); setPreflight(null); }} required /><small>Choose a future date. The contract enforces it on Monad.</small></label>
        </div>
        <button className="primary-action" type="submit" disabled={state === "checking" || state === "submitting"}>{state === "checking" ? "Validating on Monad" : "Validate issuance"}</button>
      </form>
      <div className={`issuer-result ${state === "error" ? "issuer-error" : state === "ready" || state === "submitted" ? "issuer-ready" : ""}`} aria-live="polite">
        {state === "checking" || state === "submitting" ? <RefreshIcon size={18} /> : state === "error" ? <span className="issuer-symbol">!</span> : <CheckIcon size={18} />}
        <div><strong>{state === "submitted" ? "Passport submitted" : state === "ready" ? "Safe to confirm in wallet" : state === "error" ? "Issuance blocked" : "No authority changed"}</strong><p>{message}</p>{preflight && <small>Factory vault and controller match. Monad estimated {preflight.estimatedGas.toString()} gas units before wallet confirmation.</small>}{transactionHash && <a href={`${principalDeployment.explorerUrl}/tx/${transactionHash}`} target="_blank" rel="noreferrer">View transaction <ExternalIcon size={13} /></a>}{issuedPassportId !== null && <small>Inspect Passport #{issuedPassportId.toString()} using the live inspector above.</small>}</div>
      </div>
      <button className="issuer-submit" type="button" onClick={issue} disabled={!canIssue}>{state === "submitting" ? "Waiting for wallet" : "Create or renew Passport"}</button>
      <section className="issuer-revoke" aria-labelledby="issuer-revoke-title">
        <div><p>Emergency control</p><h3 id="issuer-revoke-title">Revoke a Passport</h3><span>Permanent onchain termination. This does not move any aUSDC.</span></div>
        <form onSubmit={validateRevocation}>
          <label htmlFor="revoke-passport-id">Passport ID<input id="revoke-passport-id" value={revokePassportId} onChange={(event) => { setRevokePassportId(event.target.value); setRevokeData(null); }} inputMode="numeric" autoComplete="off" /></label>
          <button className="revoke-validate" type="submit" disabled={revokeState === "checking" || revokeState === "submitting"}>{revokeState === "checking" ? "Validating" : "Validate revocation"}</button>
        </form>
        <p className={`revoke-message ${revokeState}`} aria-live="polite">{revokeMessage}</p>
        <button className="revoke-submit" type="button" onClick={revoke} disabled={revokeState !== "ready" || !revokeData}>{revokeState === "submitting" ? "Waiting for wallet" : "Revoke Passport"}</button>
      </section>
    </div>
  </section>;
}
