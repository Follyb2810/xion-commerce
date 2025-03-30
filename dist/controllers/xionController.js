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
exports.releaseOrCancelEscrow = exports.sendXionToEscrowContract = exports.sendXionToContract = exports.getAddressBalance = void 0;
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
exports.sendXionToContract = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recipientAddress, amount } = req.body;
    if (!recipientAddress || !amount) {
        return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Recipient address and amount are required");
    }
    try {
        const payment = yield Transaction.sendTokens(recipientAddress, amount);
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Funds sent successfully", payment);
    }
    catch (error) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "ERROR_SENDING_XION", 500);
    }
}));
exports.sendXionToEscrowContract = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sellerAddress, amount } = req.body;
    if (!sellerAddress || !amount) {
        return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Contract address and amount are required");
    }
    if (!amount || Number(amount) <= 0) {
        throw new Error("Invalid amount: must be greater than zero.");
    }
    const formattedAmount = xion_queries_1.default.xionToUxion(amount);
    const user = yield UserRepository_1.default.findById(req._id);
    const msg = {
        initiate_escrow: {
            seller: sellerAddress,
            amount: formattedAmount,
        },
    };
    const funds = [{ denom: "uxion", amount: formattedAmount }];
    const transaction = yield Transaction.executeContract(user === null || user === void 0 ? void 0 : user.walletAddress, msg, funds, user === null || user === void 0 ? void 0 : user.mnemonic);
    const formattedTransaction = {
        transactionHash: transaction === null || transaction === void 0 ? void 0 : transaction.transactionHash,
        gasUsed: transaction === null || transaction === void 0 ? void 0 : transaction.gasUsed.toString(),
        gasWanted: transaction === null || transaction === void 0 ? void 0 : transaction.gasWanted.toString(),
    };
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Funds sent to escrow contract", formattedTransaction);
}));
exports.releaseOrCancelEscrow = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { buyerAddress, status } = req.body;
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
    try {
        const transaction = yield Transaction.executeContract(buyerAddress, msg, [], user.mnemonic);
        if (!transaction) {
            return (0, ResponseHandler_1.ResponseHandler)(res, 500, "Transaction failed.");
        }
        req.transactionData = {
            transactionHash: transaction.transactionHash,
            gasUsed: transaction.gasUsed.toString(),
            gasWanted: transaction.gasWanted.toString(),
        };
        next();
    }
    catch (error) {
        return (0, ResponseHandler_1.ResponseHandler)(res, 500, "Escrow transaction failed.", error);
    }
}));
