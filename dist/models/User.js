"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const IUser_1 = require("../types/IUser");
const hash_1 = require("../utils/hash");
const userSchema = new mongoose_1.Schema({
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
        enum: Object.values(IUser_1.Roles),
        default: [IUser_1.Roles.BUYER],
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
            item: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' },
            timestamp: { type: Date, default: Date.now },
            transactionHash: { type: String, default: null },
        },
    ],
    kyc: {
        status: {
            type: String,
            enum: Object.values(IUser_1.KYCStatus),
            default: IUser_1.KYCStatus.NOT_SUBMITTED,
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
}, { timestamps: true });
userSchema.index({ role: 1 });
userSchema.index({ "profile.name": 1 });
userSchema.index({ email: 1, isVerified: 1 });
userSchema.pre('save', function (next) {
    if (!this.username && this.email) {
        this.username = this.email;
    }
    if (this.isModified('mnemonic') && this.mnemonic && this._id) {
        this.mnemonic = (0, hash_1.encryptKey)(this.mnemonic, this._id.toString());
    }
    next();
});
exports.default = mongoose_1.default.models.User || mongoose_1.default.model('User', userSchema);
