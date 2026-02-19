const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { startCronJobs } = require("./index");
const path = require("path");

dotenv.config();

connectDB();

const app = express();

// ==================== COMPLETE CORS CONFIGURATION ====================
// All possible origins your app might use
const allowedOrigins = [
  // Local development
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:3000",
  
  // Vercel deployments
  "https://care-ops4.vercel.app",
  "https://care-ops4.vercel.app/",
  "https://www.care-ops4.vercel.app",
  "https://care-ops4-git-main-marwa-sayed12s-projects.vercel.app",
  "https://care-ops4-dbkdfeg6k-marwa-sayed12s-projects.vercel.app",
  "https://care-ops4-marwa-sayed12s-projects.vercel.app",
  "https://care-ops.netlify.app/",

  // Render deployments
  "https://careops4.onrender.com",
  "https://www.careops4.onrender.com",
  "https://careops-backend.onrender.com",
  "https://careops-frontend.onrender.com",
  "https://careops-frontend.onrender.com/",
  
  // Environment variable
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values

// Also allow all Vercel preview deployments (wildcard)
const vercelWildcard = /^https:\/\/care-ops4-.*\.vercel\.app$/;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc)
    if (!origin) {
      console.log("✅ Allowed: No origin (mobile/API client)");
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log("✅ Allowed origin (exact match):", origin);
      return callback(null, true);
    }
    
    // Check if origin matches Vercel preview pattern
    if (vercelWildcard.test(origin)) {
      console.log("✅ Allowed origin (Vercel preview):", origin);
      return callback(null, true);
    }
    
    // For production, you might want to log but still allow (temporary)
    if (process.env.NODE_ENV === 'production') {
      console.log("⚠️ New origin detected - allowing temporarily:", origin);
      // Add to allowedOrigins dynamically (optional)
      allowedOrigins.push(origin);
      return callback(null, true);
    }
    
    console.log("❌ Blocked origin:", origin);
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With", 
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Credentials"
  ],
  exposedHeaders: ["Content-Length", "Authorization", "Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests explicitly
app.options('*', cors());

// ==================== Debug Middleware ====================
app.use((req, res, next) => {
  console.log("\n📱 Incoming Request:");
  console.log("  - Time:", new Date().toISOString());
  console.log("  - Origin:", req.headers.origin || "No origin");
  console.log("  - Method:", req.method);
  console.log("  - URL:", req.url);
  console.log("  - User-Agent:", req.headers['user-agent']?.substring(0, 50) + "...");
  console.log("  - Content-Type:", req.headers['content-type']);
  console.log("  - Authorization:", req.headers.authorization ? "Present ✅" : "Not present ❌");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (if needed)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// After your debug middleware and before your API routes, add:
app.get("/", (req, res) => {
  res.json({ message: "CareOps API is running" });
});

app.head("/", (req, res) => {
  res.status(200).end();
});

// Then your API routes...
app.use("/api/auth", require("./routes/authRoutes"));
// ... rest of your routes

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
      allowedOrigins: allowedOrigins,
      allowed: allowedOrigins.includes(req.headers.origin || "") || !req.headers.origin
    }
  });
});

// ==================== Root Route Handler ====================
app.get("/", (req, res) => {
  res.json({ 
    message: "CareOps API is running", 
    status: "healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      leads: "/api/leads",
      bookings: "/api/bookings"
    }
  });
});

// Also handle HEAD requests to root
app.head("/", (req, res) => {
  res.status(200).end();
});

// ==================== Test CORS Endpoint ====================
app.get("/api/test-cors", (req, res) => {
  res.json({
    message: "CORS is working!",
    yourOrigin: req.headers.origin || "No origin",
    allowedOrigins: allowedOrigins,
    headers: req.headers
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
// 👇 FIXED: Added '0.0.0.0' to bind to all network interfaces
const PORT = process.env.PORT || 10000; // Using Render's default port

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 CareOps API running on port ${PORT} at 0.0.0.0`);
  console.log(`📧 Email Service: ${process.env.RESEND_API_KEY ? "Configured ✅" : "Not Configured ❌"}`);
  console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log(`⚙️ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`\n✅ Allowed Origins (${allowedOrigins.length}):`);
  allowedOrigins.forEach((origin, i) => {
    console.log(`   ${i+1}. ${origin}`);
  });
  console.log(`   ✅ Vercel preview deployments (wildcard): https://care-ops4-*.vercel.app`);
  console.log(`   ✅ No origin requests (mobile apps, API clients)`);
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