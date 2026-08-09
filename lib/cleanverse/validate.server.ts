import "server-only";

import { CleanverseMalformedResponseError } from "./errors";
import type {
  APassRecord,
  AToken,
  DepositAToken,
  DepositATokenList,
  GenerateAPassResponse,
  ValidatorGrantResponse,
} from "./types";

type UnknownRecord = Record<string, unknown>;

function malformed(message: string): never {
  throw new CleanverseMalformedResponseError(`Cleanverse returned malformed ${message}.`);
}

function record(value: unknown, name: string): UnknownRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return malformed(name);
  return value as UnknownRecord;
}

function stringField(value: unknown, name: string) {
  if (typeof value !== "string") return malformed(name);
  return value;
}

function numberField(value: unknown, name: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) return malformed(name);
  return value;
}

function stringArray(value: unknown, name: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) return malformed(name);
  return value as string[];
}

function parseToken(value: unknown, name: string): AToken {
  const token = record(value, name);
  const decimals = numberField(token.decimals, `${name}.decimals`);
  if (!Number.isInteger(decimals) || decimals < 0) return malformed(`${name}.decimals`);
  return {
    address: stringField(token.address, `${name}.address`),
    name: stringField(token.name, `${name}.name`),
    symbol: stringField(token.symbol, `${name}.symbol`),
    decimals,
    icon: stringField(token.icon, `${name}.icon`),
  };
}

function parseDepositToken(value: unknown, index: number): DepositAToken {
  const token = record(value, `deposit token ${index}`);
  return {
    origin_token: parseToken(token.origin_token, `deposit token ${index}.origin_token`),
    atoken: parseToken(token.atoken, `deposit token ${index}.atoken`),
    accesscore_address: stringField(token.accesscore_address, `deposit token ${index}.accesscore_address`),
    apass_address: stringField(token.apass_address, `deposit token ${index}.apass_address`),
  };
}

export function parseDepositATokenList(value: unknown): DepositATokenList {
  const data = record(value, "deposit A-Token list");
  if (!Array.isArray(data.tokens)) return malformed("deposit A-Token list.tokens");
  return {
    chain: stringField(data.chain, "deposit A-Token list.chain"),
    tokens: data.tokens.map(parseDepositToken),
  };
}

export function parseAPassRecord(value: unknown): APassRecord {
  const data = record(value, "A-Pass record");
  return {
    cvRecordId: stringField(data.cvRecordId, "A-Pass record.cvRecordId"),
    subTier: numberField(data.subTier, "A-Pass record.subTier"),
    tier: stringField(data.tier, "A-Pass record.tier"),
    status: numberField(data.status, "A-Pass record.status"),
    expirationTime: numberField(data.expirationTime, "A-Pass record.expirationTime"),
    subGroup: stringField(data.subGroup, "A-Pass record.subGroup"),
    currentKycHash: stringField(data.currentKycHash, "A-Pass record.currentKycHash"),
    group: stringField(data.group, "A-Pass record.group"),
    countries: stringArray(data.countries, "A-Pass record.countries"),
  };
}

export function parseGenerateAPassResponse(value: unknown): GenerateAPassResponse {
  const data = record(value, "Generate A-Pass response");
  const wallet = record(data.wallet, "Generate A-Pass response.wallet");
  return {
    customerId: stringField(data.customerId, "Generate A-Pass response.customerId"),
    cvRecordId: stringField(data.cvRecordId, "Generate A-Pass response.cvRecordId"),
    tier: stringField(data.tier, "Generate A-Pass response.tier"),
    wallet: {
      operate: stringField(wallet.operate, "Generate A-Pass response.wallet.operate"),
      address: stringField(wallet.address, "Generate A-Pass response.wallet.address"),
      chain: stringField(wallet.chain, "Generate A-Pass response.wallet.chain"),
      txHash: stringField(wallet.txHash, "Generate A-Pass response.wallet.txHash"),
      depositUSDCWallet: stringField(wallet.depositUSDCWallet, "Generate A-Pass response.wallet.depositUSDCWallet"),
      depositUSDTWallet: stringField(wallet.depositUSDTWallet, "Generate A-Pass response.wallet.depositUSDTWallet"),
    },
  };
}

export function parseValidatorGrantResponse(value: unknown): ValidatorGrantResponse {
  const data = record(value, "Validator grant response");
  return {
    chain: stringField(data.chain, "Validator grant response.chain"),
    address: stringField(data.address, "Validator grant response.address"),
    tx_hash: stringField(data.tx_hash, "Validator grant response.tx_hash"),
  };
}

