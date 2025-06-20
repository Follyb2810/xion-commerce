import XionQueries from "./utils/XionQueries";
import XionTransaction from "./utils/XionTransaction";
import { XionUtils } from "./utils/XionUtils";
import XionWallet from "./utils/XionWallet";

type IDeploy = {
  buyer: string;
  seller: string;
  required_deposit: string;
};

interface ServiceResponse<T = any> {
  success: boolean;
  message?: string;
  errorCode?: string;
  data?: T;
}
type IAction= "release" | "refund"

const wallet = new XionWallet();
const Xion = new XionQueries();
const Transaction = new XionTransaction();

class DeployService {
  private readonly marketplace: string;
  private readonly denom: string;
  private readonly fee_percentage: number;

  constructor() {
    this.denom = process.env.XION_DENOM_IBC as string;
    this.marketplace = process.env.ADMIN_ADDRESS as string;
    this.fee_percentage = 5;

    if (!this.denom) {
      throw new Error("XION_DENOM_IBC environment variable is required");
    }
    if (!this.marketplace) {
      throw new Error("ADMIN_ADDRESS environment variable is required");
    }
  }

  private buildSuccess<T>(data: T): ServiceResponse<T> {
    return { success: true, data };
  }

  private buildError(message: string, errorCode: string): ServiceResponse {
    return { success: false, message, errorCode };
  }

  async depositToEscrow(contractAddress: string): Promise<ServiceResponse> {
    try {

      const state = await Transaction.queryContract(contractAddress, {
        get_state: {},
      });


      const { status, denom, required_deposit } = state;

      if (status !== "Created") {
        return this.buildError(
          `Cannot deposit. Contract status is: ${status}`,
          "INVALID_CONTRACT_STATE"
        );
      }

      const funds = [{ denom, amount: required_deposit }];

      const result = await Transaction.executeContract(
        contractAddress,
        { deposit: {} },
        funds
      );


      return this.buildSuccess({
        transactionHash: result.transactionHash,
        gasUsed: result.gasUsed,
        gasWanted: result.gasWanted,
      });
    } catch (error: unknown) {
      return this.buildError(
        error instanceof Error ? error.message : "Unknown error occurred",
        "XION_DEPOSIT_ERROR"
      );
    }
  }


async releaseOrRefund(
  action: IAction,
  contractAddress: string
): Promise<ServiceResponse> {
  try {

    const normalizedAction = action.toLowerCase();

    if (normalizedAction !== "release" && normalizedAction !== "refund") {
      throw new Error(`Invalid action: ${action}`);
    }

    const msg = normalizedAction === "release"
      ? { release: {} }
      : { refund: {} };

    const result = await Transaction.executeContract(contractAddress, msg, []);


    return this.buildSuccess({
      transactionHash: result.transactionHash,
      gasUsed: result.gasUsed,
      gasWanted: result.gasWanted,
    });
  } catch (error: unknown) {
    return this.buildError(
      error instanceof Error ? error.message : "Unknown error occurred",
      "XION_EXECUTE_ERROR"
    );
  }
}


  async deployEscrowContract(payload: IDeploy): Promise<ServiceResponse> {
    try {
      if (!payload.buyer || !XionUtils.isValidXionAddress(payload.buyer)) {
        return this.buildError(
          `Invalid buyer address: ${payload.buyer}`,
          "INVALID_BUYER_ADDRESS"
        );
      }

      if (!payload.seller || !XionUtils.isValidXionAddress(payload.seller)) {
        return this.buildError(
          `Invalid seller address: ${payload.seller}`,
          "INVALID_SELLER_ADDRESS"
        );
      }

      if (
        !payload.required_deposit ||
        isNaN(Number(payload.required_deposit)) ||
        Number(payload.required_deposit) <= 0
      ) {
        return this.buildError(
          `Invalid required deposit: ${payload.required_deposit}`,
          "INVALID_DEPOSIT_AMOUNT"
        );
      }

      const uploadResult = await Transaction.uploadEscrow();
      const { codeId, transactionHash: uploadTxHash } = uploadResult;

      if (!uploadTxHash) {
        return this.buildError(
          "Upload failed: no transaction hash returned.",
          "UPLOAD_FAILED"
        );
      }

      if (!codeId || codeId <= 0) {
        return this.buildError(
          `Upload failed: invalid code ID: ${codeId}`,
          "INVALID_CODE_ID"
        );
      }

      const amount = XionUtils.xionToUxion(payload.required_deposit);

      const instantiateMsg = {
        buyer: payload.buyer,
        seller: payload.seller,
        required_deposit: amount,
        marketplace: this.marketplace,
        denom: this.denom,
        fee_percentage: this.fee_percentage,
      };

      const instantiateResult = await Transaction.instantiateContract({
        codeId,
        msg: instantiateMsg,
        label: `Escrow Contract - ${Date.now()}`,
      });

      const {
        contractAddress,
        transactionHash: instantiateTxHash,
        gasUsed,
      } = instantiateResult;
      

      if (!contractAddress) {
        return this.buildError(
          "Instantiation failed: no contract address returned.",
          "INSTANTIATION_FAILED"
        );
      }
      const state = await Transaction.queryContract(contractAddress, {
        get_state: {},
      });

      const deploymentResult = {
        codeId,
        contractAddress,
        buyer: payload.buyer,
        seller: payload.seller,
        marketplace: this.marketplace,
        required_deposit: amount,
        denom: this.denom,
        fee_percentage: this.fee_percentage,
        state,
        upload: uploadTxHash,
        instantiate: instantiateTxHash,
        gasUsed: gasUsed?.toString(),
      };

      return this.buildSuccess(deploymentResult);
    } catch (error: unknown) {

      let errorMessage = "Unknown error occurred";
      let errorCode = "DEPLOY_FAILED";

      if (error instanceof Error) {
        errorMessage = error.message;

        if (errorMessage.includes("insufficient funds")) {
          errorCode = "INSUFFICIENT_FUNDS";
        } else if (errorMessage.includes("code not found")) {
          errorCode = "CODE_NOT_FOUND";
        } else if (errorMessage.includes("invalid address")) {
          errorCode = "INVALID_ADDRESS";
        } else if (errorMessage.includes("gas")) {
          errorCode = "GAS_ERROR";
        } else if (errorMessage.includes("timeout")) {
          errorCode = "TIMEOUT_ERROR";
        } else if (errorMessage.includes("connection")) {
          errorCode = "CONNECTION_ERROR";
        }
      }

      return this.buildError(errorMessage, errorCode);
    }
  }

  async checkServiceHealth(): Promise<ServiceResponse> {
    try {

      const checks = {
        environment: {
          denom: !!this.denom,
          marketplace: !!this.marketplace,
          adminAddress: !!process.env.ADMIN_ADDRESS,
        },
        wallet: false,
        connection: false,
      };

      try {
        const address = await wallet.getMyXionAddress();
        checks.wallet = !!address;
      } catch (e) {
        console.log("👛 Wallet check: ❌", e);
      }

      checks.connection = true;

      const isHealthy =
        Object.values(checks.environment).every(Boolean) &&
        checks.wallet &&
        checks.connection;

      return this.buildSuccess({
        healthy: isHealthy,
        checks,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return this.buildError(
        error instanceof Error ? error.message : "Health check failed",
        "HEALTH_CHECK_ERROR"
      );
    }
  }
}

export default new DeployService();
