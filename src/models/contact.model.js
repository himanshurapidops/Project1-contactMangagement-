const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"], 
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },

  email: [{ 
    type: String, 
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
  }],

  phone: { 
    type: String, 
    trim: true,
    match: [/^\+?\d{10,15}$/, "Invalid phone number format"] 
  },

  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, "Created by is required"] 
  },

  editedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});



export const contactModel = mongoose.model('Contact', contactSchema);
