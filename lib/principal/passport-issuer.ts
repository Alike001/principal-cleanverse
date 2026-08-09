import { addMonadTestnet, monadTestnet, type Eip1193Provider } from "./monad";

const REGISTER_PASSPORT_SELECTOR = "0x53eba396";
const FACTORY_VAULT_SELECTOR = "0x3a8e36be";
const OWNER_SELECTOR = "0x8da5cb5b";
const ACTIVE_PASSPORT_SELECTOR = "0x512823e5";
const REVOKE_PASSPORT_SELECTOR = "0x92c3ad1d";

export type PassportIssuerPreflight = {
  account: string;
  factoryVault: string;
  owner: string;
  estimatedGas: bigint;
  data: string;
};

export class PassportIssuerInputError extends Error {}

function isAddress(value: string) {
  return /^0x[0-9a-fA-F]{40}$/.test(value);
}

function requireAddress(value: string, label: string) {
  const normalized = value.trim().toLowerCase();
  if (!isAddress(normalized)) throw new PassportIssuerInputError(`Enter a valid ${label} address.`);
  return normalized;
}

function word(value: bigint) {
  return value.toString(16).padStart(64, "0");
}

function addressWord(value: string) {
  return value.slice(2).toLowerCase().padStart(64, "0");
}

export function parseAusdcAmount(value: string) {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{1,6})?$/.test(normalized)) {
    throw new PassportIssuerInputError("Enter a total aUSDC allowance with up to 6 decimal places.");
  }
  const [whole, fraction = ""] = normalized.split(".");
  const units = BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, "0"));
  if (units === 0n) throw new PassportIssuerInputError("The total allowance must be greater than zero.");
  if (units > (1n << 128n) - 1n) throw new PassportIssuerInputError("The total allowance is too large for a Principal passport.");
  return units;
}

export function parseExpiry(value: string) {
  const timestamp = Math.floor(new Date(value).getTime() / 1000);
  if (!Number.isSafeInteger(timestamp) || timestamp <= Math.floor(Date.now() / 1000) + 60) {
    throw new PassportIssuerInputError("Choose an expiry at least one minute in the future.");
  }
  return BigInt(timestamp);
}

export function encodeRegisterPassport(vault: string, amountCap: bigint, expiry: bigint) {
  const checkedVault = requireAddress(vault, "vault");
  if (amountCap <= 0n || amountCap > (1n << 128n) - 1n) throw new PassportIssuerInputError("The amount cap is invalid.");
  if (expiry <= 0n || expiry > (1n << 64n) - 1n) throw new PassportIssuerInputError("The expiry is invalid.");
  return `${REGISTER_PASSPORT_SELECTOR}${addressWord(checkedVault)}${word(amountCap)}${word(expiry)}`;
}

export function parseIssuerPassportId(value: string) {
  const normalized = value.trim();
  if (!/^[1-9]\d*$/.test(normalized)) throw new PassportIssuerInputError("Enter a positive Passport ID.");
  const passportId = BigInt(normalized);
  if (passportId > (1n << 256n) - 1n) throw new PassportIssuerInputError("Passport ID is too large.");
  return passportId;
}

export function encodeRevokePassport(passportId: string) {
  return `${REVOKE_PASSPORT_SELECTOR}${word(parseIssuerPassportId(passportId))}`;
}

function decodeAddress(value: unknown, label: string) {
  if (typeof value !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(value)) {
    throw new PassportIssuerInputError(`Could not read ${label} from Monad.`);
  }
  return `0x${value.slice(-40)}`.toLowerCase();
}

function decodeUint256(value: unknown, label: string) {
  if (typeof value !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(value)) {
    throw new PassportIssuerInputError(`Could not read ${label} from Monad.`);
  }
  return BigInt(value);
}

async function ethCall(provider: Eip1193Provider, to: string, data: string) {
  return provider.request({ method: "eth_call", params: [{ to, data }, "latest"] });
}

export async function ensureMonadTestnet(provider: Eip1193Provider) {
  const currentChain = await provider.request({ method: "eth_chainId" });
  if (currentChain === monadTestnet.chainId) return;
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: monadTestnet.chainId }] });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? (error as { code?: number }).code : undefined;
    if (code !== 4902) throw new PassportIssuerInputError("Switch your wallet to Monad Testnet, then try again.");
    await addMonadTestnet(provider);
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: monadTestnet.chainId }] });
  }
}

export async function connectPassportIssuer(provider: Eip1193Provider) {
  await ensureMonadTestnet(provider);
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!Array.isArray(accounts) || typeof accounts[0] !== "string") {
    throw new PassportIssuerInputError("Your wallet did not provide an account.");
  }
  return requireAddress(accounts[0], "wallet");
}

export async function preflightPassportIssuance(
  provider: Eip1193Provider,
  input: { registry: string; vault: string; account: string; amountCap: string; expiry: string },
): Promise<PassportIssuerPreflight> {
  const registry = requireAddress(input.registry, "registry");
  const vault = requireAddress(input.vault, "vault");
  const account = requireAddress(input.account, "wallet");
  const amountCap = parseAusdcAmount(input.amountCap);
  const expiry = parseExpiry(input.expiry);
  await ensureMonadTestnet(provider);

  const factoryVault = decodeAddress(await ethCall(provider, registry, FACTORY_VAULT_SELECTOR), "factory vault");
  if (factoryVault !== vault) throw new PassportIssuerInputError("This vault was not created by the selected Principal registry.");

  const owner = decodeAddress(await ethCall(provider, vault, OWNER_SELECTOR), "vault controller");
  if (owner !== account) throw new PassportIssuerInputError("The connected wallet is not this vault's controller.");

  const data = encodeRegisterPassport(vault, amountCap, expiry);
  const gas = await provider.request({ method: "eth_estimateGas", params: [{ from: account, to: registry, data }] });
  if (typeof gas !== "string" || !/^0x[0-9a-fA-F]+$/.test(gas)) {
    throw new PassportIssuerInputError("Monad could not simulate this passport issuance.");
  }
  return { account, factoryVault, owner, estimatedGas: BigInt(gas), data };
}

export async function submitPassportIssuance(provider: Eip1193Provider, input: { account: string; registry: string; data: string }) {
  const account = requireAddress(input.account, "wallet");
  const registry = requireAddress(input.registry, "registry");
  const result = await provider.request({ method: "eth_sendTransaction", params: [{ from: account, to: registry, data: input.data }] });
  if (typeof result !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(result)) {
    throw new PassportIssuerInputError("Your wallet did not return a transaction hash.");
  }
  return result;
}

export async function preflightPassportRevocation(
  provider: Eip1193Provider,
  input: { registry: string; account: string; passportId: string },
) {
  const registry = requireAddress(input.registry, "registry");
  const account = requireAddress(input.account, "wallet");
  const data = encodeRevokePassport(input.passportId);
  await ensureMonadTestnet(provider);
  const gas = await provider.request({ method: "eth_estimateGas", params: [{ from: account, to: registry, data }] });
  if (typeof gas !== "string" || !/^0x[0-9a-fA-F]+$/.test(gas)) {
    throw new PassportIssuerInputError("Monad could not simulate this Passport revocation.");
  }
  return { data, estimatedGas: BigInt(gas) };
}

export async function waitForTransactionReceipt(
  provider: Eip1193Provider,
  transactionHash: string,
  wait: (milliseconds: number) => Promise<void> = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds)),
) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const receipt = await provider.request({ method: "eth_getTransactionReceipt", params: [transactionHash] });
    if (receipt && typeof receipt === "object") {
      const status = "status" in receipt ? (receipt as { status?: unknown }).status : undefined;
      if (status === "0x1") return;
      if (status === "0x0") throw new PassportIssuerInputError("Monad confirmed that the passport transaction reverted.");
    }
    await wait(1000);
  }
  throw new PassportIssuerInputError("The transaction is still pending. Use its explorer link, then load the active Passport when it confirms.");
}

export async function readActivePassportId(provider: Eip1193Provider, registry: string, vault: string) {
  const checkedRegistry = requireAddress(registry, "registry");
  const checkedVault = requireAddress(vault, "vault");
  const result = await ethCall(provider, checkedRegistry, `${ACTIVE_PASSPORT_SELECTOR}${addressWord(checkedVault)}`);
  return decodeUint256(result, "active passport ID");
}
