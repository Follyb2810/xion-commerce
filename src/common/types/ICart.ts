import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICart extends Document {
  user: Types.ObjectId;
  total: number;
  items: {
    product: Types.ObjectId;
    quantity: number;
    price: number;
  }[];
}