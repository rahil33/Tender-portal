const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const uploadConfig = require('../config/upload');
const logger = require('../config/logger');

class FileService {
  async saveFile(file, subDirectory = 'documents') {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      const uploadPath = path.join(uploadConfig.uploadDir, subDirectory);
      
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const uniqueName = `${uuidv4()}${path.extname(file.originalname || file.name)}`;
      const filePath = path.join(uploadPath, uniqueName);

      await fs.promises.writeFile(filePath, file.buffer || file.data);

      const relativePath = path.join(subDirectory, uniqueName);
      const fileUrl = uploadConfig.getFileUrl(uniqueName);

      logger.info('File saved successfully', { path: relativePath, size: file.size });

      return {
        filename: uniqueName,
        path: relativePath,
        url: fileUrl,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      logger.error('Failed to save file', { error: error.message });
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async deleteFile(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(uploadConfig.uploadDir, filePath);

      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        logger.info('File deleted successfully', { path: filePath });
        return true;
      }

      logger.warn('File not found for deletion', { path: filePath });
      return false;
    } catch (error) {
      logger.error('Failed to delete file', { path: filePath, error: error.message });
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  async getFile(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(uploadConfig.uploadDir, filePath);

      if (!fs.existsSync(fullPath)) {
        throw new Error('File not found');
      }

      const stats = await fs.promises.stat(fullPath);
      const content = await fs.promises.readFile(fullPath);

      return {
        path: fullPath,
        content,
        size: stats.size,
        modifiedAt: stats.mtime,
      };
    } catch (error) {
      logger.error('Failed to get file', { path: filePath, error: error.message });
      throw error;
    }
  }

  async fileExists(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(uploadConfig.uploadDir, filePath);

      return fs.existsSync(fullPath);
    } catch (error) {
      logger.error('Failed to check file existence', { path: filePath, error: error.message });
      return false;
    }
  }

  async getFileInfo(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(uploadConfig.uploadDir, filePath);

      if (!fs.existsSync(fullPath)) {
        throw new Error('File not found');
      }

      const stats = await fs.promises.stat(fullPath);

      return {
        path: fullPath,
        name: path.basename(filePath),
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        ext: path.extname(filePath),
      };
    } catch (error) {
      logger.error('Failed to get file info', { path: filePath, error: error.message });
      throw error;
    }
  }

  async createDirectory(dirPath) {
    try {
      const fullPath = path.join(uploadConfig.uploadDir, dirPath);
      
      if (!fs.existsSync(fullPath)) {
        await fs.promises.mkdir(fullPath, { recursive: true });
        logger.info('Directory created', { path: dirPath });
      }

      return fullPath;
    } catch (error) {
      logger.error('Failed to create directory', { path: dirPath, error: error.message });
      throw error;
    }
  }

  async listFiles(directory = 'documents') {
    try {
      const dirPath = path.join(uploadConfig.uploadDir, directory);
      
      if (!fs.existsSync(dirPath)) {
        return [];
      }

      const files = await fs.promises.readdir(dirPath);
      
      return files.map(file => ({
        name: file,
        path: path.join(directory, file),
      }));
    } catch (error) {
      logger.error('Failed to list files', { directory, error: error.message });
      throw error;
    }
  }
}

module.exports = new FileService();