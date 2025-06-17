import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import crypto from "crypto";
import { generateMnemonic, entropyToMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { WalletInfo, XION_CONSTANTS } from "../deploy.type";

class XionWallet {
  private readonly rpcUrl: string;
  private readonly chainId: string;
  private readonly mnemonic?: string;

  constructor(config?: {
    rpcUrl?: string;
    chainId?: string;
    mnemonic?: string;
  }) {
    this.rpcUrl =
      config?.rpcUrl ??
      process.env.XION_RPC_URL ??
      XION_CONSTANTS.DEFAULT_ENDPOINTS.RPC_URL;
    this.chainId =
      config?.chainId ??
      process.env.XION_CHAIN_ID ??
      XION_CONSTANTS.DEFAULT_ENDPOINTS.CHAIN_ID;
    this.mnemonic = config?.mnemonic ?? process.env.XION_MNEMONIC;
  }

  private static generateMnemonicFromEmail(email: string): string {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    const hash = crypto
      .createHash("sha256")
      .update(email.toLowerCase().trim())
      .digest("hex");
    const entropy = Buffer.from(hash, "hex").subarray(0, 16);
    return entropyToMnemonic(entropy, wordlist);
  }

  static async generateAddressFromEmail(email: string): Promise<WalletInfo> {
    const mnemonic = this.generateMnemonicFromEmail(email);
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "xion",
    });
    const [firstAccount] = await wallet.getAccounts();
    return { address: firstAccount.address, mnemonic };
  }

  static async generateNewWallet(): Promise<WalletInfo> {
    const mnemonic = generateMnemonic(wordlist, 128);
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "xion",
    });
    const [account] = await wallet.getAccounts();

    return { mnemonic, address: account.address };
  }

  async getMyXionAddress(): Promise<string> {
    if (!this.mnemonic) {
      throw new Error("No mnemonic set for this wallet.");
    }

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(this.mnemonic, {
      prefix: "xion",
    });
    const [firstAccount] = await wallet.getAccounts();

    if (!firstAccount?.address) {
      throw new Error("Failed to derive address from mnemonic");
    }

    return firstAccount.address;
  }

  static async generateXionWallet(): Promise<WalletInfo> {
    const wallet = await DirectSecp256k1HdWallet.generate(24, {
      prefix: "xion",
    });
    const [firstAccount] = await wallet.getAccounts();

    if (!firstAccount?.address) {
      throw new Error("Failed to generate wallet address");
    }

    return {
      mnemonic: wallet.mnemonic,
      address: firstAccount.address,
    };
  }

  static async getAddressFromXionMnemonic(mnemonic: string): Promise<string> {
    if (!mnemonic || mnemonic.trim().split(" ").length < 12) {
      throw new Error("Invalid mnemonic phrase");
    }

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic.trim(), {
      prefix: "xion",
    });
    const [firstAccount] = await wallet.getAccounts();

    if (!firstAccount?.address) {
      throw new Error("Failed to derive address from mnemonic");
    }

    return firstAccount.address;
  }

  static isValidMnemonic(mnemonic: string): boolean {
    try {
      const words = mnemonic.trim().split(" ");
      return words.length >= 12 && words.length <= 24 && words.length % 3 === 0;
    } catch {
      return false;
    }
  }
}

export default XionWallet;
