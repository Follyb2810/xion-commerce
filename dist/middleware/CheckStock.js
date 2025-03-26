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
const ResponseHandler_1 = require("../utils/ResponseHandler");
const ProductRepository_1 = __importDefault(require("../repositories/ProductRepository"));
const CheckStock = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, quantity } = req.body;
        console.log(`✅ CheckStock: Received productId=${productId}, quantity=${quantity}`);
        if (!mongoose_1.Types.ObjectId.isValid(productId)) {
            console.error("❌ CheckStock Error: INVALID_PRODUCT_ID");
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_PRODUCT_ID", 400);
        }
        if (quantity <= 0) {
            console.error("❌ CheckStock Error: INVALID_QUANTITY");
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_QUANTITY", 400);
        }
        console.log("✅ CheckStock: Fetching product from database...");
        const product = yield ProductRepository_1.default.findById(productId, [
            { path: "seller", select: "walletAddress" },
        ]);
        if (!product) {
            console.error("❌ CheckStock Error: PRODUCT_NOT_FOUND");
            return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
        }
        console.log(`✅ CheckStock: Product found with stock=${product.stock}, requested=${quantity}`);
        if (product.stock < quantity) {
            console.error(`❌ CheckStock Error: INSUFFICIENT_STOCK (Stock=${product.stock}, Requested=${quantity})`);
            return (0, ResponseHandler_1.ErrorHandler)(res, "INSUFFICIENT_STOCK", 400);
        }
        console.log("✅ CheckStock: Stock is sufficient. Proceeding...");
        req.product = product;
        req.seller = product.seller;
        next();
    }
    catch (error) {
        console.error("❌ CheckStock Unexpected Error:", error);
        return (0, ResponseHandler_1.ErrorHandler)(res, "SERVER_ERROR", 500);
    }
});
exports.CheckStock = CheckStock;
