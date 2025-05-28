"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
class MulterService {
    static uploadSingle(fieldName) {
        return (0, multer_1.default)({ storage: this.storage, fileFilter: this.fileFilter }).single(fieldName);
    }
    static uploadMultiple(fieldName, maxCount) {
        return (0, multer_1.default)({ storage: this.storage, fileFilter: this.fileFilter }).array(fieldName, maxCount);
    }
    static uploadProductFiles() {
        return (0, multer_1.default)({
            storage: this.storage,
            fileFilter: this.fileFilter,
        }).fields([
            { name: "image_of_land", maxCount: 4 },
            { name: "document_of_land", maxCount: 5 },
            { name: "coverImage", maxCount: 1 },
            { name: "kycDocuments", maxCount: 1 },
        ]);
    }
}
MulterService.storage = multer_1.default.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path_1.default.extname(file.originalname));
    },
});
MulterService.fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
        console.log('filer of file succesfull');
    }
    else {
        cb(new Error("Invalid file type. Only JPEG, PNG, JPG, and PDF are allowed."));
    }
};
exports.default = MulterService;
// const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 9 }])
