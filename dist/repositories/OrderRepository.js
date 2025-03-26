"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Order_1 = __importDefault(require("../models/Order"));
const repository_1 = __importDefault(require("./repository"));
class OrderRepository extends repository_1.default {
}
exports.default = new OrderRepository(Order_1.default);
