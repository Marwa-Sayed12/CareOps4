const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { startCronJobs } = require("./index");
const path = require("path");

// Essential startup logs only
console.log("🚀 Starting CareOps API...");
console.log(`📁 Directory: ${__dirname}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);

dotenv.config();
connectDB();

const app = express();

// ==================== CORS CONFIGURATION ====================
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
  
  process.env.FRONTEND_URL,
].filter(Boolean);

const vercelWildcard = /^https:\/\/care-ops4-.*\.vercel\.app$/;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || vercelWildcard.test(origin)) {
      callback(null, true);
    } else {
      console.log(`⚠️ Blocked origin: ${origin}`);
      callback(new Error('CORS not allowed'), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Content-Length", "Authorization", "Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.options('*', cors());

// ==================== Minimal Request Logger ====================
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${req.headers.origin || "No origin"}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== Routes ====================
app.get("/", (req, res) => {
  res.json({ 
    message: "CareOps API is running", 
    status: "healthy",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      leads: "/api/leads",
      bookings: "/api/bookings"
    }
  });
});

app.head("/", (req, res) => res.status(200).end());

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/forms", require("./routes/formRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/conversations", require("./routes/conversationRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/workspace", require("./routes/workspaceRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// ==================== Health & Test Endpoints ====================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/test-cors", (req, res) => {
  res.json({ message: "CORS is working!", yourOrigin: req.headers.origin || "No origin" });
});

// ==================== 404 Handler ====================
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found", path: req.originalUrl });
});

// ==================== Error Handler ====================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// ==================== Start Server ====================
const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ CareOps API running on port ${PORT}`);
  console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log(`⏰ Starting cron jobs...`);
  
  try {
    startCronJobs();
    console.log("✅ Cron jobs started");
  } catch (err) {
    console.error("❌ Cron jobs failed:", err.message);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 Shutting down...");
  server.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  console.log("👋 Shutting down...");
  server.close(() => process.exit(0));
});

module.exports = app;