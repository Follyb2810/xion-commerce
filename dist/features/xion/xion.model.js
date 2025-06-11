"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const xionSchema = new mongoose_1.default.Schema({
    name: String,
});
exports.XionModel = mongoose_1.default.model('Xion', xionSchema);
