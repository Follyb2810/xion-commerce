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
exports.getCheckoutData = exports.updateUserProfile = exports.allUser = exports.UserProfile = exports.removeUserRole = exports.verifyUser = exports.SingleUser = exports.login = exports.register = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_mapper_1 = require("./user.mapper");
const ResponseHandler_1 = require("./../../utils/ResponseHandler");
const user_service_1 = __importDefault(require("./user.service"));
exports.register = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "EMAIL_PASS_ERROR", 400);
    }
    try {
        const newUser = yield user_service_1.default.registerUser(email, password);
        const accessToken = yield user_service_1.default.generateAccessToken(newUser._id, newUser.role);
        return (0, ResponseHandler_1.ResponseHandler)(res, 201, "User Successfull login or Register with wallet", {
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
exports.login = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "EMAIL_PASS_ERROR", 400);
    }
    try {
        const user = yield user_service_1.default.loginUser(email, password);
        const accessToken = yield user_service_1.default.generateAccessToken(user._id, user.role);
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Login successful", {
            accessToken,
            user: (0, user_mapper_1.UserResponse)(user),
        });
    }
    catch (error) {
        if (error.message === "INVALID_CREDENTIALS") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_CREDENTIALS", 401);
        }
        throw error;
    }
}));
exports.SingleUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield user_service_1.default.getUserById(id);
    if (!user) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOTFOUND", 404);
    }
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "User retrieved successfully", {
        user: (0, user_mapper_1.UserResponse)(user),
    });
}));
exports.verifyUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield user_service_1.default.verifyUserAsSeller(id);
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "User successfully verified");
    }
    catch (error) {
        if (error.message === "USER_NOTFOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOTFOUND", 404);
        }
        throw error;
    }
}));
exports.removeUserRole = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { role } = req.body;
    try {
        yield user_service_1.default.removeUserRole(id, role);
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Role removed successfully");
    }
    catch (error) {
        if (error.message === "INVALID_ROLE") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_ROLE", 400);
        }
        if (error.message === "USER_NOTFOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOTFOUND", 404);
        }
        throw error;
    }
}));
exports.UserProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req._id;
    const user = yield user_service_1.default.getUserById(id);
    if (!user) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOTFOUND", 404);
    }
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "User profile retrieved successfully", {
        user: (0, user_mapper_1.UserResponse)(user),
    });
}));
exports.allUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_service_1.default.getAllUsers();
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "All users retrieved successfully", {
        users: users.map(user_mapper_1.UserResponse),
    });
}));
exports.updateUserProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req._id;
    const { email, phoneNumber, name } = req.body;
    try {
        yield user_service_1.default.updateUserProfile(id, { email, phoneNumber, name });
        return (0, ResponseHandler_1.ResponseHandler)(res, 200, "User profile updated successfully");
    }
    catch (error) {
        if (error.message === "NO_DATA_PROVIDED") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "NO_DATA_PROVIDED", 400);
        }
        if (error.message === "USER_NOTFOUND") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOTFOUND", 404);
        }
        if (error.message === "USER_EXIST") {
            return (0, ResponseHandler_1.ErrorHandler)(res, "USER_EXIST", 409);
        }
        throw error;
    }
}));
exports.getCheckoutData = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletAddress } = req.params;
    if (!walletAddress) {
        res.status(400).json({ message: "Wallet address is required" });
        return;
    }
    const user = yield user_service_1.default.getUserByWalletAddress(walletAddress);
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "User data retrieved successfully", {
        user,
    });
}));
