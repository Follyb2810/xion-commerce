import mongoose, { Schema } from "mongoose";
import { IOrder, OrderStatus } from "../types/IOrder";

const orderSchema: Schema = new Schema<IOrder>(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    email: { type: String, default: null },
    fullName: { type: String, default: null },
    totalAmount: { type: Number, required: true },
    phoneNumber: { type: Number, required: true },
    payment: {
      amount: Number,
      txHash: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

