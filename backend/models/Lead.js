const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  source: { type: String, default: "Website Form" },
  status: { type: String, default: "New" }, // New, Contacted, Converted
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Lead", leadSchema);
