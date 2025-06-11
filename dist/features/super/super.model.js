"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const superSchema = new mongoose_1.default.Schema({
    name: String,
});
exports.SuperModel = mongoose_1.default.model('Super', superSchema);
