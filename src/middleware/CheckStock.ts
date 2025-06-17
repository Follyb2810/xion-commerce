import { NextFunction, RequestHandler, Response } from "express";
import { IUser } from "../common/types/IUser";
import { AuthRequest } from "./auth";
import { Types } from "mongoose";
import { ErrorHandler } from "./../common/exceptions/ResponseHandler";
import ProductRepository from "./../features/product/product.repository";

export interface ProductAuth extends AuthRequest {
  product?: any;
  seller?: IUser;
  cart?: any;
  cartItemIndex?: number;
}

export const CheckStock: RequestHandler = async (
  req: ProductAuth,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, quantity } = req.body;

    console.log(
      `✅ CheckStock: Received productId=${productId}, quantity=${quantity}`
    );

    if (!Types.ObjectId.isValid(productId)) {
      return ErrorHandler(res, "INVALID_PRODUCT_ID", 400);
    }

    if (quantity <= 0) {
      return ErrorHandler(res, "INVALID_QUANTITY", 400);
    }
    const product = await ProductRepository.findById(productId, [
      { path: "seller", select: "walletAddress" },
    ]);

    if (!product) {
      return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
    }

    if (product.stock < quantity) {
      return ErrorHandler(res, "INSUFFICIENT_STOCK", 400);
    }
    req.product = product;
    req.seller = product.seller as IUser;

    next();
  } catch (error) {
    return ErrorHandler(res, "SERVER_ERROR", 500);
  }
};
