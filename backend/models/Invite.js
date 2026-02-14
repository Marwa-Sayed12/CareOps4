const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  workspace: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Workspace", 
    required: true 
  },
  invitedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  permissions: {
    inbox: { type: Boolean, default: true },
    bookings: { type: Boolean, default: true },
    forms: { type: Boolean, default: false },
    inventory: { type: Boolean, default: false },
    customers: { type: Boolean, default: false },
    reports: { type: Boolean, default: false }
  },
  token: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "expired"], 
    default: "pending" 
  },
  expiresAt: { type: Date, required: true },
  acceptedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Invite", inviteSchema);