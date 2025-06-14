import { NextFunction, Request, Response } from "express";
import { cache } from "../utils/cache";
import { AuthRequest } from "./auth";

type KeyGenerator = (req: Request) => string;

const checkCache =
  (keyGenerator?: KeyGenerator) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const key = keyGenerator ? keyGenerator(req) : req.originalUrl;
    const cachedData = cache.get(key);

    if (cachedData) {
      return res.status(200).json({ source: "cache", data: cachedData });
    }

    req.cacheKey = key;
    next();
  };

export default checkCache;

// router.get(
//   '/:productId',
//   checkCache((req) => `product:${req.params.productId}`),
//   getProductById
// );
// cache.del(key);
