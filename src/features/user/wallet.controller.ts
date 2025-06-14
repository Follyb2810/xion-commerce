import UserService from "./user.service";
import { Request, Response } from "express";
import AsyncHandler from "express-async-handler";
import { UserResponse } from "./user.mapper";
import { AuthRequest } from "./../../middleware/auth";
import { ErrorHandler, ResponseHandler } from "./../../utils/ResponseHandler";
import {
  ErrorKey,
  ErrorKeyOf,
  IApiError,
} from "../../common/exceptions/ResponseHandler";

export const authWallet = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      res.status(400).json({ message: "Wallet address is required" });
      return;
    }

    try {
      const newUser = await UserService.authWallet(walletAddress);

      const accessToken = await UserService.generateAccessToken(
        newUser._id,
        newUser.role
      );
      const result = UserResponse(newUser);
      ResponseHandler(res, 200, "User Successfull login or Register", {
        accessToken,
        user: result,
      });
      // return ResponseHandler(res, 201, "User registered successfully", {
      //   accessToken,
      //   user: UserResponse(newUser),
      // });
    } catch (error: any) {
      if (error.message === "USER_EXIST") {
        return ErrorHandler(res, "USER_EXIST", 400);
      }
      throw error;
    }
  }
);

export const authUpdateWallet = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      const { walletAddress, email, name, username, bio, avatar } = req.body;
      const userId = req._id;

      if (!userId) {
        return ErrorHandler(res, "Unauthorized", 401);
      }

      const updatedUser = await UserService.updateProfileWithWallet({
        walletAddress,
        email,
        name,
        userId,
        username,
        bio,
        avatar,
      });

      return ResponseHandler(
        res,
        200,
        "Profile updated successfully",
        updatedUser
      );
    } catch (error: any) {
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
      let errorKey: ErrorKey = "SERVER_ERROR";
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

      return ErrorHandler(res, errorKey, statusCode);
    }
  }
);
