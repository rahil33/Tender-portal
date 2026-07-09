const { body, param, query, validationResult } = require('express-validator');
const {
  NOTIFICATION_TYPE_VALUES,
  NOTIFICATION_CATEGORY_VALUES,
  NOTIFICATION_PRIORITY_VALUES,
  NOTIFICATION_STATUS_VALUES,
  NOTIFICATION_CHANNEL_VALUES,
  TENDER_NOTIFICATION_EVENT_VALUES,
  BID_NOTIFICATION_EVENT_VALUES,
  ORGANIZATION_NOTIFICATION_EVENT_VALUES,
  USER_NOTIFICATION_EVENT_VALUES,
  SCHEDULE_TYPE_VALUES,
  MAX_LIMIT,
  SORT_FIELDS_VALUES,
  SORT_ORDER_VALUES,
} = require('./constants');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

const notificationsValidators = {
  createNotification: [
    body('title')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Notification title is required')
      .isLength({ max: 200 })
      .withMessage('Title must be max 200 characters'),
    body('message')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Notification message is required')
      .isLength({ max: 2000 })
      .withMessage('Message must be max 2000 characters'),
    body('type')
      .isIn(NOTIFICATION_TYPE_VALUES)
      .withMessage('Invalid notification type'),
    body('category')
      .isIn(NOTIFICATION_CATEGORY_VALUES)
      .withMessage('Invalid notification category'),
    body('priority')
      .optional()
      .isIn(NOTIFICATION_PRIORITY_VALUES)
      .withMessage('Invalid priority'),
    body('event')
      .optional()
      .isString()
      .trim()
      .withMessage('Event must be a string'),
    body('recipientType')
      .isIn(['user', 'organization', 'tender', 'bid', 'broadcast'])
      .withMessage('Invalid recipient type'),
    body('recipientId')
      .optional()
      .isMongoId()
      .withMessage('Recipient ID must be valid'),
    body('targetUsers')
      .optional()
      .isArray()
      .withMessage('Target users must be an array'),
    body('targetOrganizations')
      .optional()
      .isArray()
      .withMessage('Target organizations must be an array'),
    body('relatedEntity.entityType')
      .optional()
      .isIn(['tender', 'bid', 'organization', 'user', 'document', 'other'])
      .withMessage('Invalid entity type'),
    body('relatedEntity.entityId')
      .optional()
      .isMongoId()
      .withMessage('Entity ID must be valid'),
    body('actionUrl')
      .optional()
      .isString()
      .trim()
      .isURL()
      .withMessage('Action URL must be valid'),
    body('scheduledAt')
      .optional()
      .isISO8601()
      .withMessage('Scheduled time must be a valid date'),
    body('expiresAt')
      .optional()
      .isISO8601()
      .withMessage('Expiration time must be a valid date'),
    handleValidationErrors,
  ],

  getNotificationById: [
    param('notificationId')
      .isMongoId()
      .withMessage('Notification ID must be valid'),
    handleValidationErrors,
  ],

  getAllNotifications: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be positive'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: MAX_LIMIT })
      .withMessage(`Limit must be between 1 and ${MAX_LIMIT}`),
    query('category')
      .optional()
      .isIn(NOTIFICATION_CATEGORY_VALUES)
      .withMessage('Invalid category'),
    query('priority')
      .optional()
      .isIn(NOTIFICATION_PRIORITY_VALUES)
      .withMessage('Invalid priority'),
    query('status')
      .optional()
      .isIn(NOTIFICATION_STATUS_VALUES)
      .withMessage('Invalid status'),
    query('type')
      .optional()
      .isIn(NOTIFICATION_TYPE_VALUES)
      .withMessage('Invalid type'),
    query('isRead')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('isRead must be true or false'),
    query('sortBy')
      .optional()
      .isIn(SORT_FIELDS_VALUES)
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(SORT_ORDER_VALUES)
      .withMessage('Sort order must be asc or desc'),
    handleValidationErrors,
  ],

  markAsRead: [
    param('notificationId')
      .isMongoId()
      .withMessage('Notification ID must be valid'),
    handleValidationErrors,
  ],

  markAllAsRead: [
    body('category')
      .optional()
      .isIn(NOTIFICATION_CATEGORY_VALUES)
      .withMessage('Invalid category'),
    handleValidationErrors,
  ],

  updateNotificationPreference: [
    body('emailNotifications')
      .optional()
      .isBoolean()
      .withMessage('Email notifications must be boolean'),
    body('smsNotifications')
      .optional()
      .isBoolean()
      .withMessage('SMS notifications must be boolean'),
    body('pushNotifications')
      .optional()
      .isBoolean()
      .withMessage('Push notifications must be boolean'),
    body('inAppNotifications')
      .optional()
      .isBoolean()
      .withMessage('In-app notifications must be boolean'),
    body('whatsappNotifications')
      .optional()
      .isBoolean()
      .withMessage('WhatsApp notifications must be boolean'),
    body('categoryPreferences.tender')
      .optional()
      .isBoolean()
      .withMessage('Tender preference must be boolean'),
    body('categoryPreferences.bid')
      .optional()
      .isBoolean()
      .withMessage('Bid preference must be boolean'),
    body('categoryPreferences.organization')
      .optional()
      .isBoolean()
      .withMessage('Organization preference must be boolean'),
    body('categoryPreferences.system')
      .optional()
      .isBoolean()
      .withMessage('System preference must be boolean'),
    body('categoryPreferences.broadcast')
      .optional()
      .isBoolean()
      .withMessage('Broadcast preference must be boolean'),
    body('categoryPreferences.reminder')
      .optional()
      .isBoolean()
      .withMessage('Reminder preference must be boolean'),
    body('categoryPreferences.alert')
      .optional()
      .isBoolean()
      .withMessage('Alert preference must be boolean'),
    body('quietHours.enabled')
      .optional()
      .isBoolean()
      .withMessage('Quiet hours enabled must be boolean'),
    body('quietHours.startTime')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Start time must be in HH:MM format'),
    body('quietHours.endTime')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('End time must be in HH:MM format'),
    body('digestFrequency')
      .optional()
      .isIn(['none', 'daily', 'weekly', 'monthly'])
      .withMessage('Invalid digest frequency'),
    body('immediateNotifications')
      .optional()
      .isBoolean()
      .withMessage('Immediate notifications must be boolean'),
    handleValidationErrors,
  ],

  createBroadcast: [
    body('title')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Broadcast title is required')
      .isLength({ max: 200 })
      .withMessage('Title must be max 200 characters'),
    body('message')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Broadcast message is required')
      .isLength({ max: 2000 })
      .withMessage('Message must be max 2000 characters'),
    body('channels')
      .isArray({ min: 1 })
      .withMessage('At least one channel is required'),
    body('channels.*')
      .isIn(NOTIFICATION_CHANNEL_VALUES)
      .withMessage('Invalid channel'),
    body('priority')
      .optional()
      .isIn(NOTIFICATION_PRIORITY_VALUES)
      .withMessage('Invalid priority'),
    body('targetAudience')
      .isIn(['all', 'vendors', 'evaluators', 'admins', 'specific_users', 'specific_organizations'])
      .withMessage('Invalid target audience'),
    body('targetUsers')
      .optional()
      .isArray()
      .withMessage('Target users must be an array'),
    body('targetOrganizations')
      .optional()
      .isArray()
      .withMessage('Target organizations must be an array'),
    body('filters.category')
      .optional()
      .isArray()
      .withMessage('Category filters must be an array'),
    body('filters.location')
      .optional()
      .isArray()
      .withMessage('Location filters must be an array'),
    body('filters.role')
      .optional()
      .isArray()
      .withMessage('Role filters must be an array'),
    body('scheduledAt')
      .optional()
      .isISO8601()
      .withMessage('Scheduled time must be a valid date'),
    body('actionUrl')
      .optional()
      .isString()
      .trim()
      .isURL()
      .withMessage('Action URL must be valid'),
    handleValidationErrors,
  ],

  getBroadcastById: [
    param('broadcastId')
      .isMongoId()
      .withMessage('Broadcast ID must be valid'),
    handleValidationErrors,
  ],

  executeBroadcast: [
    param('broadcastId')
      .isMongoId()
      .withMessage('Broadcast ID must be valid'),
    handleValidationErrors,
  ],

  cancelBroadcast: [
    param('broadcastId')
      .isMongoId()
      .withMessage('Broadcast ID must be valid'),
    handleValidationErrors,
  ],

  createScheduledNotification: [
    body('title')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Scheduled notification title is required')
      .isLength({ max: 200 })
      .withMessage('Title must be max 200 characters'),
    body('message')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Scheduled notification message is required')
      .isLength({ max: 2000 })
      .withMessage('Message must be max 2000 characters'),
    body('scheduleType')
      .isIn(SCHEDULE_TYPE_VALUES)
      .withMessage('Invalid schedule type'),
    body('scheduledAt')
      .isISO8601()
      .withMessage('Scheduled time must be a valid date'),
    body('recurrence.interval')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Interval must be positive'),
    body('recurrence.daysOfWeek')
      .optional()
      .isArray()
      .withMessage('Days of week must be an array'),
    body('recurrence.daysOfWeek.*')
      .optional()
      .isInt({ min: 0, max: 6 })
      .withMessage('Day must be between 0 (Sunday) and 6 (Saturday)'),
    body('recurrence.dayOfMonth')
      .optional()
      .isInt({ min: 1, max: 31 })
      .withMessage('Day of month must be between 1 and 31'),
    body('recurrence.hourOfDay')
      .optional()
      .isInt({ min: 0, max: 23 })
      .withMessage('Hour must be between 0 and 23'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be boolean'),
    body('channels')
      .optional()
      .isArray()
      .withMessage('Channels must be an array'),
    body('channels.*')
      .optional()
      .isIn(NOTIFICATION_CHANNEL_VALUES)
      .withMessage('Invalid channel'),
    body('priority')
      .optional()
      .isIn(NOTIFICATION_PRIORITY_VALUES)
      .withMessage('Invalid priority'),
    body('category')
      .optional()
      .isIn(NOTIFICATION_CATEGORY_VALUES)
      .withMessage('Invalid category'),
    body('targetAudience')
      .optional()
      .isIn(['all', 'vendors', 'evaluators', 'admins', 'specific_users', 'specific_organizations'])
      .withMessage('Invalid target audience'),
    body('targetUsers')
      .optional()
      .isArray()
      .withMessage('Target users must be an array'),
    body('targetOrganizations')
      .optional()
      .isArray()
      .withMessage('Target organizations must be an array'),
    body('maxExecutions')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Max executions must be positive'),
    body('expiresAt')
      .optional()
      .isISO8601()
      .withMessage('Expiration time must be a valid date'),
    body('actionUrl')
      .optional()
      .isString()
      .trim()
      .isURL()
      .withMessage('Action URL must be valid'),
    handleValidationErrors,
  ],

  getScheduledNotificationById: [
    param('scheduledId')
      .isMongoId()
      .withMessage('Scheduled notification ID must be valid'),
    handleValidationErrors,
  ],

  updateScheduledNotification: [
    param('scheduledId')
      .isMongoId()
      .withMessage('Scheduled notification ID must be valid'),
    body('title')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty'),
    body('message')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Message cannot be empty'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be boolean'),
    body('scheduledAt')
      .optional()
      .isISO8601()
      .withMessage('Scheduled time must be a valid date'),
    handleValidationErrors,
  ],

  deleteScheduledNotification: [
    param('scheduledId')
      .isMongoId()
      .withMessage('Scheduled notification ID must be valid'),
    handleValidationErrors,
  ],

  executeScheduledNotification: [
    param('scheduledId')
      .isMongoId()
      .withMessage('Scheduled notification ID must be valid'),
    handleValidationErrors,
  ],

  getNotificationStats: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date'),
    handleValidationErrors,
  ],
};

module.exports = notificationsValidators;