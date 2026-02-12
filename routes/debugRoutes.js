const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/**
 * Debug endpoint to check server configuration
 * GET /api/debug/config
 */
router.get('/config', (req, res) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  
  const checkDir = (dirPath) => {
    try {
      return {
        exists: fs.existsSync(dirPath),
        isDirectory: fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory(),
        permissions: fs.existsSync(dirPath) ? fs.statSync(dirPath).mode.toString(8) : 'N/A',
        path: dirPath
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message,
        path: dirPath
      };
    }
  };

  const config = {
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      USE_S3: process.env.USE_S3,
      BASE_URL: process.env.BASE_URL,
      PORT: process.env.PORT
    },
    directories: {
      uploadsRoot: checkDir(uploadsDir),
      events: checkDir(path.join(uploadsDir, 'events')),
      danweem: checkDir(path.join(uploadsDir, 'danweem')),
      proofs: checkDir(path.join(uploadsDir, 'proofs'))
    },
    uploadStrategy: process.env.USE_S3 === 'true' ? 'AWS S3' : 'Local Storage',
    timestamp: new Date().toISOString()
  };

  res.json(config);
});

/**
 * Test file write
 * POST /api/debug/test-write
 */
router.post('/test-write', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const testDir = path.join(uploadsDir, 'test');
    
    // Create directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    // Write test file
    const testFile = path.join(testDir, 'test.txt');
    fs.writeFileSync(testFile, `Test write at ${new Date().toISOString()}`);
    
    // Read it back
    const content = fs.readFileSync(testFile, 'utf8');
    
    // Clean up
    fs.unlinkSync(testFile);
    fs.rmdirSync(testDir);
    
    res.json({
      success: true,
      message: 'Write test successful',
      content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
