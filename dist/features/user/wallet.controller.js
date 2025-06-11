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
exports.authUpdateWallet = exports.authWallet = void 0;
const user_service_1 = __importDefault(require("./user.service"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_mapper_1 = require("./user.mapper");
const ResponseHandler_1 = require("./../../utils/ResponseHandler");
exports.authWallet = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletAddress } = req.body;
    if (!walletAddress) {
        res.status(400).json({ message: "Wallet address is required" });
        return;
    }
    try {
        const newUser = yield user_service_1.default.authWallet(walletAddress);
        const accessToken = yield user_service_1.default.generateAccessToken(newUser._id, newUser.role);
        return (0, ResponseHandler_1.ResponseHandler)(res, 201, "User registered successfully", {
            accessToken,
            user: (0, user_mapper_1.UserResponse)(newUser),
        });
    }
    catch (error) {
        if (error.message === "USER_EXIST") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "USER_EXIST", 400);
        }
        throw error;
    }
}));
exports.authUpdateWallet = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddress, email, name, username, bio, avatar } = req.body;
        const userId = req._id;
        if (!userId) {
            return (0, ResponseHandler_1.ErrorHandler)(res, "Unauthorized", 401);
        }
        const updatedUser = yield user_service_1.default.updateProfileWithWallet({
            walletAddress,
            email,
            name,
            userId,
            username,
            bio,
            avatar,
        });
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Profile updated successfully", updatedUser);
    }
    catch (error) {
        //   const errorType = error.message as ErrorKeyOf
        // console.error("Update profile error:", error);
        // switch (error.message) {
        //   case "Unauthorized":
        //     return ErrorHandler(res, "Unauthorized", 401);
        //   case "User not found":
        //     return ErrorHandler(res, "User not found", 404);
        //   case "You cannot change your email":
        //     return ErrorHandler(res, "Email cannot be changed", 400);
        //   case "Wallet address is already in use":
        //     return ErrorHandler(res, "Wallet address already in use", 409);
        //   case "You must add an email before changing your wallet address":
        //     return ErrorHandler(res, "Add email before changing wallet", 400);
        //   default:
        //     return ErrorHandler(res, "Failed to update profile", 500);
        // }
        let errorKey = "SERVER_ERROR";
        let statusCode = 500;
        if (error instanceof Error) {
            switch (error.message) {
                case "User not found":
                    errorKey = "USER_NOT_FOUND";
                    statusCode = 404;
                    break;
                case "Invalid credentials":
                    errorKey = "INVALID_CREDENTIALS";
                    statusCode = 401;
                    break;
                case "Email already in use":
                    errorKey = "EMAIL_IN_USE";
                    statusCode = 400;
                    break;
                case "Unauthorized":
                    errorKey = "UNAUTHORIZED";
                    statusCode = 403;
                    break;
                default:
                    errorKey = "SERVER_ERROR";
                    statusCode = 500;
                    break;
            }
        }
        return (0, ResponseHandler_1.ErrorHandler)(res, errorKey, statusCode);
    }
}));
