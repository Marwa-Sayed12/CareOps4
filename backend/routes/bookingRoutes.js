const express = require("express");
const router = express.Router();
const { createBooking, getBookings } = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

// Public booking: customer can book without login
router.post("/", createBooking);

// Admin dashboard: login required
router.get("/", protect, getBookings);

module.exports = router;
