import mongoose, { Schema } from 'mongoose';
import { IUser, Roles, KYCStatus } from '../types/IUser';
import { encryptKey } from '../utils/hash';

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isAuthenticated: { type: Boolean, default: false },

    role: {
      type: [String],
      enum: Object.values(Roles),
      default: [Roles.BUYER],
    },

    walletAddress: { type: String, sparse: true, default: null },
    phoneNumber: { type: String, sparse: true, default: null },
    mnemonic: { type: String, default: null },

    profile: {
      name: { type: String, default: null },
      bio: { type: String, default: null },
      avatar: {
        type: String,
        default: 'https://via.placeholder.com/150',
      },
    },

    refreshToken: { type: String, default: null },

    history: [
      {
        paid: { type: Number, default: 0 },
        item: { type: Schema.Types.ObjectId, ref: 'Product' },
        timestamp: { type: Date, default: Date.now },
        transactionHash: { type: String, default: null },
      },
    ],

    kyc: {
      status: {
        type: String,
        enum: Object.values(KYCStatus),
        default: KYCStatus.NOT_SUBMITTED,
      },
      documents: [
        {
          type: {
            type: String, 
          },
          url: String,
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
  

      submittedAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null },
      rejectedReason: { type: String, default: null },
    },

    verificationToken: String,
    verificationTokenExpires: Date,

    passwordResetToken: String,
    passwordResetExpires: Date,

    lastLogin: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    accountLocked: { type: Boolean, default: false },
    accountUnlockTime: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre<IUser>('save', function (next) {
  if (!this.username && this.email) {
    this.username = this.email;
  }
  if (this.isModified('mnemonic') && this.mnemonic && this._id) {
    this.mnemonic = encryptKey(this.mnemonic, this._id.toString());
  }
  next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);