import { StargateClient, SigningStargateClient, GasPrice } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
class XionConnect{
    private CHAIN_ID: string;
    private XION_RPC_URL: string;
    private MNEMONIC?: string;
    
    constructor(){
        this.CHAIN_ID = process.env.XION_CHAIN_ID || "xion-testnet-2";
        this.XION_RPC_URL = process.env.XION_RPC_URL || "https://rpc.xion-testnet-2.burnt.com";
        this.MNEMONIC = process.env.XION_MNEMONIC;
        if(!this.CHAIN_ID){
            throw new Error("CHAIN_ID is required in .env file");
        }
        if (!this.XION_RPC_URL) {
            throw new Error("XION_RPC_URL is required in .env file");
          }
          if (!this.MNEMONIC) {
            throw new Error("XION_MNEMONIC is required in .env file");
          }
    }
    //? Creates a read-only client for querying the blockchain
    async getQueryClient() {
        return await StargateClient.connect(this.XION_RPC_URL);
      }
      async  getSigningClient(mnemonic = this.MNEMONIC) {
        // Create wallet from mnemonic
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic!, {
          prefix: "xion" // XION address prefix
        });
        
        // Create and return a signing client
        return await SigningStargateClient.connectWithSigner(
          this.XION_RPC_URL,
          wallet,
          { gasPrice: GasPrice.fromString("0.025uxion") }
        );
      }
}

export default XionConnect