const cron = require("node-cron");
const Booking = require("../models/Booking");
const Contact = require("../models/Contact");
const Form = require("../models/Form");
const Inventory = require("../models/Inventory");
const Workspace = require("../models/Workspace");
const { sendEmail } = require("./emailService");

// Run every hour — check for upcoming booking reminders
const sendBookingReminders = async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const bookings = await Booking.find({
      status: "upcoming",
      reminderSent: false,
      date: { $gte: now, $lte: in24h },
    }).populate("contact");

    for (const booking of bookings) {
      if (booking.contact.automationPaused) continue;
      if (!booking.contact.email) continue;

      await sendEmail(
        booking.contact.email,
        "Booking Reminder — CareOps",
        `<h2>Reminder</h2><p>Hi ${booking.contact.fullName}, your appointment for <strong>${booking.serviceName}</strong> is tomorrow at <strong>${booking.time}</strong>.</p>`
      );

      booking.reminderSent = true;
      await booking.save();
    }
  } catch (err) {
    console.error("Reminder cron error:", err.message);
  }
};

// Run daily — check for overdue forms
const checkOverdueForms = async () => {
  try {
    const now = new Date();
    await Form.updateMany(
      { status: "pending", dueDate: { $lt: now } },
      { $set: { status: "overdue" } }
    );

    const overdueForms = await Form.find({ status: "overdue" }).populate("contact");
    for (const form of overdueForms) {
      if (form.contact.automationPaused || !form.contact.email) continue;

      await sendEmail(
        form.contact.email,
        "Form Reminder — CareOps",
        `<h2>Pending Form</h2><p>Hi ${form.contact.fullName}, please complete your <strong>${form.name}</strong> form.</p>`
      );
    }
  } catch (err) {
    console.error("Overdue forms cron error:", err.message);
  }
};

// Run daily — check low inventory
const checkLowInventory = async () => {
  try {
    const lowItems = await Inventory.find({
      $expr: { $lt: ["$quantity", "$threshold"] },
      alertSent: false,
    }).populate("workspace");

    for (const item of lowItems) {
      const workspace = item.workspace;
      if (workspace?.contactEmail) {
        await sendEmail(
          workspace.contactEmail,
          `Low Stock Alert: ${item.itemName}`,
          `<h2>Low Stock</h2><p><strong>${item.itemName}</strong> has only <strong>${item.quantity}</strong> remaining (threshold: ${item.threshold}).</p>`
        );
      }
      item.alertSent = true;
      await item.save();
    }
  } catch (err) {
    console.error("Inventory cron error:", err.message);
  }
};

const startCronJobs = () => {
  // Every hour — booking reminders
  cron.schedule("0 * * * *", sendBookingReminders);
  // Every day at 8am — overdue forms & inventory
  cron.schedule("0 8 * * *", checkOverdueForms);
  cron.schedule("0 8 * * *", checkLowInventory);
  console.log("Cron jobs started");
};

module.exports = { startCronJobs };
