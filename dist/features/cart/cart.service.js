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
const mongoose_1 = require("mongoose");
const cart_repository_1 = __importDefault(require("./cart.repository"));
const product_repository_1 = __importDefault(require("./../product/product.repository"));
const user_repository_1 = __importDefault(require("./../user/user.repository"));
const order_repository_1 = __importDefault(require("./../order/order.repository"));
const IOrder_1 = require("./../../common/types/IOrder");
class CartService {
    addProductToCart(userId_1, productId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, productId, quantity = 1) {
            const productData = yield product_repository_1.default.findById(productId);
            if (!productData) {
                throw new Error("NOT_FOUND");
            }
            if (quantity <= 0) {
                throw new Error("INVALID_QUANTITY");
            }
            if (productData.stock < quantity) {
                throw new Error("INSUFFICIENT_STOCK");
            }
            let cart = yield cart_repository_1.default.findByEntity({
                user: new mongoose_1.Types.ObjectId(userId),
            });
            if (!cart) {
                cart = yield cart_repository_1.default.create({
                    user: new mongoose_1.Types.ObjectId(userId),
                    items: [
                        {
                            product: new mongoose_1.Types.ObjectId(productId),
                            quantity,
                            price: productData.price,
                        },
                    ],
                    total: productData.price * quantity,
                });
            }
            else {
                const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
                if (itemIndex > -1) {
                    cart.items[itemIndex].quantity += quantity;
                }
                else {
                    cart.items.push({
                        product: new mongoose_1.Types.ObjectId(productId),
                        quantity,
                        price: productData.price,
                    });
                }
                cart.total = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
                yield cart.save();
            }
            return cart;
        });
    }
    getUserCart(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield cart_repository_1.default.findByEntity({ user: userId }, undefined, "items.product");
            return cart;
        });
    }
    removeProductFromCart(userId_1, productId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, productId, quantity = 1) {
            if (!mongoose_1.Types.ObjectId.isValid(productId)) {
                throw new Error("FIELD_ERROR");
            }
            const cart = yield cart_repository_1.default.findByEntity({
                user: new mongoose_1.Types.ObjectId(userId),
            });
            if (!cart) {
                throw new Error("NOT_FOUND");
            }
            if (String(userId) !== String(cart.user._id)) {
                throw new Error("UNAUTHORIZED");
            }
            const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
            if (itemIndex === -1) {
                throw new Error("NOT_FOUND");
            }
            if (quantity >= cart.items[itemIndex].quantity) {
                cart.items.splice(itemIndex, 1);
            }
            else {
                cart.items[itemIndex].quantity -= quantity;
            }
            cart.total = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
            yield cart.save();
            return cart;
        });
    }
    deleteCart(userId, cartId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userCart = yield cart_repository_1.default.findById(cartId);
            if (!userCart) {
                throw new Error("NOT_FOUND");
            }
            if (String(userId) !== String(userCart.user._id)) {
                throw new Error("UNAUTHORIZED");
            }
            yield cart_repository_1.default.deleteById(cartId);
            return true;
        });
    }
    validateProductAvailability(productId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const productData = yield product_repository_1.default.findById(productId);
            if (!productData) {
                throw new Error("PRODUCT_NOT_FOUND");
            }
            if (productData.stock < quantity) {
                throw new Error("INSUFFICIENT_STOCK");
            }
            return { product: productData, available: true };
        });
    }
    processCheckout(userId, transactionHash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                throw new Error("USER_NOT_FOUND");
            }
            const cart = yield cart_repository_1.default.findByEntity({ user: userId }, undefined, "items.product");
            if (!cart || cart.items.length === 0) {
                throw new Error("EMPTY_CART");
            }
            let totalAmount = 0;
            const orderItems = [];
            const historyItems = [];
            const stockUpdates = [];
            for (const item of cart.items) {
                const productData = yield product_repository_1.default.findById(item.product.toString());
                if (!productData) {
                    throw new Error("PRODUCT_NOT_FOUND");
                }
                if (productData.stock < item.quantity) {
                    throw new Error("INSUFFICIENT_STOCK");
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
                const order = yield order_repository_1.default.create({
                    buyer: new mongoose_1.Types.ObjectId(userId),
                    items: orderItems,
                    totalAmount,
                    status: IOrder_1.OrderStatus.PENDING,
                    payment: {
                        amount: totalAmount,
                        txHash: transactionHash || new mongoose_1.Types.ObjectId().toString(),
                    },
                });
                yield Promise.all(stockUpdates.map((update) => product_repository_1.default.updateById(update.id, {
                    $inc: { stock: -update.quantity },
                })));
                yield user_repository_1.default.updateById(userId, {
                    $push: {
                        history: {
                            $each: historyItems,
                        },
                    },
                });
                if (cart) {
                    yield cart_repository_1.default.deleteById(String(cart._id));
                }
                return {
                    orderId: order._id,
                    totalAmount,
                    transactionHash: transactionHash || new mongoose_1.Types.ObjectId().toString(),
                };
            }
            catch (error) {
                console.error("Checkout error:", error);
                throw new Error("CHECKOUT_FAILED");
            }
        });
    }
}
exports.default = new CartService();
