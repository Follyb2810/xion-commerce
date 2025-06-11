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
const ResponseHandler_1 = require("./../../common/exceptions/ResponseHandler");
const xion_service_1 = __importDefault(require("./xion.service"));
exports.getAddressBalance = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const address = req.query.address;
    if (!address)
        return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Address is required");
    try {
        const balance = yield xion_service_1.default.getAddressBalance(address);
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
        const payment = yield xion_service_1.default.sendXionTokenUser(recipientAddress, amount);
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
    if (Number(amount) <= 0) {
        return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Invalid amount: must be greater than zero.");
    }
    try {
        const transaction = yield xion_service_1.default.sendXionToEscrow(req._id, sellerAddress, amount);
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Funds sent to escrow contract", transaction);
    }
    catch (error) {
        if (error.message === "Insufficient funds") {
            return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Insufficient funds for the transaction.");
        }
        return (0, ResponseHandler_1.ResponseHandler)(res, 500, error.message);
    }
}));
exports.releaseOrCancelEscrow = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { buyerAddress, status } = req.body;
    if (!buyerAddress || !status) {
        return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Buyer address and fund status are required.");
    }
    const validStatuses = ["release", "cancel"];
    if (!validStatuses.includes(status.toLowerCase())) {
        return (0, ResponseHandler_1.ResponseHandler)(res, 400, "Invalid fund status.");
    }
    try {
        const transaction = yield xion_service_1.default.releaseOrCancelEscrow(req._id, buyerAddress, status);
        req.transactionData = transaction;
        return next();
    }
    catch (error) {
        return (0, ResponseHandler_1.ResponseHandler)(res, 500, "Escrow transaction failed", error.message);
    }
}));
