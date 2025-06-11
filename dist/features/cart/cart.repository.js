"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repository_1 = __importDefault(require("./../../common/contract/repository"));
const cart_model_1 = __importDefault(require("./cart.model"));
class CartRepository extends repository_1.default {
}
exports.default = new CartRepository(cart_model_1.default);
