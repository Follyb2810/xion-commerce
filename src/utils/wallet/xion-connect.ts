import { StargateClient, SigningStargateClient, GasPrice } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient,CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
// import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";


class XionConnect {
    private readonly CHAIN_ID: string;
    private readonly XION_RPC_URL: string;
    private readonly MNEMONIC?: string;


    constructor() {
        this.CHAIN_ID = process.env.XION_CHAIN_ID ?? "xion-testnet-2";
        this.XION_RPC_URL = process.env.XION_RPC_URL ?? "https://rpc.xion-testnet-2.burnt.com";
        this.MNEMONIC = process.env.XION_MNEMONIC;

    }
    //? Use SigningCosmWasmClient for interacting with CosmWasm smart contracts.
    //? Use SigningCosmWasmClient Call smart contract functions (execute, instantiate, upload, send tokens to contract)
    //? Use SigningStargateClient for standard Cosmos transactions (send tokens, stake, vote, withdraw rewards)
   
    //?  StargateClient → Cannot query smart contracts but to query blockchain data (account balance, transaction history, staking info)
    //? StargateClient is used for querying bank balances, transactions, governance, and staking, but not smart contracts.
    //?  CosmWasmClient → Use for querying smart contracts data (fetch contract state, user data, contract balances)
    //? CosmWasmClient is specifically designed for querying CosmWasm smart contracts.
    // Get query-only client
    async getQueryClient(): Promise<StargateClient> {
        return StargateClient.connect(this.XION_RPC_URL);
    }
     // ✅Use CosmWasmClient for querying smart contracts
    async getQueryCosmWasmClient(): Promise<CosmWasmClient> {
        return CosmWasmClient.connect(this.XION_RPC_URL);
    }

    //  Use SigningCosmWasmClient for smart contract interactions.  
    //? ✅ SigningCosmWasmClient for smart contract transactions (execute, upload, instantiate)
    async getSigningWasmClient(mnemonic?: string): Promise<SigningCosmWasmClient> {
        const seed = mnemonic ?? this.MNEMONIC;
        if (!seed) throw new Error("Mnemonic is required");
        
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(seed, { prefix: "xion" });
        return SigningCosmWasmClient.connectWithSigner(this.XION_RPC_URL, wallet,{gasPrice: GasPrice.fromString("0.05uxion")});
    }
    
    //? Bank
    // Use SigningStargateClient for standard Cosmos transactions (bank transfers, staking).
    //? Get a SigningStargateClient for normal transactions (sending tokens, delegations,redelegateTokens,vote,withdrawRewards etc.)
     // ✅ SigningStargateClient for standard Cosmos transactions (send tokens, staking, governance)
     async getSigningStargateClient(mnemonic?: string): Promise<SigningStargateClient> {
        const seed = mnemonic ?? this.MNEMONIC;
        if (!seed) throw new Error("Mnemonic is required");

        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(seed, { prefix: "xion" });
        return SigningStargateClient.connectWithSigner(this.XION_RPC_URL, wallet, { gasPrice: GasPrice.fromString("0.025uxion") });
    }
     
    
}

export default XionConnect;

// async executeContractFunction(senderAddress: string, msg: JsonObject, funds = []) {
// return this.executeContract(senderAddress, msg, funds);
// }
//  const client = await CosmWasmClient.connect(this.xionConnect.rpcUrl);
/**
const wasmClient = await xionConnect.getSigningWasmClient();
await wasmClient.execute(senderAddress, contractAddress, msg, "auto");
const bankClient = await xionConnect.getSigningClient();
await bankClient.sendTokens(senderAddress, recipientAddress, [{ denom, amount }], "auto");

*/
