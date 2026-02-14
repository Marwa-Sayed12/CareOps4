// routes/inventoryRoutes.js
const express = require("express");
const router = express.Router();
const { getInventory, addInventory } = require("../controllers/inventoryController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getInventory);
router.post("/", protect, addInventory);

module.exports = router;
