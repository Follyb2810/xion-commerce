import mongoose, { Schema } from "mongoose";
import { IProduct } from "../types/IProduct";

const productSchema: Schema = new Schema<IProduct>(
    {
        title: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        category: { type: Schema.Types.ObjectId, ref: 'Category' },
        seller: { type: Schema.Types.ObjectId, ref: 'User',required: true },
        stock: { type: Number, default: 0 },
        address: { type: String, required: true },
        mapping_location: {
            type: { lat: Number, lng: Number },
            required: true
        },
        image_of_land: { type: String, required: true },
        size_of_land: { type: String, required: true },
        document_of_land: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
