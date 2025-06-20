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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xion_connect_1 = __importDefault(require("./xion-connect"));
const xion_wallet_1 = __importDefault(require("./xion_wallet"));
class XionTransaction {
    constructor() {
        this.xionConnect = new xion_connect_1.default();
        this.xionWallet = new xion_wallet_1.default();
        this.contractAddress = process.env.CONTRACT_XION;
        this.adminAddress = process.env.CONTRACT_XION;
    }
    sendTokens(recipientAddress_1, amount_1) {
        return __awaiter(this, arguments, void 0, function* (recipientAddress, amount, denom = "uxion", memo = "") {
            const client = yield this.xionConnect.getSigningStargateClient();
            const senderAddress = yield this.xionWallet.getMyXionAddress();
            const result = yield client.sendTokens(senderAddress, recipientAddress, [{ denom, amount }], "auto", memo || "Transfer via XION backend");
            return {
                transactionHash: result.transactionHash,
                gasUsed: result.gasUsed,
                gasWanted: result.gasWanted,
            };
        });
    }
    //? Executes a smart contract function
    executeContract(senderAddress_1, msg_1) {
        return __awaiter(this, arguments, void 0, function* (senderAddress, msg, funds = [], mnemonic) {
            try {
                const client = yield this.xionConnect.getSigningWasmClient(mnemonic);
                const result = yield client.execute(senderAddress, this.contractAddress, msg, "auto", "Execute contract via XION backend", funds);
                return {
                    transactionHash: result.transactionHash,
                    gasUsed: result.gasUsed.toString(),
                    gasWanted: result.gasWanted.toString(),
                };
            }
            catch (error) {
                console.error("🚨 Smart Contract Execution Error:", error);
                throw error;
            }
        });
    }
    //? 
    deployEscrow(wasmCode, senderAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.xionConnect.getSigningWasmClient();
            // const wasmCode = readFileSync(wasmFilePath);
            const uploadResult = yield client.upload(senderAddress, wasmCode, "auto", "Escrow Contract v0.1.0");
            const { codeId, transactionHash } = uploadResult;
            return { codeId, transactionHash };
        });
    }
    instantiateContract(senderAddress, codeId, msg, label, fee, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.xionConnect.getSigningWasmClient();
            const instantiateResult = yield client.instantiate(senderAddress, codeId, msg, label, (fee = "auto"), {
                memo: `Instantiating ${label}`,
                admin: this.adminAddress,
            });
            const { contractAddress, transactionHash, gasUsed } = instantiateResult;
            return { contractAddress, transactionHash, gasUsed };
        });
    }
    queryContact(contractAddress, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (yield this.xionConnect.getQueryCosmWasmClient()).queryContractSmart(contractAddress, msg);
            return result;
        });
    }
}
exports.default = XionTransaction;
