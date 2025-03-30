import { NextFunction, Request, Response } from "express";
import AsyncHandler from "express-async-handler";
import XionQueries from "../utils/wallet/xion_queries";
import { ErrorHandler, ResponseHandler } from "../utils/ResponseHandler";
import XionTransaction from "../utils/wallet/xion_transactions";
import { AuthRequest } from "../middleware/auth";
import UserRepository from "../repositories/UserRepository";

const Xion = new XionQueries();
const Transaction = new XionTransaction();

export interface XionRequest extends AuthRequest {
  transactionData?: {
    transactionHash: string;
    gasUsed: string;
    gasWanted: string;
  };
}

export const getAddressBalance = AsyncHandler(
  async (req: Request, res: Response) => {
    const address = req.query.address as string;

    if (!address) {
      return ResponseHandler(res, 400, "Address is required");
    }

    try {
      const balance = await Xion.getBalance(address);

      return ResponseHandler(res, 200, "Balance of Xion", { balance });
    } catch (error) {
      return ErrorHandler(res, "ERROR_XION", 400);
    }
  }
);

export const sendXionToContract = AsyncHandler(
  async (req: Request, res: Response) => {
    const { recipientAddress, amount } = req.body;

    if (!recipientAddress || !amount) {
      return ResponseHandler(
        res,
        400,
        "Recipient address and amount are required"
      );
    }

    try {
      const payment = await Transaction.sendTokens(recipientAddress, amount);

      return ResponseHandler(res, 200, "Funds sent successfully", payment);
    } catch (error) {
      return ErrorHandler(res, "ERROR_SENDING_XION", 500);
    }
  }
);
export const sendXionToEscrowContract = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { sellerAddress, amount } = req.body;

    if (!sellerAddress || !amount) {
      return ResponseHandler(
        res,
        400,
        "Contract address and amount are required"
      );
    }

    if (!amount || Number(amount) <= 0) {
      throw new Error("Invalid amount: must be greater than zero.");
    }
    const formattedAmount = XionQueries.xionToUxion(amount);
    const user = await UserRepository.findById(req._id!);
    const msg = {
      initiate_escrow: {
        seller: sellerAddress,
        amount: formattedAmount,
      },
    };
    const funds = [{ denom: "uxion", amount: formattedAmount }];
    const transaction = await Transaction.executeContract(
      user?.walletAddress!,
      msg,
      funds,
      user?.mnemonic as string
    );

    const formattedTransaction = {
      transactionHash: transaction?.transactionHash,
      gasUsed: transaction?.gasUsed.toString(),
      gasWanted: transaction?.gasWanted.toString(),
    };

    return ResponseHandler(
      res,
      200,
      "Funds sent to escrow contract",
      formattedTransaction
    );
  }
);
export const releaseOrCancelEscrow = AsyncHandler(
  async (req: XionRequest, res: Response, next: NextFunction) => {
    const { buyerAddress, status } = req.body;

    if (!buyerAddress || !status) {
      return ResponseHandler(
        res,
        400,
        "Buyer address and fund status are required."
      );
    }

    const user = await UserRepository.findById(req._id!);

    if (!user) {
      return ResponseHandler(res, 400, "User not found.");
    }

    const FUND_STATES = ["release", "cancel"];
    if (!FUND_STATES.includes(status.toLowerCase())) {
      return ResponseHandler(res, 400, "Invalid fund status.");
    }

    const msg =
      status.toLowerCase() === "release"
        ? { release_funds: {} }
        : { cancel_escrow: {} };

    try {
      const transaction = await Transaction.executeContract(
        buyerAddress,
        msg,
        [],
        user.mnemonic as string
      );
      if (!transaction) {
        return ResponseHandler(res, 500, "Transaction failed.");
      }

      req.transactionData = {
        transactionHash: transaction.transactionHash,
        gasUsed: transaction.gasUsed.toString(),
        gasWanted: transaction.gasWanted.toString(),
      };

      next();
    } catch (error) {
      return ResponseHandler(res, 500, "Escrow transaction failed.", error);
    }
  }
);
