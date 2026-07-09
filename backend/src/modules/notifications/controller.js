const notificationsService = require('./service');
const { NotificationsResponseDTO } = require('./dto');

class NotificationsController {
  async createNotification(req, res) {
    try {
      const createdBy = req.user?.id || req.user?.userId;
      const result = await notificationsService.createNotification(createdBy, req.body);

      return res.status(201).json(
        new NotificationsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new NotificationsResponseDTO(false, 'Failed to create notification', null, [error.message])
      );
    }
  }

  async getNotificationById(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await notificationsService.getNotificationById(notificationId, userId);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, 'Notification retrieved', result.data)
      );
    } catch (error) {
      return res.status(404).json(
        new NotificationsResponseDTO(false, 'Failed to get notification', null, [error.message])
      );
    }
  }

  async getUserNotifications(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const {
        page = 1,
        limit = 20,
        category,
        priority,
        status,
        type,
        isRead,
        search,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await notificationsService.getUserNotifications(
        userId,
        parseInt(page),
        parseInt(limit),
        { category, priority, status, type, isRead, search, startDate, endDate, sortBy, sortOrder }
      );

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, 'Notifications retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new NotificationsResponseDTO(false, 'Failed to get notifications', null, [error.message])
      );
    }
  }

  async getUnreadCount(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const result = await notificationsService.getUnreadCount(userId);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, 'Unread count retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new NotificationsResponseDTO(false, 'Failed to get unread count', null, [error.message])
      );
    }
  }

  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await notificationsService.markAsRead(notificationId, userId);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new NotificationsResponseDTO(false, 'Failed to mark notification as read', null, [error.message])
      );
    }
  }

  async markAllAsRead(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { category } = req.body;
      const result = await notificationsService.markAllAsRead(userId, category);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new NotificationsResponseDTO(false, 'Failed to mark all as read', null, [error.message])
      );
    }
  }

  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await notificationsService.deleteNotification(notificationId, userId);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new NotificationsResponseDTO(false, 'Failed to delete notification', null, [error.message])
      );
    }
  }

  async getNotificationPreference(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const result = await notificationsService.getNotificationPreference(userId);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, 'Notification preferences retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new NotificationsResponseDTO(false, 'Failed to get notification preferences', null, [error.message])
      );
    }
  }

  async updateNotificationPreference(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const result = await notificationsService.updateNotificationPreference(userId, req.body);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new NotificationsResponseDTO(false, 'Failed to update notification preferences', null, [error.message])
      );
    }
  }

  async createBroadcast(req, res) {
    try {
      const createdBy = req.user?.id || req.user?.userId;
      const result = await notificationsService.createBroadcast(createdBy, req.body);

      return res.status(201).json(
        new NotificationsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new NotificationsResponseDTO(false, 'Failed to create broadcast', null, [error.message])
      );
    }
  }

  async getBroadcastById(req, res) {
    try {
      const { broadcastId } = req.params;
      const result = await notificationsService.getBroadcastById(broadcastId);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, 'Broadcast retrieved', result.data)
      );
    } catch (error) {
      return res.status(404).json(
        new NotificationsResponseDTO(false, 'Failed to get broadcast', null, [error.message])
      );
    }
  }

  async getAllBroadcasts(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        targetAudience,
        priority,
      } = req.query;

      const result = await notificationsService.getAllBroadcasts(
        parseInt(page),
        parseInt(limit),
        { status, targetAudience, priority }
      );

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, 'Broadcasts retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new NotificationsResponseDTO(false, 'Failed to get broadcasts', null, [error.message])
      );
    }
  }

  async executeBroadcast(req, res) {
    try {
      const { broadcastId } = req.params;
      const executedBy = req.user?.id || req.user?.userId;
      const result = await notificationsService.executeBroadcast(broadcastId, executedBy);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new NotificationsResponseDTO(false, 'Failed to execute broadcast', null, [error.message])
      );
    }
  }

  async cancelBroadcast(req, res) {
    try {
      const { broadcastId } = req.params;
      const result = await notificationsService.cancelBroadcast(broadcastId);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new NotificationsResponseDTO(false, 'Failed to cancel broadcast', null, [error.message])
      );
    }
  }

  async createScheduledNotification(req, res) {
    try {
      const createdBy = req.user?.id || req.user?.userId;
      const result = await notificationsService.createScheduledNotification(createdBy, req.body);

      return res.status(201).json(
        new NotificationsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new NotificationsResponseDTO(false, 'Failed to create scheduled notification', null, [error.message])
      );
    }
  }

  async getScheduledNotificationById(req, res) {
    try {
      const { scheduledId } = req.params;
      const result = await notificationsService.getScheduledNotificationById(scheduledId);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, 'Scheduled notification retrieved', result.data)
      );
    } catch (error) {
      return res.status(404).json(
        new NotificationsResponseDTO(false, 'Failed to get scheduled notification', null, [error.message])
      );
    }
  }

  async getAllScheduledNotifications(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        isActive,
        scheduleType,
        category,
      } = req.query;

      const result = await notificationsService.getAllScheduledNotifications(
        parseInt(page),
        parseInt(limit),
        { isActive, scheduleType, category }
      );

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, 'Scheduled notifications retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new NotificationsResponseDTO(false, 'Failed to get scheduled notifications', null, [error.message])
      );
    }
  }

  async updateScheduledNotification(req, res) {
    try {
      const { scheduledId } = req.params;
      const result = await notificationsService.updateScheduledNotification(scheduledId, req.body);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new NotificationsResponseDTO(false, 'Failed to update scheduled notification', null, [error.message])
      );
    }
  }

  async deleteScheduledNotification(req, res) {
    try {
      const { scheduledId } = req.params;
      const result = await notificationsService.deleteScheduledNotification(scheduledId);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new NotificationsResponseDTO(false, 'Failed to delete scheduled notification', null, [error.message])
      );
    }
  }

  async executeScheduledNotification(req, res) {
    try {
      const { scheduledId } = req.params;
      const result = await notificationsService.executeScheduledNotification(scheduledId);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new NotificationsResponseDTO(false, 'Failed to execute scheduled notification', null, [error.message])
      );
    }
  }

  async getNotificationStats(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { startDate, endDate } = req.query;
      const result = await notificationsService.getNotificationStats(userId, startDate, endDate);

      return res.status(200).json(
        new NotificationsResponseDTO(result.success, 'Notification statistics retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new NotificationsResponseDTO(false, 'Failed to get notification statistics', null, [error.message])
      );
    }
  }
}

module.exports = new NotificationsController();