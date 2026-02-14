const User = require("../models/User");
const Invite = require("../models/Invite");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const {
  sendStaffWelcomeEmail,
  sendStaffInviteEmail
} = require("../services/emailService");

// @desc    Get all staff members for a workspace
// @route   GET /api/users/staff
// @access  Private (Admin only)
const getStaffMembers = async (req, res) => {
  try {
    const staff = await User.find({
      workspace: req.user.workspace,
      role: "staff"
    }).select("-password").sort({ createdAt: -1 });

    res.json(staff);
  } catch (err) {
    console.error("Get staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new staff member directly
// @route   POST /api/users/create-staff
// @access  Private (Admin only)
const createStaff = async (req, res) => {
  try {
    const { email, businessName, password } = req.body;

    // Validation
    if (!email || !businessName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists in this workspace
    const existingUser = await User.findOne({ 
      email, 
      workspace: req.user.workspace 
    });

    if (existingUser) {
      return res.status(400).json({ message: "Staff member already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create staff user
    const staff = await User.create({
      email,
      password: hashedPassword,
      businessName,
      role: "staff",
      workspace: req.user.workspace,
      invitedBy: req.user._id,
      isActive: true,
      permissions: {
        inbox: true,
        bookings: true,
        forms: false,
        inventory: false,
        customers: false,
        reports: false
      }
    });

    // Send welcome email via Resend
    try {
      await sendStaffWelcomeEmail(email, businessName, password);
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (emailErr) {
      console.error("❌ Failed to send welcome email:", emailErr.message);
      // Don't fail the request if email fails
    }

    // Return user without password
    const staffResponse = staff.toObject();
    delete staffResponse.password;

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: staffResponse
    });

  } catch (err) {
    console.error("Create staff error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Invite staff member via email
// @route   POST /api/users/invite-staff
// @access  Private (Admin only)
const inviteStaff = async (req, res) => {
  try {
    const { email, businessName } = req.body;

    if (!email || !businessName) {
      return res.status(400).json({ message: "Email and business name are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email, 
      workspace: req.user.workspace 
    });

    if (existingUser) {
      return res.status(400).json({ message: "Staff member already exists" });
    }

    // Check for existing pending invite
    const existingInvite = await Invite.findOne({
      email,
      workspace: req.user.workspace,
      status: "pending"
    });

    if (existingInvite) {
      return res.status(400).json({ message: "Invitation already sent to this email" });
    }

    // Create invite token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invite = await Invite.create({
      email,
      businessName,
      workspace: req.user.workspace,
      invitedBy: req.user._id,
      token,
      expiresAt,
      permissions: {
        inbox: true,
        bookings: true,
        forms: false,
        inventory: false,
        customers: false,
        reports: false
      }
    });

    // Create invite link
    const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/staff/signup?token=${token}`;
    
    // Send invitation email
    try {
      await sendStaffInviteEmail(email, inviteLink);
      console.log(`✅ Invitation email sent to ${email}`);
    } catch (emailErr) {
      console.error("❌ Failed to send invitation email:", emailErr.message);
      // Still return success but note email failure
    }

    res.status(201).json({
      message: "Invitation sent successfully",
      invite: {
        email: invite.email,
        expiresAt: invite.expiresAt
      }
    });

  } catch (err) {
    console.error("Invite staff error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a staff member
// @route   DELETE /api/users/staff/:id
// @access  Private (Admin only)
const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findOne({
      _id: req.params.id,
      workspace: req.user.workspace,
      role: "staff"
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Soft delete - just deactivate
    staff.isActive = false;
    await staff.save();

    res.json({ message: "Staff member deactivated successfully" });
  } catch (err) {
    console.error("Delete staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update staff permissions
// @route   PATCH /api/users/staff/:id/permissions
// @access  Private (Admin only)
const updateStaffPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    
    const staff = await User.findOne({
      _id: req.params.id,
      workspace: req.user.workspace,
      role: "staff"
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    staff.permissions = permissions;
    await staff.save();

    res.json(staff);
  } catch (err) {
    console.error("Update permissions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getStaffMembers,
  createStaff,
  deleteStaff,
  updateStaffPermissions,
  inviteStaff
};