const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/authMiddleware");

// Public route - Submit contact form
router.post("/", contactController.createMessage);

// Admin routes - Manage messages
router.get("/admin/all", protect, adminOnly, contactController.getAllMessages);
router.get("/admin/pending", protect, adminOnly, contactController.getPendingMessages);
router.patch("/:messageId/status", protect, adminOnly, contactController.updateMessageStatus);
router.delete("/:messageId", protect, adminOnly, contactController.deleteMessage);

module.exports = router;
