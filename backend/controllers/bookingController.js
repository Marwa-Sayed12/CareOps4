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

    // Create booking
    const booking = await Booking.create({
      customerName,
      email,
      phone: phone || "",
      service,
      date,
      time: time || "",
    });

    console.log("Booking created:", booking._id);

    // Get a workspace (for demo, take the first one)
    const workspace = await Workspace.findOne();
    if (workspace) {
      // Create form linked to workspace
      const form = await Form.create({
        booking: booking._id,
        workspace: workspace._id, // ✅ ObjectId
        status: "Pending",
        type: "Intake",
      });
      console.log("Form created:", form._id);
    } else {
      console.warn("No workspace found, skipping form creation");
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Optional: get all bookings for admin dashboard
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1 });
    res.json(bookings);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ message: err.message });
  }
};
