import { InstantiateOptions, JsonObject } from "@cosmjs/cosmwasm-stargate";
import { StdFee } from "@cosmjs/stargate";

export interface TransactionResult {
  transactionHash: string;
  gasUsed: string;
  gasWanted: string;
}

export interface WalletInfo {
  address: string;
  mnemonic: string;
}

export interface ContractDeployResult {
  codeId: number;
  transactionHash: string;
}

export interface ContractInstantiateResult {
  contractAddress: string;
  transactionHash: string;
  gasUsed: number | bigint;
}

export interface IQueryContract {
  status: string;
  denom: string;
  required_deposit: string;
  buyer: string;
  seller: string;
  fee_percentage: string;
}

export const XION_CONSTANTS = {
  UXION_DECIMALS: 1e6,
  DEFAULT_DENOM: "uxion",
  DEFAULT_GAS_PRICES: {
    STARGATE: "0.025uxion",
    COSMWASM: "0.05uxion",
  },
  DEFAULT_ENDPOINTS: {
    RPC_URL: "https://rpc.xion-testnet-2.burnt.com",
    CHAIN_ID: "xion-testnet-2",
  },
} as const;

export interface IInstanceContract  {
  senderAddress?: string;
  codeId: number;
  msg: JsonObject;
  label?: string;
  fee?: StdFee | "auto" | number;
  options?: InstantiateOptions;
  mnemonic?: string;
}