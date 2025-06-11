import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  _id: string;
  name: string;
  description?: string;
}