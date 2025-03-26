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
const CartRepository_1 = __importDefault(require("../repositories/CartRepository"));
const mongoose_1 = require("mongoose");
const ProductRepository_1 = __importDefault(require("../repositories/ProductRepository"));
const UserRepository_1 = __importDefault(require("../repositories/UserRepository"));
const ResponseHandler_1 = require("../utils/ResponseHandler");
const OrderRepository_1 = __importDefault(require("../repositories/OrderRepository"));
const IOrder_1 = require("../types/IOrder");
const ProductResponse_1 = require("../middleware/ProductResponse");
exports.addToCart = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const { productId, quantity = 1 } = req.body;
    const productData = yield ProductRepository_1.default.findById(productId);
    if (!productData) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "NOT_FOUND", 404);
    }
    if (quantity <= 0) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_QUANTITY", 400);
    }
    if (productData.stock < quantity) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "INSUFFICIENT_STOCK", 400);
    }
    let cart = yield CartRepository_1.default.findByEntity({ user: new mongoose_1.Types.ObjectId(userId) });
    if (!cart) {
        cart = yield CartRepository_1.default.create({
            user: new mongoose_1.Types.ObjectId(userId),
            items: [{ product: new mongoose_1.Types.ObjectId(productId), quantity, price: productData.price }],
            total: productData.price * quantity,
        });
    }
    else {
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        itemIndex > -1 ? (cart.items[itemIndex].quantity += quantity) : cart.items.push({
            product: new mongoose_1.Types.ObjectId(productId),
            quantity,
            price: productData.price,
        });
        cart.total = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
        yield cart.save();
    }
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "Cart Successfully Added");
}));
exports.getCart = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    console.log(userId);
    const cart = yield CartRepository_1.default.findByEntity({ user: userId }, undefined, "items.product");
    // if (!cart || cart.items.length === 0) {
    //   return ErrorHandler(res, "NOT_FOUND", 404);
    // }
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "User Cart", cart);
}));
exports.removeCart = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const { productId, quantity = 1 } = req.body;
    console.log(userId);
    console.log(productId);
    console.log(quantity);
    if (!mongoose_1.Types.ObjectId.isValid(productId)) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "FIELD_ERROR", 400);
    }
    const cart = yield CartRepository_1.default.findByEntity({ user: new mongoose_1.Types.ObjectId(userId) });
    console.log(cart);
    console.log(1);
    if (!cart) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "NOT_FOUND", 404);
    }
    console.log(2);
    if (String(req._id) !== String(cart.user._id)) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "UNAUTHORIZED", 403);
    }
    console.log(3);
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "NOT_FOUND", 404);
    }
    console.log(4);
    quantity >= cart.items[itemIndex].quantity
        ? cart.items.splice(itemIndex, 1)
        : (cart.items[itemIndex].quantity -= quantity);
    cart.total = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    yield cart.save();
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "Item removed from cart", cart);
}));
exports.deleteUserCart = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userCart = yield CartRepository_1.default.findById(req.params.cartId);
    if (!userCart) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "NOT_FOUND", 404);
    }
    if (String(req._id) !== String(userCart.user._id)) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "UNAUTHORIZED", 403);
    }
    yield CartRepository_1.default.deleteById(req.params.cartId);
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "Cart deleted successfully");
}));
//? single product processPayment
// Process payment for a single product in the cart
exports.checkCartProductAvailable = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { quantity } = req.body;
    const { product, seller } = req;
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product available", (0, ProductResponse_1.formatProductResponse)(product, seller, quantity));
}));
//? all product on the checkout
//? // Checkout all items in the cart
exports.checkout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const { transactionHash } = req.body;
    if (!userId) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOT_FOUND", 400);
    }
    const cart = yield CartRepository_1.default.findByEntity({ user: userId }, undefined, "items.product");
    if (!cart || cart.items.length === 0) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "EMPTY_CART", 400);
    }
    let totalAmount = 0;
    const orderItems = [];
    const historyItems = [];
    const stockUpdates = [];
    for (const item of cart.items) {
        const productData = yield ProductRepository_1.default.findById(item.product.toString());
        if (!productData) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
        }
        if (productData.stock < item.quantity) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INSUFFICIENT_STOCK", 400);
        }
        const itemTotal = productData.price * item.quantity;
        totalAmount += itemTotal;
        orderItems.push({
            product: item.product,
            quantity: item.quantity,
            price: productData.price,
        });
        historyItems.push({
            paid: itemTotal,
            item: new mongoose_1.Types.ObjectId(item.product.toString()),
            timestamp: new Date(),
            transactionHash: transactionHash || new mongoose_1.Types.ObjectId().toString(),
        });
        stockUpdates.push({
            id: item.product.toString(),
            quantity: item.quantity,
        });
    }
    try {
        const order = yield OrderRepository_1.default.create({
            buyer: new mongoose_1.Types.ObjectId(userId),
            items: orderItems,
            totalAmount,
            status: IOrder_1.OrderStatus.PENDING,
            payment: {
                amount: totalAmount,
                txHash: transactionHash || new mongoose_1.Types.ObjectId().toString(),
            },
        });
        yield Promise.all(stockUpdates.map((update) => ProductRepository_1.default.updateById(update.id, {
            $inc: { stock: -update.quantity },
        })));
        yield UserRepository_1.default.updateById(userId, {
            $push: {
                history: {
                    $each: historyItems,
                },
            },
        });
        if (cart) {
            yield CartRepository_1.default.deleteById(String(cart._id));
        }
        (0, ResponseHandler_1.ResponseHandler)(res, 200, "Checkout successful", {
            orderId: order._id,
            totalAmount,
            transactionHash,
        });
    }
    catch (error) {
        // return AppError(error, res);
        console.log(error);
    }
}));
