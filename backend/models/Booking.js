const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  service: { type: String, required: true },
  date: { type: Date, required: true },
  time: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
 