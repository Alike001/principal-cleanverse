import { describe, expect, it, vi } from "vitest";
import { addMonadTestnet, monadTestnet } from "../lib/principal/monad";

describe("Monad testnet setup", () => {
  it("uses the official Monad Testnet identity and a MON faucet", () => {
    expect(monadTestnet.chainIdDecimal).toBe(10143);
    expect(monadTestnet.chainId).toBe("0x279f");
    expect(monadTestnet.nativeCurrency.symbol).toBe("MON");
    expect(monadTestnet.faucetUrl).toBe("https://faucet.monad.xyz");
  });

  it("requests network addition without asking for accounts", async () => {
    const request = vi.fn().mockResolvedValue(null);
    await addMonadTestnet({ request });
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ method: "wallet_addEthereumChain" }));
    expect(request).not.toHaveBeenCalledWith(expect.objectContaining({ method: "eth_requestAccounts" }));
  });
});
