"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xion_wallet_1 = __importDefault(require("../../common/wallet/xion_wallet"));
class DeployEscrowContract {
    constructor() {
        this.xionWallet = new xion_wallet_1.default();
    }
    static deploy() {
    }
}
