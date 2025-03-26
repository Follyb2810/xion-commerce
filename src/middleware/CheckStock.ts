import { NextFunction, RequestHandler, Response } from "express";
import { IUser } from "../types/IUser";
import { AuthRequest } from "./auth";
import { Types } from "mongoose";
import { ErrorHandler } from "../utils/ResponseHandler";
import ProductRepository from "../repositories/ProductRepository";

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

    console.log(`✅ CheckStock: Received productId=${productId}, quantity=${quantity}`);

    if (!Types.ObjectId.isValid(productId)) {
      console.error("❌ CheckStock Error: INVALID_PRODUCT_ID");
      return ErrorHandler(res, "INVALID_PRODUCT_ID", 400);
    }

    if (quantity <= 0) {
      console.error("❌ CheckStock Error: INVALID_QUANTITY");
      return ErrorHandler(res, "INVALID_QUANTITY", 400);
    }

    console.log("✅ CheckStock: Fetching product from database...");
    const product = await ProductRepository.findById(productId, [
      { path: "seller", select: "walletAddress" },
    ]);

    if (!product) {
      console.error("❌ CheckStock Error: PRODUCT_NOT_FOUND");
      return ErrorHandler(res, "PRODUCT_NOT_FOUND", 404);
    }

    console.log(`✅ CheckStock: Product found with stock=${product.stock}, requested=${quantity}`);

    if (product.stock < quantity) {
      console.error(`❌ CheckStock Error: INSUFFICIENT_STOCK (Stock=${product.stock}, Requested=${quantity})`);
      return ErrorHandler(res, "INSUFFICIENT_STOCK", 400);
    }

    console.log("✅ CheckStock: Stock is sufficient. Proceeding...");
    req.product = product;
    req.seller = product.seller as IUser;

    next();
  } catch (error) {
    console.error("❌ CheckStock Unexpected Error:", error);
    return ErrorHandler(res, "SERVER_ERROR", 500);
  }
};


