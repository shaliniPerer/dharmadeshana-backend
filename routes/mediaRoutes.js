const express = require("express");
const mediaController = require("../controllers/mediaController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create new media (authenticated users)
router.post("/", protect, mediaController.createMedia);

// Get user's own media
router.get("/my-media", protect, mediaController.getUserMedia);

// Get all public media (with optional category filter)
router.get("/", mediaController.getAllMedia);

// Delete media
router.delete("/:mediaId", protect, mediaController.deleteMedia);

module.exports = router;
