import { Request, Response } from "express";
import User from "../models/User";
import Repository from "../repositories/repository";
import AsyncHandler from "express-async-handler";
import JwtService from "../utils/jwt";
import crypto from "crypto";
import { AuthRequest } from "../middleware/auth";
import { Roles } from "../types/IUser";
import { UserResponse } from "../types/IAuthResponse";
import MongodbValidate from "../utils/MongodbValidate";
import { ResponseHandler } from "../utils/ResponseHandler";
import XionWallet from "../utils/wallet/xion_wallet";

const userRepository = new Repository(User);

export const authWallet = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        res.status(400).json({ message: "Wallet address is required" });
        return;
    }
    // if (!MongodbValidate.validateCosmosAddress(walletAddress)) {
    //     res.status(400).json({ message: "Invalide cosmos wallet address" });
    //     return;
    // }

    let user = await userRepository.findByEntity({ walletAddress });

    if (!user) {

        const userWallet =await XionWallet.generateNewWallet()
        user = await userRepository.create({ walletAddress,
            // walletAddress: userWallet.address,
            mnemonic: userWallet.mnemonic
        });
        user.refreshToken = crypto.randomBytes(40).toString("hex");
        if (!user.role.includes(Roles.SELLER)) {
        user.role.push(Roles.SELLER);
        await user.save();
    }
        await user.save();
    }

    const accessToken = JwtService.signToken({
        id: user._id,
        roles: user.role,
    });
    const result = UserResponse(user);
    ResponseHandler(res,200,'User Successfull login or Register',{ accessToken, result })
    
});

export const updateProfile = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { walletAddress, email, name, username, bio, avatar } = req.body;
    const userId = req._id; 
    

    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    
    const user = await userRepository.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    if (email && user.email) {
        res.status(400).json({ message: "You cannot change your email" });
        return;
    }


    if (walletAddress && walletAddress !== user.walletAddress) {
        const existingUser = await userRepository.findByEntity({ walletAddress });
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

    if (username) user.username = username;

    user.profile = user.profile || {};

    if (name) user.profile.name = name;
    if (bio) user.profile.bio = bio;
    if (avatar) user.profile.avatar = avatar;

    await user.save();
    const result = UserResponse(user);
    res.status(200).json({ message: "Profile updated successfully", result });
});


