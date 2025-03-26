import { NextFunction, RequestHandler, Response } from "express";
import { IUser } from "../types/IUser";
import { AuthRequest } from "./auth";
import { Types } from "mongoose";
import { ErrorHandler } from "../utils/ResponseHandler";
import ProductRepository from "../repositories/ProductRepository";
import { ProductAuth } from "./CheckStock";
import CartRepository from "../repositories/CartRepository";

export const CheckCart: RequestHandler = async (
  req: ProductAuth, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userId = req._id;
    const { productId, quantity } = req.body;

    console.log(`CheckCart: Received productId=${productId}, quantity=${quantity}`);

    if (!Types.ObjectId.isValid(productId)) {
      console.error("CheckCart Error: INVALID_PRODUCT_ID");
      return ErrorHandler(res, "INVALID_PRODUCT_ID", 400);
    }

    console.log("CheckCart: Fetching cart from database...");
    let cart = await CartRepository.findByEntity({ user: new Types.ObjectId(userId) });

    if (!cart) {
      console.error("CheckCart Error: CART_NOT_FOUND");
      return ErrorHandler(res, "CART_NOT_FOUND", 404);
    }

    console.log(`CheckCart: Searching for product in cart with ${cart.items.length} items`);
    
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex === -1) {
      console.error("CheckCart Error: PRODUCT_NOT_IN_CART");
      return ErrorHandler(res, "PRODUCT_NOT_IN_CART", 404);
    }

    console.log("CheckCart: Product found in cart at index", itemIndex);

    const productItem = cart.items[itemIndex];

    if (quantity > productItem.quantity) {
      console.error("CheckCart Error: INVALID_QUANTITY - Requested:", quantity, "Available:", productItem.quantity);
      return ErrorHandler(res, "INVALID_QUANTITY", 400);
    }

    console.log("CheckCart: Passed all checks, moving to next middleware...");
    req.cart = cart;
    req.cartItemIndex = itemIndex;
    
    next();
  } catch (error) {
    console.error("CheckCart Unexpected Error:", error);
    return ErrorHandler(res, "SERVER_ERROR", 500);
  }
};
