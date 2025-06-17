import { NextFunction, RequestHandler, Response } from "express";
import { IUser } from "./../common/types/IUser";
import { AuthRequest } from "./auth";
import { Types } from "mongoose";
import { ErrorHandler } from "./../common/exceptions/ResponseHandler";
import ProductRepository from "./../features/product/product.repository";
import { ProductAuth } from "./CheckStock";
import CartRepository from "./../features/cart/cart.repository";

export const CheckCart: RequestHandler = async (
  req: ProductAuth,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req._id;
    const { productId, quantity } = req.body;

    if (!Types.ObjectId.isValid(productId)) {
      return ErrorHandler(res, "INVALID_PRODUCT_ID", 400);
    }

    let cart = await CartRepository.findByEntity({
      user: new Types.ObjectId(userId),
    });

    if (!cart) {
      return ErrorHandler(res, "CART_NOT_FOUND", 404);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return ErrorHandler(res, "PRODUCT_NOT_IN_CART", 404);
    }

    const productItem = cart.items[itemIndex];

    if (quantity > productItem.quantity) {
      return ErrorHandler(res, "INVALID_QUANTITY", 400);
    }

    req.cart = cart;
    req.cartItemIndex = itemIndex;

    next();
  } catch (error) {
    return ErrorHandler(res, "SERVER_ERROR", 500);
  }
};
