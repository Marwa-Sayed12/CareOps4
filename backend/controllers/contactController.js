const Contact = require("../models/Contact");
const Conversation = require("../models/Conversation");

const Workspace = require("../models/Workspace");
const { sendEmail } = require("../services/emailService");

const createContact = async (req, res) => {
  try {
    const { fullName, email, phone, message, workspaceId } = req.body;

    const workspace = workspaceId
      ? await Workspace.findById(workspaceId)
      : await Workspace.findOne({ isActivated: true });

    if (!workspace) {
      return res.status(400).json({ message: "No active workspace found" });
    }

    let contact = await Contact.findOne({
      $or: [{ email }, { phone }],
      workspace: workspace._id,
    });

    if (!contact) {
      contact = await Contact.create({
        fullName,
        email: email || "",
        phone: phone || "",
        message: message || "",
        workspace: workspace._id,
      });
    }

    // ✅ CREATE CONVERSATION CORRECTLY
    const conversation = await Conversation.create({
      contact: contact._id,
      workspace: workspace._id,
      messages: [
        {
          sender: "system",
          content: `New inquiry from ${contact.fullName}.`,
        },
        {
          sender: "contact",
          content: contact.message || "Customer submitted a form.",
        },
      ],
      status: "new",
    });

    if (email) {
      await sendEmail(
        email,
        "Welcome to " + workspace.businessName,
        `<h2>Hi ${fullName}!</h2><p>Thank you for reaching out. Our team will contact you shortly.</p>`
      );
    }

    res.status(201).json({ contact, conversationId: conversation._id });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = { createContact };
