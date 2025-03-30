import { Request, Response } from "express";
import User from "../models/User";
import Repository from "../repositories/repository";
import { IUser, Roles } from "../types/IUser";
import crypto from "crypto";
import { ComparePassword, hashPwd } from "../utils/bcrypt";
import JwtService from "../utils/jwt";
import AsyncHandler from "express-async-handler";
import { UserResponse } from "../types/IAuthResponse";
import { AuthRequest } from "../middleware/auth";
import { ErrorHandler, ResponseHandler } from "../utils/ResponseHandler";
import XionWallet from "./../utils/wallet/xion_wallet";

const authRepository = new Repository(User);

export const register = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        return ErrorHandler(res,'EMAIL_PASS_ERROR', 400);
    }

    const existingUser = await authRepository.findByEntity({ email });
    if (existingUser) {
        return ErrorHandler(res, "USER_EXIST",400);
    }

    const hashedPassword = await hashPwd(password);
    const userWallet =await XionWallet.generateAddressFromEmail(email)
    const newUser = await authRepository.create({
        email,
        password: hashedPassword,
        walletAddress: userWallet.address,
        mnemonic: userWallet.mnemonic
    } as Partial<IUser>);

    newUser.refreshToken = crypto.randomBytes(40).toString("hex");
    if(!newUser.role.includes(Roles.SELLER)){
        newUser.role.push(Roles.SELLER)
    }
    await newUser.save();

    const accessToken = JwtService.signToken({ id: newUser._id, roles: newUser.role });
    return ResponseHandler(res, 201, "User registered successfully", { accessToken, user: UserResponse(newUser) });
});

export const login = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        return ErrorHandler(res, "EMAIL_PASS_ERROR",400);
    }

    const user = await authRepository.findByEntity({ email });
    if (!user || !(await ComparePassword(password, user.password!))) {
        return ErrorHandler(res, "INVALID_CREDENTIALS",401);
    }

    user.refreshToken = crypto.randomBytes(40).toString("hex");
    await user.save();

    const accessToken = JwtService.signToken({ id: user._id, roles: user.role });
    return ResponseHandler(res, 200, "Login successful", { accessToken, user: UserResponse(user) });
});

export const SingleUser = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await authRepository.findById(id);
    if (!user) {
        return ErrorHandler(res,"USER_NOTFOUND", 404);
    }
    return ResponseHandler(res, 200, "User retrieved successfully", { user: UserResponse(user) });
});

export const verifyUser = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await authRepository.findById(id);
    if (!user) {
        return ErrorHandler(res, "USER_NOTFOUND",404);
    }

    await authRepository.updateOne({ _id: id }, { $addToSet: { role: Roles.SELLER } });
    return ResponseHandler(res, 200, "User successfully verified");
});

export const removeUserRole = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { role } = req.body;
    if (!Object.values(Roles).includes(role)) {
        return ErrorHandler(res,  "INVALID_ROLE",400);
    }

    const user = await authRepository.findById(id);
    if (!user) {
        return ErrorHandler(res, "USER_NOTFOUND",404);
    }

    await authRepository.updateOne({ _id: id }, { $pull: { role } });
    return ResponseHandler(res, 200, "Role removed successfully");
});

export const UserProfile = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req._id;
    const user = await authRepository.findById(id!);
    if (!user) {
        return ErrorHandler(res, "USER_NOTFOUND",404);
    }
    return ResponseHandler(res, 200, "User profile retrieved successfully", { user: UserResponse(user) });
});

export const allUser = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const users = await authRepository.getAll();
    return ResponseHandler(res, 200, "All users retrieved successfully", { users: users.map(UserResponse) });
});
