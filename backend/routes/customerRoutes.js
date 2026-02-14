const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const Booking = require("../models/Booking");

// ===========================
// Customer routes
// ===========================

// POST lead info
router.post("/customer/lead", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) return res.status(400).json({ message: "Name and Email required" });

    const lead = await Lead.create({ name, email, phone });
    res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

 

module.exports = router;
