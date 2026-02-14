const Booking = require("../models/Booking");
const Form = require("../models/Form");
const Inventory = require("../models/Inventory");
const Lead = require("../models/Lead");
const Conversation = require("../models/Conversation");
const Contact = require("../models/Contact");

// ===============================
// GET /api/dashboard/overview - WORKSPACE ISOLATED
// ===============================
const getDashboardStats = async (req, res) => {
  try {
    const workspaceId = req.user.workspace;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all counts for this workspace only
    const [
      todaysBookings,
      totalBookings,
      unreadConversations,
      pendingForms,
      lowStock,
      totalLeads,
      totalContacts
    ] = await Promise.all([
      // Today's Bookings
      Booking.countDocuments({
        workspace: workspaceId,
        date: { $gte: today, $lt: tomorrow }
      }),
      
      // Total Bookings
      Booking.countDocuments({ workspace: workspaceId }),
      
      // Unread Conversations (status = 'new')
      Conversation.countDocuments({ 
        workspace: workspaceId,
        status: "new"
      }),
      
      // Pending Forms
      Form.countDocuments({
        workspace: workspaceId,
        status: "pending"
      }),
      
      // Low Stock Items
      Inventory.countDocuments({
        workspace: workspaceId,
        $expr: { $lte: ["$qty", "$threshold"] }
      }),
      
      // Total Leads
      Lead.countDocuments({ workspace: workspaceId }),
      
      // Total Contacts
      Contact.countDocuments({ workspace: workspaceId })
    ]);

    // Get recent activity (limited to this workspace)
    const recentActivity = [];

    // Recent conversations
    const recentConversations = await Conversation.find({ workspace: workspaceId })
      .sort({ lastMessageAt: -1 })
      .limit(3)
      .populate("contact", "fullName");

    recentConversations.forEach(conv => {
      if (conv.messages.length > 0) {
        const lastMsg = conv.messages[conv.messages.length - 1];
        recentActivity.push({
          text: `Message from ${conv.contact?.fullName || "Someone"}`,
          time: formatTimeAgo(lastMsg.timestamp),
          type: "message"
        });
      }
    });

    // Recent leads
    const recentLeads = await Lead.find({ workspace: workspaceId })
      .sort({ createdAt: -1 })
      .limit(3);

    recentLeads.forEach(lead => {
      recentActivity.push({
        text: `New lead: ${lead.name}`,
        time: formatTimeAgo(lead.createdAt),
        type: "lead"
      });
    });

    // Sort by time (most recent first)
    recentActivity.sort((a, b) => {
      if (a.time === "Just now") return -1;
      if (b.time === "Just now") return 1;
      return 0;
    });

    res.json({
      stats: {
        todaysBookings,
        totalBookings,
        unreadMessages: unreadConversations,
        pendingForms,
        lowStock,
        totalLeads,
        totalContacts
      },
      recentActivity: recentActivity.slice(0, 6)
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: error.message });
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

module.exports = { getDashboardStats };