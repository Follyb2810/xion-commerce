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
exports.allUser = exports.UserProfile = exports.removeUserRole = exports.verifyUser = exports.SingleUser = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const repository_1 = __importDefault(require("../repositories/repository"));
const IUser_1 = require("../types/IUser");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = __importDefault(require("../utils/jwt"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const IAuthResponse_1 = require("../types/IAuthResponse");
const ResponseHandler_1 = require("../utils/ResponseHandler");
const xion_wallet_1 = __importDefault(require("./../utils/wallet/xion_wallet"));
const authRepository = new repository_1.default(User_1.default);
exports.register = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return (0, ResponseHandler_1.ErrorHandler)(res, 'EMAIL_PASS_ERROR', 400);
    }
    const existingUser = yield authRepository.findByEntity({ email });
    if (existingUser) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "USER_EXIST", 400);
    }
    const hashedPassword = yield (0, bcrypt_1.hashPwd)(password);
    const userWallet = yield xion_wallet_1.default.generateAddressFromEmail(email);
    const newUser = yield authRepository.create({
        email,
        password: hashedPassword,
        walletAddress: userWallet.address,
        mnemonic: userWallet.mnemonic
    });
    newUser.refreshToken = crypto_1.default.randomBytes(40).toString("hex");
    if (!newUser.role.includes(IUser_1.Roles.SELLER)) {
        newUser.role.push(IUser_1.Roles.SELLER);
    }
    yield newUser.save();
    const accessToken = jwt_1.default.signToken({ id: newUser._id, roles: newUser.role });
    return (0, ResponseHandler_1.ResponseHandler)(res, 201, "User registered successfully", { accessToken, user: (0, IAuthResponse_1.UserResponse)(newUser) });
}));
exports.login = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "EMAIL_PASS_ERROR", 400);
    }
    const user = yield authRepository.findByEntity({ email });
    if (!user || !(yield (0, bcrypt_1.ComparePassword)(password, user.password))) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_CREDENTIALS", 401);
    }
    user.refreshToken = crypto_1.default.randomBytes(40).toString("hex");
    yield user.save();
    const accessToken = jwt_1.default.signToken({ id: user._id, roles: user.role });
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Login successful", { accessToken, user: (0, IAuthResponse_1.UserResponse)(user) });
}));
exports.SingleUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield authRepository.findById(id);
    if (!user) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOTFOUND", 404);
    }
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "User retrieved successfully", { user: (0, IAuthResponse_1.UserResponse)(user) });
}));
exports.verifyUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield authRepository.findById(id);
    if (!user) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOTFOUND", 404);
    }
    yield authRepository.updateOne({ _id: id }, { $addToSet: { role: IUser_1.Roles.SELLER } });
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "User successfully verified");
}));
exports.removeUserRole = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { role } = req.body;
    if (!Object.values(IUser_1.Roles).includes(role)) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "INVALID_ROLE", 400);
    }
    const user = yield authRepository.findById(id);
    if (!user) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOTFOUND", 404);
    }
    yield authRepository.updateOne({ _id: id }, { $pull: { role } });
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "Role removed successfully");
}));
exports.UserProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req._id;
    const user = yield authRepository.findById(id);
    if (!user) {
        return (0, ResponseHandler_1.ErrorHandler)(res, "USER_NOTFOUND", 404);
    }
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "User profile retrieved successfully", { user: (0, IAuthResponse_1.UserResponse)(user) });
}));
exports.allUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield authRepository.getAll();
    return (0, ResponseHandler_1.ResponseHandler)(res, 200, "All users retrieved successfully", { users: users.map(IAuthResponse_1.UserResponse) });
}));
