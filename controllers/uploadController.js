// Use local storage for development
const { uploadToLocal, uploadMultipleToLocal } = require('../utils/localStorage');

// For production with S3 (uncomment when needed)
// const { uploadToS3, uploadMultipleToS3 } = require('../utils/s3Upload');

// Alias for easy switching
const uploadFile = uploadToLocal;
const uploadMultipleFiles = uploadMultipleToLocal;

/**
 * Upload a single file
 * POST /api/upload/single
 * Request: multipart/form-data with 'file' field
 * Query params: folder (optional)
 */
const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const folder = req.query.folder || 'uploads';
    const fileUrl = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl: fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ 
      message: 'Failed to upload file',
      error: error.message 
    });
  }
};

/**
 * Upload multiple files
 * POST /api/upload/multiple
 * Request: multipart/form-data with 'files' field
 * Query params: folder (optional)
 */
const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const folder = req.query.folder || 'uploads';
    const fileUrls = await uploadMultipleFiles(req.files, folder);

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: req.files.map((file, index) => ({
        fileUrl: fileUrls[index],
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
      })),
    });
  } catch (error) {
    console.error('Multiple Upload Error:', error);
    res.status(500).json({ 
      message: 'Failed to upload files',
      error: error.message 
    });
  }
};

/**
 * Upload event media (images/videos)
 * POST /api/upload/event-media
 */
const uploadEventMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const fileUrls = await uploadMultipleFiles(req.files, 'events');

    res.status(200).json({
      message: 'Event media uploaded successfully',
      mediaUrls: fileUrls,
    });
  } catch (error) {
    console.error('Event Media Upload Error:', error);
    res.status(500).json({ 
      message: 'Failed to upload event media',
      error: error.message 
    });
  }
};

/**
 * Upload proof document
 * POST /api/upload/proof
 */
const uploadProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'proofs'
    );

    res.status(200).json({
      message: 'Proof document uploaded successfully',
      fileUrl: fileUrl,
    });
  } catch (error) {
    console.error('Proof Upload Error:', error);
    res.status(500).json({ 
      message: 'Failed to upload proof document',
      error: error.message 
    });
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadEventMedia,
  uploadProof,
};
