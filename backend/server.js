const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { startCronJobs } = require("./index");
const path = require("path");

dotenv.config();

connectDB();

const app = express();

// ==================== CORS Configuration (FIXED) ====================
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "https://care-ops4.vercel.app",      // Your Vercel frontend
    "https://careops-frontend.onrender.com",
    "https://care-ops4-dbkdfeg6k-marwa-sayed12s-projects.vercel.app",
    "https://care-ops4-dbkdfeg6k-marwa-sayed12s-projects.vercel.app",
    "https://care-ops4.vercel.app/api",
    "https://care-ops4-dbkdfeg6k-marwa-sayed12s-projects.vercel.app",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Handle preflight requests (OPTIONS)
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (if needed)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== API Routes ====================

// Auth Routes
app.use("/api/auth", require("./routes/authRoutes"));

// User & Staff Management
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));

// Core Business Routes
app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/forms", require("./routes/formRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));

// Communication Routes
app.use("/api/conversations", require("./routes/conversationRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

// Workspace & Dashboard
app.use("/api/workspace", require("./routes/workspaceRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// ==================== Health Check ====================
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// ==================== 404 Handler ====================
app.use("*", (req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

// ==================== Error Handler ====================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// ==================== Start Server ====================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 CareOps API running on port ${PORT}`);
  console.log(`📧 Email Service: ${process.env.RESEND_API_KEY ? "Configured ✅" : "Not Configured ❌"}`);
  console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log(`⚙️ Environment: ${process.env.NODE_ENV || "development"}\n`);
  
  // Start cron jobs for automated emails
  try {
    startCronJobs();
    console.log("⏰ Cron jobs started successfully");
  } catch (err) {
    console.error("❌ Failed to start cron jobs:", err.message);
  }
});

// ==================== Graceful Shutdown ====================
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("💤 Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("👋 SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("💤 Server closed");
    process.exit(0);
  });
});

module.exports = app;