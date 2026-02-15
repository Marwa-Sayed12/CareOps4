// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  service: { type: String, required: true },
  date: { type: Date, required: true },
  time: String,
  status: { type: String, default: "confirmed" },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);