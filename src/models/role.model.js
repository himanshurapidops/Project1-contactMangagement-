import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  permissions: [String],  
  createdAt: { type: Date, default: Date.now },
  
});

export const roleModel = mongoose.model('Role', roleSchema);