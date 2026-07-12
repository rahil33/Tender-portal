const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('./env');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

const uploadDir = path.resolve(env.UPLOAD_PATH);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename) => {
  return path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, '_');
};

// Validate MIME type based on file content
const validateMimeType = (file) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const allowedMimeTypes = {
    pdf: ['application/pdf'],
    doc: ['application/msword'],
    docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    xls: ['application/vnd.ms-excel'],
    xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    png: ['image/png'],
    jpg: ['image/jpeg'],
    jpeg: ['image/jpeg'],
  };

  const allowedMimes = allowedMimeTypes[ext];
  if (!allowedMimes) {
    return { valid: false, message: `File type ${ext} is not allowed` };
  }

  // Note: Actual MIME type checking requires file content inspection
  // This is a basic check; production should use a library like file-type
  if (!allowedMimes.includes(file.mimetype)) {
    logger.warn(`MIME type mismatch: ${file.mimetype} for ${file.originalname}`);
  }

  return { valid: true };
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadDir, 'documents');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const sanitizedOriginal = sanitizeFilename(file.originalname);
    const uniqueName = `${uuidv4()}-${sanitizedOriginal}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (!env.ALLOWED_FILE_TYPES.includes(ext)) {
    return cb(new Error(`File type ${ext} is not allowed. Allowed types: ${env.ALLOWED_FILE_TYPES.join(', ')}`), false);
  }
  
  const mimeTypeValidation = validateMimeType(file);
  if (!mimeTypeValidation.valid) {
    return cb(new Error(mimeTypeValidation.message), false);
  }
  
  cb(null, true);
};

const limits = {
  fileSize: env.MAX_FILE_SIZE,
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

const uploadSingle = (fieldName) => upload.single(fieldName);

const uploadMultiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);

const uploadFields = (fields) => upload.fields(fields);

const deleteFile = (filePath) => {
  try {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(uploadDir, filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

const getFileUrl = (filename) => {
  return `/uploads/documents/${filename}`;
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFile,
  getFileUrl,
  uploadDir,
};