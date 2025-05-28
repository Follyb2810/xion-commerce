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
    const validStatuses = Object.values(IOrder_1.OrderStatus).map((s) => s.toLowerCase());
    if (!validStatuses.includes(status)) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_STATUS", 400);
    }
    const order = yield OrderRepository_1.default.findById(orderId);
    if (!order) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "ORDER_NOT_FOUND", 404);
    }
    if (status === IOrder_1.OrderStatus.CANCELED) {
        for (const item of order.items) {
            yield ProductRepository_1.default.updateById(item.product.toString(), {
                $inc: { stock: item.quantity },
            });
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
    console.log(orders);
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "Purchase details retrieved", orders);
}));
//!
exports.checkProductAvailability = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { quantity } = req.body;
    const { product, seller } = req;
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product available", (0, ProductResponse_1.formatProductResponse)(product, seller, quantity));
}));
//!
exports.directPurchase = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const { productId, quantity = 1, transactionHash, email, fullName, phoneNumber, saveDetailsToProfile = false, } = req.body;
    if (!mongoose_1.Types.ObjectId.isValid(productId)) {
        console.error("INVALID_PRODUCT_ID", "confirmDirectPurchase transactionHash");
        return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_PRODUCT_ID", 400);
    }
    if (!transactionHash) {
        console.error("TRANSACTION_HASH_REQUIRED", "confirmDirectPurchase transactionHash");
        return (0, ResponseHandler_1.ErrorHandler)(res, "TRANSACTION_HASH_REQUIRED", 400);
    }
    const product = yield ProductRepository_1.default.findById(productId);
    if (!product) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
    }
    if (product.stock < quantity) {
        console.error(`${product.stock} - ${quantity}`, "confirmDirectPurchase product");
        return (0, ResponseHandler_1.ErrorHandler)(res, "INSUFFICIENT_STOCK", 400);
    }
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
                txHash: transactionHash,
            },
            email,
            fullName,
            phoneNumber,
            status: IOrder_1.OrderStatus.PENDING,
        });
        yield ProductRepository_1.default.updateById(productId, {
            $inc: { stock: -quantity },
        });
        let cart = yield CartRepository_1.default.findByEntity({
            user: new mongoose_1.Types.ObjectId(userId),
        });
        if (cart) {
            const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
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
                    orderId: order._id,
                },
            },
        });
        if (saveDetailsToProfile) {
            yield updateUserProfileFromOrder(userId, {
                email,
                fullName,
                phoneNumber,
            });
        }
        return (0, ResponseHandler_1.ResponseHandler)(res, 201, "Purchase successful", {
            order,
            transactionHash,
            updatedStock: product.stock - quantity,
            product: {
                title: product.title,
                price: product.price,
            },
            profileUpdated: saveDetailsToProfile,
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
    console.log(orders);
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "User purchase history retrieved", orders);
}));
const updateUserProfileFromOrder = (userId, orderDetails) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield UserRepository_1.default.findById(userId);
        if (!user)
            return;
        const normalizedEmail = (_a = orderDetails.email) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase();
        const updates = {};
        if (normalizedEmail && normalizedEmail !== user.email) {
            const emailTaken = yield UserRepository_1.default.findByEntity({
                email: normalizedEmail
            });
            const isEmailUsedByAnotherUser = emailTaken && emailTaken._id.toString() !== user._id.toString();
            if (!isEmailUsedByAnotherUser) {
                updates.email = normalizedEmail;
                updates.isEmailVerified = false;
            }
        }
        if (orderDetails.phoneNumber) {
            user.phoneNumber = orderDetails.phoneNumber;
        }
        if (orderDetails.fullName) {
            updates.profile = Object.assign(Object.assign({}, user.profile), { name: orderDetails.fullName });
        }
    }
    catch (error) {
        console.error("Profile update from order failed:", error);
    }
});
