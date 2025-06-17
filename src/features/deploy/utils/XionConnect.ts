import {
  StargateClient,
  SigningStargateClient,
  GasPrice,
} from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import {
  SigningCosmWasmClient,
  CosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { XION_CONSTANTS } from "../deploy.type";

type IConfig = {
  chainId?: string;
  rpcUrl?: string;
  mnemonic?: string;
};

class XionConnect {
  private readonly chainId: string;
  private readonly rpcUrl: string;
  private readonly mnemonic?: string;
  private queryClientCache?: StargateClient;
  private wasmQueryClientCache?: CosmWasmClient;

  constructor(config?: IConfig) {
    this.chainId =
      config?.chainId ??
      process.env.XION_CHAIN_ID ??
      XION_CONSTANTS.DEFAULT_ENDPOINTS.CHAIN_ID;
    this.rpcUrl =
      config?.rpcUrl ??
      process.env.XION_RPC_URL ??
      XION_CONSTANTS.DEFAULT_ENDPOINTS.RPC_URL;
    this.mnemonic = config?.mnemonic ?? process.env.XION_MNEMONIC;
  }

  //? Use SigningCosmWasmClient for interacting with CosmWasm smart contracts.
  //? Use SigningCosmWasmClient Call smart contract functions (execute, instantiate, upload, send tokens to contract)
  //? Use SigningStargateClient for standard Cosmos transactions (send tokens, stake, vote, withdraw rewards)

  //?  StargateClient → Cannot query smart contracts but to query blockchain data (account balance, transaction history, staking info)
  //? StargateClient is used for querying bank balances, transactions, governance, and staking, but not smart contracts.
  //?  CosmWasmClient → Use for querying smart contracts data (fetch contract state, user data, contract balances)
  //? CosmWasmClient is specifically designed for querying CosmWasm smart contracts.

  // Get query-only client with caching
  async getQueryClient(): Promise<StargateClient> {
    if (!this.queryClientCache) {
      this.queryClientCache = await StargateClient.connect(this.rpcUrl);
    }
    return this.queryClientCache;
  }

  // ✅Use CosmWasmClient for querying smart contracts
  async getQueryCosmWasmClient(): Promise<CosmWasmClient> {
    if (!this.wasmQueryClientCache) {
      this.wasmQueryClientCache = await CosmWasmClient.connect(this.rpcUrl);
    }
    return this.wasmQueryClientCache;
  }

  //? ✅ SigningCosmWasmClient for smart contract transactions (execute, upload, instantiate)
  async getSigningWasmClient(
    mnemonic?: string
  ): Promise<SigningCosmWasmClient> {
    const seed = mnemonic ?? this.mnemonic;
    if (!seed) {
      throw new Error("Mnemonic is required for signing transactions");
    }

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(seed, {
      prefix: "xion",
    });
    return SigningCosmWasmClient.connectWithSigner(this.rpcUrl, wallet, {
      gasPrice: GasPrice.fromString(XION_CONSTANTS.DEFAULT_GAS_PRICES.COSMWASM),
    });
  }

  //? Bank
  // Use SigningStargateClient for standard Cosmos transactions (bank transfers, staking).
  //? Get a SigningStargateClient for normal transactions (sending tokens, delegations,redelegateTokens,vote,withdrawRewards etc.)
  // ✅ SigningStargateClient for standard Cosmos transactions (send tokens, staking, governance)
  async getSigningStargateClient(
    mnemonic?: string
  ): Promise<SigningStargateClient> {
    const seed = mnemonic ?? this.mnemonic;
    if (!seed) {
      throw new Error("Mnemonic is required for signing transactions");
    }

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(seed, {
      prefix: "xion",
    });
    return SigningStargateClient.connectWithSigner(this.rpcUrl, wallet, {
      gasPrice: GasPrice.fromString(XION_CONSTANTS.DEFAULT_GAS_PRICES.STARGATE),
    });
  }

  async disconnect(): Promise<void> {
    if (this.queryClientCache) {
      this.queryClientCache.disconnect();
      this.queryClientCache = undefined;
    }
    if (this.wasmQueryClientCache) {
      this.wasmQueryClientCache.disconnect();
      this.wasmQueryClientCache = undefined;
    }
  }
}

export default XionConnect;
