export const monadTestnet = {
  chainId: "0x279f",
  chainIdDecimal: 10143,
  chainName: "Monad Testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: ["https://testnet-rpc.monad.xyz"],
  blockExplorerUrls: ["https://testnet.monadscan.com"],
  faucetUrl: "https://faucet.monad.xyz",
} as const;

export type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export function addMonadTestnet(provider: Eip1193Provider) {
  return provider.request({
    method: "wallet_addEthereumChain",
    params: [{
      chainId: monadTestnet.chainId,
      chainName: monadTestnet.chainName,
      nativeCurrency: monadTestnet.nativeCurrency,
      rpcUrls: [...monadTestnet.rpcUrls],
      blockExplorerUrls: [...monadTestnet.blockExplorerUrls],
    }],
  });
}
