const express = require("express");
const router = express.Router();
const { getLeads, createLead, deleteLead, createPublicLead } = require("../controllers/leadController");
const { protect } = require("../middleware/authMiddleware");

// Protected routes (admin dashboard)
router.get("/", protect, getLeads);
router.post("/", protect, createLead);
router.delete("/:id", protect, deleteLead);

// Public route (for customer form)
router.post("/public", createPublicLead);

module.exports = router;
