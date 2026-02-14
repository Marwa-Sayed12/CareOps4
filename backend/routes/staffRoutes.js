const express = require("express");
const router = express.Router();
const { getStaffDashboard } = require("../controllers/staffController");
const { protect } = require("../middleware/authMiddleware");

// All staff routes require authentication
router.use(protect);

// Staff dashboard
router.get("/dashboard", getStaffDashboard);

module.exports = router;