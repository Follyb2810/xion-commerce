"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const repository_1 = __importDefault(require("./repository"));
class UserRepository extends repository_1.default {
}
exports.default = new UserRepository(User_1.default);
