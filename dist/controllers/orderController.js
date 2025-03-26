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
exports.getUserPurchaseHistory = exports.confirmDirectPurchase = exports.checkProductAvailability = exports.getUserOrder = exports.getDirectPurchaseHistory = exports.updateOrderStatus = exports.allOrder = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ResponseHandler_1 = require("../utils/ResponseHandler");
const mongoose_1 = require("mongoose");
const UserRepository_1 = __importDefault(require("../repositories/UserRepository"));
const ProductRepository_1 = __importDefault(require("../repositories/ProductRepository"));
const OrderRepository_1 = __importDefault(require("../repositories/OrderRepository"));
const IOrder_1 = require("../types/IOrder");
const CartRepository_1 = __importDefault(require("../repositories/CartRepository"));
const ProductResponse_1 = require("../middleware/ProductResponse");
//!
exports.allOrder = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const all = yield OrderRepository_1.default.getAll();
    res.json(all);
}));
exports.updateOrderStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    let { status } = req.body;
    status = status.toLowerCase();
    const validStatuses = Object.values(IOrder_1.OrderStatus).map(s => s.toLowerCase());
    if (!validStatuses.includes(status)) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_STATUS", 400);
    }
    const order = yield OrderRepository_1.default.findById(orderId);
    if (!order) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "ORDER_NOT_FOUND", 404);
    }
    if (status === IOrder_1.OrderStatus.CANCELED) {
        for (const item of order.items) {
            yield ProductRepository_1.default.updateById(item.product.toString(), { $inc: { stock: item.quantity } });
        }
    }
    const updatedOrder = yield OrderRepository_1.default.updateById(orderId, { status });
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "Order status updated", updatedOrder);
}));
//! 
exports.getDirectPurchaseHistory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const user = yield UserRepository_1.default.findById(userId, "history.item");
    if (!user) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOT_FOUND", 404);
    }
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "History of Purchase", (user === null || user === void 0 ? void 0 : user.history) || []);
}));
//!
exports.getUserOrder = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const orders = yield OrderRepository_1.default.findByEntity({ $or: [{ buyer: userId }, { seller: userId }] }, "buyer seller items status totalAmount createdAt updatedAt");
    if (!orders) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "ORDER_NOT_FOUND", 404);
    }
    if (String(orders.buyer) !== String(userId)) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "UNAUTHORIZED", 403);
    }
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "Purchase details retrieved", orders);
}));
//! 
exports.checkProductAvailability = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { quantity } = req.body;
    const { product, seller } = req;
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product available", (0, ProductResponse_1.formatProductResponse)(product, seller, quantity));
}));
//! 
exports.confirmDirectPurchase = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const { productId, quantity = 1, transactionHash } = req.body;
    console.log(userId, 'confirmDirectPurchase userId');
    console.log(productId, 'confirmDirectPurchase productId');
    console.log(quantity, 'confirmDirectPurchase quantity');
    console.log(transactionHash, 'confirmDirectPurchase transactionHash');
    if (!mongoose_1.Types.ObjectId.isValid(productId)) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_PRODUCT_ID", 400);
    }
    console.log('INVALID_PRODUCT_ID', 'confirmDirectPurchase transactionHash');
    if (!transactionHash) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "TRANSACTION_HASH_REQUIRED", 400);
    }
    console.log('TRANSACTION_HASH_REQUIRED', 'confirmDirectPurchase transactionHash');
    const product = yield ProductRepository_1.default.findById(productId);
    if (!product) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
    }
    console.log(product, 'confirmDirectPurchase product');
    if (product.stock < quantity) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "INSUFFICIENT_STOCK", 400);
    }
    console.log(`${product.stock} - ${quantity}`, 'confirmDirectPurchase product');
    const totalAmount = product.price * quantity;
    try {
        const order = yield OrderRepository_1.default.create({
            buyer: new mongoose_1.Types.ObjectId(userId),
            seller: product.seller,
            items: [
                {
                    product: new mongoose_1.Types.ObjectId(productId),
                    quantity: quantity,
                    price: product.price,
                },
            ],
            totalAmount: totalAmount,
            payment: {
                amount: totalAmount,
                txHash: transactionHash
            },
            status: IOrder_1.OrderStatus.PENDING
        });
        yield ProductRepository_1.default.updateById(productId, {
            $inc: { stock: -quantity }
        });
        console.log(`${product.stock} - ${quantity}`, 'confirmDirectPurchase product');
        let cart = yield CartRepository_1.default.findByEntity({ user: new mongoose_1.Types.ObjectId(userId) });
        console.log(`${cart}`, 'confirmDirectPurchase cart');
        if (cart) {
            const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
            console.log(`${itemIndex}`, 'confirmDirectPurchase itemIndex');
            if (itemIndex !== -1) {
                const productItem = cart.items[itemIndex];
                if (quantity === productItem.quantity) {
                    cart.items.splice(itemIndex, 1);
                }
                else {
                    cart.items[itemIndex].quantity -= quantity;
                }
                cart.total = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
                yield cart.save();
            }
        }
        yield UserRepository_1.default.updateById(userId, {
            $push: {
                history: {
                    paid: totalAmount,
                    item: new mongoose_1.Types.ObjectId(productId),
                    timestamp: new Date(),
                    transactionHash,
                    orderId: order._id
                }
            }
        });
        console.log('last');
        (0, ResponseHandler_1.ResponseHandler)(res, 201, "Purchase successful", {
            order,
            transactionHash,
            updatedStock: product.stock - quantity,
            product: {
                title: product.title,
                price: product.price
            }
        });
    }
    catch (error) {
        console.error("Direct purchase error:", error);
        return (0, ResponseHandler_1.ErrorHandler)(res, "PURCHASE_FAILED", 500);
    }
}));
exports.getUserPurchaseHistory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const { status } = req.query;
    const filter = { buyer: userId };
    if (status) {
        filter.status = status;
    }
    const orders = yield OrderRepository_1.default.getAll(undefined, filter, [
        {
            path: "items.product",
            select: "price image_of_land stock",
        },
    ]);
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "User purchase history retrieved", orders);
}));
