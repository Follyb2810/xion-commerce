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
exports.releaseOrRefund = exports.deployEscrowContract = exports.first = void 0;
const deploy_service_1 = __importDefault(require("./deploy.service"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ResponseHandler_1 = require("../../common/exceptions/ResponseHandler");
const cache_1 = require("../../common/libs/cache");
const order_service_1 = __importDefault(require("../order/order.service"));
const first = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.first = first;
exports.deployEscrowContract = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { buyer, required_deposit, seller } = req.body;
    if (!buyer || !seller || !required_deposit) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "FIELD_ERROR", 400);
    }
    try {
        const result = yield deploy_service_1.default.deployEscrowContract({
            buyer,
            required_deposit,
            seller,
        });
        if (!result.success) {
            console.log(result.errorCode);
            (0, ResponseHandler_1.ErrorHandler)(res, result.errorCode, 400);
            return;
        }
        return (0, ResponseHandler_1.ResponseHandler)(res, 201, "Escrow deploy success", result.data);
    }
    catch (error) {
        const err = error;
        const knownError = err.message;
        const statusCode = knownError === "DEPLOY_FAILED" ? 500 : 400;
        (0, ResponseHandler_1.ErrorHandler)(res, knownError, statusCode);
    }
}));
exports.releaseOrRefund = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { contractAddress, action, status } = req.body;
    const { orderId } = req.params;
    if (!contractAddress || !action || !orderId || !status) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "FIELD_ERROR", 400);
    }
    try {
        const release = yield deploy_service_1.default.releaseOrRefund(action, contractAddress);
        if (!release.success) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "", 400);
        }
        const updatedOrder = yield order_service_1.default.updateOrderStatus(orderId, status);
        cache_1.cache.keys().forEach((key) => {
            if (key.startsWith(`user:order:${orderId}`)) {
                cache_1.cache.del(key);
            }
        });
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Order status updated", updatedOrder);
    }
    catch (error) {
        if (error.message === "INVALID_STATUS") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_STATUS", 400);
        }
        if (error.message === "ORDER_NOT_FOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "ORDER_NOT_FOUND", 404);
        }
        return (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_UPDATE_ORDER", 500);
    }
}));
