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
const XionQueries_1 = __importDefault(require("./utils/XionQueries"));
const XionTransaction_1 = __importDefault(require("./utils/XionTransaction"));
const XionUtils_1 = require("./utils/XionUtils");
const XionWallet_1 = __importDefault(require("./utils/XionWallet"));
const wallet = new XionWallet_1.default();
const Xion = new XionQueries_1.default();
const Transaction = new XionTransaction_1.default();
class DeployService {
    constructor() {
        this.denom = process.env.XION_DENOM_IBC;
        this.marketplace = process.env.ADMIN_ADDRESS;
        this.fee_percentage = 5;
        if (!this.denom) {
            throw new Error("XION_DENOM_IBC environment variable is required");
        }
        if (!this.marketplace) {
            throw new Error("ADMIN_ADDRESS environment variable is required");
        }
    }
    buildSuccess(data) {
        return { success: true, data };
    }
    buildError(message, errorCode) {
        return { success: false, message, errorCode };
    }
    depositToEscrow(contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const state = yield Transaction.queryContract(contractAddress, {
                    get_state: {},
                });
                const { status, denom, required_deposit } = state;
                if (status !== "Created") {
                    return this.buildError(`Cannot deposit. Contract status is: ${status}`, "INVALID_CONTRACT_STATE");
                }
                const funds = [{ denom, amount: required_deposit }];
                const result = yield Transaction.executeContract(contractAddress, { deposit: {} }, funds);
                return this.buildSuccess({
                    transactionHash: result.transactionHash,
                    gasUsed: result.gasUsed,
                    gasWanted: result.gasWanted,
                });
            }
            catch (error) {
                return this.buildError(error instanceof Error ? error.message : "Unknown error occurred", "XION_DEPOSIT_ERROR");
            }
        });
    }
    releaseOrRefund(action, contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const normalizedAction = action.toLowerCase();
                if (normalizedAction !== "release" && normalizedAction !== "refund") {
                    throw new Error(`Invalid action: ${action}`);
                }
                const msg = normalizedAction === "release"
                    ? { release: {} }
                    : { refund: {} };
                const result = yield Transaction.executeContract(contractAddress, msg, []);
                return this.buildSuccess({
                    transactionHash: result.transactionHash,
                    gasUsed: result.gasUsed,
                    gasWanted: result.gasWanted,
                });
            }
            catch (error) {
                return this.buildError(error instanceof Error ? error.message : "Unknown error occurred", "XION_EXECUTE_ERROR");
            }
        });
    }
    deployEscrowContract(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!payload.buyer || !XionUtils_1.XionUtils.isValidXionAddress(payload.buyer)) {
                    return this.buildError(`Invalid buyer address: ${payload.buyer}`, "INVALID_BUYER_ADDRESS");
                }
                if (!payload.seller || !XionUtils_1.XionUtils.isValidXionAddress(payload.seller)) {
                    return this.buildError(`Invalid seller address: ${payload.seller}`, "INVALID_SELLER_ADDRESS");
                }
                if (!payload.required_deposit ||
                    isNaN(Number(payload.required_deposit)) ||
                    Number(payload.required_deposit) <= 0) {
                    return this.buildError(`Invalid required deposit: ${payload.required_deposit}`, "INVALID_DEPOSIT_AMOUNT");
                }
                const uploadResult = yield Transaction.uploadEscrow();
                const { codeId, transactionHash: uploadTxHash } = uploadResult;
                if (!uploadTxHash) {
                    return this.buildError("Upload failed: no transaction hash returned.", "UPLOAD_FAILED");
                }
                if (!codeId || codeId <= 0) {
                    return this.buildError(`Upload failed: invalid code ID: ${codeId}`, "INVALID_CODE_ID");
                }
                const amount = XionUtils_1.XionUtils.xionToUxion(payload.required_deposit);
                const instantiateMsg = {
                    buyer: payload.buyer,
                    seller: payload.seller,
                    required_deposit: amount,
                    marketplace: this.marketplace,
                    denom: this.denom,
                    fee_percentage: this.fee_percentage,
                };
                const instantiateResult = yield Transaction.instantiateContract({
                    codeId,
                    msg: instantiateMsg,
                    label: `Escrow Contract - ${Date.now()}`,
                });
                const { contractAddress, transactionHash: instantiateTxHash, gasUsed, } = instantiateResult;
                if (!contractAddress) {
                    return this.buildError("Instantiation failed: no contract address returned.", "INSTANTIATION_FAILED");
                }
                const state = yield Transaction.queryContract(contractAddress, {
                    get_state: {},
                });
                const deploymentResult = {
                    codeId,
                    contractAddress,
                    buyer: payload.buyer,
                    seller: payload.seller,
                    marketplace: this.marketplace,
                    required_deposit: amount,
                    denom: this.denom,
                    fee_percentage: this.fee_percentage,
                    state,
                    upload: uploadTxHash,
                    instantiate: instantiateTxHash,
                    gasUsed: gasUsed === null || gasUsed === void 0 ? void 0 : gasUsed.toString(),
                };
                return this.buildSuccess(deploymentResult);
            }
            catch (error) {
                let errorMessage = "Unknown error occurred";
                let errorCode = "DEPLOY_FAILED";
                if (error instanceof Error) {
                    errorMessage = error.message;
                    if (errorMessage.includes("insufficient funds")) {
                        errorCode = "INSUFFICIENT_FUNDS";
                    }
                    else if (errorMessage.includes("code not found")) {
                        errorCode = "CODE_NOT_FOUND";
                    }
                    else if (errorMessage.includes("invalid address")) {
                        errorCode = "INVALID_ADDRESS";
                    }
                    else if (errorMessage.includes("gas")) {
                        errorCode = "GAS_ERROR";
                    }
                    else if (errorMessage.includes("timeout")) {
                        errorCode = "TIMEOUT_ERROR";
                    }
                    else if (errorMessage.includes("connection")) {
                        errorCode = "CONNECTION_ERROR";
                    }
                }
                return this.buildError(errorMessage, errorCode);
            }
        });
    }
    checkServiceHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checks = {
                    environment: {
                        denom: !!this.denom,
                        marketplace: !!this.marketplace,
                        adminAddress: !!process.env.ADMIN_ADDRESS,
                    },
                    wallet: false,
                    connection: false,
                };
                try {
                    const address = yield wallet.getMyXionAddress();
                    checks.wallet = !!address;
                }
                catch (e) {
                    console.log("👛 Wallet check: ❌", e);
                }
                checks.connection = true;
                const isHealthy = Object.values(checks.environment).every(Boolean) &&
                    checks.wallet &&
                    checks.connection;
                return this.buildSuccess({
                    healthy: isHealthy,
                    checks,
                    timestamp: new Date().toISOString(),
                });
            }
            catch (error) {
                return this.buildError(error instanceof Error ? error.message : "Health check failed", "HEALTH_CHECK_ERROR");
            }
        });
    }
}
exports.default = new DeployService();
