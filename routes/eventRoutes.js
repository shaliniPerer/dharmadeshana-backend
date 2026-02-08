const express = require("express");
const eventController = require("../controllers/eventController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, eventController.createEvent);
router.get("/approved", eventController.getApprovedEvents);
router.get("/my-events", protect, eventController.getUserEvents);
router.get("/:eventId", eventController.getEventById);

module.exports = router;