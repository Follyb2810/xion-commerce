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
const axios_1 = __importDefault(require("axios"));
class Currency {
    static getCryptoPrice(coin) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const response = yield axios_1.default.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`);
                return (_b = (_a = response.data[coin]) === null || _a === void 0 ? void 0 : _a.usd) !== null && _b !== void 0 ? _b : null;
            }
            catch (error) {
                console.error(`Error fetching price for ${coin}:`, error);
                return null;
            }
        });
    }
    static convert(from, to, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const fromPrice = yield this.getCryptoPrice(from);
            const toPrice = yield this.getCryptoPrice(to);
            if (!fromPrice || !toPrice) {
                console.error("Invalid cryptocurrency symbol or price not found.");
                return null;
            }
            return (amount * fromPrice) / toPrice;
        });
    }
}
// Example Usage:
(() => __awaiter(void 0, void 0, void 0, function* () {
    const amount = 0.1; // BTC amount
    const result = yield Currency.convert("bitcoin", "binancecoin", amount);
    console.log(`Converted Amount: ${result} BNB`);
}))();
