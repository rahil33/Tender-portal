const documentsService = require('./service');
const { DocumentsResponseDTO } = require('./dto');

class DocumentsController {
  async uploadDocument(req, res) {
    try {
      const uploadedBy = req.user?.id || req.user?.userId;
      const result = await documentsService.uploadDocument(uploadedBy, req.body);

      return res.status(201).json(
        new DocumentsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new DocumentsResponseDTO(false, 'Failed to upload document', null, [error.message])
      );
    }
  }

  async getDocumentById(req, res) {
    try {
      const { documentId } = req.params;
      const result = await documentsService.getDocumentById(documentId);

      return res.status(200).json(
        new DocumentsResponseDTO(result.success, 'Document retrieved', result.data)
      );
    } catch (error) {
      return res.status(404).json(
        new DocumentsResponseDTO(false, 'Failed to get document', null, [error.message])
      );
    }
  }

  async updateDocument(req, res) {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await documentsService.updateDocument(documentId, userId, req.body);

      return res.status(200).json(
        new DocumentsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new DocumentsResponseDTO(false, 'Failed to update document', null, [error.message])
      );
    }
  }

  async deleteDocument(req, res) {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await documentsService.deleteDocument(documentId, userId);

      return res.status(200).json(
        new DocumentsResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new DocumentsResponseDTO(false, 'Failed to delete document', null, [error.message])
      );
    }
  }

  async restoreDocument(req, res) {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await documentsService.restoreDocument(documentId, userId);

      return res.status(200).json(
        new DocumentsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new DocumentsResponseDTO(false, 'Failed to restore document', null, [error.message])
      );
    }
  }

  async downloadDocument(req, res) {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await documentsService.downloadDocument(documentId, userId);

      return res.status(200).json(
        new DocumentsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new DocumentsResponseDTO(false, 'Failed to download document', null, [error.message])
      );
    }
  }

  async getAllDocuments(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        documentType,
        tenderId,
        bidId,
        organizationId,
        isPublic,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await documentsService.getAllDocuments(
        parseInt(page),
        parseInt(limit),
        { status, documentType, tenderId, bidId, organizationId, isPublic, sortBy, sortOrder }
      );

      return res.status(200).json(
        new DocumentsResponseDTO(result.success, 'Documents retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new DocumentsResponseDTO(false, 'Failed to get documents', null, [error.message])
      );
    }
  }

  async searchDocuments(req, res) {
    try {
      const { q, page = 1, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json(
          new DocumentsResponseDTO(false, 'Search term is required', null, ['q parameter is missing'])
        );
      }

      const result = await documentsService.searchDocuments(
        q,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new DocumentsResponseDTO(result.success, 'Search results', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new DocumentsResponseDTO(false, 'Failed to search documents', null, [error.message])
      );
    }
  }

  async uploadNewVersion(req, res) {
    try {
      const { documentId } = req.params;
      const uploadedBy = req.user?.id || req.user?.userId;
      const { fileUrl, fileName, fileSize, mimeType, changes } = req.body;

      const result = await documentsService.uploadNewVersion(documentId, uploadedBy, {
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        changes,
      });

      return res.status(201).json(
        new DocumentsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new DocumentsResponseDTO(false, 'Failed to upload new version', null, [error.message])
      );
    }
  }

  async getTenderDocuments(req, res) {
    try {
      const { tenderId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await documentsService.getTenderDocuments(
        tenderId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new DocumentsResponseDTO(result.success, 'Tender documents retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new DocumentsResponseDTO(false, 'Failed to get tender documents', null, [error.message])
      );
    }
  }

  async getBidDocuments(req, res) {
    try {
      const { bidId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await documentsService.getBidDocuments(
        bidId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new DocumentsResponseDTO(result.success, 'Bid documents retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new DocumentsResponseDTO(false, 'Failed to get bid documents', null, [error.message])
      );
    }
  }

  async getOrganizationDocuments(req, res) {
    try {
      const { organizationId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await documentsService.getOrganizationDocuments(
        organizationId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new DocumentsResponseDTO(result.success, 'Organization documents retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new DocumentsResponseDTO(false, 'Failed to get organization documents', null, [error.message])
      );
    }
  }

  async getDocumentStatistics(req, res) {
    try {
      const result = await documentsService.getDocumentStatistics();

      return res.status(200).json(
        new DocumentsResponseDTO(result.success, 'Document statistics retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new DocumentsResponseDTO(false, 'Failed to get document statistics', null, [error.message])
      );
    }
  }
}

module.exports = new DocumentsController();