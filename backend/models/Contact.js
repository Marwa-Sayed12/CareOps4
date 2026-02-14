const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    message: { type: String, default: "" },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    automationPaused: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
