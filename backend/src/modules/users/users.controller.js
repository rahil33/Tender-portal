const usersService = require('./users.service');
const { UsersResponseDTO } = require('./users.dto');

class UsersController {
  /**
   * Get user profile
   * GET /api/users/profile/:userId
   */
  async getUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const result = await usersService.getUserProfile(userId);

      return res.status(200).json(
        new UsersResponseDTO(result.success, 'User profile retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new UsersResponseDTO(false, 'Failed to get user profile', null, [error.message])
      );
    }
  }

  /**
   * Create user profile
   * POST /api/users/profile
   */
  async createUserProfile(req, res) {
    try {
      const { userId, ...profileData } = req.body;

      const result = await usersService.createUserProfile(userId, profileData);

      return res.status(201).json(
        new UsersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new UsersResponseDTO(false, 'Failed to create user profile', null, [error.message])
      );
    }
  }

  /**
   * Update user profile
   * PUT /api/users/profile/:userId
   */
  async updateUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const result = await usersService.updateUserProfile(userId, updates);

      return res.status(200).json(
        new UsersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new UsersResponseDTO(false, 'Failed to update user profile', null, [error.message])
      );
    }
  }

  /**
   * Get user settings
   * GET /api/users/settings/:userId
   */
  async getUserSettings(req, res) {
    try {
      const { userId } = req.params;
      const result = await usersService.getUserSettings(userId);

      return res.status(200).json(
        new UsersResponseDTO(result.success, 'User settings retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new UsersResponseDTO(false, 'Failed to get user settings', null, [error.message])
      );
    }
  }

  /**
   * Update user settings
   * PUT /api/users/settings/:userId
   */
  async updateUserSettings(req, res) {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const result = await usersService.updateUserSettings(userId, updates);

      return res.status(200).json(
        new UsersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new UsersResponseDTO(false, 'Failed to update user settings', null, [error.message])
      );
    }
  }

  /**
   * Upload user document
   * POST /api/users/documents
   */
  async uploadUserDocument(req, res) {
    try {
      const { userId, ...documentData } = req.body;

      const result = await usersService.uploadUserDocument(userId, documentData);

      return res.status(201).json(
        new UsersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new UsersResponseDTO(false, 'Failed to upload document', null, [error.message])
      );
    }
  }

  /**
   * Get user documents
   * GET /api/users/:userId/documents
   */
  async getUserDocuments(req, res) {
    try {
      const { userId } = req.params;
      const { status, documentType, page = 1, limit = 10 } = req.query;

      const result = await usersService.getUserDocuments(
        userId,
        status,
        documentType,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new UsersResponseDTO(result.success, 'User documents retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new UsersResponseDTO(false, 'Failed to get user documents', null, [error.message])
      );
    }
  }

  /**
   * Delete user document
   * DELETE /api/users/documents/:documentId
   */
  async deleteUserDocument(req, res) {
    try {
      const { documentId } = req.params;

      const result = await usersService.deleteUserDocument(documentId);

      return res.status(200).json(
        new UsersResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new UsersResponseDTO(false, 'Failed to delete document', null, [error.message])
      );
    }
  }

  /**
   * Get user activity
   * GET /api/users/:userId/activity
   */
  async getUserActivity(req, res) {
    try {
      const { userId } = req.params;
      const { actionType, page = 1, limit = 10 } = req.query;

      const result = await usersService.getUserActivity(
        userId,
        actionType,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new UsersResponseDTO(result.success, 'User activity retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new UsersResponseDTO(false, 'Failed to get user activity', null, [error.message])
      );
    }
  }

  /**
   * Log user activity
   * POST /api/users/activity/log
   */
  async logUserActivity(req, res) {
    try {
      const { userId, action, actionType, ipAddress, userAgent, status = 'success' } = req.body;

      const result = await usersService.logUserActivity(
        userId,
        action,
        actionType,
        ipAddress,
        userAgent,
        status
      );

      return res.status(201).json(
        new UsersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new UsersResponseDTO(false, 'Failed to log activity', null, [error.message])
      );
    }
  }

  /**
   * Get all users (admin)
   * GET /api/users
   */
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const result = await usersService.getAllUsers(parseInt(page), parseInt(limit), search);

      return res.status(200).json(
        new UsersResponseDTO(result.success, 'Users retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new UsersResponseDTO(false, 'Failed to get users', null, [error.message])
      );
    }
  }

  /**
   * Update document verification
   * PUT /api/users/documents/:documentId/verify
   */
  async updateDocumentVerification(req, res) {
    try {
      const { documentId } = req.params;
      const { status, verificationNotes } = req.body;
      const verifiedBy = req.user?.id;

      const result = await usersService.updateDocumentVerification(
        documentId,
        status,
        verificationNotes,
        verifiedBy
      );

      return res.status(200).json(
        new UsersResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new UsersResponseDTO(false, 'Failed to update document verification', null, [error.message])
      );
    }
  }

  /**
   * Search users
   * GET /api/users/search
   */
  async searchUsers(req, res) {
    try {
      const { q, page = 1, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json(
          new UsersResponseDTO(false, 'Search term is required', null, ['q parameter is missing'])
        );
      }

      const result = await usersService.searchUsers(q, parseInt(page), parseInt(limit));

      return res.status(200).json(
        new UsersResponseDTO(result.success, 'Search results', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new UsersResponseDTO(false, 'Failed to search users', null, [error.message])
      );
    }
  }

  /**
   * Get user statistics
   * GET /api/users/:userId/statistics
   */
  async getUserStatistics(req, res) {
    try {
      const { userId } = req.params;

      const result = await usersService.getUserStatistics(userId);

      return res.status(200).json(
        new UsersResponseDTO(result.success, 'User statistics retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new UsersResponseDTO(false, 'Failed to get user statistics', null, [error.message])
      );
    }
  }

  /**
   * Deactivate user account
   * POST /api/users/:userId/deactivate
   */
  async deactivateUserAccount(req, res) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      const result = await usersService.deactivateUserAccount(userId, reason);

      return res.status(200).json(
        new UsersResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new UsersResponseDTO(false, 'Failed to deactivate account', null, [error.message])
      );
    }
  }
}

module.exports = new UsersController();
