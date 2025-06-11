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
const xion_queries_1 = __importDefault(require("./../../common/wallet/xion_queries"));
const xion_transactions_1 = __importDefault(require("./../../common/wallet/xion_transactions"));
const user_repository_1 = __importDefault(require("./../user/user.repository"));
const Xion = new xion_queries_1.default();
const Transaction = new xion_transactions_1.default();
class XionService {
    static getAddressBalance(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Xion.getBalance(address);
        });
    }
    static sendXionTokenUser(recipientAddress, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Transaction.sendTokens(recipientAddress, amount);
        });
    }
    static sendXionToEscrow(userId, sellerAddress, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const formattedAmount = xion_queries_1.default.xionToUxion(amount);
            const user = yield user_repository_1.default.findById(userId);
            if (!(user === null || user === void 0 ? void 0 : user.walletAddress) || !(user === null || user === void 0 ? void 0 : user.mnemonic)) {
                throw new Error("Invalid user credentials");
            }
            const msg = {
                initiate_escrow: {
                    seller: sellerAddress,
                    amount: formattedAmount,
                },
            };
            const funds = [{ denom: "uxion", amount: formattedAmount }];
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const transaction = yield Transaction.executeContract(user.walletAddress, msg, funds, user.mnemonic);
                    if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionHash)) {
                        throw new Error("Transaction failed: No transaction hash returned.");
                    }
                    return {
                        transactionHash: transaction.transactionHash,
                        gasUsed: ((_a = transaction.gasUsed) === null || _a === void 0 ? void 0 : _a.toString()) || "N/A",
                        gasWanted: ((_b = transaction.gasWanted) === null || _b === void 0 ? void 0 : _b.toString()) || "N/A",
                    };
                }
                catch (error) {
                    if (error.message.includes("insufficient funds")) {
                        throw new Error("Insufficient funds");
                    }
                    if (attempt === 3)
                        throw error;
                    yield new Promise((resolve) => setTimeout(resolve, 2000));
                }
            }
        });
    }
    static releaseOrCancelEscrow(userId, buyerAddress, status) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const user = yield user_repository_1.default.findById(userId);
            if (!user)
                throw new Error("User not found");
            const msg = status.toLowerCase() === "release"
                ? { release_funds: {} }
                : { cancel_escrow: {} };
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const transaction = yield Transaction.executeContract(buyerAddress, msg, [], user.mnemonic);
                    if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionHash)) {
                        throw new Error("Transaction failed: No transaction hash returned.");
                    }
                    return {
                        transactionHash: transaction.transactionHash,
                        gasUsed: ((_a = transaction.gasUsed) === null || _a === void 0 ? void 0 : _a.toString()) || "N/A",
                        gasWanted: ((_b = transaction.gasWanted) === null || _b === void 0 ? void 0 : _b.toString()) || "N/A",
                    };
                }
                catch (error) {
                    if (attempt === 3)
                        throw error;
                    yield new Promise((resolve) => setTimeout(resolve, 2000));
                }
            }
        });
    }
}
exports.default = XionService;
