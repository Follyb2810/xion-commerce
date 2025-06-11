import mongoose from 'mongoose';

const authSchema = new mongoose.Schema({
  name: String,
});

export const AuthModel = mongoose.model('Auth', authSchema);
