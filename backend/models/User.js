const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    businessName: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["admin", "staff"], 
      default: "staff" 
    },
    workspace: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Workspace", 
      required: true 
    },
    permissions: {
      inbox: { type: Boolean, default: false },
      bookings: { type: Boolean, default: false },
      forms: { type: Boolean, default: false },
      inventory: { type: Boolean, default: false },
      customers: { type: Boolean, default: false },
      reports: { type: Boolean, default: false }
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);