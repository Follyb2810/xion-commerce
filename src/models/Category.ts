import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  _id: string;
  name: string;
  description?: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const Category =mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
// export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);
