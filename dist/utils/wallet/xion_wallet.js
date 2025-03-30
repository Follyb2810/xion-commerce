"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const proto_signing_1 = require("@cosmjs/proto-signing");
const crypto_1 = __importDefault(require("crypto"));
const bip39_1 = require("@scure/bip39");
const english_1 = require("@scure/bip39/wordlists/english");
class XionWallet {
    constructor() {
        var _a, _b;
        this.XION_RPC_URL = (_a = process.env.XION_RPC_URL) !== null && _a !== void 0 ? _a : "https://rpc.xion-testnet-2.burnt.com";
        this.CHAIN_ID = (_b = process.env.XION_CHAIN_ID) !== null && _b !== void 0 ? _b : "xion-testnet-2";
        this.MNEMONIC = process.env.XION_MNEMONIC;
    }
    static generateMnemonicFromEmail(email) {
        const hash = crypto_1.default.createHash("sha256").update(email).digest("hex");
        const entropy = Buffer.from(hash, "hex").subarray(0, 16);
        return (0, bip39_1.entropyToMnemonic)(entropy, english_1.wordlist);
        // return bip39.entropyToMnemonic(); // 32 hex chars = 16 bytes entropy
        // return bip39.entropyToMnemonic(hash.slice(0, 32)); // 32 hex chars = 16 bytes entropy
        // return entropyToMnemonic(hash.slice(0, 32), wordlist); // 32 hex chars = 16 bytes entropy
    }
    static generateAddressFromEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const mnemonic = this.generateMnemonicFromEmail(email);
            const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "xion" });
            const [firstAccount] = yield wallet.getAccounts();
            return { address: firstAccount.address, mnemonic };
        });
    }
    static generateNewWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            const mnemonic = (0, bip39_1.generateMnemonic)(english_1.wordlist, 128);
            const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "xion" });
            const [account] = yield wallet.getAccounts();
            return { mnemonic, address: account.address };
        });
    }
    getMyXionAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.MNEMONIC)
                throw new Error("No mnemonic set for this wallet.");
            const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(this.MNEMONIC, { prefix: "xion" });
            const [firstAccount] = yield wallet.getAccounts();
            return (_a = firstAccount === null || firstAccount === void 0 ? void 0 : firstAccount.address) !== null && _a !== void 0 ? _a : null;
        });
    }
    static generateXionWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.generate(24, { prefix: "xion" });
            const [firstAccount] = yield wallet.getAccounts();
            return { mnemonic: wallet.mnemonic, address: (_a = firstAccount === null || firstAccount === void 0 ? void 0 : firstAccount.address) !== null && _a !== void 0 ? _a : null };
        });
    }
    static getAddressFromXionMnemonic(mnemonic) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "xion" });
            const [firstAccount] = yield wallet.getAccounts();
            return (_a = firstAccount === null || firstAccount === void 0 ? void 0 : firstAccount.address) !== null && _a !== void 0 ? _a : null;
        });
    }
}
exports.default = XionWallet;
