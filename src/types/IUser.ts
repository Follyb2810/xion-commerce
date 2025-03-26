import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Types } from 'mongoose';

export enum Roles {
  BUYER = 'buyer',
  SELLER = 'seller',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

export interface IUser extends mongoose.Document {
    _id: string;
    username?: string;
    email?: string;
    password?: string;
    role: Roles[];
    profile?: { 
      name?: string;
      bio?: string;
      avatar?: string;
    };
    refreshToken?: string;
    walletAddress?: string| null;
    isVerified?: boolean;
    createdAt: Date;
    updatedAt: Date;
    history?: {
      paid: number,
      item: Types.ObjectId,
      timestamp:Date,
      transactionHash:string
    }[]
}

export interface IAuthRequest extends Request {
    user?: JwtPayload & { id: string; role: Roles[] };
}
