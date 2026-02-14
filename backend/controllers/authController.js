const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Workspace = require("../models/Workspace");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { email, password, businessName, timezone, address } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      businessName,
      role: "admin",
    });

    const workspace = await Workspace.create({
      businessName,
      address: address || "",
      timezone: timezone || "America/New_York",
      contactEmail: email,
      owner: user._id,
    });

    user.workspace = workspace._id;
    await user.save();

    res.status(201).json({
      _id: user._id,
      email: user.email,
      businessName: user.businessName,
      role: user.role,
      workspace: workspace._id,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      businessName: user.businessName,
      workspace: user.workspace,
      token: generateToken(user._id), // 🔥 THIS IS THE KEY
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = { signup, login };
