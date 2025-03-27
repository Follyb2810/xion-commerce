import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import crypto from "crypto";
import { generateMnemonic, entropyToMnemonic } from "@scure/bip39";
import bip39 from "bip39";
import { wordlist } from "@scure/bip39/wordlists/english";


class XionWallet {
  private XION_RPC_URL: string;
  private CHAIN_ID: string;
  private MNEMONIC?: string;

  constructor() {
    this.XION_RPC_URL = process.env.XION_RPC_URL || "https://rpc.xion-testnet-2.burnt.com";
    this.CHAIN_ID = process.env.XION_CHAIN_ID || "xion-testnet-2";
    this.MNEMONIC = process.env.XION_MNEMONIC;

    if (!this.MNEMONIC) {
      throw new Error("XION_MNEMONIC is required in .env file");
    }
    if (!this.XION_RPC_URL) {
      throw new Error("XION_RPC_URL is required in .env file");
    }
  }
  //? 1 ok
  private static generateMnemonicFromEmail(email: string): string {
    const hash = crypto.createHash("sha256").update(email).digest("hex");
    console.log('hash',hash)
    const entropy = Buffer.from(hash, "hex").subarray(0, 16); // Ensure 16 bytes
    console.log('entropy',entropy)
    console.log('entropy',entropy.length)
    return entropyToMnemonic(entropy, wordlist);
    // return bip39.entropyToMnemonic(); // 32 hex chars = 16 bytes entropy
    // return bip39.entropyToMnemonic(hash.slice(0, 32)); // 32 hex chars = 16 bytes entropy
    // return entropyToMnemonic(hash.slice(0, 32), wordlist); // 32 hex chars = 16 bytes entropy
  }
  // ok
  static async generateAddressFromEmail(email: string) {
    const mnemonic = this.generateMnemonicFromEmail(email);
    console.log('mnemonic',mnemonic)
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "xion",
    });
    
    const [firstAccount] = await wallet.getAccounts();
    console.log('firstAccount',firstAccount)
    return {
      address: firstAccount.address,
      mnemonic, // For testing purposes only; do not store in production
    };
  }
  //?2 ok
  static async generateNewWallet() {
    const mnemonic = generateMnemonic(wordlist,128);
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "xion",
    });
    console.log(`✔1 ${wallet.mnemonic}`)
    console.log(`✔2 ${wallet}`)
    
    const [account] = await wallet.getAccounts();
    console.log(`✔ ${mnemonic} `)
    console.log(`✔ ${account.address}`)

    return {
      mnemonic,
      address: account.address,
    };
  }
  //? ok 3 Gets the address associated with the configured mnemonic
   async getMyXionAddress() {
    if (!this.MNEMONIC) throw new Error("No mnemonic set for this wallet.");
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(this.MNEMONIC, {
      prefix: "xion",
    });

    const [firstAccount] = await wallet.getAccounts();
    console.log({wallet_address:firstAccount.address})
    console.log({wallet_algo:firstAccount.algo})
    console.log({wallet_pubkey:firstAccount.pubkey})
    return firstAccount?.address || null;
  }
    //?ok 4 Generates a new wallet (useful for creating recipient wallets for testing)
  static async generateXionWallet() {
    const wallet = await DirectSecp256k1HdWallet.generate(24, {
      prefix: "xion",
    });
    console.log(`🐱‍🏍 wallet ${wallet}`)
    const [firstAccount] = await wallet.getAccounts();
    console.log(`🐱‍🏍 firstAccount ${firstAccount.address}`)
    console.log(`🐱‍🏍 pub ${firstAccount.pubkey}`)
    console.log(`🐱‍🏍 mnemonic ${wallet.mnemonic}`)

    return {
      mnemonic: wallet.mnemonic,
      address: firstAccount?.address || null,
    };
  }
  
  //?5 ok  Gets address from a specific mnemonic
  static async getAddressFromXionMnemonic(mnemonic: string) {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "xion",
    });
    
    const [firstAccount] = await wallet.getAccounts();
    console.log(`🐱‍🏍 wallet ${wallet}`)
    console.log(`🐱‍🏍 firstAccount ${firstAccount.address}`)
    console.log(`🐱‍🏍 pub ${firstAccount.pubkey}`)
    console.log(`🐱‍🏍 mnemonic ${wallet.mnemonic}`)
    console.log(`🐱‍🏍 firstAccount ${firstAccount.address}`)
    return firstAccount?.address || null;
  }
}

export default XionWallet;

/**
//? 1
hash 6cde6d736d4d27f716126f835245e3623cd3988808e25687686ade8e2f1acd32
entropy <Buffer 6c de 6d 73 6d 4d 27 f7 16 12 6f 83 52 45 e3 62>
entropy 16
mnemonic holiday vibrant fresh surround sponsor wine flame evil local mutual juice settle
Promise { <pending> }
dcc3f129eb1ba3b7a40cebbc6ba245efd6281051498e73c58115a91aae0302e9
firstAccount {
  algo: 'secp256k1',
  pubkey: Uint8Array(33) [
      2, 183, 140, 209, 138,  44,  22,  35,
    136,   4,  41, 196,  41,  66,  66, 111,
    162, 188, 155, 192, 248, 115, 189, 169,
    149, 153,  68,  50, 131,  34,  21,  63,
    138
  ],
  address: 'xion1rsjr643n3092mnt0up8jer7jzh7vguhcq89vz7'
}
  //?2
  Promise { <pending> }
fc1804ec57cbfafca39004fc758923ad3638947d646a4d3a17a3018df361aa59
✔1 glide trouble sense utility nothing round tuition liar pudding reopen govern rich
✔2 [object Object]
✔ glide trouble sense utility nothing round tuition liar pudding reopen govern rich 
✔ xion1qcmzahdc5n2fnc3unxj65ghk053mtv9klsg2x0

//?3
Promise { <pending> }
XionWallet {
  XION_RPC_URL: 'https://rpc.xion-testnet-2.burnt.com',
  CHAIN_ID: 'xion-testnet-2',
  MNEMONIC: 'wait fabric fitness giggle below dismiss school rival interest spray deputy enlist mobile ribbon champion forest feed polar east cook riot merit forward envelope'
}
//wallet address: 24d93e6b560f2e3db737c993e94027433dcb20a7dec9aff9090d4c60e2973f2c
//! 3
e44cd5595194a60cd18d9a34cc9eef9fab04c2fb2f36194c38027bc8c3e088b5
{ wallet_address: 'xion1uy2glj674hx2k02wwc8ctgk3cfhfu7z0vyduww' }
{ wallet_algo: 'secp256k1' }
{
  wallet_pubkey: Uint8Array(33) [
      2,  95, 105,  53, 199, 121, 241,  96,
    117, 115, 140, 136, 206, 250, 220,  20,
     11, 189, 179, 205, 228,   1,  89, 209,
    224, 225, 228,  52,  75,  97, 243, 100,
    230
  ]
}
  //? 4
  b9341aa2caf0319d219859adb827803b3b27daa18d8cd807cf4937ec98d5901c
🐱‍🏍 wallet [object Object]
🐱‍🏍 firstAccount xion1taq08gauecady9xpvje736ulljwau8kmgf76dz
🐱‍🏍 pub 3,94,61,150,74,221,235,49,39,163,167,165,212,110,64,81,82,60,233,78,24,170,9,151,94,203,90 ,49,137,212,78,153,83
🐱‍🏍 mnemonic rubber slight cinnamon rare faith buyer mind minute alarm cabin west town long pretty  media gown follow neither shove undo muscle useful fire glove
//? 4
ef8d27569dc93a5fc112227973eba82f824c4a3784284114c2f4138277a068f9
🐱‍🏍 wallet [object Object]
🐱‍🏍 firstAccount xion1vx8gz8eyralzu8dc5dap76sxr7zuvqewnnk8j6
🐱‍🏍 pub 2,151,67,254,138,70,25,107,189,182,15,204,66,195,119,190,50,231,32,68,163,112,122,10,158,2 46,6,137,141,160,217,102,3
🐱‍🏍 mnemonic wife fee yard rose joke relax undo muffin abstract cover caught warm today arrive exc lude clever wood occur atom clay jar talk beach typical
//? 4
Promise { <pending> }
62a001a0ecd7dfff312f5f86cbf992b2bd4c67ea71ba25ab975c4ca6377d2257
🐱‍🏍 wallet [object Object]
🐱‍🏍 firstAccount xion1ullt54jeq8ujdw2ft4zdrk8whym4v7jxygjpf9
🐱‍🏍 pub 2,83,107,20,175,201,31,147,39,204,27,104,164,136,246,117,58,233,216,157,21,53,233,117,49,3 1,80,116,49,17,85,60,72
🐱‍🏍 mnemonic obey school diary diet item increase industry pyramid spring pole elder green ethics  iron spread catalog story alien column child fun inherit neutral denial
db is connected
//?
5000
Promise { <pending> }
aab51b06586e63ae94d9e262b2cad97fe27dabef4a9499dda19b76be88f4f4ec
🐱‍🏍 wallet [object Object]
🐱‍🏍 firstAccount xion19c5uu6rz4e53ht3g9e8sg9xdvzzk3l6fe6skhj
🐱‍🏍 pub 3,162,50,166,102,160,210,20,25,39,8,165,2,59,129,110,47,253,53,75,13,92,74,90,41,96,175,22 8,194,29,98,183,225
🐱‍🏍 mnemonic win include air antenna lawn curtain move model artist destroy runway hurt attitude a pril neck reform chapter edge replace enact claim romance convince another
Promise { <pending> }
🐱‍🏍 wallet [object Object]
🐱‍🏍 firstAccount xion19c5uu6rz4e53ht3g9e8sg9xdvzzk3l6fe6skhj
🐱‍🏍 pub 3,162,50,166,102,160,210,20,25,39,8,165,2,59,129,110,47,253,53,75,13,92,74,90,41,96,175,22 8,194,29,98,183,225
🐱‍🏍 mnemonic win include air antenna lawn curtain move model artist destroy runway hurt attitude a pril neck reform chapter edge replace enact claim romance convince another
🐱‍🏍 firstAccount xion19c5uu6rz4e53ht3g9e8sg9xdvzzk3l6fe6skhj
db is connected
database is running succesfull
//?
Promise { <pending> }
d948de7ce3db77b2a5533886199c925502c92a6aefdc72eef3dfe081120a6a41
🐱‍🏍 wallet [object Object]
🐱‍🏍 firstAccount xion1wk2xlklngzsx8h8ge3hnkc8qsuwluyckejuqmw
🐱‍🏍 pub 3,62,125,216,34,147,148,170,195,89,134,27,105,155,189,71,149,60,56,26,42,115,78,136,164,20 2,255,229,251,206,254,159,227
🐱‍🏍 mnemonic action trial smoke happy wagon focus burger rapid aspect nominee fuel arrow defy prid e code agree test travel tide arrange tree discover castle decade
Promise { <pending> }
🐱‍🏍 wallet [object Object]
🐱‍🏍 firstAccount xion1wk2xlklngzsx8h8ge3hnkc8qsuwluyckejuqmw
🐱‍🏍 pub 3,62,125,216,34,147,148,170,195,89,134,27,105,155,189,71,149,60,56,26,42,115,78,136,164,20 2,255,229,251,206,254,159,227
🐱‍🏍 mnemonic action trial smoke happy wagon focus burger rapid aspect nominee fuel arrow defy prid e code agree test travel tide arrange tree discover castle decade
🐱‍🏍 firstAccount xion1wk2xlklngzsx8h8ge3hnkc8qsuwluyckejuqmw
db is connected
database is running succesfull
//?
//? 5
25e1fd7d5391d8f3806453222e53d5e57890b7f617fa637308dd8f3c8672f529
*/