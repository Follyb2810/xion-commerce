import { Request, Response } from "express";
import  DeployService from "./deploy.service";
import expressAsyncHandler from "express-async-handler";
import { AuthRequest } from "../../middleware/auth";
import { AppError, ErrorHandler } from "../../common/exceptions/ResponseHandler";

export const first = async (req: Request, res: Response) => {};

export const deployEscrowContract = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { buyer, required_deposit, seller } = req.body;

  try {
    const result = await DeployService.deployEscrowContract({ buyer, required_deposit, seller });
    if (!result.success) {
        console.log(result.errorCode)
        ErrorHandler(res, result.errorCode as keyof typeof AppError, 400);
      return 
    }

    res.status(201).json(result.data);
    return 
  } catch (error) {
    const err = error as Error;

    const knownError = err.message as keyof typeof AppError;
    const statusCode = knownError === "DEPLOY_FAILED" ? 500 : 400;

    ErrorHandler(res, knownError, statusCode);
    // return 
  }
});