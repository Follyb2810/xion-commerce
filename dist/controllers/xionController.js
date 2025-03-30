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
exports.releaseOrCancelEscrow = exports.sendXionToEscrowContract = exports.sendXionTokenUser = exports.getAddressBalance = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const xion_queries_1 = __importDefault(require("../utils/wallet/xion_queries"));
const ResponseHandler_1 = require("../utils/ResponseHandler");
const xion_transactions_1 = __importDefault(require("../utils/wallet/xion_transactions"));
const UserRepository_1 = __importDefault(require("../repositories/UserRepository"));
const Xion = new xion_queries_1.default();
const Transaction = new xion_transactions_1.default();
exports.getAddressBalance = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const address = req.query.address;
    if (!address) {
        return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Address is required");
    }
    try {
        const balance = yield Xion.getBalance(address);
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Balance of Xion", { balance });
    }
    catch (error) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "ERROR_XION", 400);
    }
}));
exports.sendXionTokenUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recipientAddress, amount } = req.body;
    if (!recipientAddress || !amount) {
        return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Recipient address and amount are required");
    }
    try {
        const payment = yield Transaction.sendTokens(recipientAddress, amount);
        console.error({ payment });
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Funds sent successfully", payment);
    }
    catch (error) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "ERROR_SENDING_XION", 500);
    }
}));
exports.sendXionToEscrowContract = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { sellerAddress, amount } = req.body;
    const maxRetries = 3;
    if (!sellerAddress || !amount) {
        return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Contract address and amount are required");
    }
    if (Number(amount) <= 0) {
        return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Invalid amount: must be greater than zero.");
    }
    const formattedAmount = xion_queries_1.default.xionToUxion(amount);
    const user = yield UserRepository_1.default.findById(req._id);
    if (!(user === null || user === void 0 ? void 0 : user.walletAddress) || !(user === null || user === void 0 ? void 0 : user.mnemonic)) {
        console.error("User wallet address or mnemonic is missing.");
        return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Invalid user credentials");
    }
    const msg = {
        initiate_escrow: {
            seller: sellerAddress,
            amount: formattedAmount,
        },
    };
    const funds = [{ denom: "uxion", amount: formattedAmount }];
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const transaction = yield Transaction.executeContract(user.walletAddress, msg, funds, user.mnemonic);
            if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionHash)) {
                throw new Error("Transaction failed: No transaction hash returned.");
            }
            const formattedTransaction = {
                transactionHash: transaction.transactionHash,
                gasUsed: ((_a = transaction.gasUsed) === null || _a === void 0 ? void 0 : _a.toString()) || "N/A",
                gasWanted: ((_b = transaction.gasWanted) === null || _b === void 0 ? void 0 : _b.toString()) || "N/A",
            };
            console.log("Transaction successful:", formattedTransaction);
            return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Funds sent to escrow contract", formattedTransaction);
        }
        catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.message);
            if (error.message.includes("insufficient funds")) {
                return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Insufficient funds for the transaction.");
            }
            if (attempt === maxRetries) {
                return (0, ResponseHandler_1.ResponseHandler)(res, 500, "Transaction failed after multiple attempts.");
            }
            yield new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }
}));
exports.releaseOrCancelEscrow = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { buyerAddress, status } = req.body;
    const maxRetries = 3;
    if (!buyerAddress || !status) {
        return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Buyer address and fund status are required.");
    }
    const user = yield UserRepository_1.default.findById(req._id);
    if (!user) {
        return (0, ResponseHandler_1.ResponseHandler)(res, 400, "User not found.");
    }
    const FUND_STATES = ["release", "cancel"];
    if (!FUND_STATES.includes(status.toLowerCase())) {
        return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Invalid fund status.");
    }
    const msg = status.toLowerCase() === "release"
        ? { release_funds: {} }
        : { cancel_escrow: {} };
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}: Executing escrow transaction...`);
            const transaction = yield Transaction.executeContract(buyerAddress, msg, [], user.mnemonic);
            if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionHash)) {
                throw new Error("Transaction failed: No transaction hash returned.");
            }
            req.transactionData = {
                transactionHash: transaction.transactionHash,
                gasUsed: ((_a = transaction.gasUsed) === null || _a === void 0 ? void 0 : _a.toString()) || "N/A",
                gasWanted: ((_b = transaction.gasWanted) === null || _b === void 0 ? void 0 : _b.toString()) || "N/A",
            };
            console.log("Transaction successful:", req.transactionData);
            return next();
        }
        catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.message);
            if (attempt === maxRetries) {
                return (0, ResponseHandler_1.ResponseHandler)(res, 500, "Escrow transaction failed after multiple attempts.", error);
            }
            yield new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }
}));
