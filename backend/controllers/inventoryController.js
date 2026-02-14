// controllers/inventoryController.js
const Inventory = require("../models/Inventory");

const getInventory = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    console.log("Workspace from user:", req.user.workspace);

    const items = await Inventory.find({
      workspace: req.user.workspace
    }); 

    console.log("Items found:", items);

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


const addInventory = async (req, res) => {
  try {
    const { items } = req.body; // expect an array
    if (!Array.isArray(items)) return res.status(400).json({ message: "Invalid data" });

    // Add workspace reference
    const inventoryItems = items.map((item) => ({
      ...item,
      workspace: req.user.workspace,

    }));
    console.log("USER WORKSPACE:", req.user.workspace);

    // Save all items
    const savedItems = await Inventory.insertMany(inventoryItems);
    res.status(201).json(savedItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getInventory, addInventory };
