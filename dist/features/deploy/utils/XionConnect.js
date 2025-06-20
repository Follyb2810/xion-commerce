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
const deploy_type_1 = require("../deploy.type");
class XionConnect {
    constructor(config) {
        var _a, _b, _c, _d, _e;
        this.chainId =
            (_b = (_a = config === null || config === void 0 ? void 0 : config.chainId) !== null && _a !== void 0 ? _a : process.env.XION_CHAIN_ID) !== null && _b !== void 0 ? _b : deploy_type_1.XION_CONSTANTS.DEFAULT_ENDPOINTS.CHAIN_ID;
        this.rpcUrl =
            (_d = (_c = config === null || config === void 0 ? void 0 : config.rpcUrl) !== null && _c !== void 0 ? _c : process.env.XION_RPC_URL) !== null && _d !== void 0 ? _d : deploy_type_1.XION_CONSTANTS.DEFAULT_ENDPOINTS.RPC_URL;
        this.mnemonic = (_e = config === null || config === void 0 ? void 0 : config.mnemonic) !== null && _e !== void 0 ? _e : process.env.XION_MNEMONIC;
    }
    //? Use SigningCosmWasmClient for interacting with CosmWasm smart contracts.
    //? Use SigningCosmWasmClient Call smart contract functions (execute, instantiate, upload, send tokens to contract)
    //? Use SigningStargateClient for standard Cosmos transactions (send tokens, stake, vote, withdraw rewards)
    //?  StargateClient → Cannot query smart contracts but to query blockchain data (account balance, transaction history, staking info)
    //? StargateClient is used for querying bank balances, transactions, governance, and staking, but not smart contracts.
    //?  CosmWasmClient → Use for querying smart contracts data (fetch contract state, user data, contract balances)
    //? CosmWasmClient is specifically designed for querying CosmWasm smart contracts.
    // Get query-only client with caching
    getQueryClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.queryClientCache) {
                this.queryClientCache = yield stargate_1.StargateClient.connect(this.rpcUrl);
            }
            return this.queryClientCache;
        });
    }
    // ✅Use CosmWasmClient for querying smart contracts
    getQueryCosmWasmClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.wasmQueryClientCache) {
                this.wasmQueryClientCache = yield cosmwasm_stargate_1.CosmWasmClient.connect(this.rpcUrl);
            }
            return this.wasmQueryClientCache;
        });
    }
    //? ✅ SigningCosmWasmClient for smart contract transactions (execute, upload, instantiate)
    getSigningWasmClient(mnemonic) {
        return __awaiter(this, void 0, void 0, function* () {
            const seed = mnemonic !== null && mnemonic !== void 0 ? mnemonic : this.mnemonic;
            if (!seed) {
                throw new Error("Mnemonic is required for signing transactions");
            }
            const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(seed, {
                prefix: "xion",
            });
            return cosmwasm_stargate_1.SigningCosmWasmClient.connectWithSigner(this.rpcUrl, wallet, {
                gasPrice: stargate_1.GasPrice.fromString(deploy_type_1.XION_CONSTANTS.DEFAULT_GAS_PRICES.COSMWASM),
            });
        });
    }
    //? Bank
    // Use SigningStargateClient for standard Cosmos transactions (bank transfers, staking).
    //? Get a SigningStargateClient for normal transactions (sending tokens, delegations,redelegateTokens,vote,withdrawRewards etc.)
    // ✅ SigningStargateClient for standard Cosmos transactions (send tokens, staking, governance)
    getSigningStargateClient(mnemonic) {
        return __awaiter(this, void 0, void 0, function* () {
            const seed = mnemonic !== null && mnemonic !== void 0 ? mnemonic : this.mnemonic;
            if (!seed) {
                throw new Error("Mnemonic is required for signing transactions");
            }
            const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(seed, {
                prefix: "xion",
            });
            return stargate_1.SigningStargateClient.connectWithSigner(this.rpcUrl, wallet, {
                gasPrice: stargate_1.GasPrice.fromString(deploy_type_1.XION_CONSTANTS.DEFAULT_GAS_PRICES.STARGATE),
            });
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.queryClientCache) {
                this.queryClientCache.disconnect();
                this.queryClientCache = undefined;
            }
            if (this.wasmQueryClientCache) {
                this.wasmQueryClientCache.disconnect();
                this.wasmQueryClientCache = undefined;
            }
        });
    }
}
exports.default = XionConnect;
