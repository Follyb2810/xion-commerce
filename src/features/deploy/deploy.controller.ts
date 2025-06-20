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

export const first = async (req: Request, res: Response) => {};

export const deployEscrowContract = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { buyer, required_deposit, seller } = req.body;
    if (!buyer || !seller || !required_deposit) {
      return ErrorHandler(res, "FIELD_ERROR", 400);
    }

    try {
      const result = await DeployService.deployEscrowContract({
        buyer,
        required_deposit,
        seller,
      });

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
      const release = await DeployService.releaseOrRefund(
        action,
        contractAddress
      );

      if (!release.success) {
        return ErrorHandler(res, "", 400);
      }

      const updatedOrder = await orderService.updateOrderStatus(
        orderId as string,
        status
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
