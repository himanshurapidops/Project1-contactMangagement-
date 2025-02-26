import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Team name is required"], 
    trim: true, 
    unique: true,
    minlength: [2, "Team name must be at least 2 characters long"], 
    maxlength: [50, "Team name cannot exceed 50 characters"]
  },

  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, "Created by is required"]
  },

  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User"
  }],

  permissions: [{ 
    type: String, 
    trim: true 
  }],

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const teamModel = mongoose.model("Team", teamSchema);
