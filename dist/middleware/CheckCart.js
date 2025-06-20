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
exports.CheckCart = void 0;
const mongoose_1 = require("mongoose");
const ResponseHandler_1 = require("./../common/exceptions/ResponseHandler");
const cart_repository_1 = __importDefault(require("./../features/cart/cart.repository"));
const CheckCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req._id;
        const { productId, quantity } = req.body;
        if (!mongoose_1.Types.ObjectId.isValid(productId)) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_PRODUCT_ID", 400);
        }
        let cart = yield cart_repository_1.default.findByEntity({
            user: new mongoose_1.Types.ObjectId(userId),
        });
        if (!cart) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "CART_NOT_FOUND", 404);
        }
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        if (itemIndex === -1) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_IN_CART", 404);
        }
        const productItem = cart.items[itemIndex];
        if (quantity > productItem.quantity) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_QUANTITY", 400);
        }
        req.cart = cart;
        req.cartItemIndex = itemIndex;
        next();
    }
    catch (error) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "SERVER_ERROR", 500);
    }
});
exports.CheckCart = CheckCart;
