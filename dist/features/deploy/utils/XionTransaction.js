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
const XionWallet_1 = __importDefault(require("./XionWallet"));
const XionConnect_1 = __importDefault(require("./XionConnect"));
const XionUtils_1 = require("./XionUtils");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const WASM_FILE_PATH = path_1.default.join(__dirname, "../../../../public/artifacts/escrow_contract.wasm");
console.log(WASM_FILE_PATH);
class XionTransaction {
    constructor(config) {
        var _a, _b, _c;
        this.xionConnect = (_a = config === null || config === void 0 ? void 0 : config.xionConnect) !== null && _a !== void 0 ? _a : new XionConnect_1.default();
        this.xionWallet = (_b = config === null || config === void 0 ? void 0 : config.xionWallet) !== null && _b !== void 0 ? _b : new XionWallet_1.default();
        // this.contractAddress = config?.contractAddress ?? process.env.CONTRACT_ADDRESS;
        this.adminAddress =
            (_c = config === null || config === void 0 ? void 0 : config.adminAddress) !== null && _c !== void 0 ? _c : process.env.ADMIN_ADDRESS;
        if (!this.adminAddress) {
            throw new Error("Admin address is required");
        }
    }
    sendTokens(recipientAddress_1, amount_1) {
        return __awaiter(this, arguments, void 0, function* (recipientAddress, amount, denom = "uxion", memo = "") {
            if (!XionUtils_1.XionUtils.isValidXionAddress(recipientAddress)) {
                throw new Error(`Invalid recipient address: ${recipientAddress}`);
            }
            const numAmount = Number(amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                throw new Error(`Invalid amount: ${amount}`);
            }
            const client = yield this.xionConnect.getSigningStargateClient();
            const senderAddress = yield this.xionWallet.getMyXionAddress();
            const result = yield client.sendTokens(senderAddress, recipientAddress, [{ denom, amount }], "auto", memo || "Transfer via XION backend");
            return {
                transactionHash: result.transactionHash,
                gasUsed: result.gasUsed.toString(),
                gasWanted: result.gasWanted.toString(),
            };
        });
    }
    executeContract(contractAddress_1, msg_1) {
        return __awaiter(this, arguments, void 0, function* (contractAddress, msg, funds = [], mnemonic) {
            // const targetContract = contractAddress || this.contractAddress;
            if (!contractAddress) {
                throw new Error("Contract address is required for execution");
            }
            if (!XionUtils_1.XionUtils.isValidXionAddress(this.adminAddress)) {
                throw new Error(`Invalid sender address: ${this.adminAddress}`);
            }
            if (!XionUtils_1.XionUtils.isValidXionAddress(contractAddress)) {
                throw new Error(`Invalid contract address: ${contractAddress}`);
            }
            try {
                const client = yield this.xionConnect.getSigningWasmClient(mnemonic);
                const result = yield client.execute(this.adminAddress, contractAddress, msg, "auto", "Execute contract via XION backend", funds);
                return {
                    transactionHash: result.transactionHash,
                    gasUsed: result.gasUsed.toString(),
                    gasWanted: result.gasWanted.toString(),
                };
            }
            catch (error) {
                console.error("🚨 Smart Contract Execution Error:", error);
                throw new Error(`Contract execution failed: ${error.message}`);
            }
        });
    }
    uploadEscrow() {
        return __awaiter(this, arguments, void 0, function* (senderAddress = this.adminAddress, mnemonic, wasmFilePath) {
            if (!XionUtils_1.XionUtils.isValidXionAddress(senderAddress)) {
                throw new Error(`Invalid sender address: ${senderAddress}`);
            }
            const wasmCode = wasmFilePath ? wasmFilePath : (0, fs_1.readFileSync)(WASM_FILE_PATH);
            console.log(`📄 Contract size: ${wasmCode.length} bytes`);
            if (!wasmCode || wasmCode.length === 0) {
                throw new Error("WASM code is required");
            }
            const client = yield this.xionConnect.getSigningWasmClient(mnemonic);
            const uploadResult = yield client.upload(senderAddress, wasmCode, "auto", "Escrow Contract v0.1.0");
            const { codeId, transactionHash } = uploadResult;
            return { codeId, transactionHash };
        });
    }
    instantiateContract(_a) {
        return __awaiter(this, arguments, void 0, function* ({ senderAddress = this.adminAddress, codeId, msg, label = "Escrow Contract Instance", fee = "auto", options, mnemonic, }) {
            if (!XionUtils_1.XionUtils.isValidXionAddress(senderAddress)) {
                throw new Error(`Invalid sender address: ${senderAddress}`);
            }
            if (!Number.isInteger(codeId) || codeId <= 0) {
                throw new Error(`Invalid code ID: ${codeId}`);
            }
            if (!label || label.trim().length === 0) {
                throw new Error("Label is required");
            }
            const client = yield this.xionConnect.getSigningWasmClient(mnemonic);
            const instantiateResult = yield client.instantiate(senderAddress, codeId, msg, label.trim(), fee, Object.assign({ memo: `Instantiating ${label}`, admin: this.adminAddress }, options));
            const { contractAddress, transactionHash, gasUsed } = instantiateResult;
            return { contractAddress, transactionHash, gasUsed };
        });
    }
    queryContract(contractAddress, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!XionUtils_1.XionUtils.isValidXionAddress(contractAddress)) {
                throw new Error(`Invalid contract address: ${contractAddress}`);
            }
            const client = yield this.xionConnect.getQueryCosmWasmClient();
            return client.queryContractSmart(contractAddress, msg);
        });
    }
    estimateExecutionGas(senderAddress_1, msg_1) {
        return __awaiter(this, arguments, void 0, function* (senderAddress, msg, funds = [], contractAddress, mnemonic) {
            // const targetContract = contractAddress || this.contractAddress;
            if (!contractAddress) {
                throw new Error("Contract address is required for gas estimation");
            }
            if (!XionUtils_1.XionUtils.isValidXionAddress(senderAddress)) {
                throw new Error(`Invalid sender address: ${senderAddress}`);
            }
            const client = yield this.xionConnect.getSigningWasmClient(mnemonic);
            return client.simulate(senderAddress, [
                {
                    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
                    value: {
                        sender: senderAddress,
                        contract: contractAddress,
                        msg: Buffer.from(JSON.stringify(msg)),
                        funds,
                    },
                },
            ], "Gas estimation");
        });
    }
}
exports.default = XionTransaction;
