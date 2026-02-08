const express = require("express");
const adminController = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Events management
router.get("/events/pending", protect, adminOnly, adminController.getPendingEvents);
router.get("/events/all", protect, adminOnly, adminController.getAllEvents);
router.patch("/events/:eventId/approve", protect, adminOnly, adminController.approveEvent);
router.patch("/events/:eventId/reject", protect, adminOnly, adminController.rejectEvent);
router.delete("/events/:eventId", protect, adminOnly, adminController.deleteEvent);
router.get("/stats", protect, adminOnly, adminController.getAdminStats);

// Users management
router.get("/users", protect, adminOnly, adminController.getAllUsers);

module.exports = router;