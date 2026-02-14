const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// Import controllers - make sure these are exported correctly
const {
  getConversations,
  getConversationById,
  addMessage
} = require("../controllers/conversationController");

// All routes require authentication
router.use(protect);

// GET /api/conversations - Get all conversations
router.get("/", getConversations);

// GET /api/conversations/:id - Get single conversation
router.get("/:id", getConversationById);

// POST /api/conversations/:id/messages - Add message
router.post("/:id/messages", addMessage);

module.exports = router;