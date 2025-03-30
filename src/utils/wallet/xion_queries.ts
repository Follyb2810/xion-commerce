import { JsonObject } from "@cosmjs/cosmwasm-stargate";
import XionConnect from "./xion-connect";

class XionQueries {
    private readonly xionConnect: XionConnect;

    constructor() {
        this.xionConnect = new XionConnect();
    }
    static xionToUxion(amount: number | string): string {
        return Math.floor(Number(amount) * 1e6).toString();
      }
      
      static uxionToXion(amount: number | string): string {
        return (Number(amount) / 1e6).toString();
      }
    async getBalance(address: string, denom: string = "uxion"): Promise<string> {
        const client = await this.xionConnect.getQueryClient();
        const balance = await client.getBalance(address, denom);
        return XionQueries.uxionToXion(balance.amount);
    }

    async getAccount(address: string) {
        const client = await this.xionConnect.getQueryClient();
        return client.getAccount(address);
    }

    async getTransaction(hash: string) {
        const client = await this.xionConnect.getQueryClient();
        return client.getTx(hash);
    }

    async getBlock(height?: number) {
        const client = await this.xionConnect.getQueryClient();
        return height ? client.getBlock(height) : client.getBlock();
    }

    async queryContract<T>(contractAddress: string, queryMsg: Record<string, unknown>): Promise<T> {
        const client = await this.xionConnect.getQueryCosmWasmClient();
        return client.queryContractSmart(contractAddress, queryMsg);
    }
    

    async getChainHeight(): Promise<number> {
        const client = await this.xionConnect.getQueryClient();
        return client.getHeight();
    }
}

export default XionQueries