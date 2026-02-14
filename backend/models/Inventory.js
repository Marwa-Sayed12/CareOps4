// models/Inventory.js
const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  qty: { type: Number, default: 0 },
  threshold: { type: Number, default: 0 },
  unit: { type: String, default: "pcs" },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
});
 
module.exports = mongoose.model("Inventory", inventorySchema);
