import { Request, Response, NextFunction } from "express";
import AsyncHandler from "express-async-handler";
import { ResponseHandler, ErrorHandler } from "./../../common/exceptions/ResponseHandler";
import { AuthRequest } from "./../../middleware/auth";
import XionService from "./xion.service";
export interface XionRequest extends AuthRequest {
  transactionData?: {
    transactionHash: string;
    gasUsed: string;
    gasWanted: string;
  };
}

export const getAddressBalance = AsyncHandler(async (req: Request, res: Response) => {
  const address = req.query.address as string;

  if (!address) return ResponseHandler(res, 400, "Address is required");

  try {
    const balance = await XionService.getAddressBalance(address);
    return ResponseHandler(res, 200, "Balance of Xion", { balance });
  } catch (error) {
    return ErrorHandler(res, "ERROR_XION", 400);
  }
});

export const sendXionTokenUser = AsyncHandler(async (req: Request, res: Response) => {
  const { recipientAddress, amount } = req.body;

  if (!recipientAddress || !amount) {
    return ResponseHandler(res, 400, "Recipient address and amount are required");
  }

  try {
    const payment = await XionService.sendXionTokenUser(recipientAddress, amount);
    return ResponseHandler(res, 200, "Funds sent successfully", payment);
  } catch (error) {
    return ErrorHandler(res, "ERROR_SENDING_XION", 500);
  }
});

export const sendXionToEscrowContract = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const { sellerAddress, amount } = req.body;

  if (!sellerAddress || !amount) {
    return ResponseHandler(res, 400, "Contract address and amount are required");
  }

  if (Number(amount) <= 0) {
    return ResponseHandler(res, 400, "Invalid amount: must be greater than zero.");
  }

  try {
    const transaction = await XionService.sendXionToEscrow(req._id!, sellerAddress, amount);
    return ResponseHandler(res, 200, "Funds sent to escrow contract", transaction);
  } catch (error: any) {
    if (error.message === "Insufficient funds") {
      return ResponseHandler(res, 400, "Insufficient funds for the transaction.");
    }

    return ResponseHandler(res, 500, error.message);
  }
});

export const releaseOrCancelEscrow = AsyncHandler(async (req: XionRequest, res: Response, next: NextFunction) => {
  const { buyerAddress, status } = req.body;

  if (!buyerAddress || !status) {
    return ResponseHandler(res, 400, "Buyer address and fund status are required.");
  }

  const validStatuses = ["release", "cancel"];
  if (!validStatuses.includes(status.toLowerCase())) {
    return ResponseHandler(res, 400, "Invalid fund status.");
  }

  try {
    const transaction = await XionService.releaseOrCancelEscrow(req._id!, buyerAddress, status);
    req.transactionData = transaction;
    return next();
  } catch (error: any) {
    return ResponseHandler(res, 500, "Escrow transaction failed", error.message);
  }
});
