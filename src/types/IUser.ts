import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Document, Types } from "mongoose";

export enum Roles {
  BUYER = "buyer",
  SELLER = "seller",
  ADMIN = "admin",
  SUPERADMIN = "superadmin",
}

export enum KYCStatus {
  NOT_SUBMITTED = "not_submitted",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface IUser extends Document {
  _id: string;
  username?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  role: Roles[];
  walletAddress?: string | null;
  mnemonic?: string | null;
  refreshToken?: string;
  isEmailVerified: boolean;
  isAuthenticated: boolean;
  profile?: {
    name?: string;
    bio?: string;
    avatar?: string;
  };
  history?: {
    paid: number;
    item: Types.ObjectId;
    timestamp: Date;
    transactionHash: string;
  }[];
  lastLogin?: Date;
  failedLoginAttempts: number;
  accountLocked: boolean;
  accountUnlockTime?: Date;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isVerified?: boolean;
  kyc?: {
    status: KYCStatus;
    documents: {
      type: string;
      url: string;
      uploadedAt: Date;
    }[];
    verifiedAt?: Date | null;
    submittedAt?: Date | null;
    rejectedReason?: string | null;
  };
}

export interface IAuthRequest extends Request {
  user?: JwtPayload & { id: string; role: Roles[] };
}
