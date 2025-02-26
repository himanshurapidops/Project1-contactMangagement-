const mongoose = require('mongoose'); 
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: [{ type: String }],
  phone: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export const contactModel = mongoose.model('Contact', contactSchema);
