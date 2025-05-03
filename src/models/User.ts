import mongoose, { Schema } from 'mongoose';
import { IUser, Roles } from '../types/IUser';
import { encryptKey } from '../utils/hash';

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
      mnemonic: { type: String, unique: true, sparse: true, required: false, default: null },
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
    if (this.isModified('mnemonic') && this.mnemonic && this._id) {
      this.mnemonic = encryptKey(this.mnemonic, this._id.toString());
  }
    next();
});


export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
// mnemonic: { type: String, unique: true, index: { name: 'mnemonic_unique_index' }, sparse: true }
