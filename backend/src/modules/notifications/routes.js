const express = require('express');
const notificationsController = require('./controller');
const notificationsValidators = require('./validator');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

/**
 * Notification CRUD Routes
 */
router.post('/', notificationsValidators.createNotification, notificationsController.createNotification);
router.get('/', notificationsValidators.getAllNotifications, notificationsController.getUserNotifications);
router.get('/unread-count', notificationsController.getUnreadCount);
router.get('/statistics', notificationsValidators.getNotificationStats, notificationsController.getNotificationStats);
router.get('/:notificationId', notificationsValidators.getNotificationById, notificationsController.getNotificationById);
router.put('/:notificationId/mark-read', notificationsValidators.markAsRead, notificationsController.markAsRead);
router.put('/mark-all-read', notificationsValidators.markAllAsRead, notificationsController.markAllAsRead);
router.delete('/:notificationId', notificationsController.deleteNotification);

/**
 * Notification Preferences Routes
 */
router.get('/preferences', notificationsController.getNotificationPreference);
router.put('/preferences', notificationsValidators.updateNotificationPreference, notificationsController.updateNotificationPreference);

/**
 * Broadcast Notification Routes
 */
router.post('/broadcast', notificationsValidators.createBroadcast, notificationsController.createBroadcast);
router.get('/broadcast', notificationsController.getAllBroadcasts);
router.get('/broadcast/:broadcastId', notificationsValidators.getBroadcastById, notificationsController.getBroadcastById);
router.post('/broadcast/:broadcastId/execute', notificationsValidators.executeBroadcast, notificationsController.executeBroadcast);
router.post('/broadcast/:broadcastId/cancel', notificationsValidators.cancelBroadcast, notificationsController.cancelBroadcast);

/**
 * Scheduled Notification Routes
 */
router.post('/scheduled', notificationsValidators.createScheduledNotification, notificationsController.createScheduledNotification);
router.get('/scheduled', notificationsController.getAllScheduledNotifications);
router.get('/scheduled/:scheduledId', notificationsValidators.getScheduledNotificationById, notificationsController.getScheduledNotificationById);
router.put('/scheduled/:scheduledId', notificationsValidators.updateScheduledNotification, notificationsController.updateScheduledNotification);
router.delete('/scheduled/:scheduledId', notificationsValidators.deleteScheduledNotification, notificationsController.deleteScheduledNotification);
router.post('/scheduled/:scheduledId/execute', notificationsValidators.executeScheduledNotification, notificationsController.executeScheduledNotification);

module.exports = router;