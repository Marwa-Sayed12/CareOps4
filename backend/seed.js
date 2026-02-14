// Run: node seed.js — creates the default test admin
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");
const Workspace = require("./models/Workspace"); 

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Clean existing test admin
  await User.deleteOne({ email: "admin@careops.com" });

  const hashedPassword = await bcrypt.hash("123456", 10);

  const user = await User.create({
    email: "admin@careops.com",
    password: hashedPassword,
    businessName: "CareOps Demo Clinic",
    role: "admin",
  });

  const workspace = await Workspace.create({
    businessName: "CareOps Demo Clinic",
    address: "123 Main St, Springfield",
    timezone: "America/New_York",
    contactEmail: "admin@careops.com",
    emailConnected: true,
    isActivated: true,
    owner: user._id,
  });

  user.workspace = workspace._id;
  await user.save();

  console.log("Seed complete — admin@careops.com / 123456");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
