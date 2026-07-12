const tendersService = require('./service');
const { TendersResponseDTO } = require('./dto');

class TendersController {
  async createTender(req, res) {
    try {
      const createdBy = req.user?.id || req.user?.userId;
      const result = await tendersService.createTender(createdBy, req.body);

      return res.status(201).json(
        new TendersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new TendersResponseDTO(false, 'Failed to create tender', null, [error.message])
      );
    }
  }

  async getTenderById(req, res) {
    try {
      const { tenderId } = req.params;
      const result = await tendersService.getTenderById(tenderId);

      return res.status(200).json(
        new TendersResponseDTO(result.success, 'Tender retrieved', result.data)
      );
    } catch (error) {
      return res.status(404).json(
        new TendersResponseDTO(false, 'Failed to get tender', null, [error.message])
      );
    }
  }

  async updateTender(req, res) {
    try {
      const { tenderId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await tendersService.updateTender(tenderId, userId, req.body);

      return res.status(200).json(
        new TendersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new TendersResponseDTO(false, 'Failed to update tender', null, [error.message])
      );
    }
  }

  async deleteTender(req, res) {
    try {
      const { tenderId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await tendersService.deleteTender(tenderId, userId);

      return res.status(200).json(
        new TendersResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new TendersResponseDTO(false, 'Failed to delete tender', null, [error.message])
      );
    }
  }

  async getAllTenders(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        category,
        visibility,
        isArchived,
        search,
        createdBy,
        issuingOrganization,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await tendersService.getAllTenders(
        parseInt(page),
        parseInt(limit),
        { status, category, visibility, isArchived, search, createdBy, issuingOrganization, sortBy, sortOrder }
      );

      return res.status(200).json(
        new TendersResponseDTO(result.success, 'Tenders retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new TendersResponseDTO(false, 'Failed to get tenders', null, [error.message])
      );
    }
  }

  async searchTenders(req, res) {
    try {
      const { q, page = 1, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json(
          new TendersResponseDTO(false, 'Search term is required', null, ['q parameter is missing'])
        );
      }

      const result = await tendersService.searchTenders(
        q,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new TendersResponseDTO(result.success, 'Search results', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new TendersResponseDTO(false, 'Failed to search tenders', null, [error.message])
      );
    }
  }

  async publishTender(req, res) {
    try {
      const { tenderId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const publishedBy = userId;
      const result = await tendersService.publishTender(tenderId, userId, publishedBy);

      return res.status(200).json(
        new TendersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new TendersResponseDTO(false, 'Failed to publish tender', null, [error.message])
      );
    }
  }

  async unpublishTender(req, res) {
    try {
      const { tenderId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await tendersService.unpublishTender(tenderId, userId);

      return res.status(200).json(
        new TendersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new TendersResponseDTO(false, 'Failed to unpublish tender', null, [error.message])
      );
    }
  }

  async closeTender(req, res) {
    try {
      const { tenderId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await tendersService.closeTender(tenderId, userId);

      return res.status(200).json(
        new TendersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new TendersResponseDTO(false, 'Failed to close tender', null, [error.message])
      );
    }
  }

  async awardTender(req, res) {
    try {
      const { tenderId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const { awardedToBidId } = req.body;
      const result = await tendersService.awardTender(tenderId, userId, awardedToBidId);

      return res.status(200).json(
        new TendersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new TendersResponseDTO(false, 'Failed to award tender', null, [error.message])
      );
    }
  }

  async cancelTender(req, res) {
    try {
      const { tenderId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const { cancellationReason } = req.body;
      const result = await tendersService.cancelTender(tenderId, userId, cancellationReason);

      return res.status(200).json(
        new TendersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new TendersResponseDTO(false, 'Failed to cancel tender', null, [error.message])
      );
    }
  }

  async archiveTender(req, res) {
    try {
      const { tenderId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await tendersService.archiveTender(tenderId, userId);

      return res.status(200).json(
        new TendersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new TendersResponseDTO(false, 'Failed to archive tender', null, [error.message])
      );
    }
  }

  async unarchiveTender(req, res) {
    try {
      const { tenderId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await tendersService.unarchiveTender(tenderId, userId);

      return res.status(200).json(
        new TendersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new TendersResponseDTO(false, 'Failed to unarchive tender', null, [error.message])
      );
    }
  }

  async addDocument(req, res) {
    try {
      const { tenderId } = req.params;
      const uploadedBy = req.user?.id || req.user?.userId;
      const { documentType, documentName, documentUrl, fileSize, mimeType } = req.body;

      const result = await tendersService.addDocument(tenderId, uploadedBy, {
        documentType,
        documentName,
        documentUrl,
        fileSize,
        mimeType,
      });

      return res.status(201).json(
        new TendersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new TendersResponseDTO(false, 'Failed to add document', null, [error.message])
      );
    }
  }

  async removeDocument(req, res) {
    try {
      const { tenderId, documentId } = req.params;
      const result = await tendersService.removeDocument(tenderId, documentId);

      return res.status(200).json(
        new TendersResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new TendersResponseDTO(false, 'Failed to remove document', null, [error.message])
      );
    }
  }

  async getTenderStatistics(req, res) {
    try {
      const result = await tendersService.getTenderStatistics();

      return res.status(200).json(
        new TendersResponseDTO(result.success, 'Tender statistics retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new TendersResponseDTO(false, 'Failed to get tender statistics', null, [error.message])
      );
    }
  }
}

module.exports = new TendersController();
