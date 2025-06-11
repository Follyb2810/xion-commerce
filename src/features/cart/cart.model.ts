import mongoose, { Schema, Document, Types } from "mongoose";
import { ICart } from "../../common/types/ICart";

// created_at:{type:Date,default:Date.now}
const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    total: { type: Number, default: 0 },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number , required:false, default:1 },
        price: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);


