const express = require("express");
const router = express.Router();
const {
  getStaffMembers,
  createStaff,
  deleteStaff,
  updateStaffPermissions,
  inviteStaff
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Staff management routes
router.get("/staff", getStaffMembers);
router.post("/create-staff", createStaff);
router.post("/invite-staff", inviteStaff);
router.delete("/staff/:id", deleteStaff);
router.patch("/staff/:id/permissions", updateStaffPermissions);

module.exports = router;