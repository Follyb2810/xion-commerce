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
const deploy_type_1 = require("../deploy.type");
class XionWallet {
    constructor(config) {
        var _a, _b, _c, _d, _e;
        this.rpcUrl =
            (_b = (_a = config === null || config === void 0 ? void 0 : config.rpcUrl) !== null && _a !== void 0 ? _a : process.env.XION_RPC_URL) !== null && _b !== void 0 ? _b : deploy_type_1.XION_CONSTANTS.DEFAULT_ENDPOINTS.RPC_URL;
        this.chainId =
            (_d = (_c = config === null || config === void 0 ? void 0 : config.chainId) !== null && _c !== void 0 ? _c : process.env.XION_CHAIN_ID) !== null && _d !== void 0 ? _d : deploy_type_1.XION_CONSTANTS.DEFAULT_ENDPOINTS.CHAIN_ID;
        this.mnemonic = (_e = config === null || config === void 0 ? void 0 : config.mnemonic) !== null && _e !== void 0 ? _e : process.env.XION_MNEMONIC;
    }
    static generateMnemonicFromEmail(email) {
        if (!email || !email.includes("@")) {
            throw new Error("Invalid email address");
        }
        const hash = crypto_1.default
            .createHash("sha256")
            .update(email.toLowerCase().trim())
            .digest("hex");
        const entropy = Buffer.from(hash, "hex").subarray(0, 16);
        return (0, bip39_1.entropyToMnemonic)(entropy, english_1.wordlist);
    }
    static generateAddressFromEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const mnemonic = this.generateMnemonicFromEmail(email);
            const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
                prefix: "xion",
            });
            const [firstAccount] = yield wallet.getAccounts();
            return { address: firstAccount.address, mnemonic };
        });
    }
    static generateNewWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            const mnemonic = (0, bip39_1.generateMnemonic)(english_1.wordlist, 128);
            const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
                prefix: "xion",
            });
            const [account] = yield wallet.getAccounts();
            return { mnemonic, address: account.address };
        });
    }
    getMyXionAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mnemonic) {
                throw new Error("No mnemonic set for this wallet.");
            }
            const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(this.mnemonic, {
                prefix: "xion",
            });
            const [firstAccount] = yield wallet.getAccounts();
            if (!(firstAccount === null || firstAccount === void 0 ? void 0 : firstAccount.address)) {
                throw new Error("Failed to derive address from mnemonic");
            }
            return firstAccount.address;
        });
    }
    static generateXionWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.generate(24, {
                prefix: "xion",
            });
            const [firstAccount] = yield wallet.getAccounts();
            if (!(firstAccount === null || firstAccount === void 0 ? void 0 : firstAccount.address)) {
                throw new Error("Failed to generate wallet address");
            }
            return {
                mnemonic: wallet.mnemonic,
                address: firstAccount.address,
            };
        });
    }
    static getAddressFromXionMnemonic(mnemonic) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mnemonic || mnemonic.trim().split(" ").length < 12) {
                throw new Error("Invalid mnemonic phrase");
            }
            const wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(mnemonic.trim(), {
                prefix: "xion",
            });
            const [firstAccount] = yield wallet.getAccounts();
            if (!(firstAccount === null || firstAccount === void 0 ? void 0 : firstAccount.address)) {
                throw new Error("Failed to derive address from mnemonic");
            }
            return firstAccount.address;
        });
    }
    static isValidMnemonic(mnemonic) {
        try {
            const words = mnemonic.trim().split(" ");
            return words.length >= 12 && words.length <= 24 && words.length % 3 === 0;
        }
        catch (_a) {
            return false;
        }
    }
}
exports.default = XionWallet;
