const dashboardService = require('./dashboard.service');
const { APIResponseDTO } = require('./dashboard.dto');

class DashboardController {
  /**
   * GET /api/dashboard/overview
   * Get complete dashboard overview for authenticated user
   */
  async getDashboardOverview(req, res) {
    try {
      const userId = req.user.id || req.query.userId;

      if (!userId) {
        return res.status(400).json(
          new APIResponseDTO(false, 'User ID is required')
        );
      }

      const result = await dashboardService.getDashboardOverview(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getDashboardOverview:', error);
      return res.status(500).json(
        new APIResponseDTO(false, error.message || 'Failed to get dashboard overview')
      );
    }
  }

  /**
   * GET /api/dashboard/summary
   * Get quick dashboard summary
   */
  async getDashboardSummary(req, res) {
    try {
      const userId = req.user.id || req.query.userId;

      if (!userId) {
        return res.status(400).json(
          new APIResponseDTO(false, 'User ID is required')
        );
      }

      const result = await dashboardService.getDashboardSummary(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getDashboardSummary:', error);
      return res.status(500).json(
        new APIResponseDTO(false, error.message || 'Failed to get dashboard summary')
      );
    }
  }

  /**
   * GET /api/dashboard/activities
   * Get paginated activities for a user
   */
  async getActivities(req, res) {
    try {
      const userId = req.query.userId || req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const type = req.query.type || null;

      if (!userId) {
        return res.status(400).json(
          new APIResponseDTO(false, 'User ID is required')
        );
      }

      const result = await dashboardService.getActivities(userId, page, limit, type);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getActivities:', error);
      return res.status(500).json(
        new APIResponseDTO(false, error.message || 'Failed to get activities')
      );
    }
  }

  /**
   * POST /api/dashboard/activities
   * Log a new activity
   */
  async logActivity(req, res) {
    try {
      const { userId, activityType, description, relatedId, metadata } = req.body;

      if (!userId || !activityType) {
        return res.status(400).json(
          new APIResponseDTO(false, 'User ID and activity type are required')
        );
      }

      const result = await dashboardService.logActivity(
        userId,
        activityType,
        description,
        relatedId,
        metadata
      );
      return res.status(201).json(result);
    } catch (error) {
      console.error('Error in logActivity:', error);
      return res.status(500).json(
        new APIResponseDTO(false, error.message || 'Failed to log activity')
      );
    }
  }

  /**
   * GET /api/dashboard/statistics/:userId
   * Get statistics for a user
   */
  async getStatistics(req, res) {
    try {
      const { userId } = req.params;

      const result = await dashboardService.getStatistics(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getStatistics:', error);
      return res.status(500).json(
        new APIResponseDTO(false, error.message || 'Failed to get statistics')
      );
    }
  }

  /**
   * PUT /api/dashboard/statistics
   * Update statistics for a user
   */
  async updateStatistics(req, res) {
    try {
      const { userId, ...updates } = req.body;

      if (!userId) {
        return res.status(400).json(
          new APIResponseDTO(false, 'User ID is required')
        );
      }

      const result = await dashboardService.updateStatistics(userId, updates);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in updateStatistics:', error);
      return res.status(500).json(
        new APIResponseDTO(false, error.message || 'Failed to update statistics')
      );
    }
  }

  /**
   * POST /api/dashboard/statistics/increment
   * Increment a statistic counter
   */
  async incrementStatistic(req, res) {
    try {
      const { userId, field, amount } = req.body;

      if (!userId || !field) {
        return res.status(400).json(
          new APIResponseDTO(false, 'User ID and field are required')
        );
      }

      const result = await dashboardService.incrementStatistic(
        userId,
        field,
        amount || 1
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in incrementStatistic:', error);
      return res.status(500).json(
        new APIResponseDTO(false, error.message || 'Failed to increment statistic')
      );
    }
  }

  /**
   * GET /api/dashboard/preferences/:userId
   * Get user preferences
   */
  async getPreferences(req, res) {
    try {
      const { userId } = req.params;

      const result = await dashboardService.getPreferences(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getPreferences:', error);
      return res.status(500).json(
        new APIResponseDTO(false, error.message || 'Failed to get preferences')
      );
    }
  }

  /**
   * PUT /api/dashboard/preferences
   * Update user preferences
   */
  async updatePreferences(req, res) {
    try {
      const { userId, ...updates } = req.body;

      if (!userId) {
        return res.status(400).json(
          new APIResponseDTO(false, 'User ID is required')
        );
      }

      const result = await dashboardService.updatePreferences(userId, updates);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in updatePreferences:', error);
      return res.status(500).json(
        new APIResponseDTO(false, error.message || 'Failed to update preferences')
      );
    }
  }

  /**
   * POST /api/dashboard/activities/mark-as-read
   * Mark specific activities as read
   */
  async markActivitiesAsRead(req, res) {
    try {
      const { activityIds } = req.body;

      if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
        return res.status(400).json(
          new APIResponseDTO(false, 'Activity IDs array is required')
        );
      }

      const result = await dashboardService.markActivitiesAsRead(activityIds);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in markActivitiesAsRead:', error);
      return res.status(500).json(
        new APIResponseDTO(false, error.message || 'Failed to mark activities as read')
      );
    }
  }

  /**
   * POST /api/dashboard/activities/mark-all-as-read
   * Mark all activities as read for a user
   */
  async markAllActivitiesAsRead(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json(
          new APIResponseDTO(false, 'User ID is required')
        );
      }

      const result = await dashboardService.markAllActivitiesAsRead(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in markAllActivitiesAsRead:', error);
      return res.status(500).json(
        new APIResponseDTO(false, error.message || 'Failed to mark all activities as read')
      );
    }
  }

  /**
   * DELETE /api/dashboard/activities
   * Clear all activities for a user
   */
  async clearActivities(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json(
          new APIResponseDTO(false, 'User ID is required')
        );
      }

      const result = await dashboardService.clearActivities(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in clearActivities:', error);
      return res.status(500).json(
        new APIResponseDTO(false, error.message || 'Failed to clear activities')
      );
    }
  }
}

module.exports = new DashboardController();
