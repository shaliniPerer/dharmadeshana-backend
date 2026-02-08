const multer = require('multer');
const path = require('path');

// Configure multer to use memory storage (files stored in buffer)
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|avi|mov|mkv|webm/;
  const allowedDocTypes = /pdf|doc|docx/;
  
  const extname = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;
  
  // Check if file type is allowed
  if (
    allowedImageTypes.test(extname) ||
    allowedVideoTypes.test(extname) ||
    allowedDocTypes.test(extname) ||
    mimetype.startsWith('image/') ||
    mimetype.startsWith('video/') ||
    mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and PDFs are allowed.'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

module.exports = upload;
