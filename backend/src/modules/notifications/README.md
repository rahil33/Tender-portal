# Notifications Module

Comprehensive notification system for the tender portal supporting in-app notifications, email notifications, broadcast notifications, scheduled notifications, and user preferences.

## Features

- **In-App Notifications**: Real-time notifications for users
- **Email Notifications**: Email delivery support
- **Tender Notifications**: Automatic notifications for tender events (created, published, updated, cancelled, closed, deadline approaching, extended, awarded, rejected)
- **Bid Notifications**: Automatic notifications for bid events (submitted, updated, withdrawn, evaluated, awarded, rejected, shortlisted, clarification requested)
- **Organization Notifications**: Notifications for organization events (created, updated, verified, rejected, member changes)
- **User Notifications**: Account-related notifications (profile updated, password changed, account activated/deactivated, document verification)
- **Read/Unread Status**: Track notification read status per user
- **Notification Preferences**: User-configurable notification settings per category and channel
- **Scheduled Notifications**: One-time, daily, weekly, monthly, or custom recurring notifications
- **Broadcast Notifications**: Send notifications to multiple users based on role, filters, or specific targets
- **Pagination**: Paginated notification lists
- **Filtering**: Filter by category, priority, status, type, read status
- **Search**: Search notifications by title and message
- **Audit Logging**: Complete audit trail for all notification actions

## Models

### Notification
Main notification model with support for multiple recipients, channels, and related entities.

### NotificationPreference
User-specific notification preferences including channel preferences, category preferences, event preferences, and quiet hours.

### BroadcastNotification
Broadcast notifications for sending to multiple users with targeting options.

### ScheduledNotification
Recurring or one-time scheduled notifications with flexible scheduling options.

## API Endpoints

### Notification CRUD
- `POST /api/notifications` - Create notification
- `GET /api/notifications` - Get user notifications (paginated, filterable)
- `GET /api/notifications/unread-count` - Get unread notification count
- `GET /api/notifications/statistics` - Get notification statistics
- `GET /api/notifications/:notificationId` - Get notification by ID
- `PUT /api/notifications/:notificationId/mark-read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/notifications/:notificationId` - Delete notification

### Notification Preferences
- `GET /api/notifications/preferences` - Get user notification preferences
- `PUT /api/notifications/preferences` - Update user notification preferences

### Broadcast Notifications
- `POST /api/notifications/broadcast` - Create broadcast notification
- `GET /api/notifications/broadcast` - Get all broadcasts
- `GET /api/notifications/broadcast/:broadcastId` - Get broadcast by ID
- `POST /api/notifications/broadcast/:broadcastId/execute` - Execute broadcast
- `POST /api/notifications/broadcast/:broadcastId/cancel` - Cancel broadcast

### Scheduled Notifications
- `POST /api/notifications/scheduled` - Create scheduled notification
- `GET /api/notifications/scheduled` - Get all scheduled notifications
- `GET /api/notifications/scheduled/:scheduledId` - Get scheduled notification by ID
- `PUT /api/notifications/scheduled/:scheduledId` - Update scheduled notification
- `DELETE /api/notifications/scheduled/:scheduledId` - Delete scheduled notification
- `POST /api/notifications/scheduled/:scheduledId/execute` - Execute scheduled notification

## Notification Categories

- `tender` - Tender-related notifications
- `bid` - Bid-related notifications
- `organization` - Organization-related notifications
- `user` - User account notifications
- `system` - System notifications
- `broadcast` - Broadcast notifications
- `reminder` - Reminder notifications
- `alert` - Alert notifications

## Notification Priorities

- `low` - Low priority
- `normal` - Normal priority (default)
- `high` - High priority
- `urgent` - Urgent priority

## Notification Channels

- `in_app` - In-app notification
- `email` - Email notification
- `sms` - SMS notification
- `push` - Push notification
- `whatsapp` - WhatsApp notification

## Schedule Types

- `once` - One-time execution
- `daily` - Daily recurrence
- `weekly` - Weekly recurrence
- `monthly` - Monthly recurrence
- `custom` - Custom recurrence pattern

## Integration with Other Modules

The notifications module integrates with:

- **Tenders Module**: Automatic notifications for tender events
- **Bids Module**: Automatic notifications for bid events
- **Organizations Module**: Automatic notifications for organization events
- **Users Module**: User notification preferences and account notifications

## Usage Examples

### Create a Tender Notification
```javascript
const notificationsService = require('./notifications/service');
const { TENDER_NOTIFICATION_EVENT } = require('./notifications/constants');

await notificationsService.createTenderNotification(
  TENDER_NOTIFICATION_EVENT.TENDER_PUBLISHED,
  tenderId,
  userId
);
```

### Create a Bid Notification
```javascript
const notificationsService = require('./notifications/service');
const { BID_NOTIFICATION_EVENT } = require('./notifications/constants');

await notificationsService.createBidNotification(
  BID_NOTIFICATION_EVENT.BID_AWARDED,
  bidId,
  userId
);
```

### Update User Notification Preferences
```javascript
const notificationsService = require('./notifications/service');

await notificationsService.updateNotificationPreference(userId, {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  categoryPreferences: {
    tender: true,
    bid: true,
    organization: false,
  },
  quietHours: {
    enabled: true,
    startTime: '22:00',
    endTime: '08:00',
  },
});
```

### Create a Broadcast Notification
```javascript
const notificationsService = require('./notifications/service');

await notificationsService.createBroadcast(userId, {
  title: 'System Maintenance',
  message: 'Scheduled maintenance on Sunday 2 AM - 4 AM',
  channels: ['in_app', 'email'],
  priority: 'high',
  targetAudience: 'all',
  scheduledAt: new Date('2026-07-01T02:00:00Z'),
});
```

### Create a Scheduled Notification
```javascript
const notificationsService = require('./notifications/service');
const { SCHEDULE_TYPE } = require('./notifications/constants');

await notificationsService.createScheduledNotification(userId, {
  title: 'Weekly Tender Summary',
  message: 'Check out this week\'s new tenders',
  scheduleType: SCHEDULE_TYPE.WEEKLY,
  scheduledAt: new Date('2026-07-01T09:00:00Z'),
  recurrence: {
    interval: 1,
    daysOfWeek: [1], // Monday
    hourOfDay: 9,
  },
  channels: ['in_app', 'email'],
  category: 'reminder',
  targetAudience: 'vendors',
});
```

## Response Format

All responses follow the standard format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-06-29T10:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ],
  "timestamp": "2026-06-29T10:00:00.000Z"
}
```