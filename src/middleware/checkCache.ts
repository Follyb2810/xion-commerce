import { NextFunction, Request, RequestHandler, Response } from "express";
import { cache } from "./../common/libs/cache";
import { AuthRequest } from "./auth";
import { ResponseHandler } from "../common/exceptions/ResponseHandler";

export interface CacheRequest extends AuthRequest {
  cacheKey?: string;
}

type KeyGenerator = (req: CacheRequest) => string;

const checkCache =
  (
    keyGenerator: KeyGenerator
  ): RequestHandler<any, any, any, any, CacheRequest> =>
  (req: CacheRequest, res: Response, next: NextFunction) => {
    // const baseKey = keyGenerator ? keyGenerator(req) : req.originalUrl;
    const baseKey = keyGenerator(req);

    console.log("Checking cache for key:", baseKey);
    const result = cache.get(baseKey);
    console.log("Cache result:", result ? "Hit" : "Miss");

    if (result) {
      console.log("Cache hit for:", baseKey);
      return ResponseHandler(res, 200, "Cache hit", result);
    }

    req.cacheKey = baseKey;
    console.log("Cache miss, proceeding to handler");
    console.log("Middleware key:", baseKey);
    console.log("Route handler key:", req.cacheKey);
    next();
  };

// export interface CacheRequest extends AuthRequest {
//   cacheKey?: string;
// }
// type KeyGenerator = (req: CacheRequest) => string;

// const checkCache =
//   (
//     keyGenerator?: KeyGenerator
//   ): RequestHandler<any, any, any, any, CacheRequest> =>
//   (req: CacheRequest, res: Response, next: NextFunction) => {
//     const baseKey = keyGenerator ? keyGenerator(req) : req.originalUrl;

//     console.log("Cache key:", baseKey);
//     const result = cache.get(baseKey);
//     console.log({ result });

//     if (result) {
//       console.log("Cache hit for:", baseKey);
//       return ResponseHandler(res, 200, "cache", result);
//     }

//     req.cacheKey = baseKey;
//     console.log("Cache miss, proceeding to handler");
//     next();
//   };
// const checkCache =
//   (
//     keyGenerator?: KeyGenerator
//   ): RequestHandler<any, any, any, any, CacheRequest> =>
//   (req: CacheRequest, res: Response, next: NextFunction) => {
//     console.log({ originalUrl: req.originalUrl });
//     const key = keyGenerator ? keyGenerator(req) : req.originalUrl;
//     console.log({ key });
//     const result = cache.get(key);
//     console.log({ result });
//     if (result) {
//       ResponseHandler(res, 200, "cache", result);
//       return;
//     }
//     console.log({ cacheKey: req.cacheKey }, "first");
//     // req.cacheKey = key;
//     // (req as CacheRequest).cacheKey = key;
//     req.cacheKey = key;
//     console.log({ cacheKey: req.cacheKey }, "second");
//     console.log("All cache keys:", cache.keys());

//     next();
//   };

export default checkCache;

// router.get(
//   '/:productId',
//   checkCache((req) => `product:${req.params.productId}`),
//   getProductById
// );
// cache.del(key);
