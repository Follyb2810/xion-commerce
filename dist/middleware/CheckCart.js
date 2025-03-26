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
const ResponseHandler_1 = require("../utils/ResponseHandler");
const CartRepository_1 = __importDefault(require("../repositories/CartRepository"));
const CheckCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req._id;
        const { productId, quantity } = req.body;
        console.log(`CheckCart: Received productId=${productId}, quantity=${quantity}`);
        if (!mongoose_1.Types.ObjectId.isValid(productId)) {
            console.error("CheckCart Error: INVALID_PRODUCT_ID");
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_PRODUCT_ID", 400);
        }
        console.log("CheckCart: Fetching cart from database...");
        let cart = yield CartRepository_1.default.findByEntity({ user: new mongoose_1.Types.ObjectId(userId) });
        if (!cart) {
            console.error("CheckCart Error: CART_NOT_FOUND");
            return (0, ResponseHandler_1.ErrorHandler)(res, "CART_NOT_FOUND", 404);
        }
        console.log(`CheckCart: Searching for product in cart with ${cart.items.length} items`);
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        if (itemIndex === -1) {
            console.error("CheckCart Error: PRODUCT_NOT_IN_CART");
            return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_IN_CART", 404);
        }
        console.log("CheckCart: Product found in cart at index", itemIndex);
        const productItem = cart.items[itemIndex];
        if (quantity > productItem.quantity) {
            console.error("CheckCart Error: INVALID_QUANTITY - Requested:", quantity, "Available:", productItem.quantity);
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_QUANTITY", 400);
        }
        console.log("CheckCart: Passed all checks, moving to next middleware...");
        req.cart = cart;
        req.cartItemIndex = itemIndex;
        next();
    }
    catch (error) {
        console.error("CheckCart Unexpected Error:", error);
        return (0, ResponseHandler_1.ErrorHandler)(res, "SERVER_ERROR", 500);
    }
});
exports.CheckCart = CheckCart;
