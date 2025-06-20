import { Request, Response } from "express";
import DeployService from "./deploy.service";
import AsyncHandler from "express-async-handler";
import { AuthRequest } from "../../middleware/auth";
import {
  AppError,
  ErrorHandler,
  ResponseHandler,
} from "../../common/exceptions/ResponseHandler";
import { cache } from "../../common/libs/cache";
import orderService from "../order/order.service";

const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

export const first = async (req: Request, res: Response) => {};

export const deployEscrowContract = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { buyer, required_deposit, seller } = req.body;
    if (!buyer || !seller || !required_deposit) {
      return ErrorHandler(res, "FIELD_ERROR", 400);
    }

    try {
      const result = await retry(
        () => DeployService.deployEscrowContract({
          buyer,
          required_deposit,
          seller,
        }),
        3,
        1000
      );

      if (!result.success) {
        console.log(result.errorCode);
        ErrorHandler(res, result.errorCode as keyof typeof AppError, 400);
        return;
      }

      return ResponseHandler(res, 201, "Escrow deploy success", result.data);
    } catch (error) {
      const err = error as Error;

      const knownError = err.message as keyof typeof AppError;
      const statusCode = knownError === "DEPLOY_FAILED" ? 500 : 400;

      ErrorHandler(res, knownError, statusCode);
    }
  }
);

export const releaseOrRefund = AsyncHandler(
  async (req: Request, res: Response) => {
    const { contractAddress, action, status } = req.body;
    const { orderId } = req.params;
    if (!contractAddress || !action || !orderId || !status) {
      return ErrorHandler(res, "FIELD_ERROR", 400);
    }

    try {
      const release = await retry(
        () => DeployService.releaseOrRefund(action, contractAddress),
        3,
        1000
      );

      if (!release.success) {
        return ErrorHandler(res, "", 400);
      }

      const updatedOrder = await retry(
        () => orderService.updateOrderStatus(orderId as string, status),
        3,
        500
      );

      cache.keys().forEach((key) => {
        if (key.startsWith(`user:order:${orderId}`)) {
          cache.del(key);
        }
      });

      return ResponseHandler(res, 200, "Order status updated", updatedOrder);
    } catch (error: any) {
      if (error.message === "INVALID_STATUS") {
        return ErrorHandler(res, "INVALID_STATUS", 400);
      }
      if (error.message === "ORDER_NOT_FOUND") {
        return ErrorHandler(res, "ORDER_NOT_FOUND", 404);
      }

      return ErrorHandler(res, "FAILED_TO_UPDATE_ORDER", 500);
    }
  }
);