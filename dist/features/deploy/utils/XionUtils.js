"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XionUtils = void 0;
const deploy_type_1 = require("../deploy.type");
class XionUtils {
    static xionToUxion(amount) {
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount < 0) {
            throw new Error('Invalid amount: must be a positive number');
        }
        return Math.floor(numAmount * deploy_type_1.XION_CONSTANTS.UXION_DECIMALS).toString();
    }
    static uxionToXion(amount) {
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount < 0) {
            throw new Error('Invalid amount: must be a positive number');
        }
        return (numAmount / deploy_type_1.XION_CONSTANTS.UXION_DECIMALS).toString();
    }
    static isValidXionAddress(address) {
        return /^xion1[a-z0-9]{38,58}$/.test(address);
    }
    static isValidTxHash(hash) {
        return /^[A-F0-9]{64}$/i.test(hash);
    }
}
exports.XionUtils = XionUtils;
