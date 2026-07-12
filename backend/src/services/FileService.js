const crypto = require('crypto');
const logger = require('../config/logger');

const ALLOWED_MIME_TYPES = {
  PDF: ['application/pdf'],
  DOCX: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  DOC: ['application/msword'],
  XLSX: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  XLS: ['application/vnd.ms-excel'],
  ZIP: ['application/zip', 'application/x-zip-compressed'],
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  TEXT: ['text/plain', 'text/csv'],
};

const ALLOWED_EXTENSIONS = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-excel': '.xls',
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'text/plain': '.txt',
  'text/csv': '.csv',
};

const MAX_FILE_SIZE = {
  PDF: 25 * 1024 * 1024, // 25 MB
  DOCX: 20 * 1024 * 1024, // 20 MB
  XLSX: 20 * 1024 * 1024, // 20 MB
  ZIP: 50 * 1024 * 1024, // 50 MB
  IMAGE: 10 * 1024 * 1024, // 10 MB
  DEFAULT: 10 * 1024 * 1024, // 10 MB
};

const FILE_CATEGORIES = {
  DOCUMENT: 'document',
  SPREADSHEET: 'spreadsheet',
  ARCHIVE: 'archive',
  IMAGE: 'image',
  OTHER: 'other',
};

class FileService {
  validateMimeType(mimeType, allowedTypes = []) {
    if (!mimeType) {
      throw new Error('MIME type is required');
    }

    const allAllowedTypes = Object.values(ALLOWED_MIME_TYPES).flat();
    if (allowedTypes.length > 0) {
      if (!allowedTypes.includes(mimeType)) {
        throw new Error(`File type ${mimeType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      }
    } else {
      if (!allAllowedTypes.includes(mimeType)) {
        throw new Error(`File type ${mimeType} is not supported`);
      }
    }

    return true;
  }

  validateFileSize(fileSize, category = 'DEFAULT') {
    if (!fileSize) {
      throw new Error('File size is required');
    }

    const maxSize = MAX_FILE_SIZE[category] || MAX_FILE_SIZE.DEFAULT;
    if (fileSize > maxSize) {
      throw new Error(`File size ${fileSize} bytes exceeds maximum allowed size of ${maxSize} bytes`);
    }

    if (fileSize <= 0) {
      throw new Error('File size must be greater than 0');
    }

    return true;
  }

  validateFileName(fileName) {
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('File name is required');
    }

    if (fileName.length > 255) {
      throw new Error('File name must not exceed 255 characters');
    }

    const invalidChars = /[<>:"|\\?*]/g;
    if (invalidChars.test(fileName)) {
      throw new Error('File name contains invalid characters');
    }

    const extension = fileName.split('.').pop().toLowerCase();
    if (!extension || extension.length === 0) {
      throw new Error('File must have an extension');
    }

    return true;
  }

  getFileCategory(mimeType) {
    if (ALLOWED_MIME_TYPES.PDF.includes(mimeType) || 
        ALLOWED_MIME_TYPES.DOCX.includes(mimeType) || 
        ALLOWED_MIME_TYPES.DOC.includes(mimeType)) {
      return FILE_CATEGORIES.DOCUMENT;
    }

    if (ALLOWED_MIME_TYPES.XLSX.includes(mimeType) || 
        ALLOWED_MIME_TYPES.XLS.includes(mimeType)) {
      return FILE_CATEGORIES.SPREADSHEET;
    }

    if (ALLOWED_MIME_TYPES.ZIP.includes(mimeType)) {
      return FILE_CATEGORIES.ARCHIVE;
    }

    if (ALLOWED_MIME_TYPES.IMAGES.includes(mimeType)) {
      return FILE_CATEGORIES.IMAGE;
    }

    return FILE_CATEGORIES.OTHER;
  }

  getMaxFileSize(mimeType) {
    const category = this.getFileCategory(mimeType);
    switch (category) {
      case FILE_CATEGORIES.DOCUMENT:
        return MAX_FILE_SIZE.PDF;
      case FILE_CATEGORIES.SPREADSHEET:
        return MAX_FILE_SIZE.XLSX;
      case FILE_CATEGORIES.ARCHIVE:
        return MAX_FILE_SIZE.ZIP;
      case FILE_CATEGORIES.IMAGE:
        return MAX_FILE_SIZE.IMAGE;
      default:
        return MAX_FILE_SIZE.DEFAULT;
    }
  }

  generateFileHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  generateSecureFileName(originalName) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = originalName.split('.').pop().toLowerCase();
    const sanitizedName = originalName
      .split('.')
      .slice(0, -1)
      .join('.')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    
    return `${sanitizedName}_${timestamp}_${random}.${extension}`;
  }

  async malwareScanHook(fileBuffer, fileName) {
    logger.info('Malware scan hook triggered', { fileName });
    
    try {
      const scanResult = {
        isClean: true,
        scanTime: new Date(),
        scanner: 'placeholder',
        threats: [],
      };

      return scanResult;
    } catch (error) {
      logger.error('Malware scan failed', { fileName, error: error.message });
      throw new Error('Security scan failed. File cannot be uploaded.');
    }
  }

  async validateFile(file, allowedTypes = []) {
    const errors = [];

    try {
      this.validateFileName(file.originalname || file.fileName);
    } catch (error) {
      errors.push(error.message);
    }

    try {
      this.validateMimeType(file.mimetype || file.mimeType, allowedTypes);
    } catch (error) {
      errors.push(error.message);
    }

    try {
      const category = this.getFileCategory(file.mimetype || file.mimeType);
      this.validateFileSize(file.size || file.fileSize, category);
    } catch (error) {
      errors.push(error.message);
    }

    if (errors.length > 0) {
      throw new Error(`File validation failed: ${errors.join('; ')}`);
    }

    return {
      isValid: true,
      category: this.getFileCategory(file.mimetype || file.mimeType),
      maxFileSize: this.getMaxFileSize(file.mimetype || file.mimeType),
      secureFileName: this.generateSecureFileName(file.originalname || file.fileName),
    };
  }

  sanitizeFileName(fileName) {
    return fileName
      .replace(/[^a-zA-Z0-9-_\.]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }

  getExtensionFromMime(mimeType) {
    return ALLOWED_EXTENSIONS[mimeType] || '.bin';
  }

  checkDuplicateFileName(existingFiles, newFileName) {
    const normalizedName = newFileName.toLowerCase();
    const isDuplicate = existingFiles.some(
      f => f.fileName.toLowerCase() === normalizedName
    );

    if (isDuplicate) {
      const timestamp = Date.now();
      const nameParts = newFileName.split('.');
      const extension = nameParts.pop();
      const name = nameParts.join('.');
      return `${name}_${timestamp}.${extension}`;
    }

    return newFileName;
  }
}

module.exports = new FileService();