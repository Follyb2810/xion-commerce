"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const order_model_1 = __importDefault(require("./order.model"));
const repository_1 = __importDefault(require("./../../common/contract/repository"));
class OrderRepository extends repository_1.default {
}
exports.default = new OrderRepository(order_model_1.default);
