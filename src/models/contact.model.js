import mongoose from "mongoose";
const contactSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"], 
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },

  email: [ {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  }],

  phone: {
    type: String,
    trim: true,
    match: [/^\+?\d{10,15}$/, 'Invalid phone number format'],
    required: [true, 'Phone number is required']
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

  
},{
  timestamps  : true
});

contactSchema.pre("save", async function (next) {

  if (this.isNew || this.isModified("email")) {  

    if (this.email && this.email.length > 0) {

      this.email = [...new Set(this.email)];
 
      const existingContact = await contactModel.findOne({

        email: { $in: this.email },

      });

      if (existingContact) {

        return next(

          new CustomHttpError(400, "Email already exists in certain contact")

        );

      }

    }

  }

  next();

});

 

export const contactModel = mongoose.model('Contact', contactSchema);
