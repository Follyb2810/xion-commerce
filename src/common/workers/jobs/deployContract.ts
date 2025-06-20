import DeployService from "../../../features/deploy/deploy.service";

export type IWorkerContract = {
  buyer: string;
  seller: string;
  required_deposit: string;
};
export default async function deployContractHandler(data: IWorkerContract) {
  const { buyer, seller, required_deposit } = data;

  const result = await DeployService.deployEscrowContract({
    buyer,
    seller,
    required_deposit,
  });

  if (!result.success) throw new Error(result.errorCode || "DEPLOY_FAILED");

  return result.data;
}
