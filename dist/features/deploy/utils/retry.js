"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = retry;
function retry(fn_1) {
    return __awaiter(this, arguments, void 0, function* (fn, retries = 3, delayMs = 1000) {
        let lastError;
        for (let i = 0; i < retries; i++) {
            try {
                return yield fn();
            }
            catch (error) {
                lastError = error;
                if (i < retries - 1)
                    yield new Promise((res) => setTimeout(res, delayMs));
            }
        }
        throw lastError;
    });
}
// async deployEscrowContract(payload: IDeploy): Promise<ServiceResponse> {
//   try {
//     const uploadResult = await retry(() => Transaction.uploadEscrow(), 3, 1000);
//     const { codeId, transactionHash: uploadTxHash } = uploadResult;
//     if (!uploadTxHash) {
//       return this.buildError("Upload failed: no transaction hash.", "UPLOAD_FAILED");
//     }
//     const msg = {
//       buyer: payload.buyer,
//       seller: payload.seller,
//       required_deposit: payload.required_deposit,
//       marketplace: this.marketplace,
//       denom: this.denom,
//       fee_percentage: this.fee_percentage,
//     };
//     const { contractAddress, transactionHash: instantiateTxHash } =
//       await retry(() => Transaction.instantiateContract({ codeId, msg }), 3, 1000);
//     const state = await retry(() => Transaction.queryContract({ get_state: {} }, contractAddress), 3, 1000);
//     if (state.status !== "Created") {
//       return this.buildError(`Contract state not valid: ${state.status}`, "INVALID_CONTRACT_STATE");
//     }
//     return this.buildSuccess({
//       codeId,
//       contractAddress,
//       transactions: {
//         upload: uploadTxHash,
//         instantiate: instantiateTxHash,
//       },
//     });
//   } catch (error: unknown) {
//     return this.buildError(
//       error instanceof Error ? error.message : "Unknown error occurred",
//       "DEPLOY_FAILED"
//     );
//   }
// }
