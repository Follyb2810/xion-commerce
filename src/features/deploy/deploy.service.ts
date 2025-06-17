import XionQueries from "./utils/XionQueries";
import XionTransaction from "./utils/XionTransaction";
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
  }

  private buildSuccess<T>(data: T): ServiceResponse<T> {
    return { success: true, data };
  }

  private buildError(message: string, errorCode: string): ServiceResponse {
    return { success: false, message, errorCode };
  }

  async depositToEscrow(contractAddress: string): Promise<ServiceResponse> {
    try {
      const state = await Transaction.queryContract(
        { get_state: {} },
        contractAddress
      );
      const { status, denom, required_deposit } = state;

      if (status !== "Created") {
        return this.buildError(
          `Cannot deposit. Contract status is: ${status}`,
          "INVALID_CONTRACT_STATE"
        );
      }

      const funds = [{ denom, amount: required_deposit }];
      const result = await Transaction.executeContract(
        { deposit: {} },
        funds,
        contractAddress
      );

      return this.buildSuccess({
        transactionHash: result.transactionHash,
        gasUsed: result.gasUsed,
        gasWanted: result.gasWanted,
      });
    } catch (error: unknown) {
      // throw Error('XION_DEPOSIT_ERROR')

      return this.buildError(
        error instanceof Error ? error.message : "Unknown error occurred",
        "XION_DEPOSIT_ERROR"
      );
    }
  }

  async releaseOrRefund(
    action: "release" | "refund",
    contractAddress: string
  ): Promise<ServiceResponse> {
    try {
      const msg = action === "release" ? { release: {} } : { refund: {} };
      const result = await Transaction.executeContract(
        msg,
        undefined,
        contractAddress
      );

      return this.buildSuccess({
        transactionHash: result.transactionHash,
        gasUsed: result.gasUsed,
        gasWanted: result.gasWanted,
      });
    } catch (error: unknown) {
      // throw Error('XION_EXECUTE_ERROR')
      return this.buildError(
        error instanceof Error ? error.message : "Unknown error occurred",
        "XION_EXECUTE_ERROR"
      );
    }
  }

  async deployEscrowContract(payload: IDeploy): Promise<ServiceResponse> {
    try {
      const uploadResult = await Transaction.uploadEscrow();
      const { codeId, transactionHash: uploadTxHash } = uploadResult;

      if (!uploadTxHash) {
        return this.buildError(
          "Upload failed: no transaction hash.",
          "UPLOAD_FAILED"
        );
      }

      const msg = {
        buyer: payload.buyer,
        seller: payload.seller,
        required_deposit: payload.required_deposit,
        marketplace: this.marketplace,
        denom: this.denom,
        fee_percentage: this.fee_percentage,
      };

      const { contractAddress, transactionHash: instantiateTxHash } =
        await Transaction.instantiateContract({ codeId, msg });

      const state = await Transaction.queryContract(
        { get_state: {} },
        contractAddress
      );

      if (state.status !== "Created") {
        return this.buildError(
          `Contract state not valid: ${state.status}`,
          "INVALID_CONTRACT_STATE"
        );
      }

      return this.buildSuccess({
        codeId,
        contractAddress,
        transactions: {
          upload: uploadTxHash,
          instantiate: instantiateTxHash,
        },
      });
    } catch (error: unknown) {
      // throw Error('DEPLOY_FAILED')
      return this.buildError(
        error instanceof Error ? error.message : "Unknown error occurred",
        "DEPLOY_FAILED"
      );
    }
  }
}

export default new DeployService();

// const result = await DeployService.deployEscrowContract(req.body);
// if (!result.success) {
//   return res.status(400).json({ message: result.message, code: result.errorCode });
// }
// res.status(201).json(result.data);
