import { Request, Response } from "express";
import { IUser, Roles } from "../types/IUser";
import crypto from "crypto";
import { ComparePassword, hashPwd } from "../utils/bcrypt";
import JwtService from "../utils/jwt";
import AsyncHandler from "express-async-handler";
import { UserResponse } from "../types/IAuthResponse";
import { AuthRequest } from "../middleware/auth";
import { ErrorHandler, ResponseHandler } from "../utils/ResponseHandler";
import UserRepository from "../repositories/UserRepository";


export const register = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      return ErrorHandler(res, "EMAIL_PASS_ERROR", 400);
    }

    if (email.toLowerCase() === "superadmin@chaincart.com") {
      return ErrorHandler(res, "USER_EXIST", 403);
    }

    const existingUser = await UserRepository.findByEntity({ email });
    if (existingUser) {
      return ErrorHandler(res, "USER_EXIST", 400);
    }

    const hashedPassword = await hashPwd(password);
    const newUser = await UserRepository.create({
      email,
      password: hashedPassword,
    } as Partial<IUser>);

    newUser.refreshToken = crypto.randomBytes(40).toString("hex");

    if (!newUser.role.includes(Roles.SELLER)) {
      newUser.role.push(Roles.SELLER);
    }

    await newUser.save();

    const accessToken = JwtService.signToken({
      id: newUser._id,
      roles: newUser.role,
    });
    return ResponseHandler(res, 201, "User registered successfully", {
      accessToken,
      user: UserResponse(newUser),
    });
  }
);

export const login = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
      return ErrorHandler(res, "EMAIL_PASS_ERROR", 400);
    }

    const user = await UserRepository.findByEntity({ email });
    if (!user || !(await ComparePassword(password, user.password!))) {
      return ErrorHandler(res, "INVALID_CREDENTIALS", 401);
    }

    user.refreshToken = crypto.randomBytes(40).toString("hex");
    await user.save();

    const accessToken = JwtService.signToken({
      id: user._id,
      roles: user.role,
    });
    return ResponseHandler(res, 200, "Login successful", {
      accessToken,
      user: UserResponse(user),
    });
  }
);

export const SingleUser = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await UserRepository.findById(id);
    if (!user) {
      return ErrorHandler(res, "USER_NOTFOUND", 404);
    }
    return ResponseHandler(res, 200, "User retrieved successfully", {
      user: UserResponse(user),
    });
  }
);

export const verifyUser = AsyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await UserRepository.findById(id);
    if (!user) {
      return ErrorHandler(res, "USER_NOTFOUND", 404);
    }

    await UserRepository.updateOne(
      { _id: id },
      { $addToSet: { role: Roles.SELLER } }
    );
    return ResponseHandler(res, 200, "User successfully verified");
  }
);

export const removeUserRole = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { role } = req.body;
    console.log({role})
    console.log(Object.values(Roles))
    console.log(Object.values(Roles).includes(role))

    if (!Object.values(Roles).includes(role)) {
      return ErrorHandler(res, "INVALID_ROLE", 400);
    }

    const user = await UserRepository.findById(id);
    if (!user) {
      return ErrorHandler(res, "USER_NOTFOUND", 404);
    }

    await UserRepository.updateOne({ _id: id }, { $pull: { role } });
    return ResponseHandler(res, 200, "Role removed successfully");
  }
);

export const UserProfile = AsyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req._id;
    const user = await UserRepository.findById(id!);
    if (!user) {
      return ErrorHandler(res, "USER_NOTFOUND", 404);
    }
    return ResponseHandler(res, 200, "User profile retrieved successfully", {
      user: UserResponse(user),
    });
  }
);

export const allUser = AsyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const users = await UserRepository.getAll();
    return ResponseHandler(res, 200, "All users retrieved successfully", {
      users: users.map(UserResponse),
    });
  }
);
export const updateUserProfile = AsyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req._id;
    let { email, phoneNumber, name } = req.body;

    if (!email && !phoneNumber && !name) {
      return ErrorHandler(res, "NO_DATA_PROVIDED", 400);
    }

    const user = await UserRepository.findById(id!);
    if (!user) {
      return ErrorHandler(res, "USER_NOTFOUND", 404);
    }

    const normalizedEmail = email?.trim().toLowerCase();

    if (normalizedEmail && normalizedEmail !== user.email) {
      const emailTaken = await UserRepository.findByEntity({
        email: normalizedEmail,
      });

      const isEmailUsedByAnotherUser =
        emailTaken && emailTaken._id.toString() !== user._id.toString();

      if (isEmailUsedByAnotherUser) {
        return ErrorHandler(res, "USER_EXIST", 409);
      }
    }

    const updates: Partial<IUser> = {};

    if (normalizedEmail) updates.email = normalizedEmail;
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (name) {
      updates.profile = {
        ...user.profile,
        name,
      };
    }

     await UserRepository.updateById(id!, updates);

    return ResponseHandler(res, 200, "User profile updated successfully");
  }
);

export const getCheckoutData = AsyncHandler(async(req:AuthRequest,res:Response)=>{
   const { walletAddress } = req.params;

    if (!walletAddress) {
      res.status(400).json({ message: "Wallet address is required" });
      return;
    }
    const user = await UserRepository.findByEntity({walletAddress},'email phoneNumber profile.name')
    return ResponseHandler(res, 200, "All users retrieved successfully", {
      user
    });
    

})

