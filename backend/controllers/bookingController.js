const Booking = require("../models/Booking");
const Form = require("../models/Form");
const Workspace = require("../models/Workspace");

exports.createBooking = async (req, res) => {
  try {
    const { customerName, email, phone, service, date, time } = req.body;

    // Validate required fields
    if (!customerName || !email || !service || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get a workspace (for demo, take the first one)
    const workspace = await Workspace.findOne();
    if (!workspace) {
      return res.status(400).json({ message: "No workspace found" });
    }

    // Create booking with workspace
    const booking = await Booking.create({
      customerName,
      email,
      phone: phone || "",
      service,
      date,
      time: time || "",
      workspace: workspace._id // Add workspace to booking
    });

    console.log("Booking created:", booking._id);

    // Create form linked to workspace
    const form = await Form.create({
      booking: booking._id,
      workspace: workspace._id,
      status: "Pending",
      type: "Intake",
    });
    console.log("Form created:", form._id);

    res.status(201).json(booking);
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get bookings for admin dashboard - WITH WORKSPACE FILTER
exports.getBookings = async (req, res) => {
  try {
    // Get workspace from authenticated user
    const workspaceId = req.user?.workspace;
    
    if (!workspaceId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const bookings = await Booking.find({ 
      workspace: workspaceId 
    }).sort({ date: 1 });
    
    res.json(bookings);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ message: err.message });
  }
};