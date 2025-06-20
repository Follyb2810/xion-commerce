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
const XionConnect_1 = __importDefault(require("./XionConnect"));
const XionUtils_1 = require("./XionUtils");
const deploy_type_1 = require("../deploy.type");
class XionQueries {
    constructor(xionConnect) {
        this.xionConnect = xionConnect !== null && xionConnect !== void 0 ? xionConnect : new XionConnect_1.default();
    }
    getBalance(address_1) {
        return __awaiter(this, arguments, void 0, function* (address, denom = deploy_type_1.XION_CONSTANTS.DEFAULT_DENOM) {
            if (!XionUtils_1.XionUtils.isValidXionAddress(address)) {
                throw new Error(`Invalid Xion address: ${address}`);
            }
            const client = yield this.xionConnect.getQueryClient();
            const balance = yield client.getBalance(address, denom);
            return XionUtils_1.XionUtils.uxionToXion(balance.amount);
        });
    }
    getAccount(address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!XionUtils_1.XionUtils.isValidXionAddress(address)) {
                throw new Error(`Invalid Xion address: ${address}`);
            }
            const client = yield this.xionConnect.getQueryClient();
            return client.getAccount(address);
        });
    }
    getTransaction(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!XionUtils_1.XionUtils.isValidTxHash(hash)) {
                throw new Error(`Invalid transaction hash: ${hash}`);
            }
            const client = yield this.xionConnect.getQueryClient();
            return client.getTx(hash);
        });
    }
    getBlock(height) {
        return __awaiter(this, void 0, void 0, function* () {
            if (height !== undefined && (!Number.isInteger(height) || height < 0)) {
                throw new Error(`Invalid block height: ${height}`);
            }
            const client = yield this.xionConnect.getQueryClient();
            return height ? client.getBlock(height) : client.getBlock();
        });
    }
    queryContract(contractAddress, queryMsg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!XionUtils_1.XionUtils.isValidXionAddress(contractAddress)) {
                throw new Error(`Invalid contract address: ${contractAddress}`);
            }
            const client = yield this.xionConnect.getQueryCosmWasmClient();
            return client.queryContractSmart(contractAddress, queryMsg);
        });
    }
    getChainHeight() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.xionConnect.getQueryClient();
            return client.getHeight();
        });
    }
    getAllBalances(address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!XionUtils_1.XionUtils.isValidXionAddress(address)) {
                throw new Error(`Invalid Xion address: ${address}`);
            }
            const client = yield this.xionConnect.getQueryClient();
            return client.getAllBalances(address);
        });
    }
    /**
     * Get chain information
     */
    getChainInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.xionConnect.getQueryClient();
            const [height, block] = yield Promise.all([
                client.getHeight(),
                client.getBlock()
            ]);
            return {
                height,
                chainId: block.header.chainId,
                blockTime: block.header.time
            };
        });
    }
}
XionQueries.xionToUxion = XionUtils_1.XionUtils.xionToUxion;
XionQueries.uxionToXion = XionUtils_1.XionUtils.uxionToXion;
exports.default = XionQueries;
