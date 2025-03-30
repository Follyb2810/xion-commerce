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
const xion_connect_1 = __importDefault(require("./xion-connect"));
class XionQueries {
    constructor() {
        this.xionConnect = new xion_connect_1.default();
    }
    static xionToUxion(amount) {
        return Math.floor(Number(amount) * 1e6).toString();
    }
    static uxionToXion(amount) {
        return (Number(amount) / 1e6).toString();
    }
    getBalance(address_1) {
        return __awaiter(this, arguments, void 0, function* (address, denom = "uxion") {
            const client = yield this.xionConnect.getQueryClient();
            const balance = yield client.getBalance(address, denom);
            return XionQueries.uxionToXion(balance.amount);
        });
    }
    getAccount(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.xionConnect.getQueryClient();
            return client.getAccount(address);
        });
    }
    getTransaction(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.xionConnect.getQueryClient();
            return client.getTx(hash);
        });
    }
    getBlock(height) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.xionConnect.getQueryClient();
            return height ? client.getBlock(height) : client.getBlock();
        });
    }
    queryContract(contractAddress, queryMsg) {
        return __awaiter(this, void 0, void 0, function* () {
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
}
exports.default = XionQueries;
