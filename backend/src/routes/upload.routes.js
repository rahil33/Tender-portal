const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadMultiple, getFileUrl, uploadDir } = require('../config/upload');
const logger = require('../config/logger');
const fs = require('fs');

router.post('/documents', protect, uploadMultiple('files', 10), (req, res) => {
  const uploadedFiles = [];
  
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded',
      });
    }

    const uploaded = req.files.map((file) => {
      uploadedFiles.push(file.path);
      return {
        originalName: file.originalname,
        fileName: file.filename,
        url: getFileUrl(file.filename),
        size: file.size,
        mimeType: file.mimetype,
      };
    });

    res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploaded,
    });
  } catch (error) {
    logger.error('Upload failed, cleaning up files', { error: error.message });
    
    uploadedFiles.forEach((filePath) => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info('Cleaned up file:', filePath);
        }
      } catch (cleanupError) {
        logger.error('Failed to clean up file:', filePath, cleanupError);
      }
    });
    
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
});

module.exports = router;