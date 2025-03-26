"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repository_1 = __importDefault(require("./repository"));
const Cart_1 = __importDefault(require("../models/Cart"));
class CartRepository extends repository_1.default {
}
exports.default = new CartRepository(Cart_1.default);
