import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Role name is required"], 
    trim: true, 
    unique: true,
    minlength: [2, "Role name must be at least 2 characters long"], 
    maxlength: [50, "Role name cannot exceed 50 characters"]
  },

  permissions: [{ 
    type: String, 
    trim: true, 
    required: [true, "At least one permission is required"] 
  }],  

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const roleModel = mongoose.model("Role", roleSchema);
