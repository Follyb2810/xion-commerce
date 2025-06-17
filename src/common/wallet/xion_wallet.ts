import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import crypto from "crypto";
import { generateMnemonic, entropyToMnemonic } from "@scure/bip39";
import bip39 from "bip39";
import { wordlist } from "@scure/bip39/wordlists/english";


class XionWallet {
  private readonly XION_RPC_URL: string;
  private readonly CHAIN_ID: string;
  private readonly MNEMONIC?: string;

  constructor() {
      this.XION_RPC_URL = process.env.XION_RPC_URL ?? "https://rpc.xion-testnet-2.burnt.com";
      this.CHAIN_ID = process.env.XION_CHAIN_ID ?? "xion-testnet-2";
      this.MNEMONIC = process.env.XION_MNEMONIC;
  }

  private static generateMnemonicFromEmail(email: string): string {
      const hash = crypto.createHash("sha256").update(email).digest("hex");
      const entropy = Buffer.from(hash, "hex").subarray(0, 16);
      return entropyToMnemonic(entropy, wordlist);
  }

  static async generateAddressFromEmail(email: string) {
      const mnemonic = this.generateMnemonicFromEmail(email);
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "xion" });
      const [firstAccount] = await wallet.getAccounts();
      return { address: firstAccount.address, mnemonic };
  }

  static async generateNewWallet() {
      const mnemonic = generateMnemonic(wordlist, 128);
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "xion" });
      const [account] = await wallet.getAccounts();

      return { mnemonic, address: account.address };
  }

  async getMyXionAddress(): Promise<string | null> {
      if (!this.MNEMONIC) throw new Error("No mnemonic set for this wallet.");
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(this.MNEMONIC, { prefix: "xion" });
      const [firstAccount] = await wallet.getAccounts();
      return firstAccount?.address ?? null;
  }
  

  static async generateXionWallet() {
      const wallet = await DirectSecp256k1HdWallet.generate(24, { prefix: "xion" });
      const [firstAccount] = await wallet.getAccounts();

      return { mnemonic: wallet.mnemonic, address: firstAccount?.address ?? null };
  }

  static async getAddressFromXionMnemonic(mnemonic: string): Promise<string | null> {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "xion" });
      const [firstAccount] = await wallet.getAccounts();
      return firstAccount?.address ?? null;
  }
}

export default XionWallet;

