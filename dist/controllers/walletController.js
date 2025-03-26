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
exports.updateProfile = exports.authWallet = void 0;
const User_1 = __importDefault(require("../models/User"));
const repository_1 = __importDefault(require("../repositories/repository"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jwt_1 = __importDefault(require("../utils/jwt"));
const crypto_1 = __importDefault(require("crypto"));
const IUser_1 = require("../types/IUser");
const IAuthResponse_1 = require("../types/IAuthResponse");
const ResponseHandler_1 = require("../utils/ResponseHandler");
const userRepository = new repository_1.default(User_1.default);
exports.authWallet = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletAddress } = req.body;
    if (!walletAddress) {
        res.status(400).json({ message: "Wallet address is required" });
        return;
    }
    // if (!MongodbValidate.validateCosmosAddress(walletAddress)) {
    //     res.status(400).json({ message: "Invalide cosmos wallet address" });
    //     return;
    // }
    let user = yield userRepository.findByEntity({ walletAddress });
    if (!user) {
        user = yield userRepository.create({ walletAddress });
        user.refreshToken = crypto_1.default.randomBytes(40).toString("hex");
        if (!user.role.includes(IUser_1.Roles.SELLER)) {
            user.role.push(IUser_1.Roles.SELLER);
            yield user.save();
        }
        yield user.save();
    }
    const accessToken = jwt_1.default.signToken({
        id: user._id,
        roles: user.role,
    });
    const result = (0, IAuthResponse_1.UserResponse)(user);
    (0, ResponseHandler_1.ResponseHandler)(res, 200, 'User Successfull login or Register', { accessToken, result });
    // return;
    // res.status(200).json({ accessToken, result });
}));
exports.updateProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletAddress, email, name, username, bio, avatar } = req.body;
    const userId = req._id;
    console.log(userId);
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    // if (!MongodbValidate.validateCosmosAddress(walletAddress)) {
    //     res.status(400).json({ message: "Invalide cosmos wallet address" });
    //     return;
    // }
    const user = yield userRepository.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    if (email && user.email) {
        res.status(400).json({ message: "You cannot change your email" });
        return;
    }
    if (walletAddress && walletAddress !== user.walletAddress) {
        const existingUser = yield userRepository.findByEntity({ walletAddress });
        if (existingUser) {
            res.status(400).json({ message: "Wallet address is already in use" });
            return;
        }
        if (!user.email) {
            res.status(400).json({ message: "You must add an email before changing your wallet address" });
            return;
        }
        user.walletAddress = walletAddress;
    }
    if (username)
        user.username = username;
    user.profile = user.profile || {};
    if (name)
        user.profile.name = name;
    if (bio)
        user.profile.bio = bio;
    if (avatar)
        user.profile.avatar = avatar;
    yield user.save();
    const result = (0, IAuthResponse_1.UserResponse)(user);
    res.status(200).json({ message: "Profile updated successfully", result });
}));
