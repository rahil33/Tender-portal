const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadMultiple, getFileUrl } = require('../config/upload');

// POST /api/upload/documents — upload up to 10 files, field name "files"
router.post('/documents', protect, uploadMultiple('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded',
      });
    }

    const uploaded = req.files.map((file) => ({
      originalName: file.originalname,
      fileName: file.filename,
      url: getFileUrl(file.filename),
      size: file.size,
      mimeType: file.mimetype,
    }));

    res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploaded,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
});

module.exports = router;