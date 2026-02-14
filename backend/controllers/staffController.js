const Booking = require("../models/Booking");
const Conversation = require("../models/Conversation");
const Form = require("../models/Form");
const Inventory = require("../models/Inventory");
const Lead = require("../models/Lead");

// @desc    Get staff dashboard stats
// @route   GET /api/staff/dashboard
// @access  Private (Staff only)
const getStaffDashboard = async (req, res) => {
  try {
    const workspaceId = req.user.workspace;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's bookings
    const todayBookings = await Booking.countDocuments({
      workspace: workspaceId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Get unread messages (conversations with unread messages from contacts)
    const conversations = await Conversation.find({ workspace: workspaceId });
    let unreadMessages = 0;
    
    conversations.forEach(conv => {
      const unreadFromContact = conv.messages.filter(msg => 
        msg.sender === 'contact' && !msg.readBy?.includes('staff')
      ).length;
      unreadMessages += unreadFromContact;
    });

    // Get pending forms
    const pendingForms = await Form.countDocuments({
      workspace: workspaceId,
      status: "pending"
    });

    // Get low stock items
    const lowStockItems = await Inventory.countDocuments({
      workspace: workspaceId,
      $expr: { $lte: ["$qty", "$threshold"] }
    });

    // Get recent activity
    const recentActivity = [];

    // Recent bookings
    const recentBookings = await Booking.find({ workspace: workspaceId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('lead', 'name');

    recentBookings.forEach(booking => {
      recentActivity.push({
        text: `New booking: ${booking.lead?.name || 'Customer'}`,
        time: formatTimeAgo(booking.createdAt),
        type: "booking"
      });
    });

    // Recent conversations
    const recentConversations = await Conversation.find({ workspace: workspaceId })
      .sort({ lastMessageAt: -1 })
      .limit(3)
      .populate('contact', 'fullName');

    recentConversations.forEach(conv => {
      const lastMsg = conv.messages[conv.messages.length - 1];
      if (lastMsg) {
        recentActivity.push({
          text: `Message from ${conv.contact?.fullName || 'Customer'}`,
          time: formatTimeAgo(lastMsg.timestamp),
          type: "message"
        });
      }
    });

    // Sort by most recent
    recentActivity.sort((a, b) => {
      if (a.time === "Just now") return -1;
      if (b.time === "Just now") return 1;
      return 0;
    });

    res.json({
      todayBookings,
      unreadMessages,
      pendingForms,
      lowStockItems,
      recentActivity: recentActivity.slice(0, 5)
    });

  } catch (err) {
    console.error("Staff dashboard error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Helper function
function formatTimeAgo(date) {
  const now = new Date();
  const diffMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
  
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hr ago`;
  return `${Math.floor(diffMinutes / 1440)} days ago`;
}

module.exports = {
  getStaffDashboard
};