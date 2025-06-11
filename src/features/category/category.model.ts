import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "../../common/types/ICategory";


const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const Category =mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
