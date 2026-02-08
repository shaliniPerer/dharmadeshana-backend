const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const {
  uploadSingle,
  uploadMultiple,
  uploadEventMedia,
  uploadProof,
} = require('../controllers/uploadController');

// All upload routes require authentication
router.use(protect);

// Single file upload (generic)
// Usage: POST /api/upload/single?folder=events
router.post('/single', upload.single('file'), uploadSingle);

// Multiple files upload (generic)
// Usage: POST /api/upload/multiple?folder=danweem
router.post('/multiple', upload.array('files', 10), uploadMultiple);

// Event media upload (images/videos)
router.post('/event-media', upload.array('files', 10), uploadEventMedia);

// Proof document upload
router.post('/proof', upload.single('file'), uploadProof);

module.exports = router;
