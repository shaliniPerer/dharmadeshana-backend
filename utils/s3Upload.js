const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../config/s3");
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'dharmadeshana-uploads';

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} originalName - Original filename
 * @param {string} mimetype - File MIME type
 * @param {string} folder - S3 folder (e.g., 'events', 'danweem', 'proofs')
 * @returns {Promise<string>} - URL of uploaded file
 */
const uploadToS3 = async (fileBuffer, originalName, mimetype, folder = 'uploads') => {
  try {
    const fileExtension = path.extname(originalName);
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Return the public URL
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${fileName}`;
    return fileUrl;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Delete a file from S3
 * @param {string} fileUrl - Full URL of the file to delete
 * @returns {Promise<void>}
 */
const deleteFromS3 = async (fileUrl) => {
  try {
    // Extract key from URL
    const url = new URL(fileUrl);
    const key = url.pathname.slice(1); // Remove leading '/'

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

/**
 * Upload multiple files to S3
 * @param {Array} files - Array of file objects from multer
 * @param {string} folder - S3 folder
 * @returns {Promise<Array<string>>} - Array of uploaded file URLs
 */
const uploadMultipleToS3 = async (files, folder = 'uploads') => {
  try {
    const uploadPromises = files.map(file => 
      uploadToS3(file.buffer, file.originalname, file.mimetype, folder)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple S3 Upload Error:', error);
    throw new Error('Failed to upload files to S3');
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  uploadMultipleToS3,
  BUCKET_NAME,
};
