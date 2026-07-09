const organizationsService = require('./service');
const { OrganizationsResponseDTO } = require('./dto');

class OrganizationsController {
  async createOrganization(req, res) {
    try {
      const ownerId = req.body.ownerId || req.user?.id || req.user?.userId;
      const { ownerId: _ownerId, ...organizationData } = req.body;

      const result = await organizationsService.createOrganization(ownerId, organizationData);

      return res.status(201).json(
        new OrganizationsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new OrganizationsResponseDTO(false, 'Failed to create organization', null, [error.message])
      );
    }
  }

  async getOrganizationById(req, res) {
    try {
      const { organizationId } = req.params;
      const result = await organizationsService.getOrganizationById(organizationId);

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, 'Organization retrieved', result.data)
      );
    } catch (error) {
      return res.status(404).json(
        new OrganizationsResponseDTO(false, 'Failed to get organization', null, [error.message])
      );
    }
  }

  async updateOrganization(req, res) {
    try {
      const { organizationId } = req.params;
      const result = await organizationsService.updateOrganization(organizationId, req.body);

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new OrganizationsResponseDTO(false, 'Failed to update organization', null, [error.message])
      );
    }
  }

  async deleteOrganization(req, res) {
    try {
      const { organizationId } = req.params;
      const result = await organizationsService.deleteOrganization(organizationId);

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new OrganizationsResponseDTO(false, 'Failed to delete organization', null, [error.message])
      );
    }
  }

  async getAllOrganizations(req, res) {
    try {
      const { page = 1, limit = 10, search, type, verificationStatus, isFeatured } = req.query;

      const result = await organizationsService.getAllOrganizations(
        parseInt(page),
        parseInt(limit),
        { search, type, verificationStatus, isFeatured }
      );

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, 'Organizations retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new OrganizationsResponseDTO(false, 'Failed to get organizations', null, [error.message])
      );
    }
  }

  async searchOrganizations(req, res) {
    try {
      const { q, page = 1, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json(
          new OrganizationsResponseDTO(false, 'Search term is required', null, ['q parameter is missing'])
        );
      }

      const result = await organizationsService.searchOrganizations(
        q,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, 'Search results', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new OrganizationsResponseDTO(false, 'Failed to search organizations', null, [error.message])
      );
    }
  }

  async getFeaturedOrganizations(req, res) {
    try {
      const { limit = 10 } = req.query;
      const result = await organizationsService.getFeaturedOrganizations(parseInt(limit));

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, 'Featured organizations retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new OrganizationsResponseDTO(false, 'Failed to get featured organizations', null, [error.message])
      );
    }
  }

  async getUserOrganizations(req, res) {
    try {
      const { userId } = req.params;
      const result = await organizationsService.getUserOrganizations(userId);

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, 'User organizations retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new OrganizationsResponseDTO(false, 'Failed to get user organizations', null, [error.message])
      );
    }
  }

  async verifyOrganization(req, res) {
    try {
      const { organizationId } = req.params;
      const { status, verificationNotes } = req.body;
      const verifiedBy = req.user?.id || req.user?.userId;

      const result = await organizationsService.verifyOrganization(
        organizationId,
        status,
        verificationNotes,
        verifiedBy
      );

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new OrganizationsResponseDTO(false, 'Failed to verify organization', null, [error.message])
      );
    }
  }

  async getOrganizationStatistics(req, res) {
    try {
      const { organizationId } = req.params;
      const result = await organizationsService.getOrganizationStatistics(organizationId);

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, 'Organization statistics retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new OrganizationsResponseDTO(false, 'Failed to get organization statistics', null, [error.message])
      );
    }
  }

  async addMember(req, res) {
    try {
      const { organizationId, userId, role, designation } = req.body;
      const result = await organizationsService.addMember(organizationId, userId, role, designation);

      return res.status(201).json(
        new OrganizationsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new OrganizationsResponseDTO(false, 'Failed to add member', null, [error.message])
      );
    }
  }

  async getMembers(req, res) {
    try {
      const { organizationId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await organizationsService.getMembers(
        organizationId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, 'Members retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new OrganizationsResponseDTO(false, 'Failed to get members', null, [error.message])
      );
    }
  }

  async updateMember(req, res) {
    try {
      const { memberId } = req.params;
      const result = await organizationsService.updateMember(memberId, req.body);

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new OrganizationsResponseDTO(false, 'Failed to update member', null, [error.message])
      );
    }
  }

  async removeMember(req, res) {
    try {
      const { memberId } = req.params;
      const result = await organizationsService.removeMember(memberId);

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new OrganizationsResponseDTO(false, 'Failed to remove member', null, [error.message])
      );
    }
  }

  async uploadDocument(req, res) {
    try {
      const uploadedBy = req.user?.id || req.user?.userId;
      const { organizationId, ...documentData } = req.body;

      const result = await organizationsService.uploadDocument(
        organizationId,
        uploadedBy,
        documentData
      );

      return res.status(201).json(
        new OrganizationsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new OrganizationsResponseDTO(false, 'Failed to upload document', null, [error.message])
      );
    }
  }

  async getDocuments(req, res) {
    try {
      const { organizationId } = req.params;
      const { status, documentType, page = 1, limit = 10 } = req.query;

      const result = await organizationsService.getDocuments(
        organizationId,
        status,
        documentType,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, 'Documents retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new OrganizationsResponseDTO(false, 'Failed to get documents', null, [error.message])
      );
    }
  }

  async deleteDocument(req, res) {
    try {
      const { documentId } = req.params;
      const result = await organizationsService.deleteDocument(documentId);

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new OrganizationsResponseDTO(false, 'Failed to delete document', null, [error.message])
      );
    }
  }

  async updateDocumentVerification(req, res) {
    try {
      const { documentId } = req.params;
      const { status, verificationNotes } = req.body;
      const verifiedBy = req.user?.id || req.user?.userId;

      const result = await organizationsService.updateDocumentVerification(
        documentId,
        status,
        verificationNotes,
        verifiedBy
      );

      return res.status(200).json(
        new OrganizationsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new OrganizationsResponseDTO(false, 'Failed to update document verification', null, [error.message])
      );
    }
  }
}

module.exports = new OrganizationsController();
