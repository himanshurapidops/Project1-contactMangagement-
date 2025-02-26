const mongoose = require('mongoose');
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  permissions: [String],
  createdAt: { type: Date, default: Date.now }
});

export const teamModel = mongoose.model('Team', teamSchema);