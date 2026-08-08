import "server-only";

import { CleanverseClient } from "./client.server";
import { loadDemoPrincipalAddress } from "./config.server";
import { CleanverseResponseError } from "./errors";

type MonadClient = Pick<CleanverseClient, "queryAPass" | "queryDepositATokenList">;

export type MonadPrincipalStatus = {
  chain: "monad";
  principalCvi: "registered" | "not_registered";
  assets: Array<{
    symbol: string;
    name: string;
    decimals: number;
    contractAddress: string;
  }>;
};

/// @dev This intentionally omits the wallet address and all A-Pass attributes from browser responses.
export async function getMonadPrincipalStatus(
  client: MonadClient = new CleanverseClient(),
  principalAddress = loadDemoPrincipalAddress(),
): Promise<MonadPrincipalStatus> {
  const inventory = await client.queryDepositATokenList("monad");

  let principalCvi: MonadPrincipalStatus["principalCvi"];
  try {
    await client.queryAPass("monad", principalAddress);
    principalCvi = "registered";
  } catch (error) {
    if (error instanceof CleanverseResponseError && error.code === "0002") {
      principalCvi = "not_registered";
    } else {
      throw error;
    }
  }

  return {
    chain: "monad",
    principalCvi,
    assets: inventory.tokens.map(({ atoken }) => ({
      symbol: atoken.symbol,
      name: atoken.name,
      decimals: atoken.decimals,
      contractAddress: atoken.address,
    })),
  };
}
