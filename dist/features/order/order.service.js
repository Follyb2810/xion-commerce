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
const user_repository_1 = __importDefault(require("./../user/user.repository"));
const product_repository_1 = __importDefault(require("./../product/product.repository"));
const order_repository_1 = __importDefault(require("./../order/order.repository"));
const cart_repository_1 = __importDefault(require("./../cart/cart.repository"));
const IOrder_1 = require("./../../common/types/IOrder");
class OrderService {
    getAllOrder() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield order_repository_1.default.getAll();
        });
    }
    updateOrderStatus(orderId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedStatus = status.toLowerCase();
            const validStatuses = Object.values(IOrder_1.OrderStatus).map((s) => s.toLowerCase());
            if (!validStatuses.includes(normalizedStatus)) {
                throw new Error("INVALID_STATUS");
            }
            const order = yield order_repository_1.default.findById(orderId);
            if (!order) {
                throw new Error("ORDER_NOT_FOUND");
            }
            if (normalizedStatus === IOrder_1.OrderStatus.CANCELED.toLowerCase()) {
                for (const item of order.items) {
                    yield product_repository_1.default.updateById(item.product.toString(), {
                        $inc: { stock: item.quantity },
                    });
                }
            }
            return yield order_repository_1.default.updateById(orderId, { status: normalizedStatus });
        });
    }
    getDirectPurchaseHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_repository_1.default.findById(userId, "history.item");
            if (!user) {
                throw new Error("USER_NOT_FOUND");
            }
            return user.history || [];
        });
    }
    getUserOrders(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const orders = yield order_repository_1.default.findByEntity({ $or: [{ buyer: userId }, { seller: userId }] }, "buyer seller items status totalAmount createdAt updatedAt");
            if (!orders) {
                throw new Error("ORDER_NOT_FOUND");
            }
            if (String(orders.buyer) !== String(userId)) {
                throw new Error("UNAUTHORIZED");
            }
            return orders;
        });
    }
    getUserPurchaseHistory(userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { buyer: userId };
            if (status) {
                filter.status = status;
            }
            return yield order_repository_1.default.getAll(undefined, filter, [
                {
                    path: "items.product",
                    select: "price image_of_land stock coverImage",
                },
            ]);
        });
    }
    directPurchase(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, productId, quantity, transactionHash, email, fullName, phoneNumber, saveDetailsToProfile, } = input;
            if (!mongoose_1.Types.ObjectId.isValid(productId)) {
                throw new Error("INVALID_PRODUCT_ID");
            }
            if (!transactionHash) {
                throw new Error("TRANSACTION_HASH_REQUIRED");
            }
            const product = yield product_repository_1.default.findById(productId);
            if (!product) {
                throw new Error("PRODUCT_NOT_FOUND");
            }
            if (product.stock < quantity) {
                throw new Error("INSUFFICIENT_STOCK");
            }
            const totalAmount = product.price * quantity;
            try {
                const order = yield order_repository_1.default.create({
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
                yield product_repository_1.default.updateById(productId, {
                    $inc: { stock: -quantity },
                });
                yield this.updateCartAfterPurchase(userId, productId, quantity);
                yield user_repository_1.default.updateById(userId, {
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
                // Update user profile if requested
                if (saveDetailsToProfile) {
                    yield this.updateUserProfileFromOrder(userId, {
                        email,
                        fullName,
                        phoneNumber,
                    });
                }
                return {
                    order,
                    transactionHash,
                    updatedStock: product.stock - quantity,
                    product: {
                        title: product.title,
                        price: product.price,
                    },
                    profileUpdated: saveDetailsToProfile,
                };
            }
            catch (error) {
                console.error("Direct purchase error:", error);
                throw new Error("PURCHASE_FAILED");
            }
        });
    }
    updateCartAfterPurchase(userId, productId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = yield cart_repository_1.default.findByEntity({
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
        });
    }
    updateUserProfileFromOrder(userId, orderDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user = yield user_repository_1.default.findById(userId);
                if (!user)
                    return;
                const normalizedEmail = (_a = orderDetails.email) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase();
                if (normalizedEmail && normalizedEmail !== user.email) {
                    const emailTaken = yield user_repository_1.default.findByEntity({
                        email: normalizedEmail,
                    });
                    const isEmailUsedByAnotherUser = emailTaken && emailTaken._id.toString() !== user._id.toString();
                    if (!isEmailUsedByAnotherUser) {
                        user.email = normalizedEmail;
                        user.isEmailVerified = false;
                    }
                }
                if (orderDetails.phoneNumber) {
                    user.phoneNumber = orderDetails.phoneNumber;
                }
                if (orderDetails.fullName) {
                    user.profile = Object.assign(Object.assign({}, user.profile), { name: orderDetails.fullName });
                }
                yield user.save();
            }
            catch (error) {
                console.error("Profile update from order failed:", error);
            }
        });
    }
}
exports.default = new OrderService();
