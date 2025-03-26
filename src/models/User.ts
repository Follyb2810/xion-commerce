import mongoose, { Schema } from 'mongoose';
import { IUser, Roles } from '../types/IUser';

const userSchema: Schema<IUser> = new Schema<IUser>(
    {
      username: { type: String, unique: true, sparse: true },
      email: { type: String, required: false, unique: true, sparse: true },
      password: { type: String, required: false, default: null },
      isVerified: { type: Boolean, required: false, default: false },
      role: { type: [String], enum: Object.values(Roles), default: [Roles.BUYER] },
      profile: {
        name: { type: String, default: null },
        bio: { type: String, default: null },
        avatar: { type: String, default: null },
      },
      walletAddress: { type: String, unique: true, sparse: true, required: false, default: null },
      refreshToken: { type: String, default: null },
      history: [{
        paid: { type: Number, default: 0 },
        item: { type: Schema.Types.ObjectId, ref: 'Product' },
        timestamp: { type: Date, default: Date.now },
        transactionHash: { type: String, default: null },
      }]
    },
    { timestamps: true }
);

userSchema.pre<IUser>('save', function (next) {
    if (!this.username && this.email) {
        this.username = this.email;
    }
    next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
