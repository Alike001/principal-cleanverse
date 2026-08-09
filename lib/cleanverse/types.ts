export type CleanverseEnvelope<T> = {
  code: string;
  message: string;
  data: T;
};

export type CleanverseConfig = {
  apiId: string;
  apiKey: string;
  baseUrl: string;
};

export type APassRecord = {
  cvRecordId: string;
  subTier: number;
  tier: string;
  status: number;
  expirationTime: number;
  subGroup: string;
  currentKycHash: string;
  group: string;
  countries: string[];
};

export type AToken = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
};

export type DepositAToken = {
  origin_token: AToken;
  atoken: AToken;
  accesscore_address: string;
  apass_address: string;
};

export type DepositATokenList = {
  chain: string;
  tokens: DepositAToken[];
};

export type GenerateAPassRequest = {
  customerId: string;
  expirationTime: number;
  wallet: { address: string; chain: "monad" };
  kycSource?: string;
  kycId?: string;
  subTier?: number;
  subGroup?: string;
  override?: boolean;
  identityDataList?: Array<{
    idType: "ID_CARD" | "PASSPORT" | "DRIVER_LICENSE" | "HK_MACAO_TAIWAN_PASS" | "RESIDENCE_PERMIT";
    fullName: string;
    idNumber?: string;
    validUntil?: string;
    issuingCountryISO2: string;
  }>;
};

export type GenerateAPassResponse = {
  customerId: string;
  cvRecordId: string;
  tier: string;
  wallet: {
    operate: string;
    address: string;
    chain: string;
    txHash: string;
    depositUSDCWallet: string;
    depositUSDTWallet: string;
  };
};

export type ValidatorGrantRequest = {
  chain: "monad";
  address: `0x${string}`;
  owner_signature: `0x${string}`;
};

export type ValidatorGrantResponse = {
  chain: string;
  address: string;
  tx_hash: string;
};
