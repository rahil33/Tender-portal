const { Document } = require('./model');
const {
  DocumentDTO,
  DocumentSummaryDTO,
} = require('./dto');
const {
  DOCUMENT_STATUS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  SORT_FIELDS,
  SORT_ORDER,
} = require('./constants');
const FileService = require('../../services/FileService');
const AuditService = require('../../services/AuditService');
const NotificationService = require('../../services/NotificationService');
const crypto = require('crypto');

class DocumentsService {
  _addAuditLog(document, action, performedBy, details = null) {
    document.auditLog.push({
      action,
      performedBy,
      timestamp: new Date(),
      details,
    });
  }

  async uploadDocument(uploadedBy, documentData) {
    try {
      const fileValidation = await FileService.validateFile({
        originalname: documentData.originalFileName || documentData.fileName,
        mimetype: documentData.mimeType,
        size: documentData.fileSize,
      });

      let fileHash = null;
      if (documentData.fileBuffer) {
        fileHash = FileService.generateFileHash(documentData.fileBuffer);
        
        const malwareScan = await FileService.malwareScanHook(
          documentData.fileBuffer,
          documentData.originalFileName || documentData.fileName
        );
        
        if (!malwareScan.isClean) {
          throw new Error('Security scan failed. File contains threats.');
        }
      }

      const document = await Document.create({
        ...documentData,
        uploadedBy,
        originalFileName: documentData.originalFileName || documentData.fileName,
        fileHash,
        fileName: FileService.sanitizeFileName(documentData.originalFileName || documentData.fileName),
      });

      this._addAuditLog(document, 'DOCUMENT_UPLOADED', uploadedBy, 'Document uploaded with security validation');

      await AuditService.createAuditLog({
        action: 'CREATE',
        resourceType: 'Document',
        resourceId: document._id,
        user: { id: uploadedBy },
        status: 'SUCCESS',
        metadata: {
          fileName: document.fileName,
          fileSize: document.fileSize,
          mimeType: document.mimeType,
          fileHash,
        },
      });

      if (documentData.tenderId) {
        await NotificationService.notify('document:uploaded', {
          tenderId: documentData.tenderId,
          documentId: document._id,
          fileName: document.fileName,
          uploadedBy,
        });
      }

      return {
        success: true,
        data: new DocumentDTO(document),
        message: 'Document uploaded successfully',
      };
    } catch (error) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  async getDocumentById(documentId) {
    try {
      const document = await Document.findById(documentId)
        .populate('tenderId', 'title tenderNumber')
        .populate('bidId', 'bidNumber')
        .populate('organizationId', 'name')
        .populate('uploadedBy', 'fullName email')
        .lean();

      if (!document || document.isDeleted) {
        throw new Error('Document not found');
      }

      return {
        success: true,
        data: new DocumentDTO(document),
      };
    } catch (error) {
      throw new Error(`Failed to get document: ${error.message}`);
    }
  }

  async updateDocument(documentId, userId, updates) {
    try {
      const document = await Document.findById(documentId);

      if (!document || document.isDeleted) {
        throw new Error('Document not found');
      }

      if (document.uploadedBy.toString() !== userId.toString()) {
        throw new Error('You do not have permission to update this document');
      }

      Object.assign(document, updates);
      this._addAuditLog(document, 'DOCUMENT_UPDATED', userId, 'Document metadata updated');

      await document.save();

      await AuditService.createAuditLog({
        action: 'UPDATE',
        resourceType: 'Document',
        resourceId: documentId,
        user: { id: userId },
        status: 'SUCCESS',
        changes: { after: updates },
      });

      return {
        success: true,
        data: new DocumentDTO(document),
        message: 'Document updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }

  async replaceDocument(documentId, userId, fileData) {
    try {
      const document = await Document.findById(documentId);

      if (!document || document.isDeleted) {
        throw new Error('Document not found');
      }

      if (document.uploadedBy.toString() !== userId.toString()) {
        throw new Error('You do not have permission to replace this document');
      }

      const fileValidation = await FileService.validateFile({
        originalname: fileData.originalFileName || fileData.fileName,
        mimetype: fileData.mimeType,
        size: fileData.fileSize,
      });

      let fileHash = null;
      if (fileData.fileBuffer) {
        fileHash = FileService.generateFileHash(fileData.fileBuffer);
        
        const malwareScan = await FileService.malwareScanHook(
          fileData.fileBuffer,
          fileData.originalFileName || fileData.fileName
        );
        
        if (!malwareScan.isClean) {
          throw new Error('Security scan failed. File contains threats.');
        }
      }

      const oldVersion = {
        versionNumber: document.currentVersion,
        fileUrl: document.fileUrl,
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        uploadedBy: document.uploadedBy,
        uploadedAt: document.uploadedAt || document.createdAt,
        changes: 'Replaced with new version',
      };

      document.versionHistory.push(oldVersion);
      document.currentVersion += 1;
      document.fileUrl = fileData.fileUrl;
      document.fileName = FileService.sanitizeFileName(fileData.originalFileName || fileData.fileName);
      document.fileSize = fileData.fileSize;
      document.mimeType = fileData.mimeType;
      document.fileHash = fileHash;
      document.originalFileName = fileData.originalFileName || fileData.fileName;

      this._addAuditLog(document, 'DOCUMENT_REPLACED', userId, `Document replaced with version ${document.currentVersion}`);

      await document.save();

      await AuditService.createAuditLog({
        action: 'UPDATE',
        resourceType: 'Document',
        resourceId: documentId,
        user: { id: userId },
        status: 'SUCCESS',
        metadata: {
          action: 'replace',
          oldVersion: oldVersion.versionNumber,
          newVersion: document.currentVersion,
          fileHash,
        },
      });

      return {
        success: true,
        data: new DocumentDTO(document),
        message: 'Document replaced successfully',
      };
    } catch (error) {
      throw new Error(`Failed to replace document: ${error.message}`);
    }
  }

  async previewDocument(documentId, userId) {
    try {
      const document = await Document.findById(documentId);

      if (!document || document.isDeleted) {
        throw new Error('Document not found');
      }

      const isPreviewable = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'text/plain',
        'text/csv',
      ].includes(document.mimeType);

      if (!isPreviewable) {
        throw new Error('Preview not available for this file type');
      }

      this._addAuditLog(document, 'DOCUMENT_PREVIEWED', userId, 'Document previewed');

      document.viewCount = (document.viewCount || 0) + 1;
      await document.save();

      return {
        success: true,
        data: {
          fileUrl: document.fileUrl,
          fileName: document.fileName,
          mimeType: document.mimeType,
          fileSize: document.fileSize,
          isPreviewable: true,
        },
        message: 'Preview ready',
      };
    } catch (error) {
      throw new Error(`Failed to preview document: ${error.message}`);
    }
  }

  async deleteDocument(documentId, deletedBy) {
    try {
      const document = await Document.findById(documentId);

      if (!document) {
        throw new Error('Document not found');
      }

      if (document.isDeleted) {
        throw new Error('Document is already deleted');
      }

      document.isDeleted = true;
      document.deletedAt = new Date();
      document.deletedBy = deletedBy;
      this._addAuditLog(document, 'DOCUMENT_DELETED', deletedBy, 'Document soft deleted');

      await document.save();

      return {
        success: true,
        message: 'Document deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  async restoreDocument(documentId, userId) {
    try {
      const document = await Document.findById(documentId);

      if (!document) {
        throw new Error('Document not found');
      }

      if (!document.isDeleted) {
        throw new Error('Document is not deleted');
      }

      document.isDeleted = false;
      document.deletedAt = null;
      document.deletedBy = null;
      this._addAuditLog(document, 'DOCUMENT_RESTORED', userId, 'Document restored');

      await document.save();

      return {
        success: true,
        data: new DocumentDTO(document),
        message: 'Document restored successfully',
      };
    } catch (error) {
      throw new Error(`Failed to restore document: ${error.message}`);
    }
  }

  async downloadDocument(documentId, userId) {
    try {
      const document = await Document.findById(documentId);

      if (!document || document.isDeleted) {
        throw new Error('Document not found');
      }

      document.downloadCount += 1;
      this._addAuditLog(document, 'DOCUMENT_DOWNLOADED', userId, 'Document downloaded');

      await document.save();

      return {
        success: true,
        data: {
          fileUrl: document.fileUrl,
          fileName: document.fileName,
          mimeType: document.mimeType,
          fileSize: document.fileSize,
        },
        message: 'Download initiated',
      };
    } catch (error) {
      throw new Error(`Failed to download document: ${error.message}`);
    }
  }

  async getAllDocuments(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = { isDeleted: false };

      if (filters.status) query.status = filters.status;
      if (filters.documentType) query.documentType = filters.documentType;
      if (filters.tenderId) query.tenderId = filters.tenderId;
      if (filters.bidId) query.bidId = filters.bidId;
      if (filters.organizationId) query.organizationId = filters.organizationId;
      
      if (filters.isPublic !== undefined) {
        query.isPublic = filters.isPublic === 'true' || filters.isPublic === true;
      }

      const sortField = SORT_FIELDS[filters.sortBy] || SORT_FIELDS.createdAt;
      const sortValue = filters.sortOrder === SORT_ORDER.ASC ? 1 : -1;
      const sort = { [sortField]: sortValue };

      const documents = await Document.find(query)
        .populate('tenderId', 'title tenderNumber')
        .populate('bidId', 'bidNumber')
        .populate('organizationId', 'name')
        .populate('uploadedBy', 'fullName email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Document.countDocuments(query);

      return {
        success: true,
        data: {
          data: documents.map((d) => new DocumentSummaryDTO(d)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get documents: ${error.message}`);
    }
  }

  async searchDocuments(searchTerm, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;
      const query = {
        isDeleted: false,
        $or: [
          { fileName: { $regex: searchTerm, $options: 'i' } },
          { originalFileName: { $regex: searchTerm, $options: 'i' } },
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        ],
      };

      const results = await Document.find(query)
        .populate('tenderId', 'title tenderNumber')
        .populate('bidId', 'bidNumber')
        .populate('organizationId', 'name')
        .populate('uploadedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Document.countDocuments(query);

      return {
        success: true,
        data: {
          data: results.map((d) => new DocumentSummaryDTO(d)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to search documents: ${error.message}`);
    }
  }

  async uploadNewVersion(documentId, uploadedBy, versionData) {
    try {
      const document = await Document.findById(documentId);

      if (!document || document.isDeleted) {
        throw new Error('Document not found');
      }

      const newVersion = {
        versionNumber: document.currentVersion + 1,
        fileUrl: versionData.fileUrl,
        fileName: versionData.fileName,
        fileSize: versionData.fileSize,
        mimeType: versionData.mimeType,
        uploadedBy,
        uploadedAt: new Date(),
        changes: versionData.changes || 'New version uploaded',
      };

      document.versionHistory.push(newVersion);
      document.currentVersion += 1;
      document.fileUrl = versionData.fileUrl;
      document.fileName = versionData.fileName;
      document.fileSize = versionData.fileSize;
      document.mimeType = versionData.mimeType;

      this._addAuditLog(document, 'VERSION_UPLOADED', uploadedBy, `Version ${document.currentVersion} uploaded`);

      await document.save();

      return {
        success: true,
        data: new DocumentDTO(document),
        message: 'New version uploaded successfully',
      };
    } catch (error) {
      throw new Error(`Failed to upload new version: ${error.message}`);
    }
  }

  async getTenderDocuments(tenderId, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;
      const query = { tenderId, isDeleted: false };

      const documents = await Document.find(query)
        .populate('uploadedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Document.countDocuments(query);

      return {
        success: true,
        data: {
          data: documents.map((d) => new DocumentSummaryDTO(d)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get tender documents: ${error.message}`);
    }
  }

  async getBidDocuments(bidId, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;
      const query = { bidId, isDeleted: false };

      const documents = await Document.find(query)
        .populate('uploadedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Document.countDocuments(query);

      return {
        success: true,
        data: {
          data: documents.map((d) => new DocumentSummaryDTO(d)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get bid documents: ${error.message}`);
    }
  }

  async getOrganizationDocuments(organizationId, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;
      const query = { organizationId, isDeleted: false };

      const documents = await Document.find(query)
        .populate('uploadedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Document.countDocuments(query);

      return {
        success: true,
        data: {
          data: documents.map((d) => new DocumentSummaryDTO(d)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get organization documents: ${error.message}`);
    }
  }

  async getDocumentStatistics() {
    try {
      const totalDocuments = await Document.countDocuments({ isDeleted: false });
      const activeDocuments = await Document.countDocuments({ 
        status: DOCUMENT_STATUS.ACTIVE,
        isDeleted: false 
      });
      const archivedDocuments = await Document.countDocuments({ 
        status: DOCUMENT_STATUS.ARCHIVED,
        isDeleted: false 
      });
      const deletedDocuments = await Document.countDocuments({ isDeleted: true });
      const publicDocuments = await Document.countDocuments({ 
        isPublic: true,
        isDeleted: false 
      });

      const documentsByType = await Document.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$documentType', count: { $sum: 1 } } },
      ]);

      const totalSize = await Document.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$fileSize' } } },
      ]);

      return {
        success: true,
        data: {
          totalDocuments,
          activeDocuments,
          archivedDocuments,
          deletedDocuments,
          publicDocuments,
          documentsByType: documentsByType.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          totalStorageSize: totalSize[0]?.total || 0,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get document statistics: ${error.message}`);
    }
  }
}

module.exports = new DocumentsService();