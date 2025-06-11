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
exports.getUserPurchaseHistory = exports.directPurchase = exports.checkProductAvailability = exports.getUserOrder = exports.getDirectPurchaseHistory = exports.updateOrderStatus = exports.allOrder = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ResponseHandler_1 = require("./../../common/exceptions/ResponseHandler");
const ProductResponse_1 = require("./../../middleware/ProductResponse");
const order_service_1 = __importDefault(require("./order.service"));
exports.allOrder = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allOrders = yield order_service_1.default.getAllOrder();
        (0, ResponseHandler_1.ResponseHandler)(res, 200, 'All orders', allOrders);
    }
    catch (error) {
        console.error("Get all orders error:", error);
        (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_FETCH_ORDERS", 500);
    }
}));
exports.updateOrderStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const updatedOrder = yield order_service_1.default.updateOrderStatus(orderId, status);
        (0, ResponseHandler_1.ResponseHandler)(res, 200, "Order status updated", updatedOrder);
    }
    catch (error) {
        console.error("Update order status error:", error);
        if (error.message === "INVALID_STATUS") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_STATUS", 400);
        }
        if (error.message === "ORDER_NOT_FOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "ORDER_NOT_FOUND", 404);
        }
        (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_UPDATE_ORDER", 500);
    }
}));
exports.getDirectPurchaseHistory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req._id;
        const history = yield order_service_1.default.getDirectPurchaseHistory(userId);
        (0, ResponseHandler_1.ResponseHandler)(res, 200, "History of Purchase", history);
    }
    catch (error) {
        console.error("Get purchase history error:", error);
        if (error.message === "USER_NOT_FOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOT_FOUND", 404);
        }
        (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_FETCH_HISTORY", 500);
    }
}));
exports.getUserOrder = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req._id;
        const orders = yield order_service_1.default.getUserOrders(userId);
        (0, ResponseHandler_1.ResponseHandler)(res, 200, "Purchase details retrieved", orders);
    }
    catch (error) {
        console.error("Get user orders error:", error);
        if (error.message === "ORDER_NOT_FOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "ORDER_NOT_FOUND", 404);
        }
        if (error.message === "UNAUTHORIZED") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "UNAUTHORIZED", 403);
        }
        (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_FETCH_ORDERS", 500);
    }
}));
exports.checkProductAvailability = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { quantity } = req.body;
    const { product, seller } = req;
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product available", (0, ProductResponse_1.formatProductResponse)(product, seller, quantity));
}));
exports.directPurchase = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req._id;
        const { productId, quantity = 1, transactionHash, email, fullName, phoneNumber, saveDetailsToProfile = false, } = req.body;
        const result = yield order_service_1.default.directPurchase({
            userId,
            productId,
            quantity,
            transactionHash,
            email,
            fullName,
            phoneNumber,
            saveDetailsToProfile,
        });
        (0, ResponseHandler_1.ResponseHandler)(res, 201, "Purchase successful", result);
    }
    catch (error) {
        console.error("Direct purchase controller error:", error);
        if (error.message === "INVALID_PRODUCT_ID") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_PRODUCT_ID", 400);
        }
        if (error.message === "TRANSACTION_HASH_REQUIRED") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "TRANSACTION_HASH_REQUIRED", 400);
        }
        if (error.message === "PRODUCT_NOT_FOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
        }
        if (error.message === "INSUFFICIENT_STOCK") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INSUFFICIENT_STOCK", 400);
        }
        if (error.message === "PURCHASE_FAILED") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "PURCHASE_FAILED", 500);
        }
        (0, ResponseHandler_1.ErrorHandler)(res, "PURCHASE_FAILED", 500);
    }
}));
exports.getUserPurchaseHistory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req._id;
        const { status } = req.query;
        const orders = yield order_service_1.default.getUserPurchaseHistory(userId, status);
        (0, ResponseHandler_1.ResponseHandler)(res, 200, "User purchase history retrieved", orders);
    }
    catch (error) {
        console.error("Get user purchase history error:", error);
        (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_FETCH_PURCHASE_HISTORY", 500);
    }
}));
