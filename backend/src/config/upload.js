const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('./env');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.resolve(env.UPLOAD_PATH);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadDir, 'documents');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (env.ALLOWED_FILE_TYPES.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed. Allowed types: ${env.ALLOWED_FILE_TYPES.join(', ')}`), false);
  }
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