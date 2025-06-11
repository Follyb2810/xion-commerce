import mongoose from 'mongoose';

const superSchema = new mongoose.Schema({
  name: String,
});

export const SuperModel = mongoose.model('Super', superSchema);
