const fs = require('fs');
const path = require('path');
const { uploadToS3 } = require('../utils/s3Upload');
const Event = require('../models/Event');
const Danweem = require('../models/Danweem');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Migrate a local file to S3
 */
async function migrateFileToS3(localPath) {
  try {
    if (!fs.existsSync(localPath)) {
      console.log(`File not found: ${localPath}`);
      return null;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const fileName = path.basename(localPath);
    const folder = path.basename(path.dirname(localPath));
    
    // Determine MIME type from extension
    const ext = path.extname(fileName).toLowerCase();
    let mimetype = 'application/octet-stream';
    if (['.jpg', '.jpeg'].includes(ext)) mimetype = 'image/jpeg';
    else if (ext === '.png') mimetype = 'image/png';
    else if (ext === '.gif') mimetype = 'image/gif';
    else if (ext === '.webp') mimetype = 'image/webp';
    else if (ext === '.mp4') mimetype = 'video/mp4';
    else if (ext === '.webm') mimetype = 'video/webm';
    else if (ext === '.pdf') mimetype = 'application/pdf';

    console.log(`Uploading ${fileName} to S3...`);
    const s3Url = await uploadToS3(fileBuffer, fileName, mimetype, folder);
    console.log(`✓ Uploaded: ${s3Url}`);
    
    return s3Url;
  } catch (error) {
    console.error(`Error migrating file ${localPath}:`, error.message);
    return null;
  }
}

/**
 * Update database records with new S3 URLs
 */
async function updateEventUrls(eventId, updates) {
  try {
    const event = await Event.getById(eventId);
    if (!event) return;

    const updateData = {};
    if (updates.imageUrl) updateData.imageUrl = updates.imageUrl;
    if (updates.proofDocumentUrl) updateData.proofDocumentUrl = updates.proofDocumentUrl;

    if (Object.keys(updateData).length > 0) {
      await Event.update(eventId, updateData);
      console.log(`✓ Updated event ${eventId} in database`);
    }
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error.message);
  }
}

async function updateDanweemUrls(danweemId, updates) {
  try {
    const danweem = await Danweem.getById(danweemId);
    if (!danweem) return;

    const updateData = {};
    if (updates.mediaUrl) updateData.mediaUrl = updates.mediaUrl;
    if (updates.thumbnailUrl) updateData.thumbnailUrl = updates.thumbnailUrl;
    if (updates.proofDocumentUrl) updateData.proofDocumentUrl = updates.proofDocumentUrl;

    if (Object.keys(updateData).length > 0) {
      await Danweem.update(danweemId, updateData);
      console.log(`✓ Updated danweem ${danweemId} in database`);
    }
  } catch (error) {
    console.error(`Error updating danweem ${danweemId}:`, error.message);
  }
}

/**
 * Main migration function
 */
async function migrateAllToS3() {
  console.log('Starting migration from local storage to S3...\n');

  try {
    // Migrate Events
    console.log('=== Migrating Events ===');
    const events = await Event.getAll();
    
    for (const event of events) {
      console.log(`\nProcessing Event: ${event.eventName} (${event.eventId})`);
      const updates = {};

      // Migrate event image
      if (event.imageUrl && event.imageUrl.startsWith('/uploads/')) {
        const localPath = path.join(__dirname, '..', event.imageUrl);
        const s3Url = await migrateFileToS3(localPath);
        if (s3Url) updates.imageUrl = s3Url;
      }

      // Migrate proof document
      if (event.proofDocumentUrl && event.proofDocumentUrl.startsWith('/uploads/')) {
        const localPath = path.join(__dirname, '..', event.proofDocumentUrl);
        const s3Url = await migrateFileToS3(localPath);
        if (s3Url) updates.proofDocumentUrl = s3Url;
      }

      if (Object.keys(updates).length > 0) {
        await updateEventUrls(event.eventId, updates);
      }
    }

    // Migrate Danweem
    console.log('\n\n=== Migrating Danweem ===');
    const danweemList = await Danweem.getAll();
    
    for (const danweem of danweemList) {
      console.log(`\nProcessing Danweem: ${danweem.title} (${danweem.danweemId})`);
      const updates = {};

      // Migrate media
      if (danweem.mediaUrl && danweem.mediaUrl.startsWith('/uploads/')) {
        const localPath = path.join(__dirname, '..', danweem.mediaUrl);
        const s3Url = await migrateFileToS3(localPath);
        if (s3Url) updates.mediaUrl = s3Url;
      }

      // Migrate thumbnail
      if (danweem.thumbnailUrl && danweem.thumbnailUrl.startsWith('/uploads/')) {
        const localPath = path.join(__dirname, '..', danweem.thumbnailUrl);
        const s3Url = await migrateFileToS3(localPath);
        if (s3Url) updates.thumbnailUrl = s3Url;
      }

      // Migrate proof document
      if (danweem.proofDocumentUrl && danweem.proofDocumentUrl.startsWith('/uploads/')) {
        const localPath = path.join(__dirname, '..', danweem.proofDocumentUrl);
        const s3Url = await migrateFileToS3(localPath);
        if (s3Url) updates.proofDocumentUrl = s3Url;
      }

      if (Object.keys(updates).length > 0) {
        await updateDanweemUrls(danweem.danweemId, updates);
      }
    }

    console.log('\n\n✓ Migration completed successfully!');
    console.log('You can now safely delete the local uploads folder if desired.');
    
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
  }

  process.exit(0);
}

// Run migration
if (require.main === module) {
  migrateAllToS3();
}

module.exports = { migrateAllToS3 };
