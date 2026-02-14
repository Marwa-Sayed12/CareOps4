const mongoose = require("mongoose");

const formSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    type: {
      type: String,
      default: "Intake",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Form", formSchema);
