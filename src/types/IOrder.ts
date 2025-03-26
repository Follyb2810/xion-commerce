import mongoose, { Document, Types } from "mongoose";
import { IUser } from "./IUser";

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  price: number; 
}

export enum OrderStatus {
  PENDING = "pending",
  RELEASE = "release",
  DELIVERED = "delivered",
  CANCELED = "canceled",
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  buyer: Types.ObjectId | IUser;
  seller: Types.ObjectId | IUser;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus
  payment: {
    amount: number;
    txHash?: string;
  };
}




