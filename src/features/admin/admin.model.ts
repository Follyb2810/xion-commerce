import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: String,
});

export const AdminModel = mongoose.model('Admin', adminSchema);
