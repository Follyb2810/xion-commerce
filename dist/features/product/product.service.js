"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const product_repository_1 = __importDefault(require("./product.repository"));
const claudinary_1 = __importDefault(require("./../../common/libs/claudinary"));
class ProductService {
    getAllProducts(queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { category, specialOfferPrice, isSpecialOffer, isBestDeal, isTopSelling, page = "1", limit = "10", } = queryParams;
            const pageNumber = Number(page);
            const limitNumber = Number(limit);
            const skip = (pageNumber - 1) * limitNumber;
            const query = { stock: { $gt: 0 } };
            if (category) {
                const rawCategory = typeof category === "string"
                    ? category
                    : Array.isArray(category)
                        ? category[0]
                        : "";
                if (!mongoose_1.default.Types.ObjectId.isValid(rawCategory)) {
                    throw new Error("INVALID_CATEGORY_ID");
                }
                query.category = rawCategory;
            }
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
            const products = yield product_repository_1.default.getAll(undefined, query, [
                { path: "seller", select: "walletAddress" },
                { path: "category", select: "name _id" },
            ], limitNumber, skip);
            const totalItems = yield product_repository_1.default.countDocuments(query);
            const totalPages = Math.ceil(totalItems / limitNumber);
            return {
                products,
                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages,
                    totalItems,
                },
            };
        });
    }
    getProductById(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield product_repository_1.default.findById(productId, [
                { path: "seller", select: "walletAddress" },
            ]);
            if (!product) {
                throw new Error("PRODUCT_NOT_FOUND");
            }
            return product;
        });
    }
    createProduct(productData, files) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sellerId, category } = productData, 
            // mapping_location
            rest = __rest(productData, ["sellerId", "category"]);
            if (!files.coverImage) {
                throw new Error("COVER_IMAGE_REQUIRED");
            }
            if (!files.image_of_land ||
                files.image_of_land.length === 0 ||
                files.image_of_land.length > 5) {
                throw new Error("INVALID_IMAGE_COUNT");
            }
            if (!files.document_of_land ||
                files.document_of_land.length === 0 ||
                files.document_of_land.length > 6) {
                throw new Error("INVALID_DOCUMENT_COUNT");
            }
            // const mappingLocation = JSON.parse(mapping_location);
            // console.log(mappingLocation.lat, mappingLocation.lng);
            // if (!mappingLocation || !mappingLocation.lat || !mappingLocation.lng) {
            //   return ErrorHandler(res, "MAP_LOCATION", 400);
            // }
            // Upload documents
            const documentUploads = yield claudinary_1.default.uploadMultiplePdfFiles(files.document_of_land.map((file) => file.path));
            const documentUrls = documentUploads.map((upload) => upload.secure_url);
            const imageUploads = yield claudinary_1.default.uploadMultipleImages(files.image_of_land.map((file) => file.path));
            const imageUrls = imageUploads.map((upload) => upload.secure_url);
            const coverImageUrl = yield claudinary_1.default.uploadSingleImage(files.coverImage[0].path);
            const newProduct = yield product_repository_1.default.create(Object.assign(Object.assign({}, rest), { 
                // mapping_location: mappingLocation,
                seller: new mongoose_1.Types.ObjectId(sellerId), category: new mongoose_1.Types.ObjectId(sellerId), image_of_land: imageUrls, document_of_land: documentUrls, coverImage: coverImageUrl.secure_url }));
            yield newProduct.save();
            return newProduct;
        });
    }
    deleteProduct(productId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield product_repository_1.default.findById(productId, "seller");
            if (!product) {
                throw new Error("PRODUCT_NOT_FOUND");
            }
            if (String(product.seller._id) !== String(userId)) {
                throw new Error("UNAUTHORIZED");
            }
            yield product_repository_1.default.deleteById(productId);
            return true;
        });
    }
    updateProduct(productId, userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield product_repository_1.default.findById(productId, "seller");
            if (!product) {
                throw new Error("PRODUCT_NOT_FOUND");
            }
            if (String(product.seller._id) !== String(userId)) {
                throw new Error("UNAUTHORIZED");
            }
            if (updateData.mapping_location) {
                let mappingLocation;
                if (typeof updateData.mapping_location === "object") {
                    mappingLocation = updateData.mapping_location;
                }
                else {
                    mappingLocation = JSON.parse(updateData.mapping_location);
                }
                if (!mappingLocation.lat || !mappingLocation.lng) {
                    throw new Error("INVALID_MAP_LOCATION");
                }
                updateData.mapping_location = mappingLocation;
            }
            const updatedProduct = yield product_repository_1.default.updateById(productId, updateData);
            return updatedProduct;
        });
    }
    updateProductImage(productId, userId, files) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const product = yield product_repository_1.default.findById(productId, "seller image_of_land");
            if (!product) {
                throw new Error("PRODUCT_NOT_FOUND");
            }
            if (String(product.seller._id) !== String(userId)) {
                throw new Error("UNAUTHORIZED");
            }
            if (!files || files.length === 0) {
                throw new Error("NO_IMAGE_FILES");
            }
            const uploadedCount = files.length;
            const existingCount = ((_a = product.image_of_land) === null || _a === void 0 ? void 0 : _a.length) || 0;
            if (uploadedCount + existingCount > 5) {
                throw new Error("IMAGE_LIMIT_EXCEEDED");
            }
            const newUploads = yield claudinary_1.default.uploadMultipleImages(files.map((file) => file.path));
            const newImageUrls = newUploads.map((img) => img.secure_url);
            yield product_repository_1.default.updateById(productId, {
                image_of_land: [...product.image_of_land, ...newImageUrls],
            });
            return true;
        });
    }
    deleteProductImage(productId, userId, imageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!imageUrl) {
                throw new Error("IMAGE_URL_REQUIRED");
            }
            const product = yield product_repository_1.default.findById(productId, "seller image_of_land");
            if (!product) {
                throw new Error("PRODUCT_NOT_FOUND");
            }
            if (String(product.seller._id) !== String(userId)) {
                throw new Error("UNAUTHORIZED");
            }
            if (!product.image_of_land.includes(imageUrl)) {
                throw new Error("IMAGE_NOT_FOUND");
            }
            if (product.image_of_land.length === 1) {
                throw new Error("CANNOT_DELETE_ONLY_IMAGE");
            }
            const publicId = claudinary_1.default.extractPublicId(imageUrl);
            if (!publicId) {
                throw new Error("FAILED_TO_EXTRACT_PUBLIC_ID");
            }
            yield claudinary_1.default.removeSingleImage(publicId);
            yield product_repository_1.default.updateById(productId, {
                $pull: { image_of_land: imageUrl },
            });
            return true;
        });
    }
    updateProductDocument(productId, userId, documentFile) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield product_repository_1.default.findById(productId, "seller document_of_land");
            if (!product) {
                throw new Error("PRODUCT_NOT_FOUND");
            }
            if (String(product.seller._id) !== String(userId)) {
                throw new Error("UNAUTHORIZED");
            }
            if (!documentFile) {
                throw new Error("NO_DOCUMENT_FILE");
            }
            const documentUpload = yield claudinary_1.default.uploadPdfFile(documentFile.path);
            if (product.document_of_land) {
                yield claudinary_1.default.removeMultipleImages(product.document_of_land);
            }
            yield product_repository_1.default.updateById(productId, {
                document_of_land: documentUpload.secure_url,
            });
            return true;
        });
    }
    getSellerProducts(sellerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield product_repository_1.default.getAll(undefined, {
                seller: sellerId,
            });
            return products;
        });
    }
    getSpecialOffers() {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield product_repository_1.default.getAll(undefined, { isSpecialOffer: true, stock: { $gt: 0 } }, [{ path: "seller", select: "walletAddress" }]);
            return products;
        });
    }
    getBestDeals() {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield product_repository_1.default.getAll(undefined, { isBestDeal: true, stock: { $gt: 0 } }, [{ path: "seller", select: "walletAddress" }]);
            return products;
        });
    }
    getTopSelling() {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield product_repository_1.default.getAll(undefined, { isTopSelling: true, stock: { $gt: 0 } }, [{ path: "seller", select: "walletAddress" }]);
            return products;
        });
    }
    getProductsByCategory(categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
                throw new Error("INVALID_CATEGORY_ID");
            }
            const products = yield product_repository_1.default.getAll(undefined, {
                category: new mongoose_1.default.Types.ObjectId(categoryId),
                isActive: true,
                stock: { $gt: 0 },
            }, "category");
            return products;
        });
    }
}
exports.default = new ProductService();
