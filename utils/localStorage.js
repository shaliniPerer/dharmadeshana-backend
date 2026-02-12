const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Base directory for uploads
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Upload a file to local storage
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} originalName - Original filename
 * @param {string} mimetype - File MIME type
 * @param {string} folder - Folder name (e.g., 'events', 'danweem', 'proofs')
 * @returns {Promise<string>} - URL of uploaded file
 */
const uploadToLocal = async (fileBuffer, originalName, mimetype, folder = 'uploads') => {
  try {
    console.log('Local upload starting:', { originalName, mimetype, folder });
    
    // Create folder if it doesn't exist
    const folderPath = path.join(UPLOADS_DIR, folder);
    console.log('Creating folder if not exists:', folderPath);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log('Folder created:', folderPath);
    }

    // Generate unique filename
    const fileExtension = path.extname(originalName);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(folderPath, fileName);
    
    console.log('Writing file to:', filePath);

    // Write file to disk
    await fs.promises.writeFile(filePath, fileBuffer);
    
    console.log('File written successfully');

    // Return the relative URL path (controllers will prepend BASE_URL when needed)
    const fileUrl = `/uploads/${folder}/${fileName}`;
    
    console.log('Returning URL:', fileUrl);
    return fileUrl;
  } catch (error) {
    console.error('Local Storage Upload Error:', {
      message: error.message,
      stack: error.stack,
      originalName,
      folder
    });
    throw new Error(`Failed to upload file to local storage: ${error.message}`);
  }
};

/**
 * Delete a file from local storage
 * @param {string} fileUrl - Full URL of the file to delete
 * @returns {Promise<void>}
 */
const deleteFromLocal = async (fileUrl) => {
  try {
    // Extract file path from URL
    const urlParts = fileUrl.split('/uploads/');
    if (urlParts.length < 2) {
      throw new Error('Invalid file URL');
    }

    const relativePath = urlParts[1];
    const filePath = path.join(UPLOADS_DIR, relativePath);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error('Local Storage Delete Error:', error);
    throw new Error('Failed to delete file from local storage');
  }
};

/**
 * Upload multiple files to local storage
 * @param {Array} files - Array of file objects from multer
 * @param {string} folder - Folder name
 * @returns {Promise<Array<string>>} - Array of uploaded file URLs
 */
const uploadMultipleToLocal = async (files, folder = 'uploads') => {
  try {
    const uploadPromises = files.map(file => 
      uploadToLocal(file.buffer, file.originalname, file.mimetype, folder)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple Local Storage Upload Error:', error);
    throw new Error('Failed to upload files to local storage');
  }
};

module.exports = {
  uploadToLocal,
  deleteFromLocal,
  uploadMultipleToLocal,
  UPLOADS_DIR,
};
