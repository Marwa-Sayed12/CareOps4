const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user with workspace
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account deactivated" });
      }

      // Attach user to request
      req.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        workspace: user.workspace,
        permissions: user.permissions
      };

      next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

// Middleware to check permissions
const hasPermission = (permission) => {
  return (req, res, next) => {
    // Admin has all permissions
    if (req.user.role === "admin") {
      return next();
    }

    // Check if staff has the required permission
    if (req.user.permissions && req.user.permissions[permission]) {
      return next();
    }

    return res.status(403).json({ message: `Access denied. Need ${permission} permission.` });
  };
};

module.exports = { protect, adminOnly, hasPermission };