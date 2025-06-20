import { Request, Response } from "express";
import AsyncHandler from "express-async-handler";
import { UserResponse } from "./user.mapper";
import { AuthRequest } from "./../../middleware/auth";
import {
  ErrorHandler,
  ResponseHandler,
} from "./../../common/exceptions/ResponseHandler";
import UserService from "./user.service";
import { CacheRequest } from "../../middleware/checkCache";
import { cache } from "../../common/libs/cache";
import { Roles } from "../../common/types/IUser";

export const register = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      return ErrorHandler(res, "EMAIL_PASS_ERROR", 400);
    }

    try {
      const newUser = await UserService.registerUser(email, password);
      const accessToken = await UserService.generateAccessToken(
        newUser._id,
        newUser.role
      );

      return ResponseHandler(
        res,
        201,
        "User Successfull login or Register with wallet",
        {
          accessToken,
          user: UserResponse(newUser),
        }
      );
    } catch (error: any) {
      if (error.message === "USER_EXIST") {
        return ErrorHandler(res, "USER_EXIST", 400);
      }
      throw error;
    }
  }
);

export const login = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      return ErrorHandler(res, "EMAIL_PASS_ERROR", 400);
    }

    try {
      const user = await UserService.loginUser(email, password);
      const accessToken = await UserService.generateAccessToken(
        user._id,
        user.role
      );

      return ResponseHandler(res, 200, "Login successful", {
        accessToken,
        user: UserResponse(user),
      });
    } catch (error: any) {
      if (error.message === "INVALID_CREDENTIALS") {
        return ErrorHandler(res, "INVALID_CREDENTIALS", 401);
      }
      throw error;
    }
  }
);

export const SingleUser = AsyncHandler(
  async (req: CacheRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await UserService.getUserById(id);

    if (!user) {
      return ErrorHandler(res, "USER_NOTFOUND", 404);
    }
    if (req.cacheKey && user) {
      const cacheData = JSON.parse(JSON.stringify({ user }));
      const success = cache.set(req.cacheKey, cacheData, 600);
      console.log(
        `Cache set for key ${req.cacheKey}:`,
        success ? "Success" : "Failed"
      );
    }
    return ResponseHandler(res, 200, "User retrieved successfully", {
      user: UserResponse(user),
    });
  }
);

export const verifyUser = AsyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      await UserService.verifyUserAsSeller(id);
      return ResponseHandler(res, 200, "User successfully verified");
    } catch (error: any) {
      if (error.message === "USER_NOTFOUND") {
        return ErrorHandler(res, "USER_NOTFOUND", 404);
      }
      throw error;
    }
  }
);

export const updateUserRole = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { role, action } = req.body;

    try {
      if (!Object.values(Roles).includes(role)) {
        return ErrorHandler(res, "INVALID_ROLE", 400);
      }
      await UserService.updateUserRole(id, role, action);
      cache.keys().forEach((key) => {
        if (key.startsWith("user")) {
          cache.del(key);
        }
      });
      return ResponseHandler(res, 200, `Role ${action} successfully`);
    } catch (error: any) {
      if (error.message === "INVALID_ROLE") {
        return ErrorHandler(res, "INVALID_ROLE", 400);
      }
      if (error.message === "USER_NOTFOUND") {
        return ErrorHandler(res, "USER_NOTFOUND", 404);
      }
      throw error;
    }
  }
);

export const UserProfile = AsyncHandler(
  async (req: CacheRequest, res: Response): Promise<void> => {
    const id = req._id;
    const user = await UserService.getUserById(id!);

    if (!user) {
      return ErrorHandler(res, "USER_NOTFOUND", 404);
    }
    if (req.cacheKey && user) {
      const cacheData = JSON.parse(JSON.stringify({ user }));
      const success = cache.set(req.cacheKey, cacheData, 600);
      console.log(
        `Cache set for key ${req.cacheKey}:`,
        success ? "Success" : "Failed"
      );
    }
    return ResponseHandler(res, 200, "User profile retrieved successfully", {
      user: UserResponse(user),
    });
  }
);

export const allUser = AsyncHandler(
  async (req: CacheRequest, res: Response): Promise<void> => {
    const users = await UserService.getAllUsers();
    if (req.cacheKey && users) {
      const cacheData = JSON.parse(JSON.stringify({ users }));
      const success = cache.set(req.cacheKey, cacheData, 600);
      console.log(
        `Cache set for key ${req.cacheKey}:`,
        success ? "Success" : "Failed"
      );
    }
    return ResponseHandler(res, 200, "All users retrieved successfully", {
      users: users.map(UserResponse),
    });
  }
);

export const updateUserProfile = AsyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req._id;
    const { email, phoneNumber, name } = req.body;

    try {
      await UserService.updateUserProfile(id!, { email, phoneNumber, name });
      cache.keys().forEach((key) => {
        if (key.startsWith("user")) {
          cache.del(key);
        }
      });
      return ResponseHandler(res, 200, "User profile updated successfully");
    } catch (error: any) {
      if (error.message === "NO_DATA_PROVIDED") {
        return ErrorHandler(res, "NO_DATA_PROVIDED", 400);
      }
      if (error.message === "USER_NOTFOUND") {
        return ErrorHandler(res, "USER_NOTFOUND", 404);
      }
      if (error.message === "USER_EXIST") {
        return ErrorHandler(res, "USER_EXIST", 409);
      }
      throw error;
    }
  }
);

export const getCheckoutData = AsyncHandler(
  async (req: CacheRequest, res: Response) => {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      res.status(400).json({ message: "Wallet address is required" });
      return;
    }

    const user = await UserService.getUserByWalletAddress(walletAddress);
    if (req.cacheKey && user) {
      const cacheData = JSON.parse(JSON.stringify({ user }));
      const success = cache.set(req.cacheKey, cacheData, 600);
      console.log(
        `Cache set for key ${req.cacheKey}:`,
        success ? "Success" : "Failed"
      );
    }
    return ResponseHandler(res, 200, "User data retrieved successfully", {
      user,
    });
  }
);
