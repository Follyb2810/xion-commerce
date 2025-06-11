import mongoose from 'mongoose';

const xionSchema = new mongoose.Schema({
  name: String,
});

export const XionModel = mongoose.model('Xion', xionSchema);
