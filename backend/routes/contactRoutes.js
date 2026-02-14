const express = require("express");
const { createContact, getContacts } = require("../controllers/contactController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, createContact); // public

module.exports = router;
