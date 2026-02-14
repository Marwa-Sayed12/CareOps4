const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    address: { type: String, required: true },
    timezone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    isActivated: { type: Boolean, default: false },
    activationDate: { type: Date },
    settings: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      autoReminders: { type: Boolean, default: true },
      reminderHours: { type: Number, default: 24 }
    },
    integrations: {
      email: {
        provider: { type: String },
        apiKey: { type: String },
        fromEmail: { type: String },
        isConnected: { type: Boolean, default: false }
      },
      sms: {
        provider: { type: String },
        apiKey: { type: String },
        fromNumber: { type: String },
        isConnected: { type: Boolean, default: false }
      }
    },
    onboardingStep: { 
      type: Number, 
      default: 1,
      min: 1,
      max: 8 
    },
    subscription: {
      plan: { type: String, enum: ["free", "basic", "pro"], default: "free" },
      status: { type: String, enum: ["active", "inactive", "trial"], default: "trial" },
      trialEndsAt: { type: Date }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workspace", workspaceSchema);