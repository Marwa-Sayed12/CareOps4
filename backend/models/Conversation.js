const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  sender: { 
    type: String, 
    enum: ["system", "staff", "contact"],
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  readBy: [{
    type: String,
    enum: ["staff", "contact"],
    default: []
  }]
});

const conversationSchema = new mongoose.Schema({
  contact: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Contact",  // Changed from "Lead" to "Contact"
    required: true 
  },
  workspace: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Workspace", 
    required: true 
  },
  messages: [messageSchema],
  status: { 
    type: String, 
    enum: ["new", "active", "resolved", "archived"], 
    default: "new" 
  },
  form: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Form" 
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastMessageAt when a new message is added
conversationSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
  }
  next();
});

module.exports = mongoose.model("Conversation", conversationSchema);