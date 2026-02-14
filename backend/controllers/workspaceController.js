const Workspace = require("../models/Workspace");
const User = require("../models/User");

// Step 0: Create workspace
const saveWorkspace = async (req, res) => {
  try {
    const { businessName, address, timezone, contactEmail } = req.body;
    const userId = req.user._id; // From auth middleware

    let workspace = await Workspace.findOne({ owner: userId });
          console.log("Saved workspace:", workspace); // <-- check terminal

    if (!workspace) {
      workspace = await Workspace.create({
        businessName,
        address,
        timezone,
        contactEmail,
        owner: userId,
        emailConnected: false,
        isActivated: false,
      });

      await User.findByIdAndUpdate(userId, { workspace: workspace._id });
    }

    res.status(200).json(workspace);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 1: Communication setup
const saveCommunication = async (req, res) => {
  try {
    const { emailConnected, smsConnected } = req.body;
    const workspace = await Workspace.findOneAndUpdate(
      { owner: req.user._id },
      { emailConnected, smsConnected },
      { new: true }
    );
    res.status(200).json(workspace);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 2: Contact Form
const saveContactForm = async (req, res) => {
  try {
    const { fields } = req.body; // Array of fields
    const workspace = await Workspace.findOneAndUpdate(
      { owner: req.user._id },
      { contactForm: fields },
      { new: true }
    );
    res.status(200).json(workspace);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 3: Booking
const saveBooking = async (req, res) => {
  try {
    const { services } = req.body; // Array of services
    const workspace = await Workspace.findOneAndUpdate(
      { owner: req.user._id },
      { services },
      { new: true }
    );
    res.status(200).json(workspace);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 4: Post-booking forms
const savePostBookingForms = async (req, res) => {
  try {
    const { forms } = req.body;
    const workspace = await Workspace.findOneAndUpdate(
      { owner: req.user._id },
      { postBookingForms: forms },
      { new: true }
    );
    res.status(200).json(workspace);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 5: Inventory
const saveInventory = async (req, res) => {
  try {
    const { items } = req.body; // Array of inventory items
    const workspace = await Workspace.findOneAndUpdate(
      { owner: req.user._id },
      { inventory: items },
      { new: true }
    );
    res.status(200).json(workspace);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 6: Staff
const addStaff = async (req, res) => {
  try {
    const { staff } = req.body; // Array of { email, permissions }
    const workspace = await Workspace.findOne({ owner: req.user._id });
    for (let s of staff) {
      let user = await User.findOne({ email: s.email });
      if (!user) {
        user = await User.create({
          email: s.email,
          password: "123456", // default, can send email to reset
          role: "staff",
          workspace: workspace._id,
          businessName: workspace.businessName,
        });
      }
    }
    res.status(200).json({ message: "Staff added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  saveWorkspace,
  saveCommunication,
  saveContactForm,
  saveBooking,
  savePostBookingForms,
  saveInventory,
  addStaff,
};
