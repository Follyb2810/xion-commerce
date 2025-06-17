import { JsonObject } from "@cosmjs/cosmwasm-stargate";
import XionConnect from "./XionConnect";
import { XionUtils } from "./XionUtils";
import { XION_CONSTANTS } from "../deploy.type";


class XionQueries {
  private readonly xionConnect: XionConnect;

  constructor(xionConnect?: XionConnect) {
    this.xionConnect = xionConnect ?? new XionConnect();
  }

  static xionToUxion = XionUtils.xionToUxion;
  static uxionToXion = XionUtils.uxionToXion;

  async getBalance(
    address: string, 
    denom: string = XION_CONSTANTS.DEFAULT_DENOM
  ): Promise<string> {
    if (!XionUtils.isValidXionAddress(address)) {
      throw new Error(`Invalid Xion address: ${address}`);
    }

    const client = await this.xionConnect.getQueryClient();
    const balance = await client.getBalance(address, denom);
    return XionUtils.uxionToXion(balance.amount);
  }

  async getAccount(address: string) {
    if (!XionUtils.isValidXionAddress(address)) {
      throw new Error(`Invalid Xion address: ${address}`);
    }

    const client = await this.xionConnect.getQueryClient();
    return client.getAccount(address);
  }

  async getTransaction(hash: string) {
    if (!XionUtils.isValidTxHash(hash)) {
      throw new Error(`Invalid transaction hash: ${hash}`);
    }

    const client = await this.xionConnect.getQueryClient();
    return client.getTx(hash);
  }

  async getBlock(height?: number) {
    if (height !== undefined && (!Number.isInteger(height) || height < 0)) {
      throw new Error(`Invalid block height: ${height}`);
    }

    const client = await this.xionConnect.getQueryClient();
    return height ? client.getBlock(height) : client.getBlock();
  }

  async queryContract<T = JsonObject>(
    contractAddress: string, 
    queryMsg: Record<string, unknown>
  ): Promise<T> {
    if (!XionUtils.isValidXionAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }

    const client = await this.xionConnect.getQueryCosmWasmClient();
    return client.queryContractSmart(contractAddress, queryMsg);
  }

  async getChainHeight(): Promise<number> {
    const client = await this.xionConnect.getQueryClient();
    return client.getHeight();
  }


  async getAllBalances(address: string) {
    if (!XionUtils.isValidXionAddress(address)) {
      throw new Error(`Invalid Xion address: ${address}`);
    }

    const client = await this.xionConnect.getQueryClient();
    return client.getAllBalances(address);
  }

  /**
   * Get chain information
   */
  async getChainInfo() {
    const client = await this.xionConnect.getQueryClient();
    const [height, block] = await Promise.all([
      client.getHeight(),
      client.getBlock()
    ]);
    
    return {
      height,
      chainId: block.header.chainId,
      blockTime: block.header.time
    };
  }
}

export default XionQueries;
