"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repository_1 = __importDefault(require("../../common/contract/repository"));
const category_model_1 = require("./category.model");
class CategoryRepository extends repository_1.default {
}
exports.default = new CategoryRepository(category_model_1.Category);
