import { Request, Response } from "express";
import AsyncHandler from "express-async-handler";
import { ResponseHandler } from "../utils/ResponseHandler";
import CategoryRepository from "../repositories/CartegoryRepository";
export const allCategory = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await CategoryRepository.getAll();
  ResponseHandler(res, 200, "All Available Category",result);
});