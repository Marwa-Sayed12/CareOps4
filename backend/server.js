const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { startCronJobs } = require("./index");
const path = require("path");

console.log("🚀 [BOOT] Starting server initialization...");
console.log("📁 Current directory:", __dirname);
console.log("🔧 NODE_ENV:", process.env.NODE_ENV);
console.log("🔑 RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);

dotenv.config();
console.log("✅ [BOOT] dotenv configured");

console.log("🔄 [BOOT] Connecting to MongoDB...");
connectDB();
console.log("✅ [BOOT] MongoDB connection initiated");

const app = express();
console.log("✅ [BOOT] Express app created");

// ==================== COMPLETE CORS CONFIGURATION ====================
console.log("\n🔧 [CONFIG] Setting up CORS...");

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
  "https://care-ops.netlify.app",

  // Render deployments
  "https://careops4.onrender.com",
  "https://www.careops4.onrender.com",
  "https://careops-backend.onrender.com",
  "https://careops-frontend.onrender.com",
  "https://careops-frontend.onrender.com/",
  
  // Environment variable
  process.env.FRONTEND_URL,
].filter(Boolean);

console.log(`📋 [CONFIG] Allowed Origins (${allowedOrigins.length}):`);
allowedOrigins.forEach((origin, i) => {
  console.log(`   ${i+1}. ${origin}`);
});

// Also allow all Vercel preview deployments (wildcard)
const vercelWildcard = /^https:\/\/care-ops4-.*\.vercel\.app$/;
console.log("🔍 [CONFIG] Vercel wildcard pattern:", vercelWildcard);

app.use(cors({
  origin: function (origin, callback) {
    console.log(`\n🔍 [CORS] Checking origin: "${origin}"`);
    
    // Allow requests with no origin (mobile apps, curl, Postman, etc)
    if (!origin) {
      console.log("✅ [CORS] Allowed: No origin (mobile/API client)");
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log("✅ [CORS] Allowed origin (exact match):", origin);
      return callback(null, true);
    }
    
    // Check if origin matches Vercel preview pattern
    if (vercelWildcard.test(origin)) {
      console.log("✅ [CORS] Allowed origin (Vercel preview):", origin);
      return callback(null, true);
    }
    
    // For production, you might want to log but still allow (temporary)
    if (process.env.NODE_ENV === 'production') {
      console.log("⚠️ [CORS] New origin detected - allowing temporarily:", origin);
      allowedOrigins.push(origin);
      return callback(null, true);
    }
    
    console.log("❌ [CORS] Blocked origin:", origin);
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
console.log("✅ [CONFIG] CORS middleware configured");

// Handle preflight requests explicitly
app.options('*', cors());
console.log("✅ [CONFIG] Preflight handler configured");

// ==================== Debug Middleware ====================
app.use((req, res, next) => {
  console.log("\n📱 [REQUEST] Incoming Request:");
  console.log("  - Time:", new Date().toISOString());
  console.log("  - Origin:", req.headers.origin || "No origin");
  console.log("  - Method:", req.method);
  console.log("  - URL:", req.url);
  console.log("  - Path:", req.path);
  console.log("  - Full URL:", req.protocol + '://' + req.get('host') + req.originalUrl);
  console.log("  - User-Agent:", req.headers['user-agent']?.substring(0, 50) + "...");
  console.log("  - Content-Type:", req.headers['content-type']);
  console.log("  - Authorization:", req.headers.authorization ? "Present ✅" : "Not present ❌");
  console.log("  - Headers:", JSON.stringify(req.headers, null, 2));
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("✅ [MIDDLEWARE] Body parsers configured");

// Static files (if needed)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log("✅ [MIDDLEWARE] Static file serving configured");

// Root route handler
app.get("/", (req, res) => {
  console.log("📌 [ROUTE] GET / - Root route accessed");
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

app.head("/", (req, res) => {
  console.log("📌 [ROUTE] HEAD / - Root route accessed");
  res.status(200).end();
});

// ==================== API Routes ====================
console.log("\n🔧 [ROUTES] Setting up API routes...");

// Auth Routes
console.log("  - Mounting /api/auth");
app.use("/api/auth", require("./routes/authRoutes"));

// User & Staff Management
console.log("  - Mounting /api/users");
app.use("/api/users", require("./routes/userRoutes"));
console.log("  - Mounting /api/staff");
app.use("/api/staff", require("./routes/staffRoutes"));

// Core Business Routes
console.log("  - Mounting /api/leads");
app.use("/api/leads", require("./routes/leadRoutes"));
console.log("  - Mounting /api/bookings");
app.use("/api/bookings", require("./routes/bookingRoutes"));
console.log("  - Mounting /api/forms");
app.use("/api/forms", require("./routes/formRoutes"));
console.log("  - Mounting /api/inventory");
app.use("/api/inventory", require("./routes/inventoryRoutes"));

// Communication Routes
console.log("  - Mounting /api/conversations");
app.use("/api/conversations", require("./routes/conversationRoutes"));
console.log("  - Mounting /api/contact");
app.use("/api/contact", require("./routes/contactRoutes"));

// Workspace & Dashboard
console.log("  - Mounting /api/workspace");
app.use("/api/workspace", require("./routes/workspaceRoutes"));
console.log("  - Mounting /api/dashboard");
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

console.log("✅ [ROUTES] All API routes mounted");

// ==================== Health Check ====================
app.get("/api/health", (req, res) => {
  console.log("📌 [ROUTE] GET /api/health - Health check accessed");
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

// ==================== Test CORS Endpoint ====================
app.get("/api/test-cors", (req, res) => {
  console.log("📌 [ROUTE] GET /api/test-cors - CORS test accessed");
  console.log("  - Request origin:", req.headers.origin);
  res.json({
    message: "CORS is working!",
    yourOrigin: req.headers.origin || "No origin",
    allowedOrigins: allowedOrigins,
    headers: req.headers
  });
});

// ==================== 404 Handler ====================
app.use("*", (req, res) => {
  console.log("❌ [404] Route not found:", req.method, req.originalUrl);
  console.log("  - Available routes should include /api/auth, /api/health, etc.");
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ==================== Error Handler ====================
app.use((err, req, res, next) => {
  console.error("❌ [ERROR] Server Error:", err.stack);
  console.error("  - Status:", err.statusCode || 500);
  console.error("  - Message:", err.message);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

// ==================== Start Server ====================
const PORT = process.env.PORT || 10000;

console.log(`\n🔧 [SERVER] Attempting to start server on port ${PORT}...`);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅✅✅ [SERVER] SUCCESS! 🚀 CareOps API running on port ${PORT} at 0.0.0.0`);
  console.log(`📧 Email Service: ${process.env.RESEND_API_KEY ? "Configured ✅" : "Not Configured ❌"}`);
  console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log(`⚙️ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`\n📋 Server is ready to accept connections!`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`🔍 Test endpoint: http://localhost:${PORT}/api/health\n`);
  
  // Start cron jobs for automated emails
  try {
    console.log("⏰ Starting cron jobs...");
    startCronJobs();
    console.log("✅ Cron jobs started successfully");
  } catch (err) {
    console.error("❌ Failed to start cron jobs:", err.message);
  }
});

server.on('error', (error) => {
  console.error("❌❌❌ [SERVER] Failed to start server:");
  console.error("  - Error code:", error.code);
  console.error("  - Error message:", error.message);
  console.error("  - Full error:", error);
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

console.log("✅ [BOOT] Server configuration complete. Waiting for start...");

module.exports = app;