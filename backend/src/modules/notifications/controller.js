const NotificationService = require('./service');
const { NotificationPreference } = require('./model');

class NotificationsController {
  async getPreferences(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const preferences = await NotificationService.getUserPreferences(userId);

      return res.status(200).json({
        success: true,
        data: preferences,
        message: 'Notification preferences retrieved',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get notification preferences',
        errors: [error.message],
      });
    }
  }

  async updatePreferences(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { emailNotifications, pushNotifications, smsNotifications, tenderEvents, bidEvents, documentEvents, frequency, quietHours } = req.body;

      const updates = {};
      if (emailNotifications !== undefined) updates.emailNotifications = emailNotifications;
      if (pushNotifications !== undefined) updates.pushNotifications = pushNotifications;
      if (smsNotifications !== undefined) updates.smsNotifications = smsNotifications;
      if (tenderEvents !== undefined) updates.tenderEvents = tenderEvents;
      if (bidEvents !== undefined) updates.bidEvents = bidEvents;
      if (documentEvents !== undefined) updates.documentEvents = documentEvents;
      if (frequency !== undefined) updates.frequency = frequency;
      if (quietHours !== undefined) updates.quietHours = quietHours;

      const preferences = await NotificationService.updatePreferences(userId, updates);

      return res.status(200).json({
        success: true,
        data: preferences,
        message: 'Notification preferences updated',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences',
        errors: [error.message],
      });
    }
  }

  async testNotification(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { type = 'info' } = req.body;

      await NotificationService.notifyUser(userId, 'This is a test notification', type, { test: true });

      return res.status(200).json({
        success: true,
        message: 'Test notification sent',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        errors: [error.message],
      });
    }
  }
}

module.exports = new NotificationsController();