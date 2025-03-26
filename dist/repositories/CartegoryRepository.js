"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Category_1 = require("../models/Category");
const repository_1 = __importDefault(require("./repository"));
class CategoryRepository extends repository_1.default {
}
exports.default = new CategoryRepository(Category_1.Category);
