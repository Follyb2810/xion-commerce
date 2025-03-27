import XionConnect from "./xion-connect";

class  XionQueries{
    private query
    constructor(){
        this.query = new XionConnect()
    }
    //?  Gets an account's balance for a specific token 
    //? address and token name
    async  getBalance(address:string, denom:string = "uxion") {
        const client = await this.query.getQueryClient();
        const balance = await client.getBalance(address, denom);
        return balance.amount;
      }
      //?  Gets detailed account information
      async  getAccount(address:string) {
        const client = await this.query.getQueryClient();
        return await client.getAccount(address);
      }
      // Gets transaction details by hash
      async getTransaction(hash:string) {
        const client = await this.query.getQueryClient();
        return await client.getTx(hash);
      }
      //Gets block data at a specific height
      async  getBlock(height?:string) {
        const client = await this.query.getQueryClient();
        return  height ? await client.getBlock() : await client.getBlock(height);
      }
      // ueries a smart contract
      async  queryContract(contractAddress:string, queryMsg:{}) {
        const client = await this.query.getQueryClient();
        return await client.queryContractSmart(contractAddress, queryMsg);
      }
      // {number} The current block height
     async  getChainHeight() {
       const client = await this.query.getQueryClient();
       return await client.getHeight();
     }

}

export default XionQueries