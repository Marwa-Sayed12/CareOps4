const express = require("express");
const router = express.Router();
const { saveWorkspace, saveCommunication, saveContactForm, saveBooking, savePostBookingForms, saveInventory, addStaff } = require("../controllers/workspaceController");
const { protect } = require("../middleware/authMiddleware"); // optional, if you want JWT protection

router.post("/", protect, saveWorkspace); // Step 0
router.post("/communication", protect, saveCommunication); // Step 1
router.post("/contact-form", protect, saveContactForm); // Step 2
router.post("/booking", protect, saveBooking); // Step 3
router.post("/post-booking", protect, savePostBookingForms); // Step 4
router.post("/inventory", protect, saveInventory); // Step 5
router.post("/staff", protect, addStaff); // Step 6

module.exports = router;
