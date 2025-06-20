export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw lastError;
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
