import { Request, Response } from "express";
import AsyncHandler from "express-async-handler";
import { AuthRequest } from "./../../middleware/auth";
import { ErrorHandler, ResponseHandler } from "./../../common/exceptions/ResponseHandler";
import { ProductAuth } from "./../../middleware/CheckStock";
import { formatProductResponse } from "./../../middleware/ProductResponse";
import CartService from "./cart.service";

export const addToCart = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req._id!;
  const { productId, quantity = 1 } = req.body;

  try {
    await CartService.addProductToCart(userId, productId, quantity);
    ResponseHandler(res, 200, "Cart Successfully Added");
  } catch (error: any) {
    switch (error.message) {
      case "NOT_FOUND":
        return ErrorHandler(res, "NOT_FOUND", 404);
      case "INVALID_QUANTITY":
        return ErrorHandler(res, "INVALID_QUANTITY", 400);
      case "INSUFFICIENT_STOCK":
        return ErrorHandler(res, "INSUFFICIENT_STOCK", 400);
      default:
        throw error;
    }
  }
});

export const getCart = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req._id!;
  
  const cart = await CartService.getUserCart(userId);
  ResponseHandler(res, 200, "User Cart", cart);
});

export const removeCart = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req._id!;
  const { productId, quantity = 1 } = req.body;
  
  try {
    const cart = await CartService.removeProductFromCart(userId, productId, quantity);
    ResponseHandler(res, 200, "Item removed from cart", cart);
  } catch (error: any) {
    switch (error.message) {
      case "FIELD_ERROR":
        return ErrorHandler(res, "FIELD_ERROR", 400);
      case "NOT_FOUND":
        return ErrorHandler(res, "NOT_FOUND", 404);
      case "UNAUTHORIZED":
        return ErrorHandler(res, "UNAUTHORIZED", 403);
      default:
        throw error;
    }
  }
});

export const deleteUserCart = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req._id!;
  const { cartId } = req.params;

  try {
    await CartService.deleteCart(userId, cartId);
    ResponseHandler(res, 200, "Cart deleted successfully");
  } catch (error: any) {
    switch (error.message) {
      case "NOT_FOUND":
        return ErrorHandler(res, "NOT_FOUND", 404);
      case "UNAUTHORIZED":
        return ErrorHandler(res, "UNAUTHORIZED", 403);
      default:
        throw error;
    }
  }
});

export const checkCartProductAvailable = AsyncHandler(async (req: ProductAuth, res: Response): Promise<void> => {
  const { quantity } = req.body;
  const { product, seller } = req;
  
  ResponseHandler(res, 200, "Product available", formatProductResponse(product, seller!, quantity));
});

export const checkout = AsyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req._id!;
  const { transactionHash } = req.body;

  try {
    const checkoutResult = await CartService.processCheckout(userId, transactionHash);
    ResponseHandler(res, 200, "Checkout successful", checkoutResult);
  } catch (error: any) {
    switch (error.message) {
      case "USER_NOT_FOUND":
        return ErrorHandler(res, "USER_NOT_FOUND", 400);
      case "EMPTY_CART":
        return ErrorHandler(res, "EMPTY_CART", 400);
      case "PRODUCT_NOT_FOUND":
        return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
      case "INSUFFICIENT_STOCK":
        return ErrorHandler(res, "INSUFFICIENT_STOCK", 400);
      case "CHECKOUT_FAILED":
        return ErrorHandler(res, "CHECKOUT_FAILED", 500);
      default:
        console.error("Unexpected checkout error:", error);
        return ErrorHandler(res, "INTERNAL_SERVER_ERROR", 500);
    }
  }
});