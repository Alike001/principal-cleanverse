import { createCipheriv, randomUUID } from "node:crypto";

const baseUrl = (process.env.CLEANVERSE_BASE_URL || "https://uatapi.cleanverse.com/api/cooperate").replace(/\/$/, "");
const factoryAddress = process.env.PRINCIPAL_FACTORY_ADDRESS;
const ownerSignature = process.env.OWNER_SIGNATURE;
const apiId = process.env.CLEANVERSE_API_ID;
const apiKey = process.env.CLEANVERSE_API_KEY;

for (const [name, value] of Object.entries({ PRINCIPAL_FACTORY_ADDRESS: factoryAddress, OWNER_SIGNATURE: ownerSignature, CLEANVERSE_API_ID: apiId, CLEANVERSE_API_KEY: apiKey })) {
  if (!value) throw new Error(`${name} is required.`);
}

if (!/^0x[0-9a-fA-F]{40}$/.test(factoryAddress)) throw new Error("PRINCIPAL_FACTORY_ADDRESS must be an EVM address.");
if (!/^0x[0-9a-fA-F]{130}$/.test(ownerSignature)) throw new Error("OWNER_SIGNATURE must be a 65-byte hex signature.");

const key = Buffer.from(apiKey, "base64");
if (![16, 24, 32].includes(key.length)) throw new Error("CLEANVERSE_API_KEY is not a valid AES key.");

const cipher = createCipheriv(`aes-${key.length * 8}-cbc`, key, Buffer.alloc(16, 0));
const plaintext = Buffer.from(JSON.stringify({
  chain: "monad",
  address: factoryAddress,
  owner_signature: ownerSignature,
}), "utf8");
const data = Buffer.concat([cipher.update(plaintext), cipher.final()]).toString("base64");

const response = await fetch(`${baseUrl}/validator/grant`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "api-id": apiId, "X-Request-ID": randomUUID() },
  body: JSON.stringify({ data }),
  signal: AbortSignal.timeout(10_000),
});
const envelope = await response.json();

if (!response.ok || envelope?.code !== "0000") {
  throw new Error(`Cleanverse validator grant failed: ${envelope?.code ?? response.status} ${envelope?.message ?? ""}`.trim());
}

const txHash = typeof envelope.data?.tx_hash === "string" ? envelope.data.tx_hash : "";
console.log(JSON.stringify({
  code: envelope.code,
  chain: envelope.data?.chain,
  address: factoryAddress.slice(0, 6) + "…" + factoryAddress.slice(-4),
  txHash: txHash ? txHash.slice(0, 10) + "…" + txHash.slice(-8) : "",
}));
