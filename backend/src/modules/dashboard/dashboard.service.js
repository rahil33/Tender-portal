const { Activity, Stats, Preferences } = require('./dashboard.model');
const { ActivityDTO, DashboardStatsDTO, PreferencesDTO, PaginatedResponseDTO } = require('./dashboard.dto');
const User = require('../users/users.model');

class DashboardService {
  /**
   * Get dashboard overview for a user
   */
  async getDashboardOverview(userId) {
    try {
      // Get user basic info
      const user = await User.findById(userId).select('fullName companyName email phone role -password');
      if (!user) {
        throw new Error('User not found');
      }

      // Get statistics
      let stats = await Stats.findOne({ userId });
      if (!stats) {
        stats = await Stats.create({ userId });
      }

      // Get recent activities (last 5)
      const recentActivities = await Activity.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      // Get unread notifications count
      const unreadCount = await Activity.countDocuments({
        userId,
        isRead: false,
      });

      return {
        success: true,
        data: {
          userInfo: {
            id: user._id,
            fullName: user.fullName,
            companyName: user.companyName,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
          statistics: {
            savedTendersCount: stats.savedTendersCount,
            applicationsCount: stats.applicationsCount,
            successfulBidsCount: stats.successfulBidsCount,
            failedBidsCount: stats.failedBidsCount,
            profileCompletionPercentage: stats.profileCompletionPercentage,
            notificationsUnreadCount: unreadCount,
          },
          recentActivities: recentActivities.map(act => new ActivityDTO(act)),
          lastUpdated: stats.updatedAt,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard overview: ${error.message}`);
    }
  }

  /**
   * Get paginated activities for a user
   */
  async getActivities(userId, page = 1, limit = 10, type = null) {
    try {
      const skip = (page - 1) * limit;
      const query = { userId };

      if (type) {
        query.activityType = type;
      }

      const activities = await Activity.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Activity.countDocuments(query);

      return {
        success: true,
        data: new PaginatedResponseDTO(
          activities.map(act => new ActivityDTO(act)),
          page,
          limit,
          total
        ),
      };
    } catch (error) {
      throw new Error(`Failed to get activities: ${error.message}`);
    }
  }

  /**
   * Log a new activity
   */
  async logActivity(userId, activityType, description = '', relatedId = null, metadata = {}) {
    try {
      const activity = await Activity.create({
        userId,
        activityType,
        description,
        relatedId,
        metadata,
        isRead: false,
      });

      // Update statistics last activity date
      await Stats.updateOne(
        { userId },
        { lastActivityDate: new Date() },
        { upsert: true }
      );

      return {
        success: true,
        data: new ActivityDTO(activity),
        message: 'Activity logged successfully',
      };
    } catch (error) {
      throw new Error(`Failed to log activity: ${error.message}`);
    }
  }

  /**
   * Get statistics for a user
   */
  async getStatistics(userId) {
    try {
      let stats = await Stats.findOne({ userId });

      if (!stats) {
        stats = await Stats.create({ userId });
      }

      return {
        success: true,
        data: new DashboardStatsDTO(stats),
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  /**
   * Update statistics for a user
   */
  async updateStatistics(userId, updates) {
    try {
      const stats = await Stats.findOneAndUpdate(
        { userId },
        updates,
        { new: true, upsert: true, runValidators: true }
      );

      return {
        success: true,
        data: new DashboardStatsDTO(stats),
        message: 'Statistics updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update statistics: ${error.message}`);
    }
  }

  /**
   * Increment a statistic counter
   */
  async incrementStatistic(userId, field, amount = 1) {
    try {
      const stats = await Stats.findOneAndUpdate(
        { userId },
        { $inc: { [field]: amount } },
        { new: true, upsert: true }
      );

      return {
        success: true,
        data: new DashboardStatsDTO(stats),
      };
    } catch (error) {
      throw new Error(`Failed to increment statistic: ${error.message}`);
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId) {
    try {
      let prefs = await Preferences.findOne({ userId });

      if (!prefs) {
        // Create default preferences
        prefs = await Preferences.create({
          userId,
          emailNotifications: true,
          tenderAlerts: true,
          applicationReminders: true,
          dashboard_view: 'grid',
          itemsPerPage: 10,
          preferredCategories: [],
        });
      }

      return {
        success: true,
        data: new PreferencesDTO(prefs),
      };
    } catch (error) {
      throw new Error(`Failed to get preferences: ${error.message}`);
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId, updates) {
    try {
      const prefs = await Preferences.findOneAndUpdate(
        { userId },
        updates,
        { new: true, upsert: true, runValidators: true }
      );

      return {
        success: true,
        data: new PreferencesDTO(prefs),
        message: 'Preferences updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update preferences: ${error.message}`);
    }
  }

  /**
   * Mark activities as read
   */
  async markActivitiesAsRead(activityIds) {
    try {
      const result = await Activity.updateMany(
        { _id: { $in: activityIds } },
        { isRead: true }
      );

      return {
        success: true,
        data: {
          modifiedCount: result.modifiedCount,
          message: `${result.modifiedCount} activities marked as read`,
        },
      };
    } catch (error) {
      throw new Error(`Failed to mark activities as read: ${error.message}`);
    }
  }

  /**
   * Mark all activities as read for a user
   */
  async markAllActivitiesAsRead(userId) {
    try {
      const result = await Activity.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      // Update notification count in stats
      await Stats.updateOne(
        { userId },
        { notificationsUnreadCount: 0 }
      );

      return {
        success: true,
        data: {
          modifiedCount: result.modifiedCount,
          message: `${result.modifiedCount} activities marked as read`,
        },
      };
    } catch (error) {
      throw new Error(`Failed to mark all activities as read: ${error.message}`);
    }
  }

  /**
   * Get dashboard summary (quick overview)
   */
  async getDashboardSummary(userId) {
    try {
      const stats = await Stats.findOne({ userId });
      const unreadActivities = await Activity.countDocuments({
        userId,
        isRead: false,
      });

      const summary = {
        savedTendersCount: stats?.savedTendersCount || 0,
        applicationsCount: stats?.applicationsCount || 0,
        successfulBidsCount: stats?.successfulBidsCount || 0,
        failedBidsCount: stats?.failedBidsCount || 0,
        profileCompletionPercentage: stats?.profileCompletionPercentage || 0,
        unreadNotifications: unreadActivities,
        successRate: stats?.applicationsCount > 0
          ? Math.round((stats.successfulBidsCount / stats.applicationsCount) * 100)
          : 0,
      };

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard summary: ${error.message}`);
    }
  }

  /**
   * Clear all activities for a user
   */
  async clearActivities(userId) {
    try {
      const result = await Activity.deleteMany({ userId });

      return {
        success: true,
        data: {
          deletedCount: result.deletedCount,
          message: `${result.deletedCount} activities cleared`,
        },
      };
    } catch (error) {
      throw new Error(`Failed to clear activities: ${error.message}`);
    }
  }
}

module.exports = new DashboardService();
