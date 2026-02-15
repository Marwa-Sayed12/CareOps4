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
    const workspaceId = req.user?.workspace;
    
    if (!workspaceId) {
      console.log("No workspace found for user");
      return res.status(400).json({ 
        todayBookings: 0,
        unreadMessages: 0,
        pendingForms: 0,
        lowStockItems: 0,
        recentActivity: [] 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log("Fetching staff dashboard for workspace:", workspaceId.toString());

    // Initialize all values with defaults
    let todayBookings = 0;
    let unreadMessages = 0;
    let pendingForms = 0;
    let lowStockItems = 0;
    const recentActivity = [];

    // 1. Get today's bookings (with error handling)
    try {
      todayBookings = await Booking.countDocuments({
        workspace: workspaceId,
        date: { $gte: today, $lt: tomorrow }
      });
      console.log("Today's bookings:", todayBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err.message);
    }

    // 2. Get unread messages (with error handling)
    try {
      const conversations = await Conversation.find({ workspace: workspaceId });
      console.log("Found conversations:", conversations.length);
      
      conversations.forEach(conv => {
        if (conv.messages && Array.isArray(conv.messages)) {
          const unreadFromContact = conv.messages.filter(msg => 
            msg.sender === 'contact' && 
            (!msg.readBy || !msg.readBy.includes('staff'))
          ).length;
          unreadMessages += unreadFromContact;
        }
      });
      console.log("Unread messages:", unreadMessages);
    } catch (err) {
      console.error("Error fetching conversations:", err.message);
    }

    // 3. Get pending forms
    try {
      pendingForms = await Form.countDocuments({
        workspace: workspaceId,
        status: "pending"
      });
      console.log("Pending forms:", pendingForms);
    } catch (err) {
      console.error("Error fetching forms:", err.message);
    }

    // 4. Get low stock items
    try {
      lowStockItems = await Inventory.countDocuments({
        workspace: workspaceId,
        $expr: { $lte: ["$qty", "$threshold"] }
      });
      console.log("Low stock items:", lowStockItems);
    } catch (err) {
      console.error("Error fetching inventory:", err.message);
    }

    // 5. Get recent activity (with safe checks)
    try {
      // Recent bookings
      const recentBookings = await Booking.find({ workspace: workspaceId })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(); // Use lean() for better performance

      recentBookings.forEach(booking => {
        if (booking.createdAt) {
          recentActivity.push({
            text: `New booking: ${booking.customerName || 'Customer'}`,
            time: formatTimeAgo(booking.createdAt),
            type: "booking"
          });
        }
      });

      // Recent conversations
      const recentConversations = await Conversation.find({ workspace: workspaceId })
        .sort({ lastMessageAt: -1 })
        .limit(3)
        .populate('contact', 'fullName')
        .lean();

      recentConversations.forEach(conv => {
        if (conv.messages && conv.messages.length > 0) {
          const lastMsg = conv.messages[conv.messages.length - 1];
          if (lastMsg && lastMsg.timestamp) {
            recentActivity.push({
              text: `Message from ${conv.contact?.fullName || 'Customer'}`,
              time: formatTimeAgo(lastMsg.timestamp),
              type: "message"
            });
          }
        }
      });

      console.log("Recent activity items:", recentActivity.length);
    } catch (err) {
      console.error("Error fetching recent activity:", err.message);
    }

    // Sort recent activity (most recent first)
    recentActivity.sort((a, b) => {
      // Simple sort - assumes "Just now" is most recent
      if (a.time === "Just now") return -1;
      if (b.time === "Just now") return 1;
      return 0;
    });

    // ✅ ALWAYS return a valid response
    const response = {
      todayBookings: todayBookings || 0,
      unreadMessages: unreadMessages || 0,
      pendingForms: pendingForms || 0,
      lowStockItems: lowStockItems || 0,
      recentActivity: recentActivity.slice(0, 5)
    };

    console.log("Sending response:", response);
    res.json(response);

  } catch (err) {
    console.error("❌ Staff dashboard error:", err);
    // Return empty data instead of 500 error
    res.json({
      todayBookings: 0,
      unreadMessages: 0,
      pendingForms: 0,
      lowStockItems: 0,
      recentActivity: []
    });
  }
};

// Helper function with null check
function formatTimeAgo(date) {
  if (!date) return "Just now";
  
  try {
    const now = new Date();
    const diffMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hr ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  } catch (err) {
    return "Just now";
  }
}

module.exports = {
  getStaffDashboard
};