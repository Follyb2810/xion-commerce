import { Request, Response } from "express";
import AsyncHandler from "express-async-handler";
import { AuthRequest } from "./../../middleware/auth";
import {
  ResponseHandler,
  ErrorHandler,
} from "./../../common/exceptions/ResponseHandler";
import { ProductAuth } from "./../../middleware/CheckStock";
import { formatProductResponse } from "./../../middleware/ProductResponse";
import OrderService from "./order.service";
import { CacheRequest } from "../../middleware/checkCache";
import { cache } from "../../common/libs/cache";

export const allOrder = AsyncHandler(
  async (req: CacheRequest, res: Response): Promise<void> => {
    try {
      const allOrders = await OrderService.getAllOrder();
      if (req.cacheKey && allOrders) {
        const cacheData = JSON.parse(JSON.stringify(allOrders));
        const success = cache.set(req.cacheKey, cacheData, 600);
        console.log(
          `Cache set for ${req.cacheKey}:`,
          success ? "✅ Success" : "❌ Failed"
        );
      }
      ResponseHandler(res, 200, "All orders", allOrders);
    } catch (error) {
      ErrorHandler(res, "FAILED_TO_FETCH_ORDERS", 500);
    }
  }
);

export const updateOrderStatus = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const updatedOrder = await OrderService.updateOrderStatus(
        orderId,
        status
      );
          cache.keys().forEach((key) => {
        if (key.startsWith(`user:order:${orderId}`)) {
          cache.del(key);
        }
      });
      ResponseHandler(res, 200, "Order status updated", updatedOrder);
    } catch (error: any) {
      if (error.message === "INVALID_STATUS") {
        return ErrorHandler(res, "INVALID_STATUS", 400);
      }
      if (error.message === "ORDER_NOT_FOUND") {
        return ErrorHandler(res, "ORDER_NOT_FOUND", 404);
      }

      ErrorHandler(res, "FAILED_TO_UPDATE_ORDER", 500);
    }
  }
);

export const getDirectPurchaseHistory = AsyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req._id!;
      const history = await OrderService.getDirectPurchaseHistory(userId);
      ResponseHandler(res, 200, "History of Purchase", history);
    } catch (error: any) {
      if (error.message === "USER_NOT_FOUND") {
        return ErrorHandler(res, "USER_NOT_FOUND", 404);
      }

      ErrorHandler(res, "FAILED_TO_FETCH_HISTORY", 500);
    }
  }
);

export const getUserOrder = AsyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req._id!;
      const orders = await OrderService.getUserOrders(userId);
      ResponseHandler(res, 200, "Purchase details retrieved", orders);
    } catch (error: any) {
      if (error.message === "ORDER_NOT_FOUND") {
        return ErrorHandler(res, "ORDER_NOT_FOUND", 404);
      }
      if (error.message === "UNAUTHORIZED") {
        return ErrorHandler(res, "UNAUTHORIZED", 403);
      }

      ErrorHandler(res, "FAILED_TO_FETCH_ORDERS", 500);
    }
  }
);

export const checkProductAvailability = AsyncHandler(
  async (req: ProductAuth, res: Response): Promise<void> => {
    const { quantity } = req.body;
    const { product, seller } = req;

    ResponseHandler(
      res,
      200,
      "Product available",
      formatProductResponse(product, seller!, quantity)
    );
  }
);

export const directPurchase = AsyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req._id!;
      const {
        productId,
        quantity = 1,
        transactionHash,
        email,
        fullName,
        phoneNumber,
        saveDetailsToProfile = false,
      } = req.body;

      const result = await OrderService.directPurchase({
        userId,
        productId,
        quantity,
        transactionHash,
        email,
        fullName,
        phoneNumber,
        saveDetailsToProfile,
      });

      cache.keys().forEach((key) => {
        if (key.startsWith(`user:order:${userId}`)) {
          cache.del(key);
        }
      });

      ResponseHandler(res, 201, "Purchase successful", result);
    } catch (error: any) {
      if (error.message === "INVALID_PRODUCT_ID") {
        return ErrorHandler(res, "INVALID_PRODUCT_ID", 400);
      }
      if (error.message === "TRANSACTION_HASH_REQUIRED") {
        return ErrorHandler(res, "TRANSACTION_HASH_REQUIRED", 400);
      }
      if (error.message === "PRODUCT_NOT_FOUND") {
        return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
      }
      if (error.message === "INSUFFICIENT_STOCK") {
        return ErrorHandler(res, "INSUFFICIENT_STOCK", 400);
      }
      if (error.message === "PURCHASE_FAILED") {
        return ErrorHandler(res, "PURCHASE_FAILED", 500);
      }

      ErrorHandler(res, "PURCHASE_FAILED", 500);
    }
  }
);

export const getUserPurchaseHistory = AsyncHandler(
  async (req: CacheRequest, res: Response): Promise<void> => {
    try {
      const userId = req._id!;
      const { status } = req.query;

      const orders = await OrderService.getUserPurchaseHistory(
        userId,
        status as string
      );
      if (req.cacheKey && orders) {
        const cacheData = JSON.parse(JSON.stringify(orders));
        const success = cache.set(req.cacheKey, cacheData, 600);
        console.log(
          `Cache set for ${req.cacheKey}:`,
          success ? "✅ Success" : "❌ Failed"
        );
      }
      ResponseHandler(res, 200, "User purchase history retrieved", orders);
    } catch (error) {
      ErrorHandler(res, "FAILED_TO_FETCH_PURCHASE_HISTORY", 500);
    }
  }
);
