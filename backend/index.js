const cron = require("node-cron");
const Booking = require("./models/Booking");
const Contact = require("./models/Contact");
const Form = require("./models/Form");
const Inventory = require("./models/Inventory");
const Workspace = require("./models/Workspace");
const { sendEmail } = require("./services/emailService");

// Send booking reminders 24 hours before appointment
const sendBookingReminders = async () => {
  try { 
    console.log("🔍 Checking for bookings needing reminders...");
    
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const startOfTomorrow = new Date(now);
    startOfTomorrow.setDate(now.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);
    
    const endOfTomorrow = new Date(startOfTomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      status: "confirmed",
      reminderSent: { $ne: true },
      date: { $gte: startOfTomorrow, $lte: endOfTomorrow },
    }).populate("lead");

    console.log(`📊 Found ${bookings.length} bookings for tomorrow`);

    for (const booking of bookings) {
      if (!booking.lead?.email) continue;

      // Check if automation is paused for this contact
      const contact = await Contact.findOne({ email: booking.lead.email });
      if (contact?.automationPaused) {
        console.log(`⏸️ Automation paused for ${booking.lead.email}, skipping reminder`);
        continue;
      }

      const customerName = booking.lead?.name || booking.customerName || "Valued Customer";
      
      await sendEmail(
        booking.lead.email,
        "🔔 Booking Reminder - CareOps",
        `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔔 Booking Reminder</h1>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0;">Hi ${customerName},</h2>
              <p style="color: #4b5563;">This is a friendly reminder about your appointment tomorrow:</p>
              
              <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="margin: 10px 0;"><strong>Service:</strong> ${booking.service || "Consultation"}</p>
                <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                <p style="margin: 10px 0;"><strong>Time:</strong> ${booking.time || "To be confirmed"}</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">Need to reschedule? Contact us as soon as possible.</p>
            </div>
          </div>
        </body>
        </html>
        `
      );

      booking.reminderSent = true;
      await booking.save();
      console.log(`✅ Reminder sent to ${booking.lead.email}`);
    }
  } catch (err) {
    console.error("❌ Reminder cron error:", err.message);
  }
};

// Check for overdue forms
const checkOverdueForms = async () => {
  try {
    console.log("🔍 Checking for overdue forms...");
    
    const now = new Date();
    
    // Update forms that are past due date
    const updateResult = await Form.updateMany(
      { status: "pending", dueDate: { $lt: now } },
      { $set: { status: "overdue" } }
    );
    
    console.log(`📊 Marked ${updateResult.modifiedCount} forms as overdue`);

    // Send reminders for overdue forms
    const overdueForms = await Form.find({ status: "overdue", reminderSent: { $ne: true } })
      .populate({
        path: 'booking',
        populate: { path: 'lead' }
      });

    for (const form of overdueForms) {
      const customerEmail = form.booking?.lead?.email;
      const customerName = form.booking?.lead?.name || "Valued Customer";
      
      if (!customerEmail) continue;

      // Check if automation is paused
      const contact = await Contact.findOne({ email: customerEmail });
      if (contact?.automationPaused) continue;

      await sendEmail(
        customerEmail,
        "⚠️ Form Reminder - CareOps",
        `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Form Reminder</h1>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0;">Hi ${customerName},</h2>
              <p style="color: #4b5563;">This is a reminder to complete your form:</p>
              
              <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0;">
                <p style="margin: 0;"><strong>Form:</strong> ${form.name || "Required Form"}</p>
                <p style="margin: 10px 0 0;"><strong>Due Date:</strong> ${new Date(form.dueDate).toLocaleDateString()}</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">Please complete this form at your earliest convenience.</p>
            </div>
          </div>
        </body>
        </html>
        `
      );

      form.reminderSent = true;
      await form.save();
      console.log(`✅ Overdue reminder sent for form ${form._id}`);
    }
  } catch (err) {
    console.error("❌ Overdue forms cron error:", err.message);
  }
};

// Check low inventory
const checkLowInventory = async () => {
  try {
    console.log("🔍 Checking for low inventory items...");
    
    const lowItems = await Inventory.find({
      $expr: { $lt: ["$qty", "$threshold"] },
      alertSent: { $ne: true }
    }).populate("workspace");

    console.log(`📊 Found ${lowItems.length} low inventory items`);

    for (const item of lowItems) {
      const workspace = item.workspace;
      if (!workspace?.contactEmail) continue;

      await sendEmail(
        workspace.contactEmail,
        `⚠️ Low Stock Alert: ${item.name}`,
        `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">📦 Low Stock Alert</h1>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0;">Inventory Alert</h2>
              <p style="color: #4b5563;">The following item is running low:</p>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0;">
                <p style="margin: 0;"><strong>Item:</strong> ${item.name}</p>
                <p style="margin: 10px 0;"><strong>Current Quantity:</strong> ${item.qty} ${item.unit || 'units'}</p>
                <p style="margin: 10px 0;"><strong>Threshold:</strong> ${item.threshold} ${item.unit || 'units'}</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">Please reorder soon to avoid stockouts.</p>
            </div>
          </div>
        </body>
        </html>
        `
      );

      item.alertSent = true;
      await item.save();
      console.log(`✅ Low stock alert sent for ${item.name}`);
    }
  } catch (err) {
    console.error("❌ Inventory cron error:", err.message);
  }
};

// Start all cron jobs
const startCronJobs = () => {
  console.log("⏰ Starting cron jobs...");
  
  // Run every hour at minute 0 - booking reminders
  cron.schedule("0 * * * *", () => {
    console.log("🕐 Running booking reminders check...");
    sendBookingReminders();
  });
  
  // Run every day at 8:00 AM - overdue forms
  cron.schedule("0 8 * * *", () => {
    console.log("🕗 Running overdue forms check...");
    checkOverdueForms();
  });
  
  // Run every day at 8:30 AM - inventory check
  cron.schedule("30 8 * * *", () => {
    console.log("🕣 Running inventory check...");
    checkLowInventory();
  });
  
  console.log("✅ Cron jobs started successfully");
};

module.exports = { startCronJobs };