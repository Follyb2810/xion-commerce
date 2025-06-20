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
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
class CloudinaryService {
    static uploadSingleImage(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield cloudinary_1.v2.uploader.upload(filePath, {
                    resource_type: "auto",
                });
                fs_1.default.unlinkSync(filePath);
                console.log(`✅ Uploaded: ${result.secure_url}`);
                return result;
            }
            catch (error) {
                console.error("❌ Error uploading image:", error);
                throw error;
            }
        });
    }
    static uploadFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileSize = fs_1.default.statSync(filePath).size;
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (fileSize > maxSize) {
                    throw new Error("File size exceeds 10MB limit");
                }
                const isPdf = filePath.endsWith(".pdf");
                const resourceType = isPdf ? "raw" : "image";
                const result = yield cloudinary_1.v2.uploader.upload(filePath, {
                    resource_type: resourceType,
                });
                fs_1.default.unlinkSync(filePath);
                console.log(`✅ Uploaded: ${result.secure_url}`);
                return result;
            }
            catch (error) {
                console.error("❌ Error uploading file:", error);
                throw error;
            }
        });
    }
    static uploadPdfFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield cloudinary_1.v2.uploader.upload(filePath, {
                    resource_type: "auto",
                    format: "pdf",
                    folder: "documents",
                });
                fs_1.default.unlinkSync(filePath);
                console.log(`✅ Uploaded: ${result.secure_url}`);
                console.log({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                });
                return result;
            }
            catch (error) {
                console.error("❌ Error uploading file:", error);
                throw error;
            }
        });
    }
    static uploadMultiplePdfFiles(filePaths) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const uploads = yield Promise.all(filePaths.map((filePath) => __awaiter(this, void 0, void 0, function* () {
                    const fileSize = fs_1.default.statSync(filePath).size;
                    const maxSize = 10 * 1024 * 1024; // 10 MB
                    if (fileSize > maxSize) {
                        throw new Error(`File ${path_1.default.basename(filePath)} exceeds 10MB limit`);
                    }
                    const result = yield cloudinary_1.v2.uploader.upload(filePath, {
                        resource_type: "auto",
                        format: "pdf",
                        folder: "documents",
                    });
                    fs_1.default.unlinkSync(filePath);
                    return result;
                })));
                return uploads;
            }
            catch (error) {
                console.error("❌ Error uploading multiple PDFs:", error);
                throw error;
            }
        });
    }
    static uploadMultipleImages(filePaths) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const maxSize = 10 * 1024 * 1024;
                const uploads = [];
                for (const filePath of filePaths) {
                    const absolutePath = path_1.default.resolve(filePath);
                    if (!fs_1.default.existsSync(absolutePath)) {
                        console.warn(`⚠️ File not found: ${absolutePath}`);
                        continue;
                    }
                    let fileSize;
                    try {
                        fileSize = fs_1.default.statSync(absolutePath).size;
                    }
                    catch (err) {
                        if (err instanceof Error)
                            console.warn(`❌ Can't stat file ${absolutePath}:`, err.message);
                        continue;
                    }
                    if (fileSize > maxSize) {
                        console.warn(`❌ File too large: ${path_1.default.basename(absolutePath)}`);
                        continue;
                    }
                    const result = yield cloudinary_1.v2.uploader.upload(absolutePath, {
                        resource_type: "image",
                        // folder: "images",
                    });
                    fs_1.default.unlinkSync(absolutePath);
                    console.log(`✅ Uploaded: ${result.secure_url}`);
                    uploads.push(result);
                }
                return uploads;
            }
            catch (error) {
                console.error("❌ Error uploading multiple images:", error);
                throw error;
            }
        });
    }
    static removeSingleImage(publicId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield cloudinary_1.v2.uploader.destroy(publicId);
                return result;
            }
            catch (error) {
                console.error("❌ Error deleting image:", error);
                throw new Error("Internal Server Error (Cloudinary)");
            }
        });
    }
    static removeMultipleImages(publicIds) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield cloudinary_1.v2.api.delete_resources(publicIds);
                return result;
            }
            catch (error) {
                console.error("❌ Error deleting multiple images:", error);
                throw new Error("Internal Server Error (Cloudinary)");
            }
        });
    }
    static extractPublicId(imageUrl) {
        var _a;
        const parts = imageUrl.split("/");
        const fileName = (_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0];
        return parts.includes("upload") && fileName
            ? parts.slice(parts.indexOf("upload") + 1).join("/")
            : null;
    }
}
exports.default = CloudinaryService;
