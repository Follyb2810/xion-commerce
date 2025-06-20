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
exports.getProductByCategory = exports.getTopSelling = exports.getBestDeals = exports.getSpecialOffers = exports.allSellerProduct = exports.updateProductDocument = exports.deleteProductImage = exports.updateProductImage = exports.updateProduct = exports.deleteProduct = exports.createProduct = exports.getProductById = exports.allProducts = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const IUser_1 = require("./../../common/types/IUser");
const ResponseHandler_1 = require("./../../common/exceptions/ResponseHandler");
const product_service_1 = __importDefault(require("./product.service"));
const cache_1 = require("../../common/libs/cache");
exports.allProducts = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield product_service_1.default.getAllProducts(req.query);
        // console.log({ a: result });
        if (req.cacheKey && result) {
            const cacheData = JSON.parse(JSON.stringify(result));
            const success = cache_1.cache.set(req.cacheKey, cacheData, 600);
            console.log(`Cache set for ${req.cacheKey}:`, success ? "✅ Success" : "❌ Failed");
        }
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Products retrieved successfully", result);
    }
    catch (error) {
        if (error.message === "INVALID_CATEGORY_ID") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "Invalid category ID", 400);
        }
        return (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_FETCH_PRODUCTS", 500);
    }
}));
exports.getProductById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_service_1.default.getProductById(req.params.productId);
        if (req.cacheKey && product) {
            const cacheData = JSON.parse(JSON.stringify({ product }));
            const success = cache_1.cache.set(req.cacheKey, cacheData, 600);
            console.log(`Cache set for key ${req.cacheKey}:`, success ? "Success" : "Failed");
        }
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product retrieved successfully", {
            product,
        });
    }
    catch (error) {
        if (error.message === "PRODUCT_NOT_FOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
        }
        return (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_FETCH_PRODUCT", 500);
    }
}));
exports.createProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.roles) === null || _a === void 0 ? void 0 : _a.includes(IUser_1.Roles.SELLER))) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "SELLER_AUTH", 403);
        }
        if (!req.files) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "FILE_ERROR", 400);
        }
        const files = req.files;
        const productData = Object.assign(Object.assign({}, req.body), { sellerId: req._id });
        const newProduct = yield product_service_1.default.createProduct(productData, files);
        cache_1.cache.del("products:list"); // products:list
        cache_1.cache.keys().forEach((key) => {
            if (key.startsWith("product")) {
                cache_1.cache.del(key);
            }
        });
        return (0, ResponseHandler_1.ResponseHandler)(res, 201, "Product uploaded successfully", {
            product: newProduct,
        });
    }
    catch (error) {
        if (error.message === "COVER_IMAGE_REQUIRED") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "Cover image is required", 400);
        }
        if (error.message === "INVALID_IMAGE_COUNT") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "You must upload between 1 and 5 images of the land", 400);
        }
        if (error.message === "INVALID_DOCUMENT_COUNT") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "You must upload between 1 and 6 document files", 400);
        }
        return (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_CREATE_PRODUCT", 500);
    }
}));
exports.deleteProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        yield product_service_1.default.deleteProduct(productId, req._id);
        cache_1.cache.del(`product:${productId}`); //product:124
        cache_1.cache.del("products:list"); // product:loist
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product deleted successfully");
    }
    catch (error) {
        if (error.message === "PRODUCT_NOT_FOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
        }
        if (error.message === "UNAUTHORIZED") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "UNAUTHORIZED", 403);
        }
        return (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_DELETE_PRODUCT", 500);
    }
}));
exports.updateProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    try {
        const updatedProduct = yield product_service_1.default.updateProduct(productId, req._id, req.body);
        cache_1.cache.del(`product:${productId}`); // product:123
        cache_1.cache.del("products:list"); //product:list
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product updated successfully", {
            updatedProduct,
        });
    }
    catch (error) {
        if (error.message === "PRODUCT_NOT_FOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
        }
        if (error.message === "UNAUTHORIZED") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "Unauthorized", 401);
        }
        if (error.message === "INVALID_MAP_LOCATION") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_MAP_LOCATION", 400);
        }
        return (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_UPDATE_PRODUCT", 500);
    }
}));
exports.updateProductImage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const imageFiles = (files === null || files === void 0 ? void 0 : files.image_of_land) || [];
        const { productId } = req.params;
        yield product_service_1.default.updateProductImage(productId, req._id, imageFiles);
        // cache.del(`product:${productId}`); // product:123
        // cache.del("products:list"); //product:list
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Image(s) updated successfully");
    }
    catch (error) {
        if (error.message === "PRODUCT_NOT_FOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
        }
        if (error.message === "UNAUTHORIZED") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "Unauthorized", 403);
        }
        if (error.message === "NO_IMAGE_FILES") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "No image file(s) uploaded", 400);
        }
        if (error.message === "IMAGE_LIMIT_EXCEEDED") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "You can only have a maximum of 5 images", 400);
        }
        return (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_UPDATE_IMAGES", 500);
    }
}));
exports.deleteProductImage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const { imageUrl } = req.query;
        yield product_service_1.default.deleteProductImage(productId, req._id, imageUrl);
        cache_1.cache.del(`product:${productId}`); // product:123
        cache_1.cache.del("products:list"); //products:list
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Image deleted successfully");
    }
    catch (error) {
        if (error.message === "IMAGE_URL_REQUIRED") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "Missing or invalid imageUrl", 400);
        }
        if (error.message === "PRODUCT_NOT_FOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
        }
        if (error.message === "UNAUTHORIZED") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "Unauthorized", 403);
        }
        if (error.message === "IMAGE_NOT_FOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "Image not found in product", 400);
        }
        if (error.message === "CANNOT_DELETE_ONLY_IMAGE") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "Cannot delete the only image. At least one image is required.", 400);
        }
        if (error.message === "FAILED_TO_EXTRACT_PUBLIC_ID") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "Failed to extract public ID", 500);
        }
        return (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_DELETE_IMAGE", 500);
    }
}));
exports.updateProductDocument = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const files = req.files;
        const documentFile = (_a = files === null || files === void 0 ? void 0 : files.document_of_land) === null || _a === void 0 ? void 0 : _a[0];
        const { productId } = req.params;
        if (!documentFile) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "No document file uploaded", 400);
        }
        yield product_service_1.default.updateProductDocument(productId, req._id, documentFile);
        cache_1.cache.del(`product:${productId}`); // product:123
        cache_1.cache.del("products:list"); //products:list
        return (0, ResponseHandler_1.ResponseHandler)(res, 204, "Document updated successfully");
    }
    catch (error) {
        if (error.message === "PRODUCT_NOT_FOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
        }
        if (error.message === "UNAUTHORIZED") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "Unauthorized", 403);
        }
        if (error.message === "NO_DOCUMENT_FILE") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_FILE", 400);
        }
        return (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_UPDATE_DOCUMENT", 500);
    }
}));
exports.allSellerProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_service_1.default.getSellerProducts(req._id);
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "All seller products retrieved successfully", { products });
    }
    catch (error) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_FETCH_SELLER_PRODUCTS", 500);
    }
}));
exports.getSpecialOffers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_service_1.default.getSpecialOffers();
        if (req.cacheKey) {
            const cacheData = JSON.parse(JSON.stringify({ products }));
            const success = cache_1.cache.set(req.cacheKey, cacheData, 600); // product:special
            console.log(`Cache set for key ${req.cacheKey}:`, success ? "Success" : "Failed");
        }
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Special offers fetched", { products });
    }
    catch (error) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_FETCH_SPECIAL_OFFERS", 500);
    }
}));
exports.getBestDeals = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_service_1.default.getBestDeals();
        if (req.cacheKey) {
            const cacheData = JSON.parse(JSON.stringify({ products }));
            const success = cache_1.cache.set(req.cacheKey, cacheData, 600); // product:best
        }
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Best deals fetched", { products });
    }
    catch (error) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_FETCH_BEST_DEALS", 500);
    }
}));
exports.getTopSelling = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_service_1.default.getTopSelling();
        if (req.cacheKey) {
            const cacheData = JSON.parse(JSON.stringify({ products }));
            const success = cache_1.cache.set(req.cacheKey, cacheData, 600); // product:top
        }
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Top selling properties fetched", {
            products,
        });
    }
    catch (error) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_FETCH_TOP_SELLING", 500);
    }
}));
exports.getProductByCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rawCategory = req.query.category;
        const category = typeof rawCategory === "string"
            ? rawCategory
            : Array.isArray(rawCategory)
                ? rawCategory[0]
                : "";
        const products = yield product_service_1.default.getProductsByCategory(category);
        if (req.cacheKey) {
            const cacheData = JSON.parse(JSON.stringify({ products }));
            const success = cache_1.cache.set(req.cacheKey, cacheData, 600); //product:byCategory
        }
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product by category", products);
    }
    catch (error) {
        if (error.message === "INVALID_CATEGORY_ID") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "Invalid category ID", 400);
        }
        return (0, ResponseHandler_1.ErrorHandler)(res, "FAILED_TO_FETCH_PRODUCTS_BY_CATEGORY", 500);
    }
}));
