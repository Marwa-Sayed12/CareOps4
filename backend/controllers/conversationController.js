const Conversation = require("../models/Conversation");

// ===============================
// GET /api/conversations - WORKSPACE ISOLATED
// ===============================
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      workspace: req.user.workspace
    })
    .populate("contact", "fullName email phone")
    .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error("GET CONVERSATIONS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET /api/conversations/:id - WORKSPACE ISOLATED
// ===============================
const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      workspace: req.user.workspace
    }).populate("contact", "fullName email phone");

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.json(conversation);
  } catch (err) {
    console.error("GET CONVERSATION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// POST /api/conversations/:id/messages - WORKSPACE ISOLATED
// ===============================
const addMessage = async (req, res) => {
  try {
    const { content, sender } = req.body;

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      workspace: req.user.workspace
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    conversation.messages.push({
      content,
      sender,
      timestamp: new Date(),
      readBy: sender === "staff" ? ["staff"] : []
    });

    conversation.lastMessageAt = new Date();
    if (conversation.status === "new") {
      conversation.status = "active";
    }

    await conversation.save();
    await conversation.populate("contact", "fullName email phone");

    res.json(conversation);
  } catch (err) {
    console.error("ADD MESSAGE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getConversations,
  getConversationById,
  addMessage
};