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
exports.checkout = exports.checkCartProductAvailable = exports.deleteUserCart = exports.removeCart = exports.getCart = exports.addToCart = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ResponseHandler_1 = require("./../../common/exceptions/ResponseHandler");
const ProductResponse_1 = require("./../../middleware/ProductResponse");
const cart_service_1 = __importDefault(require("./cart.service"));
const cache_1 = require("../../common/libs/cache");
exports.addToCart = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const { productId, quantity = 1 } = req.body;
    try {
        yield cart_service_1.default.addProductToCart(userId, productId, quantity);
        cache_1.cache.del(`carts:${userId}`); // carts:list
        cache_1.cache.keys().forEach((key) => {
            if (key.startsWith("cart")) {
                cache_1.cache.del(key);
            }
        });
        (0, ResponseHandler_1.ResponseHandler)(res, 200, "Cart Successfully Added");
    }
    catch (error) {
        switch (error.message) {
            case "NOT_FOUND":
                return (0, ResponseHandler_1.ErrorHandler)(res, "NOT_FOUND", 404);
            case "INVALID_QUANTITY":
                return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_QUANTITY", 400);
            case "INSUFFICIENT_STOCK":
                return (0, ResponseHandler_1.ErrorHandler)(res, "INSUFFICIENT_STOCK", 400);
            default:
                throw error;
        }
    }
}));
exports.getCart = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const cart = yield cart_service_1.default.getUserCart(userId);
    if (req.cacheKey && cart) {
        // console.log(JSON.stringify(cart, null, 2));
        const cacheData = JSON.parse(JSON.stringify(cart));
        const success = cache_1.cache.set(req.cacheKey, cacheData, 600);
        console.log(`Cache set for key ${req.cacheKey}:`, success ? "Success" : "Failed");
    }
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "User Cart", cart);
}));
exports.removeCart = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const { productId, quantity = 1 } = req.body;
    try {
        const cart = yield cart_service_1.default.removeProductFromCart(userId, productId, quantity);
        cache_1.cache.del(`cart:${userId}`); // cart:123
        (0, ResponseHandler_1.ResponseHandler)(res, 200, "Item removed from cart", cart);
    }
    catch (error) {
        switch (error.message) {
            case "FIELD_ERROR":
                return (0, ResponseHandler_1.ErrorHandler)(res, "FIELD_ERROR", 400);
            case "NOT_FOUND":
                return (0, ResponseHandler_1.ErrorHandler)(res, "NOT_FOUND", 404);
            case "UNAUTHORIZED":
                return (0, ResponseHandler_1.ErrorHandler)(res, "UNAUTHORIZED", 403);
            default:
                throw error;
        }
    }
}));
exports.deleteUserCart = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const { cartId } = req.params;
    try {
        yield cart_service_1.default.deleteCart(userId, cartId);
        cache_1.cache.del(`cart:${userId}`); // cart:123
        (0, ResponseHandler_1.ResponseHandler)(res, 200, "Cart deleted successfully");
    }
    catch (error) {
        switch (error.message) {
            case "NOT_FOUND":
                return (0, ResponseHandler_1.ErrorHandler)(res, "NOT_FOUND", 404);
            case "UNAUTHORIZED":
                return (0, ResponseHandler_1.ErrorHandler)(res, "UNAUTHORIZED", 403);
            default:
                throw error;
        }
    }
}));
exports.checkCartProductAvailable = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { quantity } = req.body;
    const { product, seller } = req;
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product available", (0, ProductResponse_1.formatProductResponse)(product, seller, quantity));
}));
exports.checkout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const { transactionHash } = req.body;
    try {
        const checkoutResult = yield cart_service_1.default.processCheckout(userId, transactionHash);
        cache_1.cache.del(`cart:${userId}`); // cart:123
        (0, ResponseHandler_1.ResponseHandler)(res, 200, "Checkout successful", checkoutResult);
    }
    catch (error) {
        switch (error.message) {
            case "USER_NOT_FOUND":
                return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOT_FOUND", 400);
            case "EMPTY_CART":
                return (0, ResponseHandler_1.ErrorHandler)(res, "EMPTY_CART", 400);
            case "PRODUCT_NOT_FOUND":
                return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
            case "INSUFFICIENT_STOCK":
                return (0, ResponseHandler_1.ErrorHandler)(res, "INSUFFICIENT_STOCK", 400);
            case "CHECKOUT_FAILED":
                return (0, ResponseHandler_1.ErrorHandler)(res, "CHECKOUT_FAILED", 500);
            default:
                console.error("Unexpected checkout error:", error);
                return (0, ResponseHandler_1.ErrorHandler)(res, "INTERNAL_SERVER_ERROR", 500);
        }
    }
}));
