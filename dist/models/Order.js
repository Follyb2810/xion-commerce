"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const IOrder_1 = require("../types/IOrder");
const orderSchema = new mongoose_1.Schema({
    buyer: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            product: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true },
        },
    ],
    status: { type: String, enum: Object.values(IOrder_1.OrderStatus), default: IOrder_1.OrderStatus.PENDING },
    email: { type: String, default: null },
    fullName: { type: String, default: null },
    totalAmount: { type: Number, required: true },
    phoneNumber: { type: Number, required: true },
    payment: {
        amount: Number,
        txHash: String,
    },
}, { timestamps: true });
orderSchema.index({ buyer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ "payment.txHash": 1 });
exports.default = mongoose_1.default.models.Order || mongoose_1.default.model("Order", orderSchema);
