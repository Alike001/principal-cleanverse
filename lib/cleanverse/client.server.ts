import "server-only";

import { loadCleanverseConfig } from "./config.server";
import { encryptCleanversePayload } from "./crypto.server";
import {
  CleanverseMalformedResponseError,
  CleanverseResponseError,
  CleanverseTransportError,
} from "./errors";
import type {
  APassRecord,
  CleanverseConfig,
  CleanverseEnvelope,
  DepositATokenList,
  GenerateAPassRequest,
  GenerateAPassResponse,
} from "./types";

type FetchLike = typeof fetch;

function isEnvelope(value: unknown): value is CleanverseEnvelope<unknown> {
  return Boolean(
    value &&
      typeof value === "object" &&
      "code" in value &&
      "message" in value &&
      typeof (value as { code: unknown }).code === "string" &&
      typeof (value as { message: unknown }).message === "string",
  );
}

export class CleanverseClient {
  constructor(
    private readonly config: CleanverseConfig = loadCleanverseConfig(),
    private readonly fetcher: FetchLike = fetch,
  ) {}

  async queryDepositATokenList(chain: "monad" = "monad"): Promise<DepositATokenList> {
    return this.request<DepositATokenList>("/query_deposit_atoken_list", { chain });
  }

  async queryAPass(chain: "monad", address: string): Promise<APassRecord> {
    return this.request<APassRecord>("/query_apass", { chain, address });
  }

  async generateAPass(payload: GenerateAPassRequest): Promise<GenerateAPassResponse> {
    return this.request<GenerateAPassResponse>("/generate_apass", payload, true);
  }

  private async request<T>(path: string, body: unknown, encrypted = false): Promise<T> {
    const requestBody = encrypted
      ? { data: encryptCleanversePayload(body, this.config.apiKey) }
      : body;

    let response: Response;
    try {
      response = await this.fetcher(`${this.config.baseUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-id": this.config.apiId,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
      });
    } catch (cause) {
      throw new CleanverseTransportError(`Cleanverse request failed: ${String(cause)}`);
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      throw new CleanverseMalformedResponseError("Cleanverse returned a non-JSON response.");
    }

    if (!isEnvelope(json)) {
      throw new CleanverseMalformedResponseError("Cleanverse returned an invalid response envelope.");
    }

    if (!response.ok) {
      throw new CleanverseTransportError(`Cleanverse returned HTTP ${response.status}.`);
    }

    if (json.code !== "0000") {
      throw new CleanverseResponseError(json.message, json.code);
    }

    return json.data as T;
  }
}
