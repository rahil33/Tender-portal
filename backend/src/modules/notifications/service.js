const {
  Notification,
  NotificationPreference,
  BroadcastNotification,
  ScheduledNotification,
} = require('./model');
const {
  NotificationDTO,
  NotificationSummaryDTO,
  NotificationPreferenceDTO,
  BroadcastNotificationDTO,
  BroadcastNotificationSummaryDTO,
  ScheduledNotificationDTO,
  ScheduledNotificationSummaryDTO,
  NotificationStatsDTO,
} = require('./dto');
const {
  NOTIFICATION_STATUS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  SORT_FIELDS,
  SORT_ORDER,
  TENDER_NOTIFICATION_EVENT,
  BID_NOTIFICATION_EVENT,
  ORGANIZATION_NOTIFICATION_EVENT,
  USER_NOTIFICATION_EVENT,
} = require('./constants');

const User = require('../users/users.model');
const Organization = require('../organizations/model').Organization;

class NotificationsService {
  async createNotification(createdBy, notificationData) {
    try {
      const notification = await Notification.create({
        ...notificationData,
        createdBy,
        status: notificationData.scheduledAt ? 'scheduled' : 'pending',
      });

      await this._addAuditLog(notification, 'NOTIFICATION_CREATED', createdBy, 'Notification created');

      return {
        success: true,
        data: new NotificationDTO(notification),
        message: 'Notification created successfully',
      };
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  async getNotificationById(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId).lean();

      if (!notification) {
        throw new Error('Notification not found');
      }

      const isRecipient = notification.recipients.some(
        (r) => r.userId.toString() === userId
      );

      if (!isRecipient && notification.recipientType !== 'broadcast') {
        throw new Error('Access denied');
      }

      return {
        success: true,
        data: new NotificationDTO(notification),
      };
    } catch (error) {
      throw new Error(`Failed to get notification: ${error.message}`);
    }
  }

  async getUserNotifications(userId, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = { recipientType: 'user', recipientId: userId };

      if (filters.category) query.category = filters.category;
      if (filters.priority) query.priority = filters.priority;
      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;

      if (filters.isRead !== undefined) {
        const isRead = filters.isRead === 'true' || filters.isRead === true;
        query['recipients.userId'] = userId;
        query['recipients.isRead'] = isRead ? true : { $ne: true };
      } else {
        query['recipients.userId'] = userId;
      }

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { message: { $regex: filters.search, $options: 'i' } },
        ];
      }

      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      const sortField = SORT_FIELDS[filters.sortBy] || SORT_FIELDS.createdAt;
      const sortValue = filters.sortOrder === SORT_ORDER.ASC ? 1 : -1;
      const sort = { [sortField]: sortValue };

      const notifications = await Notification.find(query).sort(sort).skip(skip).limit(limit).lean();
      const total = await Notification.countDocuments(query);

      const notificationsWithReadStatus = notifications.map((n) => {
        const recipient = n.recipients.find((r) => r.userId.toString() === userId);
        return { ...n, isRead: recipient ? recipient.isRead : false };
      });

      return {
        success: true,
        data: {
          data: notificationsWithReadStatus.map((n) => new NotificationSummaryDTO(n)),
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
  }

  async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        recipientType: 'user',
        recipientId: userId,
        'recipients.userId': userId,
        'recipients.isRead': { $ne: true },
      });

      return { success: true, data: { unreadCount: count } };
    } catch (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId);

      if (!notification) throw new Error('Notification not found');

      const recipient = notification.recipients.find((r) => r.userId.toString() === userId);
      if (!recipient) throw new Error('Notification not found for this user');

      recipient.isRead = true;
      recipient.readAt = new Date();
      await notification.save();

      return { success: true, message: 'Notification marked as read' };
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  async markAllAsRead(userId, category = null) {
    try {
      const query = {
        recipientType: 'user',
        recipientId: userId,
        'recipients.userId': userId,
        'recipients.isRead': { $ne: true },
      };

      if (category) query.category = category;

      const notifications = await Notification.find(query);

      for (const notification of notifications) {
        const recipient = notification.recipients.find((r) => r.userId.toString() === userId);
        if (recipient) {
          recipient.isRead = true;
          recipient.readAt = new Date();
        }
      }

      await Promise.all(notifications.map((n) => n.save()));

      return { success: true, message: `Marked ${notifications.length} notifications as read` };
    } catch (error) {
      throw new Error(`Failed to mark all as read: ${error.message}`);
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId);

      if (!notification) throw new Error('Notification not found');

      const isRecipient = notification.recipients.some((r) => r.userId.toString() === userId);
      const isCreator = notification.createdBy.toString() === userId.toString();

      if (!isRecipient && !isCreator) throw new Error('Access denied');

      await Notification.findByIdAndDelete(notificationId);

      return { success: true, message: 'Notification deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  async getNotificationPreference(userId) {
    try {
      let preference = await NotificationPreference.findOne({ userId }).lean();

      if (!preference) {
        preference = await NotificationPreference.create({ userId });
      }

      return { success: true, data: new NotificationPreferenceDTO(preference) };
    } catch (error) {
      throw new Error(`Failed to get notification preference: ${error.message}`);
    }
  }

  async updateNotificationPreference(userId, updates) {
    try {
      let preference = await NotificationPreference.findOne({ userId });

      if (!preference) {
        preference = await NotificationPreference.create({ userId, ...updates });
      } else {
        Object.assign(preference, updates);
        await preference.save();
      }

      return {
        success: true,
        data: new NotificationPreferenceDTO(preference),
        message: 'Notification preferences updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update preferences: ${error.message}`);
    }
  }

  async createBroadcast(createdBy, broadcastData) {
    try {
      const broadcast = await BroadcastNotification.create({
        ...broadcastData,
        createdBy,
        status: broadcastData.scheduledAt ? 'scheduled' : 'pending',
      });

      return {
        success: true,
        data: new BroadcastNotificationDTO(broadcast),
        message: 'Broadcast notification created successfully',
      };
    } catch (error) {
      throw new Error(`Failed to create broadcast: ${error.message}`);
    }
  }

  async getBroadcastById(broadcastId) {
    try {
      const broadcast = await BroadcastNotification.findById(broadcastId).lean();

      if (!broadcast) throw new Error('Broadcast notification not found');

      return { success: true, data: new BroadcastNotificationDTO(broadcast) };
    } catch (error) {
      throw new Error(`Failed to get broadcast: ${error.message}`);
    }
  }

  async getAllBroadcasts(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      if (filters.status) query.status = filters.status;
      if (filters.targetAudience) query.targetAudience = filters.targetAudience;
      if (filters.priority) query.priority = filters.priority;

      const broadcasts = await BroadcastNotification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await BroadcastNotification.countDocuments(query);

      return {
        success: true,
        data: {
          data: broadcasts.map((b) => new BroadcastNotificationSummaryDTO(b)),
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get broadcasts: ${error.message}`);
    }
  }

  async executeBroadcast(broadcastId, executedBy) {
    try {
      const broadcast = await BroadcastNotification.findById(broadcastId);

      if (!broadcast) throw new Error('Broadcast notification not found');
      if (broadcast.status === 'sent' || broadcast.status === 'completed') {
        throw new Error('Broadcast already executed');
      }

      const targetUsers = await this._getBroadcastTargetUsers(broadcast);
      broadcast.totalRecipients = targetUsers.length;

      for (const user of targetUsers) {
        await this._createBroadcastNotificationForUser(broadcast, user);
        broadcast.sentCount += 1;
      }

      broadcast.status = 'completed';
      broadcast.sentAt = new Date();
      broadcast.completedAt = new Date();
      await broadcast.save();

      return {
        success: true,
        data: new BroadcastNotificationDTO(broadcast),
        message: `Broadcast sent to ${targetUsers.length} recipients`,
      };
    } catch (error) {
      throw new Error(`Failed to execute broadcast: ${error.message}`);
    }
  }

  async cancelBroadcast(broadcastId) {
    try {
      const broadcast = await BroadcastNotification.findById(broadcastId);

      if (!broadcast) throw new Error('Broadcast notification not found');
      if (broadcast.status === 'sent' || broadcast.status === 'completed') {
        throw new Error('Cannot cancel executed broadcast');
      }

      broadcast.status = 'cancelled';
      await broadcast.save();

      return { success: true, message: 'Broadcast cancelled successfully' };
    } catch (error) {
      throw new Error(`Failed to cancel broadcast: ${error.message}`);
    }
  }

  async createScheduledNotification(createdBy, scheduledData) {
    try {
      const nextExecutionAt = this._calculateNextExecution(scheduledData);

      const scheduledNotification = await ScheduledNotification.create({
        ...scheduledData,
        createdBy,
        nextExecutionAt,
      });

      return {
        success: true,
        data: new ScheduledNotificationDTO(scheduledNotification),
        message: 'Scheduled notification created successfully',
      };
    } catch (error) {
      throw new Error(`Failed to create scheduled notification: ${error.message}`);
    }
  }

  async getScheduledNotificationById(scheduledId) {
    try {
      const scheduled = await ScheduledNotification.findById(scheduledId).lean();

      if (!scheduled) throw new Error('Scheduled notification not found');

      return { success: true, data: new ScheduledNotificationDTO(scheduled) };
    } catch (error) {
      throw new Error(`Failed to get scheduled notification: ${error.message}`);
    }
  }

  async getAllScheduledNotifications(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive === 'true' || filters.isActive === true;
      }
      if (filters.scheduleType) query.scheduleType = filters.scheduleType;
      if (filters.category) query.category = filters.category;

      const scheduled = await ScheduledNotification.find(query)
        .sort({ nextExecutionAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await ScheduledNotification.countDocuments(query);

      return {
        success: true,
        data: {
          data: scheduled.map((s) => new ScheduledNotificationSummaryDTO(s)),
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get scheduled notifications: ${error.message}`);
    }
  }

  async updateScheduledNotification(scheduledId, updates) {
    try {
      const scheduled = await ScheduledNotification.findByIdAndUpdate(
        scheduledId,
        updates,
        { new: true, runValidators: true }
      );

      if (!scheduled) throw new Error('Scheduled notification not found');

      if (updates.scheduledAt || updates.scheduleType || updates.recurrence) {
        scheduled.nextExecutionAt = this._calculateNextExecution(scheduled);
        await scheduled.save();
      }

      return {
        success: true,
        data: new ScheduledNotificationDTO(scheduled),
        message: 'Scheduled notification updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update scheduled notification: ${error.message}`);
    }
  }

  async deleteScheduledNotification(scheduledId) {
    try {
      const scheduled = await ScheduledNotification.findByIdAndDelete(scheduledId);

      if (!scheduled) throw new Error('Scheduled notification not found');

      return { success: true, message: 'Scheduled notification deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete scheduled notification: ${error.message}`);
    }
  }

  async executeScheduledNotification(scheduledId) {
    try {
      const scheduled = await ScheduledNotification.findById(scheduledId);

      if (!scheduled) throw new Error('Scheduled notification not found');
      if (!scheduled.isActive) throw new Error('Scheduled notification is not active');
      if (scheduled.maxExecutions && scheduled.executionCount >= scheduled.maxExecutions) {
        throw new Error('Maximum executions reached');
      }

      const targetUsers = await this._getScheduledNotificationTargetUsers(scheduled);

      for (const user of targetUsers) {
        await this._createNotificationFromScheduled(scheduled, user);
      }

      scheduled.executionCount += 1;
      scheduled.lastExecutedAt = new Date();
      scheduled.nextExecutionAt = this._calculateNextExecution(scheduled);

      if (scheduled.maxExecutions && scheduled.executionCount >= scheduled.maxExecutions) {
        scheduled.isActive = false;
      }

      await scheduled.save();

      return {
        success: true,
        message: `Scheduled notification executed for ${targetUsers.length} recipients`,
      };
    } catch (error) {
      throw new Error(`Failed to execute scheduled notification: ${error.message}`);
    }
  }

  async getPendingScheduledNotifications() {
    try {
      const now = new Date();

      const pending = await ScheduledNotification.find({
        isActive: true,
        nextExecutionAt: { $lte: now },
        $or: [
          { maxExecutions: null },
          { executionCount: { $lt: '$maxExecutions' } },
        ],
      }).lean();

      return { success: true, data: pending.map((s) => new ScheduledNotificationDTO(s)) };
    } catch (error) {
      throw new Error(`Failed to get pending scheduled notifications: ${error.message}`);
    }
  }

  async getNotificationStats(userId, startDate = null, endDate = null) {
    try {
      const dateQuery = {};
      if (startDate || endDate) {
        if (startDate) dateQuery.$gte = new Date(startDate);
        if (endDate) dateQuery.$lte = new Date(endDate);
      }

      const baseQuery = { recipientType: 'user', recipientId: userId, 'recipients.userId': userId };
      if (Object.keys(dateQuery).length > 0) baseQuery.createdAt = dateQuery;

      const totalNotifications = await Notification.countDocuments(baseQuery);
      const unreadCount = await Notification.countDocuments({ ...baseQuery, 'recipients.isRead': { $ne: true } });
      const readCount = totalNotifications - unreadCount;
      const pendingCount = await Notification.countDocuments({ ...baseQuery, status: 'pending' });
      const sentCount = await Notification.countDocuments({ ...baseQuery, status: 'sent' });
      const failedCount = await Notification.countDocuments({ ...baseQuery, status: 'failed' });
      const scheduledCount = await Notification.countDocuments({ ...baseQuery, status: 'scheduled' });

      const byCategory = await Notification.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);

      const byPriority = await Notification.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]);

      const byType = await Notification.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]);

      return {
        success: true,
        data: new NotificationStatsDTO({
          totalNotifications,
          unreadCount,
          readCount,
          pendingCount,
          sentCount,
          failedCount,
          scheduledCount,
          byCategory: byCategory.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
          byPriority: byPriority.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
          byType: byType.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
        }),
      };
    } catch (error) {
      throw new Error(`Failed to get notification stats: ${error.message}`);
    }
  }

  async createTenderNotification(event, tenderId, createdBy, extraData = {}) {
    try {
      const Tender = require('../tenders/model').Tender;
      const tender = await Tender.findById(tenderId).populate('createdBy issuingOrganization').lean();
      if (!tender) throw new Error('Tender not found');

      const notificationData = this._getTenderNotificationData(event, tender, extraData);
      const recipients = await this._getTenderNotificationRecipients(tender, event);

      const notification = await Notification.create({
        ...notificationData,
        recipients,
        relatedEntity: { entityType: 'tender', entityId: tenderId },
        createdBy,
      });

      return { success: true, data: new NotificationDTO(notification) };
    } catch (error) {
      throw new Error(`Failed to create tender notification: ${error.message}`);
    }
  }

  async createBidNotification(event, bidId, createdBy, extraData = {}) {
    try {
      const Bid = require('../bids/model').Bid;
      const bid = await Bid.findById(bidId).populate('vendorId tenderId organizationId').lean();
      if (!bid) throw new Error('Bid not found');

      const notificationData = this._getBidNotificationData(event, bid, extraData);
      const recipients = await this._getBidNotificationRecipients(bid, event);

      const notification = await Notification.create({
        ...notificationData,
        recipients,
        relatedEntity: { entityType: 'bid', entityId: bidId },
        createdBy,
      });

      return { success: true, data: new NotificationDTO(notification) };
    } catch (error) {
      throw new Error(`Failed to create bid notification: ${error.message}`);
    }
  }

  async createOrganizationNotification(event, organizationId, createdBy, extraData = {}) {
    try {
      const organization = await Organization.findById(organizationId).lean();
      if (!organization) throw new Error('Organization not found');

      const notificationData = this._getOrganizationNotificationData(event, organization, extraData);
      const recipients = await this._getOrganizationNotificationRecipients(organization, event);

      const notification = await Notification.create({
        ...notificationData,
        recipients,
        relatedEntity: { entityType: 'organization', entityId: organizationId },
        createdBy,
      });

      return { success: true, data: new NotificationDTO(notification) };
    } catch (error) {
      throw new Error(`Failed to create organization notification: ${error.message}`);
    }
  }

  async createUserNotification(event, userId, createdBy, extraData = {}) {
    try {
      const notificationData = this._getUserNotificationData(event, userId, extraData);

      const notification = await Notification.create({
        ...notificationData,
        recipients: [{ userId, isRead: false }],
        relatedEntity: { entityType: 'user', entityId: userId },
        createdBy,
      });

      return { success: true, data: new NotificationDTO(notification) };
    } catch (error) {
      throw new Error(`Failed to create user notification: ${error.message}`);
    }
  }

  async _addAuditLog(notification, action, performedBy, details, ipAddress = null) {
    notification.auditLog.push({ action, performedBy, details, ipAddress, timestamp: new Date() });
    await notification.save();
  }

  _getTenderNotificationData(event, tender, extraData) {
    const eventTitles = {
      [TENDER_NOTIFICATION_EVENT.TENDER_CREATED]: 'Tender Created',
      [TENDER_NOTIFICATION_EVENT.TENDER_PUBLISHED]: 'Tender Published',
      [TENDER_NOTIFICATION_EVENT.TENDER_UPDATED]: 'Tender Updated',
      [TENDER_NOTIFICATION_EVENT.TENDER_CANCELLED]: 'Tender Cancelled',
      [TENDER_NOTIFICATION_EVENT.TENDER_CLOSED]: 'Tender Closed',
      [TENDER_NOTIFICATION_EVENT.TENDER_DEADLINE_APPROACHING]: 'Tender Deadline Approaching',
      [TENDER_NOTIFICATION_EVENT.TENDER_EXTENDED]: 'Tender Deadline Extended',
      [TENDER_NOTIFICATION_EVENT.TENDER_AWARDED]: 'Tender Awarded',
      [TENDER_NOTIFICATION_EVENT.TENDER_REJECTED]: 'Tender Application Rejected',
    };

    return {
      title: eventTitles[event] || 'Tender Notification',
      message: `Tender "${tender.title}" - ${event.replace(/_/g, ' ')}`,
      type: 'in_app',
      category: 'tender',
      priority: event === TENDER_NOTIFICATION_EVENT.TENDER_DEADLINE_APPROACHING ? 'high' : 'normal',
      status: 'pending',
      event,
      eventType: event,
      recipientType: 'tender',
      recipientId: tender._id,
      actionUrl: `/tenders/${tender._id}`,
      metadata: { tenderId: tender._id, tenderTitle: tender.title, ...extraData },
    };
  }

  _getBidNotificationData(event, bid, extraData) {
    const eventTitles = {
      [BID_NOTIFICATION_EVENT.BID_SUBMITTED]: 'Bid Submitted',
      [BID_NOTIFICATION_EVENT.BID_UPDATED]: 'Bid Updated',
      [BID_NOTIFICATION_EVENT.BID_WITHDRAWN]: 'Bid Withdrawn',
      [BID_NOTIFICATION_EVENT.BID_EVALUATED]: 'Bid Evaluated',
      [BID_NOTIFICATION_EVENT.BID_AWARDED]: 'Bid Awarded',
      [BID_NOTIFICATION_EVENT.BID_REJECTED]: 'Bid Rejected',
      [BID_NOTIFICATION_EVENT.BID_SHORTLISTED]: 'Bid Shortlisted',
      [BID_NOTIFICATION_EVENT.BID_CLARIFICATION_REQUESTED]: 'Clarification Requested',
    };

    return {
      title: eventTitles[event] || 'Bid Notification',
      message: `Your bid for tender - ${event.replace(/_/g, ' ')}`,
      type: 'in_app',
      category: 'bid',
      priority: event === BID_NOTIFICATION_EVENT.BID_AWARDED ? 'urgent' : 'normal',
      status: 'pending',
      event,
      eventType: event,
      recipientType: 'bid',
      recipientId: bid._id,
      actionUrl: `/bids/${bid._id}`,
      metadata: { bidId: bid._id, tenderId: bid.tenderId, ...extraData },
    };
  }

  _getOrganizationNotificationData(event, organization, extraData) {
    const eventTitles = {
      [ORGANIZATION_NOTIFICATION_EVENT.ORGANIZATION_CREATED]: 'Organization Created',
      [ORGANIZATION_NOTIFICATION_EVENT.ORGANIZATION_UPDATED]: 'Organization Updated',
      [ORGANIZATION_NOTIFICATION_EVENT.ORGANIZATION_VERIFIED]: 'Organization Verified',
      [ORGANIZATION_NOTIFICATION_EVENT.ORGANIZATION_REJECTED]: 'Organization Verification Rejected',
      [ORGANIZATION_NOTIFICATION_EVENT.MEMBER_ADDED]: 'Member Added',
      [ORGANIZATION_NOTIFICATION_EVENT.MEMBER_REMOVED]: 'Member Removed',
      [ORGANIZATION_NOTIFICATION_EVENT.MEMBER_ROLE_CHANGED]: 'Member Role Changed',
    };

    return {
      title: eventTitles[event] || 'Organization Notification',
      message: `${organization.name} - ${event.replace(/_/g, ' ')}`,
      type: 'in_app',
      category: 'organization',
      priority: 'normal',
      status: 'pending',
      event,
      eventType: event,
      recipientType: 'organization',
      recipientId: organization._id,
      actionUrl: `/organizations/${organization._id}`,
      metadata: { organizationId: organization._id, organizationName: organization.name, ...extraData },
    };
  }

  _getUserNotificationData(event, userId, extraData) {
    const eventTitles = {
      [USER_NOTIFICATION_EVENT.PROFILE_UPDATED]: 'Profile Updated',
      [USER_NOTIFICATION_EVENT.PASSWORD_CHANGED]: 'Password Changed',
      [USER_NOTIFICATION_EVENT.ACCOUNT_ACTIVATED]: 'Account Activated',
      [USER_NOTIFICATION_EVENT.ACCOUNT_DEACTIVATED]: 'Account Deactivated',
      [USER_NOTIFICATION_EVENT.DOCUMENT_VERIFIED]: 'Document Verified',
      [USER_NOTIFICATION_EVENT.DOCUMENT_REJECTED]: 'Document Rejected',
    };

    return {
      title: eventTitles[event] || 'Account Notification',
      message: `Your account - ${event.replace(/_/g, ' ')}`,
      type: 'in_app',
      category: 'user',
      priority: 'normal',
      status: 'pending',
      event,
      eventType: event,
      recipientType: 'user',
      recipientId: userId,
      actionUrl: '/profile',
      metadata: { userId, ...extraData },
    };
  }

  async _getTenderNotificationRecipients(tender, event) {
    const recipients = [];
    if (tender.createdBy) recipients.push({ userId: tender.createdBy, isRead: false });

    if (event === TENDER_NOTIFICATION_EVENT.TENDER_PUBLISHED) {
      const vendors = await User.find({ role: 'vendor' }).select('_id').lean();
      for (const vendor of vendors) {
        if (!recipients.some((r) => r.userId.toString() === vendor._id.toString())) {
          recipients.push({ userId: vendor._id, isRead: false });
        }
      }
    }
    return recipients;
  }

  async _getBidNotificationRecipients(bid, event) {
    const recipients = [];
    if (bid.vendorId) recipients.push({ userId: bid.vendorId, isRead: false });

    if (event === BID_NOTIFICATION_EVENT.BID_SUBMITTED || event === BID_NOTIFICATION_EVENT.BID_EVALUATED) {
      const Tender = require('../tenders/model').Tender;
      const tender = await Tender.findById(bid.tenderId).lean();
      if (tender && tender.createdBy) recipients.push({ userId: tender.createdBy, isRead: false });
    }
    return recipients;
  }

  async _getOrganizationNotificationRecipients(organization) {
    const recipients = [];
    const OrganizationMember = require('../organizations/model').OrganizationMember;
    const members = await OrganizationMember.find({ organizationId: organization._id, isActive: true }).select('userId').lean();
    for (const member of members) recipients.push({ userId: member.userId, isRead: false });
    return recipients;
  }

  async _getBroadcastTargetUsers(broadcast) {
    const query = {};
    switch (broadcast.targetAudience) {
      case 'vendors': query.role = 'vendor'; break;
      case 'evaluators': query.role = 'evaluator'; break;
      case 'admins': query.role = 'admin'; break;
      case 'specific_users': query._id = { $in: broadcast.targetUsers || [] }; break;
      default: break;
    }
    if (broadcast.filters?.role && broadcast.targetAudience !== 'specific_users') {
      query.role = { $in: broadcast.filters.role };
    }
    const users = await User.find(query).select('_id').lean();
    return users;
  }

  async _getScheduledNotificationTargetUsers(scheduled) {
    const query = {};
    switch (scheduled.targetAudience) {
      case 'vendors': query.role = 'vendor'; break;
      case 'evaluators': query.role = 'evaluator'; break;
      case 'admins': query.role = 'admin'; break;
      case 'specific_users': query._id = { $in: scheduled.targetUsers || [] }; break;
      default: break;
    }
    const users = await User.find(query).select('_id').lean();
    return users;
  }

  async _createBroadcastNotificationForUser(broadcast, user) {
    await Notification.create({
      title: broadcast.title,
      message: broadcast.message,
      type: 'in_app',
      category: 'broadcast',
      priority: broadcast.priority,
      status: 'sent',
      event: 'broadcast_sent',
      recipientType: 'user',
      recipientId: user._id,
      recipients: [{ userId: user._id, isRead: false }],
      channels: broadcast.channels.map((ch) => ({ channel: ch, status: 'sent', sentAt: new Date() })),
      actionUrl: broadcast.actionUrl,
      metadata: { broadcastId: broadcast._id, ...broadcast.metadata },
      createdBy: broadcast.createdBy,
      sentAt: new Date(),
    });
  }

  async _createNotificationFromScheduled(scheduled, user) {
    await Notification.create({
      title: scheduled.title,
      message: scheduled.message,
      type: 'in_app',
      category: scheduled.category,
      priority: scheduled.priority,
      status: 'sent',
      event: 'scheduled_notification',
      recipientType: 'user',
      recipientId: user._id,
      recipients: [{ userId: user._id, isRead: false }],
      channels: scheduled.channels.map((ch) => ({ channel: ch, status: 'sent', sentAt: new Date() })),
      actionUrl: scheduled.actionUrl,
      metadata: { scheduledNotificationId: scheduled._id, ...scheduled.metadata },
      createdBy: scheduled.createdBy,
      sentAt: new Date(),
    });
  }

  _calculateNextExecution(scheduled) {
    const { scheduleType, scheduledAt, recurrence } = scheduled;
    let nextDate = new Date(scheduledAt);

    if (scheduleType === 'once') return null;

    const interval = recurrence?.interval || 1;
    const hourOfDay = recurrence?.hourOfDay ?? 9;

    switch (scheduleType) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        nextDate.setHours(hourOfDay, 0, 0, 0);
        break;
      case 'weekly':
        if (recurrence?.daysOfWeek?.length > 0) {
          const today = nextDate.getDay();
          const nextDay = recurrence.daysOfWeek.find((d) => d > today) || recurrence.daysOfWeek[0];
          const daysUntilNext = nextDay - today + (nextDay <= today ? 7 : 0);
          nextDate.setDate(nextDate.getDate() + daysUntilNext);
        } else {
          nextDate.setDate(nextDate.getDate() + (interval * 7));
        }
        nextDate.setHours(hourOfDay, 0, 0, 0);
        break;
      case 'monthly':
        if (recurrence?.dayOfMonth) {
          nextDate.setDate(recurrence.dayOfMonth);
          if (nextDate <= new Date()) nextDate.setMonth(nextDate.getMonth() + interval);
        } else {
          nextDate.setMonth(nextDate.getMonth() + interval);
        }
        nextDate.setHours(hourOfDay, 0, 0, 0);
        break;
      case 'custom':
        if (recurrence?.daysOfWeek?.length > 0) {
          const today = nextDate.getDay();
          const nextDay = recurrence.daysOfWeek.find((d) => d > today) || recurrence.daysOfWeek[0];
          const daysUntilNext = nextDay - today + (nextDay <= today ? 7 : 0);
          nextDate.setDate(nextDate.getDate() + daysUntilNext);
        } else if (recurrence?.dayOfMonth) {
          nextDate.setDate(recurrence.dayOfMonth);
          if (nextDate <= new Date()) nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
          nextDate.setDate(nextDate.getDate() + interval);
        }
        nextDate.setHours(hourOfDay, 0, 0, 0);
        break;
      default:
        return null;
    }

    if (scheduled.expiresAt && nextDate > new Date(scheduled.expiresAt)) {
      return null;
    }

    return nextDate;
  }
}

module.exports = new NotificationsService();