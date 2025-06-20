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
exports.CheckStock = void 0;
const mongoose_1 = require("mongoose");
const ResponseHandler_1 = require("./../common/exceptions/ResponseHandler");
const product_repository_1 = __importDefault(require("./../features/product/product.repository"));
const CheckStock = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, quantity } = req.body;
        console.log(`✅ CheckStock: Received productId=${productId}, quantity=${quantity}`);
        if (!mongoose_1.Types.ObjectId.isValid(productId)) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_PRODUCT_ID", 400);
        }
        if (quantity <= 0) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_QUANTITY", 400);
        }
        const product = yield product_repository_1.default.findById(productId, [
            { path: "seller", select: "walletAddress" },
        ]);
        if (!product) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
        }
        if (product.stock < quantity) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INSUFFICIENT_STOCK", 400);
        }
        req.product = product;
        req.seller = product.seller;
        next();
    }
    catch (error) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "SERVER_ERROR", 500);
    }
});
exports.CheckStock = CheckStock;
