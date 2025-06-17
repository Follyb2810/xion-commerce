import { Request, Response } from "express";
import AsyncHandler from "express-async-handler";
import { ResponseHandler } from "./../../common/exceptions/ResponseHandler";
import CategoryService from "./category.service";
import { cache } from "../../common/libs/cache";
import { CacheRequest } from "../../middleware/checkCache";

export const allCategory = AsyncHandler(
  async (req: CacheRequest, res: Response): Promise<void> => {
    const result = await CategoryService.allCategory();
    if (req.cacheKey && result) {
      // console.log(JSON.stringify(result, null, 2));
      const cacheData = JSON.parse(JSON.stringify(result));
      const success = cache.set(req.cacheKey, cacheData, 600);
      console.log(
        `Cache set for key ${req.cacheKey}:`,
        success ? "Success" : "Failed"
      );
    }

    ResponseHandler(res, 200, "All Available Category", result);
  }
);
