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
exports.getFilteredProducts = exports.getTopSelling = exports.getBestDeals = exports.getSpecialOffers = exports.allSellerProduct = exports.updateProductDocument = exports.deleteProductImage = exports.updateProductImage = exports.updateProduct = exports.deleteProduct = exports.createProduct = exports.getProductById = exports.allProducts = void 0;
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
    const totalItems = yield ProductRepository_1.default.countDocuments({
        stock: { $gt: 0 },
    });
    const totalPages = Math.ceil(totalItems / limit);
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "All products retrieved successfully", {
        products,
        pagination: { page, limit, totalPages, totalItems },
    });
}));
exports.getProductById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield ProductRepository_1.default.findById(req.params.productId, [
        { path: "seller", select: "walletAddress" },
    ]);
    if (!product)
        return (0, ResponseHandler_1.ErrorHandler)(res, "CART_NOT_FOUND", 404);
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product retrieved successfully", {
        product,
    });
}));
exports.createProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.roles) === null || _a === void 0 ? void 0 : _a.includes(IUser_1.Roles.SELLER)))
        return (0, ResponseHandler_1.ErrorHandler)(res, "SELLER_AUTH", 403);
    if (!req.files)
        return (0, ResponseHandler_1.ErrorHandler)(res, "FILE_ERROR", 400);
    const { title, description, price, category, stock, address, beds, baths, mapping_location, size_of_land, specialOfferPrice, isSpecialOffer, offerStartDate, offerEndDate, } = req.body;
    // const mappingLocation = JSON.parse(mapping_location);
    // console.log(mappingLocation.lat, mappingLocation.lng);
    // if (!mappingLocation || !mappingLocation.lat || !mappingLocation.lng) {
    //   return ErrorHandler(res, "MAP_LOCATION", 400);
    // }
    const files = req.files;
    const imageFiles = files.image_of_land;
    const documentFiles = files.document_of_land;
    // if (!files.image_of_land || !files.document_of_land) return ErrorHandler(res, "Files are missing",400);
    // if (!files.image_of_land || !files.document_of_land) return ErrorHandler(res, "Files are missing",400);
    if (!files.coverImage)
        return (0, ResponseHandler_1.ErrorHandler)(res, "Files are missing", 400);
    if (!files.image_of_land ||
        files.image_of_land.length === 0 ||
        files.image_of_land.length > 5) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "You must upload between 1 and 5 images of the land", 400);
    }
    if (!documentFiles ||
        documentFiles.length === 0 ||
        documentFiles.length > 6) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "You must upload between 1 and 6 document files", 400);
    }
    const documentUploads = yield claudinary_1.default.uploadMultiplePdfFiles(documentFiles.map((file) => file.path));
    const documentUrls = documentUploads.map((upload) => upload.secure_url);
    const imageUploads = yield claudinary_1.default.uploadMultipleImages(files.image_of_land.map((file) => file.path));
    const coverImageUrl = files.coverImage ? yield claudinary_1.default.uploadSingleImage(files.coverImage[0].path) : null;
    const imageUrls = imageUploads.map((upload) => upload.secure_url);
    const newProduct = yield ProductRepository_1.default.create({
        title,
        description,
        price,
        category,
        seller: new mongoose_1.Types.ObjectId(req._id),
        stock,
        address,
        isSpecialOffer,
        specialOfferPrice,
        // mapping_location: mappingLocation,
        image_of_land: imageUrls,
        size_of_land,
        document_of_land: documentUrls,
        coverImage: (coverImageUrl === null || coverImageUrl === void 0 ? void 0 : coverImageUrl.secure_url) || '',
        beds,
        baths,
        offerStartDate,
        offerEndDate
        // document_of_land: documentUpload?.secure_url || "",
    });
    yield newProduct.save();
    return (0, ResponseHandler_1.ResponseHandler)(res, 201, "Product uploaded successfully", {
        product: newProduct,
    });
}));
exports.deleteProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const product = yield ProductRepository_1.default.findById(req.params.productId, "seller");
    if (!product)
        return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
    if (String(product.seller._id) !== String(req._id))
        return (0, ResponseHandler_1.ErrorHandler)(res, "UNAUTHORIZED", 403);
    yield ProductRepository_1.default.deleteById(productId);
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product deleted successfully");
}));
exports.updateProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield ProductRepository_1.default.findById(req.params.productId, "seller");
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
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Product updated successfully", {
        updatedProduct,
    });
}));
exports.updateProductImage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const product = yield ProductRepository_1.default.findById(req.params.productId, "seller image_of_land");
    if (!product)
        return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
    if (String(product.seller._id) !== String(req._id))
        return (0, ResponseHandler_1.ErrorHandler)(res, "Unauthorized", 403);
    //     if (!req.files || typeof req.files !== 'object' || !('image_of_land' in req?.files)) return ErrorHandler(res, "No image file uploaded",400);
    const files = req.files;
    if (!files || !files.image_of_land || files.image_of_land.length === 0) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "No image file(s) uploaded", 400);
    }
    const uploadedCount = files.image_of_land.length;
    const existingCount = ((_a = product.image_of_land) === null || _a === void 0 ? void 0 : _a.length) || 0;
    if (uploadedCount + existingCount > 5) {
        return (0, ResponseHandler_1.ErrorHandler)(res, `You can only have a maximum of 5 images. Currently: ${existingCount}`, 400);
    }
    const newUploads = yield claudinary_1.default.uploadMultipleImages(files.image_of_land.map((file) => file.path));
    const newImageUrls = newUploads.map((img) => img.secure_url);
    yield ProductRepository_1.default.updateById(req.params.productId, {
        image_of_land: [...product.image_of_land, ...newImageUrls],
    });
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Image(s) updated successfully");
}));
exports.deleteProductImage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const { imageUrl } = req.query;
    if (!imageUrl || typeof imageUrl !== "string") {
        return (0, ResponseHandler_1.ErrorHandler)(res, "Missing or invalid imageUrl", 400);
    }
    const product = yield ProductRepository_1.default.findById(productId, "seller image_of_land");
    if (!product)
        return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
    if (String(product.seller._id) !== String(req._id))
        return (0, ResponseHandler_1.ErrorHandler)(res, "Unauthorized", 403);
    if (!product.image_of_land.includes(imageUrl)) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "Image not found in product", 400);
    }
    if (product.image_of_land.length === 1) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "Cannot delete the only image. At least one image is required.", 400);
    }
    const publicId = claudinary_1.default.extractPublicId(imageUrl);
    if (!publicId)
        return (0, ResponseHandler_1.ErrorHandler)(res, "Failed to extract public ID", 500);
    yield claudinary_1.default.removeSingleImage(publicId);
    yield ProductRepository_1.default.updateById(productId, {
        $pull: { image_of_land: imageUrl },
    });
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Image deleted successfully");
}));
exports.updateProductDocument = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const product = yield ProductRepository_1.default.findById(req.params.productId, "seller document_of_land");
    if (!product)
        return (0, ResponseHandler_1.ErrorHandler)(res, "PRODUCT_NOT_FOUND", 404);
    if (String(product.seller._id) !== String(req._id))
        return (0, ResponseHandler_1.ErrorHandler)(res, "Unauthorized", 403);
    if (!req.files ||
        typeof req.files !== "object" ||
        !("document_of_land" in req.files))
        return (0, ResponseHandler_1.ErrorHandler)(res, "No document file uploaded", 400);
    const files = req.files;
    const newDocumentPath = (_b = (_a = files.document_of_land) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path;
    if (!newDocumentPath)
        return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_FILE", 400);
    const documentUpload = yield claudinary_1.default.uploadPdfFile(newDocumentPath);
    if (product.document_of_land)
        yield claudinary_1.default.removeMultipleImages(product.document_of_land);
    yield ProductRepository_1.default.updateById(req.params.productId, {
        document_of_land: documentUpload.secure_url,
    });
    return (0, ResponseHandler_1.ResponseHandler)(res, 204, "Document updated successfully");
}));
exports.allSellerProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield ProductRepository_1.default.getAll(undefined, {
        seller: req._id,
    });
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "All seller products retrieved successfully", { products });
}));
//?
exports.getSpecialOffers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield ProductRepository_1.default.getAll(undefined, { isSpecialOffer: true, stock: { $gt: 0 } }, [{ path: "seller", select: "walletAddress" }]);
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Special offers fetched", { products });
}));
exports.getBestDeals = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield ProductRepository_1.default.getAll(undefined, { isBestDeal: true, stock: { $gt: 0 } }, [{ path: "seller", select: "walletAddress" }]);
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Best deals fetched", { products });
}));
exports.getTopSelling = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield ProductRepository_1.default.getAll(undefined, { isTopSelling: true, stock: { $gt: 0 } }, [{ path: "seller", select: "walletAddress" }]);
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Top selling properties fetched", {
        products,
    });
}));
exports.getFilteredProducts = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, specialOfferPrice, isSpecialOffer, isBestDeal, isTopSelling, page = "1", limit = "10", } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const query = { stock: { $gt: 0 } };
    if (category)
        query.category = category;
    if (specialOfferPrice) {
        const price = Number(specialOfferPrice);
        if (!isNaN(price)) {
            query.specialOfferPrice = { $lte: price };
        }
    }
    if (isSpecialOffer !== undefined) {
        query.isSpecialOffer = isSpecialOffer === "true";
    }
    if (isBestDeal !== undefined) {
        query.isBestDeal = isBestDeal === "true";
    }
    if (isTopSelling !== undefined) {
        query.isTopSelling = isTopSelling === "true";
    }
    const products = yield ProductRepository_1.default.getAll(undefined, query, [{ path: "seller", select: "walletAddress" }], limitNumber, skip);
    const totalItems = yield ProductRepository_1.default.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNumber);
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Filtered products retrieved successfully", {
        products,
        pagination: { page: pageNumber, limit: limitNumber, totalPages, totalItems },
    });
}));
