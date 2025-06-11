import mongoose from "mongoose";
import { Types } from "mongoose";
import { IUser } from "./IUser";

export interface IChatMessage extends mongoose.Document {
    _id: string;
    sender: Types.ObjectId | IUser;
    receiver: Types.ObjectId | IUser;
    message: string;
    timestamp: Date;
  }