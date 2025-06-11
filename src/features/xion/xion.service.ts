import XionQueries from "./../../common/wallet/xion_queries";
import XionTransaction from "./../../common/wallet/xion_transactions";
import UserRepository from "./../user/user.repository";

const Xion = new XionQueries();
const Transaction = new XionTransaction();

export default class XionService {
  static async getAddressBalance(address: string) {
    return await Xion.getBalance(address);
  }

  static async sendXionTokenUser(recipientAddress: string, amount: string) {
    return await Transaction.sendTokens(recipientAddress, amount);
  }

  static async sendXionToEscrow(userId: string, sellerAddress: string, amount: string) {
    const formattedAmount = XionQueries.xionToUxion(amount);
    const user = await UserRepository.findById(userId);

    if (!user?.walletAddress || !user?.mnemonic) {
      throw new Error("Invalid user credentials");
    }

    const msg = {
      initiate_escrow: {
        seller: sellerAddress,
        amount: formattedAmount,
      },
    };

    const funds = [{ denom: "uxion", amount: formattedAmount }];

    for (let attempt = 1; attempt <= 3; attempt++) {
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

        return {
          transactionHash: transaction.transactionHash,
          gasUsed: transaction.gasUsed?.toString() || "N/A",
          gasWanted: transaction.gasWanted?.toString() || "N/A",
        };
      } catch (error: any) {
        if (error.message.includes("insufficient funds")) {
          throw new Error("Insufficient funds");
        }

        if (attempt === 3) throw error;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  static async releaseOrCancelEscrow(userId: string, buyerAddress: string, status: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const msg =
      status.toLowerCase() === "release"
        ? { release_funds: {} }
        : { cancel_escrow: {} };

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const transaction = await Transaction.executeContract(
          buyerAddress,
          msg,
          [],
          user.mnemonic!
        );

        if (!transaction?.transactionHash) {
          throw new Error("Transaction failed: No transaction hash returned.");
        }

        return {
          transactionHash: transaction.transactionHash,
          gasUsed: transaction.gasUsed?.toString() || "N/A",
          gasWanted: transaction.gasWanted?.toString() || "N/A",
        };
      } catch (error: any) {
        if (attempt === 3) throw error;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
}
