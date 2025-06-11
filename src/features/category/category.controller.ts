import { Request, Response } from "express";
import AsyncHandler from "express-async-handler";
import { ResponseHandler } from "./../../common/exceptions/ResponseHandler";
import CategoryService from "./category.service";


export const allCategory = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await CategoryService.allCategory();
  ResponseHandler(res, 200, "All Available Category",result);
});