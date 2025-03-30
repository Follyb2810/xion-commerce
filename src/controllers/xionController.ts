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

export const sendXionTokenUser = AsyncHandler(
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
      console.error({payment})
      return ResponseHandler(res, 200, "Funds sent successfully", payment);
    } catch (error) {
      return ErrorHandler(res, "ERROR_SENDING_XION", 500);
    }
  }
);
export const sendXionToEscrowContract = AsyncHandler(async (req: AuthRequest, res: Response) => {
    const { sellerAddress, amount } = req.body;
    const maxRetries = 3;

    if (!sellerAddress || !amount) {
      return ResponseHandler(
        res,
        400,
        "Contract address and amount are required"
      );
    }

    if (Number(amount) <= 0) {
      return ResponseHandler(res, 400, "Invalid amount: must be greater than zero.");
    }

    const formattedAmount = XionQueries.xionToUxion(amount);
    const user = await UserRepository.findById(req._id!);

    if (!user?.walletAddress || !user?.mnemonic) {
      console.error("User wallet address or mnemonic is missing.");
      return ResponseHandler(res, 400, "Invalid user credentials");
    }

    const msg = {
      initiate_escrow: {
        seller: sellerAddress,
        amount: formattedAmount,
      },
    };

    const funds = [{ denom: "uxion", amount: formattedAmount }];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const transaction = await Transaction.executeContract(
          user.walletAddress,
          msg,
          funds,
          user.mnemonic
        );

        if (!transaction?.transactionHash) {
          throw new Error("Transaction failed: No transaction hash returned.");
        }

        const formattedTransaction = {
          transactionHash: transaction.transactionHash,
          gasUsed: transaction.gasUsed?.toString() || "N/A",
          gasWanted: transaction.gasWanted?.toString() || "N/A",
        };

        console.log("Transaction successful:", formattedTransaction);

        return ResponseHandler(
          res,
          200,
          "Funds sent to escrow contract",
          formattedTransaction
        );
      } catch (error: any) {
        console.error(`Attempt ${attempt} failed:`, error.message);

        if (error.message.includes("insufficient funds")) {
          return ResponseHandler(res, 400, "Insufficient funds for the transaction.");
        }

        if (attempt === maxRetries) {
          return ResponseHandler(res, 500, "Transaction failed after multiple attempts.");
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
);

export const releaseOrCancelEscrow = AsyncHandler(
  async (req: XionRequest, res: Response, next: NextFunction) => {
    const { buyerAddress, status } = req.body;
    const maxRetries = 3;

    if (!buyerAddress || !status) {
      return ResponseHandler(res, 400, "Buyer address and fund status are required.");
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

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}: Executing escrow transaction...`);

        const transaction = await Transaction.executeContract(
          buyerAddress,
          msg,
          [],
          user.mnemonic as string
        );

        if (!transaction?.transactionHash) {
          throw new Error("Transaction failed: No transaction hash returned.");
        }

        req.transactionData = {
          transactionHash: transaction.transactionHash,
          gasUsed: transaction.gasUsed?.toString() || "N/A",
          gasWanted: transaction.gasWanted?.toString() || "N/A",
        };

        console.log(`Transaction ${status} successful:`, req.transactionData);

        return next();
      } catch (error: any) {
        console.error(`Attempt ${attempt} failed:`, error.message);

        if (attempt === maxRetries) {
          return ResponseHandler(res, 500, "Escrow transaction failed after multiple attempts.", error);
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
);

