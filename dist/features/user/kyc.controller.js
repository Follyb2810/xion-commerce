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
exports.getKycStatus = exports.verifyKYC = exports.uploadKycDocuments = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ResponseHandler_1 = require("./../../utils/ResponseHandler");
const user_repository_1 = __importDefault(require("./user.repository"));
const claudinary_1 = __importDefault(require("./../../utils/claudinary"));
const IUser_1 = require("./../../common/types/IUser");
const user_mapper_1 = require("./user.mapper");
exports.uploadKycDocuments = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const { documentType } = req.body;
    if (!userId)
        return (0, ResponseHandler_1.ErrorHandler)(res, "UNAUTHORIZED", 401);
    if (!req.file)
        return (0, ResponseHandler_1.ErrorHandler)(res, "FILE_ERROR", 400);
    const user = yield user_repository_1.default.findById(userId);
    if (!user)
        return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOTFOUND", 404);
    const kycDoc = req.file;
    const uploadKyc = yield claudinary_1.default.uploadPdfFile(kycDoc.path);
    if (!(uploadKyc === null || uploadKyc === void 0 ? void 0 : uploadKyc.secure_url))
        return (0, ResponseHandler_1.ErrorHandler)(res, "Cloud upload failed", 500);
    if (!user.kyc) {
        user.kyc = {
            status: IUser_1.KYCStatus.NOT_SUBMITTED,
            documents: [],
        };
    }
    user.kyc.documents = [
        {
            type: documentType,
            url: uploadKyc.secure_url,
            uploadedAt: new Date(),
        },
    ];
    user.kyc.submittedAt = new Date();
    user.kyc.status = IUser_1.KYCStatus.PENDING;
    //Todo just give seller role for now becuase i have no verification to use now
    if (!user.role.includes(IUser_1.Roles.SELLER)) {
        user.role.push(IUser_1.Roles.SELLER);
    }
    user.isVerified = true;
    yield user.save();
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "KYC document uploaded successfully", {
        user: (0, user_mapper_1.UserResponse)(user),
    });
}));
exports.verifyKYC = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req._id;
    const { status, rejectedReason } = req.body;
    if (!userId)
        return (0, ResponseHandler_1.ErrorHandler)(res, "UNAUTHORIZED", 401);
    const normalizedStatus = typeof status === "string" ? status.toLowerCase() : "";
    if (!Object.values(IUser_1.KYCStatus).includes(normalizedStatus)) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "Invalid KYC status", 400);
    }
    const user = yield user_repository_1.default.findById(userId);
    if (!user)
        return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOTFOUND", 404);
    if (!user.kyc) {
        user.kyc = {
            status: IUser_1.KYCStatus.NOT_SUBMITTED,
            documents: [],
        };
    }
    user.kyc.status = normalizedStatus;
    if (normalizedStatus === IUser_1.KYCStatus.APPROVED) {
        user.kyc.verifiedAt = new Date();
        user.kyc.rejectedReason = undefined;
    }
    else if (normalizedStatus === IUser_1.KYCStatus.REJECTED) {
        user.kyc.verifiedAt = undefined;
        user.kyc.rejectedReason = rejectedReason || "No reason provided";
        user.isVerified = false;
    }
    yield user.save();
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "KYC status updated successfully", {
        kycStatus: user.kyc.status,
    });
}));
exports.getKycStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const userId = req._id;
    if (!userId)
        return (0, ResponseHandler_1.ErrorHandler)(res, "UNAUTHORIZED", 401);
    const user = yield user_repository_1.default.findById(userId, 'kyc');
    if (!user)
        return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOTFOUND", 404);
    (0, ResponseHandler_1.ResponseHandler)(res, 200, "KYC status retrieved", {
        status: ((_a = user.kyc) === null || _a === void 0 ? void 0 : _a.status) || "not_submitted",
        documents: ((_b = user.kyc) === null || _b === void 0 ? void 0 : _b.documents) || [],
        rejectedReason: (_c = user.kyc) === null || _c === void 0 ? void 0 : _c.rejectedReason,
    });
}));
