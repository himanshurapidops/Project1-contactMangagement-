const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  permissions: [String],  
  createdAt: { type: Date, default: Date.now },
  
});

module.exports = mongoose.model('Role', roleSchema);