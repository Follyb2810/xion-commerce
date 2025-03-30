"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const stargate_1 = require("@cosmjs/stargate");
const proto_signing_1 = require("@cosmjs/proto-signing");
const cosmwasm_stargate_1 = require("@cosmjs/cosmwasm-stargate");
// import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
class XionConnect {
    constructor() {
        var _a, _b;
        this.CHAIN_ID = (_a = process.env.XION_CHAIN_ID) !== null && _a !== void 0 ? _a : "xion-testnet-2";
        this.XION_RPC_URL = (_b = process.env.XION_RPC_URL) !== null && _b !== void 0 ? _b : "https://rpc.xion-testnet-2.burnt.com";
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
    getQueryClient() {
        return __awaiter(this, void 0, void 0, function* () {
            return stargate_1.StargateClient.connect(this.XION_RPC_URL);
        });
    }
    // ✅Use CosmWasmClient for querying smart contracts
    getQueryCosmWasmClient() {
        return __awaiter(this, void 0, void 0, function* () {
            return cosmwasm_stargate_1.CosmWasmClient.connect(this.XION_RPC_URL);
        });
    }
    //  Use SigningCosmWasmClient for smart contract interactions.  
    //? ✅ SigningCosmWasmClient for smart contract transactions (execute, upload, instantiate)
    getSigningWasmClient(mnemonic) {
        return __awaiter(this, void 0, void 0, function* () {
            const seed = mnemonic !== null && mnemonic !== void 0 ? mnemonic : this.MNEMONIC;
            if (!seed)
                throw new Error("Mnemonic is required");
            const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(seed, { prefix: "xion" });
            return cosmwasm_stargate_1.SigningCosmWasmClient.connectWithSigner(this.XION_RPC_URL, wallet, { gasPrice: stargate_1.GasPrice.fromString("0.05uxion") });
        });
    }
    //? Bank
    // Use SigningStargateClient for standard Cosmos transactions (bank transfers, staking).
    //? Get a SigningStargateClient for normal transactions (sending tokens, delegations,redelegateTokens,vote,withdrawRewards etc.)
    // ✅ SigningStargateClient for standard Cosmos transactions (send tokens, staking, governance)
    getSigningStargateClient(mnemonic) {
        return __awaiter(this, void 0, void 0, function* () {
            const seed = mnemonic !== null && mnemonic !== void 0 ? mnemonic : this.MNEMONIC;
            if (!seed)
                throw new Error("Mnemonic is required");
            const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(seed, { prefix: "xion" });
            return stargate_1.SigningStargateClient.connectWithSigner(this.XION_RPC_URL, wallet, { gasPrice: stargate_1.GasPrice.fromString("0.025uxion") });
        });
    }
}
exports.default = XionConnect;
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
