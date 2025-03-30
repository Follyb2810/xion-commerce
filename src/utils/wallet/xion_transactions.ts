import { JsonObject } from "@cosmjs/cosmwasm-stargate";
import XionConnect from "./xion-connect";
import XionWallet from "./xion_wallet";
import { ErrorHandler } from "../ResponseHandler";

class XionTransaction{
    private readonly xionWallet:XionWallet;
    private readonly xionConnect: XionConnect;
    private readonly contractAddress: string;
    
    constructor(){
        this.xionConnect = new XionConnect()
        this.xionWallet = new XionWallet()
        this.contractAddress = process.env.CONTRACT_XION as string
    }
    async sendTokens(recipientAddress:string, amount:string, denom:string = "uxion", memo:string = "") {
        const client = await this.xionConnect.getSigningStargateClient();
        const senderAddress = await this.xionWallet.getMyXionAddress();
        
        const result = await client.sendTokens(
          senderAddress!,
          recipientAddress,
          [{ denom, amount }],
          "auto", 
          memo || "Transfer via XION backend"
        );
        
        return {
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed,
          gasWanted: result.gasWanted
        };
      }
    //? Executes a smart contract function
    async executeContract(
      senderAddress: string,
      msg: JsonObject,
      funds: { denom: string; amount: string }[] = [],
      mnemonic?: string
    ) {
      try {
        const client = await this.xionConnect.getSigningWasmClient(mnemonic);  
        const result = await client.execute(
          senderAddress,
          this.contractAddress,
          msg,
          "auto", 
          "Execute contract via XION backend",
          funds
        );
    
        return {
          transactionHash: result.transactionHash,
          gasUsed: result.gasUsed.toString(), 
          gasWanted: result.gasWanted.toString(),
        }
      } catch (error: any) {
        console.error("🚨 Smart Contract Execution Error:", error);
      }
    }
    
      
      
      
}

export default XionTransaction