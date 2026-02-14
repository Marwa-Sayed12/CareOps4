const express = require("express");
const router = express.Router();
const { getFormsByWorkspace } = require("../controllers/formController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getFormsByWorkspace);

module.exports = router;
