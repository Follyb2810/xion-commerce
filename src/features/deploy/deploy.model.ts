import mongoose from 'mongoose';

const deploySchema = new mongoose.Schema({
  name: String,
});

export const DeployModel = mongoose.model('Deploy', deploySchema);
