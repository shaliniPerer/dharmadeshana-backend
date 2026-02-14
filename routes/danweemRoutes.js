const express = require("express");
const danweemController = require("../controllers/danweemController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/approved", danweemController.getApprovedDanweem);

// Authenticated user routes
router.post("/", protect, danweemController.createDanweem);
router.get("/my-danweem", protect, danweemController.getUserDanweem);
router.delete("/:danweemId", protect, danweemController.deleteDanweem);

// Admin routes
router.get("/admin/pending", protect, adminOnly, danweemController.getPendingDanweem);
router.get("/admin/all", protect, adminOnly, danweemController.getAllDanweem);
router.patch("/:danweemId/approve", protect, adminOnly, danweemController.approveDanweem);
router.patch("/:danweemId/reject", protect, adminOnly, danweemController.rejectDanweem);
router.put("/:danweemId", protect, adminOnly, danweemController.updateDanweem);

module.exports = router;
