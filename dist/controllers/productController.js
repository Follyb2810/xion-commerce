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
exports.allSellerProduct = exports.updateProductDocument = exports.updateProductImage = exports.updateProduct = exports.deleteProduct = exports.createProduct = exports.getProductById = exports.allProducts = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const IUser_1 = require("../types/IUser");
const mongoose_1 = require("mongoose");
const claudinary_1 = __importDefault(require("../utils/claudinary"));
const ResponseHandler_1 = require("../utils/ResponseHandler");
const ProductRepository_1 = __importDefault(require("../repositories/ProductRepository"));
exports.allProducts = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const products = yield ProductRepository_1.default.getAll(undefined, { stock: { $gt: 0 } }, [{ path: "seller", select: "walletAddress" }], limit, skip);
    const totalItems = yield ProductRepository_1.default.countDocuments({ stock: { $gt: 0 } });
    const totalPages = Math.ceil(totalItems / limit);
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "All products retrieved successfully", {
        products,
        pagination: { page, limit, totalPages, totalItems }
    });
}));
// export const allProducts = AsyncHandler(async (req: Request, res: Response) => {
//     const products = await ProductRepository.getAll(undefined,  { stock: { $gt: 0 } }, [{ path: "seller", select: "walletAddress" }]);
//     // const products = await ProductRepository.getAll(undefined, {}, [{ path: "seller", select: "walletAddress" }]);
//     return ResponseHandler(res, 200,"All products retrieved successfully", { products });
// });
exports.getProductById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield ProductRepository_1.default.findById(req.params.productId, [{ path: "seller", select: "walletAddress" }]);
    if (!product)
        return (0, ResponseHandler_1.ErrorHandler)(res, "CART_NOT_FOUND", 404);
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product retrieved successfully", { product });
}));
exports.createProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.roles) === null || _a === void 0 ? void 0 : _a.includes(IUser_1.Roles.SELLER)))
        return (0, ResponseHandler_1.ErrorHandler)(res, "SELLER_AUTH", 403);
    if (!req.files)
        return (0, ResponseHandler_1.ErrorHandler)(res, "FILE_ERROR", 400);
    const { title, description, price, category, stock, address, mapping_location, size_of_land } = req.body;
    const mappingLocation = JSON.parse(mapping_location);
    console.log(mappingLocation.lat, mappingLocation.lng);
    if (!mappingLocation || !mappingLocation.lat || !mappingLocation.lng) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "MAP_LOCATION", 400);
    }
    const files = req.files;
    if (!files.image_of_land || !files.document_of_land)
        return (0, ResponseHandler_1.ErrorHandler)(res, "Files are missing", 400);
    const imageUpload = files.image_of_land ? yield claudinary_1.default.uploadSingleImage(files.image_of_land[0].path) : null;
    const documentUpload = files.document_of_land ? yield claudinary_1.default.uploadPdfFile(files.document_of_land[0].path) : null;
    const newProduct = yield ProductRepository_1.default.create({
        title,
        description,
        price,
        category,
        seller: new mongoose_1.Types.ObjectId(req._id),
        stock,
        address,
        mapping_location: mappingLocation,
        image_of_land: (imageUpload === null || imageUpload === void 0 ? void 0 : imageUpload.secure_url) || "",
        size_of_land,
        document_of_land: (documentUpload === null || documentUpload === void 0 ? void 0 : documentUpload.secure_url) || ""
    });
    yield newProduct.save();
    return (0, ResponseHandler_1.ResponseHandler)(res, 201, "Product uploaded successfully", { product: newProduct });
}));
exports.deleteProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield ProductRepository_1.default.findById(req.params.productId, 'seller');
    if (!product)
        return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
    console.log(product.seller._id);
    console.log(req._id);
    if (String(product.seller._id) !== String(req._id))
        return (0, ResponseHandler_1.ErrorHandler)(res, "UNAUTHORIZED", 403);
    // if (product.stock > 1) 
    //     return ErrorHandler(res, "PRODUCT_DEL", 400);
    yield ProductRepository_1.default.deleteById(req.params.productId);
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product deleted successfully");
}));
exports.updateProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield ProductRepository_1.default.findById(req.params.productId, 'seller');
    if (!product)
        return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
    if (req.body.mapping_location) {
        const mappingLocation = JSON.parse(req.body.mapping_location);
        console.log(mappingLocation.lat, mappingLocation.lng);
        if (!mappingLocation.lat || !mappingLocation.lng) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_MAP_LOCATION", 400);
        }
    }
    if (String(product.seller._id) !== String(req._id))
        return (0, ResponseHandler_1.ErrorHandler)(res, "Unauthorized", 401);
    const updateData = Object.assign({}, req.body);
    const updatedProduct = yield ProductRepository_1.default.updateById(req.params.productId, updateData);
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product updated successfully", { updatedProduct });
}));
exports.updateProductImage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield ProductRepository_1.default.findById(req.params.productId, "seller image_of_land");
    if (!product)
        return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
    if (String(product.seller._id) !== String(req._id))
        return (0, ResponseHandler_1.ErrorHandler)(res, "Unauthorized", 403);
    if (!req.files || typeof req.files !== 'object' || !('image_of_land' in (req === null || req === void 0 ? void 0 : req.files)))
        return (0, ResponseHandler_1.ErrorHandler)(res, "No image file uploaded", 400);
    const files = req.files;
    const newImagePath = files.image_of_land[0].path;
    const imageUpload = yield claudinary_1.default.uploadSingleImage(newImagePath);
    if (product.image_of_land)
        yield claudinary_1.default.removeSingleImage(product.image_of_land);
    yield ProductRepository_1.default.updateById(req.params.productId, { image_of_land: imageUpload.secure_url });
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Image updated successfully");
}));
exports.updateProductDocument = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const product = yield ProductRepository_1.default.findById(req.params.productId, "seller document_of_land");
    if (!product)
        return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
    if (String(product.seller._id) !== String(req._id))
        return (0, ResponseHandler_1.ErrorHandler)(res, "Unauthorized", 403);
    if (!req.files || typeof req.files !== "object" || !("document_of_land" in req.files))
        return (0, ResponseHandler_1.ErrorHandler)(res, "No document file uploaded", 400);
    const files = req.files;
    const newDocumentPath = (_b = (_a = files.document_of_land) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path;
    if (!newDocumentPath)
        return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_FILE", 400);
    const documentUpload = yield claudinary_1.default.uploadPdfFile(newDocumentPath);
    if (product.document_of_land)
        yield claudinary_1.default.removeSingleImage(product.document_of_land);
    yield ProductRepository_1.default.updateById(req.params.productId, { document_of_land: documentUpload.secure_url });
    return (0, ResponseHandler_1.ResponseHandler)(res, 204, "Document updated successfully");
}));
exports.allSellerProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield ProductRepository_1.default.getAll(undefined, { seller: req._id });
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "All seller products retrieved successfully", { products });
}));
