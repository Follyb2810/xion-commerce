import { NextFunction, Response } from "express";
import { CacheRequest } from "./checkCache";
import { generateProductsCacheKey } from "../features/product/utils/generateProductsCacheKey";
import { cache } from "../common/libs/cache";
import { ResponseHandler } from "../common/exceptions/ResponseHandler";

export const checkProductsCache = (req: CacheRequest, res: Response, next: NextFunction) => {
  const cacheKey = generateProductsCacheKey(req);
  req.cacheKey = cacheKey; 

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for ${cacheKey}`);
    return ResponseHandler(res, 200, "Products from cache", cachedData);
  }

  console.log(`Cache miss for ${cacheKey}, proceeding...`);
  next();
};