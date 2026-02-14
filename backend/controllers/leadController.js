const Lead = require("../models/Lead");
const Booking = require("../models/Booking");
const Form = require("../models/Form");
const Contact = require("../models/Contact");
const Conversation = require("../models/Conversation");
const Workspace = require("../models/Workspace");
const {
  sendNewLeadNotification,
  sendCustomerAutoReply
} = require("../services/emailService");

// =======================================
// PUBLIC ROUTE - Website Form Submission
// =======================================
const createPublicLead = async (req, res) => {
  try {
    console.log("📝 Public lead request received");
    console.log("Request body:", req.body);

    const { name, fullName, email, phone, message, source, workspaceId } = req.body;
    const customerName = fullName || name;

    if (!customerName || !email) {
      return res.status(400).json({ message: "Name and Email required" });
    }

    // Find workspace
    const workspace = workspaceId
      ? await Workspace.findById(workspaceId)
      : await Workspace.findOne({ isActivated: true });

    if (!workspace) {
      return res.status(400).json({ message: "No workspace found" });
    }

    // 1️⃣ Create Contact
    let contact = await Contact.findOne({
      email,
      workspace: workspace._id,
    });

    if (!contact) {
      contact = await Contact.create({
        fullName: customerName,
        email,
        phone: phone || "",
        message: message || source || "Website form submission",
        workspace: workspace._id,
        source: "Website Form"
      });
    }

    // 2️⃣ Create Conversation
    const conversation = await Conversation.create({
      contact: contact._id,
      workspace: workspace._id,
      messages: [
        {
          sender: "system",
          content: `New lead from ${customerName}`,
          timestamp: new Date(),
          readBy: []
        },
        {
          sender: "contact",
          content: message || source || "Customer submitted a form",
          timestamp: new Date(),
          readBy: []
        }
      ],
      status: "new",
      lastMessageAt: new Date()
    });

    console.log("✅ Contact created:", contact._id);
    console.log("✅ Conversation created:", conversation._id);

    // Send emails
    try {
      // Send auto-reply to customer
      await sendCustomerAutoReply(email, customerName);
      console.log(`✅ Auto-reply sent to ${email}`);

      // Send notification to admin
      if (workspace.contactEmail) {
        await sendNewLeadNotification(workspace.contactEmail, {
          name: customerName,
          email,
          phone,
          message,
          source: source || "Website Form"
        });
        console.log(`✅ Admin notification sent to ${workspace.contactEmail}`);
      }
    } catch (emailErr) {
      console.error("❌ Email sending error:", emailErr.message);
      // Don't fail the request if emails fail
    }

    res.status(201).json({
      success: true,
      contact,
      conversationId: conversation._id,
      message: "Thank you! We'll contact you soon."
    });

  } catch (err) {
    console.error("❌ CREATE PUBLIC LEAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// GET /api/leads (Admin dashboard)
// ===============================
const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({
      workspace: req.user.workspace
    }).sort({ createdAt: -1 });

    res.json(leads);
  } catch (err) {
    console.error("GET LEADS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// POST /api/leads (Admin manual)
// ===============================
const createLead = async (req, res) => {
  try {
    const { name, email, source, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email required" });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      source: source || "Manual Entry",
      status: "New",
      workspace: req.user.workspace
    });

    res.status(201).json(lead);
  } catch (err) {
    console.error("CREATE LEAD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// DELETE /api/leads/:id
// ===============================
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (lead.workspace.toString() !== req.user.workspace.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this lead" });
    }

    await lead.deleteOne();
    res.json({ message: "Lead deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getLeads,
  createLead,
  deleteLead,
  createPublicLead
};