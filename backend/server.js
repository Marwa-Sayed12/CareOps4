const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { startCronJobs } = require("./index");
const path = require("path");

dotenv.config();

connectDB();

const app = express();

// ==================== Clean CORS Configuration ====================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "https://care-ops4.vercel.app",
  "https://care-ops4-dbkdfeg6k-marwa-sayed12s-projects.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      console.log("✅ Allowed request with no origin");
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      console.log("✅ Allowed origin:", origin);
      return callback(null, true);
    } else {
      console.log("❌ Blocked origin:", origin);
      return callback(new Error('CORS not allowed'), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Handle preflight requests
app.options("*", cors());

// ==================== Debug Middleware ====================
app.use((req, res, next) => {
  console.log("\n📱 Incoming Request:");
  console.log("  - Time:", new Date().toISOString());
  console.log("  - Origin:", req.headers.origin || "No origin");
  console.log("  - Method:", req.method);
  console.log("  - URL:", req.url);
  console.log("  - User-Agent:", req.headers['user-agent']?.substring(0, 50) + "...");
  console.log("  - Content-Type:", req.headers['content-type']);
  next();
});

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
    environment: process.env.NODE_ENV || "development",
    cors: {
      origin: req.headers.origin || "none",
      allowed: allowedOrigins
    }
  });
});

// ==================== 404 Handler ====================
app.use("*", (req, res) => {
  console.log("❌ 404 - Route not found:", req.method, req.originalUrl);
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
  console.log(`⚙️ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✅ Allowed Origins:`, allowedOrigins);
  console.log(`\n⏰ Starting cron jobs...\n`);
  
  // Start cron jobs for automated emails
  try {
    startCronJobs();
    console.log("✅ Cron jobs started successfully");
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