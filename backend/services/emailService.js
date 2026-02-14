const { Resend } = require("resend");
require("dotenv").config();

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email - change this to your verified domain in production
const FROM_EMAIL = process.env.FROM_EMAIL || "CareOps <onboarding@resend.dev>";

/**
 * Send email using Resend
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content
 * @returns {Promise<boolean>} - Success status
 */
const sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log(`📧 Sending email to: ${to} - Subject: ${subject}`);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("❌ Resend API error:", error);
      return false;
    }

    console.log("✅ Email sent successfully, ID:", data?.id);
    return true;
  } catch (err) {
    console.error("❌ Email service error:", err.message);
    return false;
  }
};

/**
 * Send welcome email to new staff member
 */
const sendStaffWelcomeEmail = async (email, name, tempPassword) => {
  const subject = "🎉 Welcome to CareOps - Your Staff Account";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✨ CareOps</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0;">Your Staff Account is Ready!</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin-top: 0;">Welcome, ${name}! 👋</h2>
          <p style="color: #4b5563;">You've been added as a staff member to your organization's CareOps workspace.</p>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px;">🔐 Your Login Credentials</h3>
            <p style="margin: 10px 0;"><strong style="color: #2563eb;">Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong style="color: #2563eb;">Temporary Password:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/staff/login" 
               style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              🚀 Login to Your Dashboard
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;"><strong>⚠️ Important:</strong> You'll be prompted to change your password on first login for security.</p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">This is an automated message from CareOps. Please do not reply to this email.</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0;">© ${new Date().getFullYear()} CareOps. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(email, subject, html);
};

/**
 * Send invitation email with signup link
 */
const sendStaffInviteEmail = async (email, inviteLink) => {
  const subject = "🤝 You're Invited to Join CareOps";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 You're Invited!</h1>
          <p style="color: #d1fae5; margin: 10px 0 0;">Join your team on CareOps</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hello there! 👋</h2>
          <p style="color: #4b5563;">You've been invited to join as a staff member on CareOps, the unified operations platform for service businesses.</p>
          
          <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="color: #065f46; margin: 0;"><strong>✨ What you can do:</strong></p>
            <ul style="color: #065f46; margin: 10px 0 0; padding-left: 20px;">
              <li>Manage customer conversations</li>
              <li>Handle daily bookings</li>
              <li>Track form completions</li>
              <li>View inventory alerts</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" 
               style="background: #059669; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              ✅ Accept Invitation
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">Or copy this link: <br/><a href="${inviteLink}" style="color: #059669; word-break: break-all;">${inviteLink}</a></p>
          <p style="color: #ef4444; font-size: 13px; margin-top: 20px;"><strong>⏰ This invitation expires in 7 days.</strong></p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(email, subject, html);
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetLink) => {
  const subject = "🔐 Reset Your CareOps Password";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔒 Password Reset</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="color: #4b5563;">We received a request to reset your password. Click the button below to set a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              🔄 Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">Or copy this link: <br/><a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a></p>
          <p style="color: #ef4444; font-size: 13px; margin-top: 20px;"><strong>⏰ This link expires in 1 hour.</strong></p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">If you didn't request this, please ignore this email or contact support if you have concerns.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(email, subject, html);
};

/**
 * Send booking confirmation to customer
 */
const sendBookingConfirmation = async (email, customerName, bookingDetails) => {
  const subject = "✅ Booking Confirmed - CareOps";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Booking Confirmed!</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin-top: 0;">Thank you, ${customerName}!</h2>
          <p style="color: #4b5563;">Your booking has been confirmed. Here are the details:</p>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px;">📅 Appointment Details</h3>
            <p style="margin: 10px 0;"><strong>Service:</strong> ${bookingDetails.service}</p>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
            <p style="margin: 10px 0;"><strong>Time:</strong> ${bookingDetails.time}</p>
            ${bookingDetails.location ? `<p style="margin: 10px 0;"><strong>Location:</strong> ${bookingDetails.location}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/customer/manage-booking/${bookingDetails.id}" 
               style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
              📋 Manage Booking
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">Need to reschedule? Use the link above or contact us directly.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(email, subject, html);
};

/**
 * Send new lead notification to admin
 */
const sendNewLeadNotification = async (adminEmail, leadData) => {
  const subject = "🎯 New Lead Received - CareOps";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎯 New Lead Alert</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="color: #4b5563;">A new lead has been submitted through your website form:</p>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px;">📋 Lead Details</h3>
            <p style="margin: 10px 0;"><strong>Name:</strong> ${leadData.name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${leadData.email}">${leadData.email}</a></p>
            ${leadData.phone ? `<p style="margin: 10px 0;"><strong>Phone:</strong> ${leadData.phone}</p>` : ''}
            <p style="margin: 10px 0;"><strong>Source:</strong> ${leadData.source}</p>
            ${leadData.message ? `<p style="margin: 10px 0;"><strong>Message:</strong> "${leadData.message}"</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/admin/leads" 
               style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
              👥 View in Dashboard
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(adminEmail, subject, html);
};

/**
 * Send auto-reply to customer after form submission
 */
const sendCustomerAutoReply = async (email, customerName) => {
  const subject = "🙏 Thank You for Contacting Us";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🙏 Thank You!</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${customerName},</h2>
          <p style="color: #4b5563;">Thanks for reaching out! We've received your message and will get back to you within 24 hours.</p>
          
          <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 20px; margin: 25px 0;">
            <p style="color: #065f46; margin: 0;"><strong>✨ What happens next?</strong></p>
            <ol style="color: #065f46; margin: 10px 0 0;">
              <li>Our team will review your request</li>
              <li>You'll receive a response via email</li>
              <li>We may reach out to schedule a consultation</li>
            </ol>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">In the meantime, you can <a href="${process.env.FRONTEND_URL}/customer/book" style="color: #059669;">book an appointment here</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendStaffWelcomeEmail,
  sendStaffInviteEmail,
  sendPasswordResetEmail,
  sendBookingConfirmation,
  sendNewLeadNotification,
  sendCustomerAutoReply
};