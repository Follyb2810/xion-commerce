import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Document, Types } from 'mongoose';

export enum Roles {
  BUYER = 'buyer',
  SELLER = 'seller',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

export enum KYCStatus {
  NOT_SUBMITTED = 'not_submitted',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface IUser extends Document {
  _id: string;
  username?: string;
  email?: string;
  password?: string;
  phoneNumber?:string;
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
    submittedAt?: Date;
    verifiedAt?: Date;
    rejectedReason?: string;
  };
}

export interface IAuthRequest extends Request {
  user?: JwtPayload & { id: string; role: Roles[] };
}


// import { Request } from 'express';
// import { JwtPayload } from 'jsonwebtoken';
// import mongoose from 'mongoose';
// import { Types } from 'mongoose';

// export enum Roles {
//   BUYER = 'buyer',
//   SELLER = 'seller',
//   ADMIN = 'admin',
//   SUPERADMIN = 'superadmin',
// }

// export interface IUser extends mongoose.Document {
//     _id: string;
//     username?: string;
//     email?: string;
//     password?: string;
//     role: Roles[];
//     profile?: { 
//       name?: string;
//       bio?: string;
//       avatar?: string;
//     };
//     refreshToken?: string;
//     walletAddress?: string| null;
//     mnemonic?: string| null;
//     isVerified?: boolean;
//     createdAt: Date;
//     updatedAt: Date;
//     history?: {
//       paid: number,
//       item: Types.ObjectId,
//       timestamp:Date,
//       transactionHash:string
//     }[],
//      isAuthenticated: boolean;
//   isEmailVerified: boolean;
//   verificationToken?: string;
//   passwordResetToken?: string;
//   passwordResetExpires?: Date;
//   lastLogin?: Date;
//   kycStatus: {
//   type: String,
//   enum: ['not_submitted', 'pending', 'approved', 'rejected'],
//   default: 'not_submitted',
// },
// kycDocuments: [{
//   type: String,
// }],
// kycSubmittedAt: { type: Date, default: null },
// kycVerifiedAt: { type: Date, default: null },
// kycRejectedReason: { type: String, default: null },
//  kyc?: {
//     status: 'pending' | 'approved' | 'rejected';
//     documents: {
//       type: string;      // e.g. "passport", "driver_license"
//       url: string;       // document file URL or path
//       uploadedAt: Date;
//     }[];
//     submittedAt?: Date;
//     verifiedAt?: Date;
//     rejectedReason?: string;
//   };
//   failedLoginAttempts: number;
//   accountLocked: boolean;
//   accountUnlockTime?: Date;
//    isEmailVerifiedExpires?: Date,
//   verificationTokenExpires?: Date,
//   // isKYCVerified: boolean;
//   // kycData?: {
//   //   fullName: string;
//   //   dateOfBirth: Date;
//   //   documentType: string;
//   //   documentNumber: string;
//   //   documentImage: string;
//   //   verificationStatus: 'pending' | 'approved' | 'rejected';
//   // };
// }

// export interface IAuthRequest extends Request {
//     user?: JwtPayload & { id: string; role: Roles[] };
// }
