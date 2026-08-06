const { NotificationPreference } = require('./model');
const EmailService = require('../../services/EmailService');
const logger = require('../../config/logger');

class NotificationService {
  constructor() {
    this.subscribers = new Map();
    this.setupDefaultSubscribers();
  }

  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType).push(callback);
    
    logger.debug('Notification subscriber added', { eventType });
  }

  unsubscribe(eventType, callback) {
    if (this.subscribers.has(eventType)) {
      const callbacks = this.subscribers.get(eventType);
      this.subscribers.set(
        eventType,
        callbacks.filter(cb => cb !== callback)
      );
      
      logger.debug('Notification subscriber removed', { eventType });
    }
  }

  async notify(eventType, data) {
    logger.info('Notification sent', { eventType, data });
    
    if (!this.subscribers.has(eventType)) {
      return { sent: 0 };
    }

    const callbacks = this.subscribers.get(eventType);
    const results = { sent: 0, failed: 0, errors: [] };

    for (const callback of callbacks) {
      try {
        await callback(data);
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({ callback: callback.name, error: error.message });
        logger.error('Notification callback failed', { eventType, error: error.message });
      }
    }

    return results;
  }

  async getUserPreferences(userId) {
    let preferences = await NotificationPreference.findOne({ userId });
    
    if (!preferences) {
      preferences = await NotificationPreference.create({ userId });
    }
    
    return preferences;
  }

  async updatePreferences(userId, updates) {
    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );
    
    return preferences;
  }

  async shouldNotify(userId, eventType) {
    const preferences = await this.getUserPreferences(userId);
    
    if (preferences.quietHours?.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { startTime, endTime } = preferences.quietHours;
      
      if (startTime > endTime) {
        if (currentTime >= startTime || currentTime <= endTime) {
          return false;
        }
      } else {
        if (currentTime >= startTime && currentTime <= endTime) {
          return false;
        }
      }
    }
    
    return true;
  }

  async notifyUser(userId, message, type = 'info', metadata = {}) {
    const shouldNotify = await this.shouldNotify(userId, type);
    if (!shouldNotify) {
      logger.debug('Notification skipped due to quiet hours', { userId, type });
      return { sent: 0, skipped: 1 };
    }

    const preferences = await this.getUserPreferences(userId);
    const results = { email: false, push: false, sms: false };

    if (preferences.emailNotifications) {
      try {
        await EmailService.sendNotification(userId, message, type, metadata);
        results.email = true;
      } catch (error) {
        logger.error('Email notification failed', { userId, error: error.message });
      }
    }

    if (preferences.pushNotifications) {
      try {
        await this.sendPushNotification(userId, { message, type, metadata });
        results.push = true;
      } catch (error) {
        logger.error('Push notification failed', { userId, error: error.message });
      }
    }

    if (preferences.smsNotifications && type === 'urgent') {
      try {
        await this.sendSMSNotification(userId, message);
        results.sms = true;
      } catch (error) {
        logger.error('SMS notification failed', { userId, error: error.message });
      }
    }

    logger.info('User notification processed', { userId, type, results });
    
    return results;
  }

  async sendPushNotification(userId, data) {
    logger.info('Push notification sent', { userId, data });
    return this.notify('push:notification', { userId, ...data });
  }

  async sendSMSNotification(userId, message) {
    logger.info('SMS notification sent', { userId, message });
    return this.notify('sms:notification', { userId, message });
  }

  setupDefaultSubscribers() {
    this.subscribe('tender:published', async (data) => {
      logger.info('Tender published notification', data);
    });

    this.subscribe('tender:closed', async (data) => {
      logger.info('Tender closed notification', data);
    });

    this.subscribe('tender:cancelled', async (data) => {
      logger.info('Tender cancelled notification', data);
    });

    this.subscribe('tender:awarded', async (data) => {
      logger.info('Tender awarded notification', data);
    });

    this.subscribe('document:uploaded', async (data) => {
      logger.info('Document uploaded notification', data);
    });

    this.subscribe('bid:received', async (data) => {
      logger.info('Bid received notification', data);
    });

    this.subscribe('bid:submitted', async (data) => {
      logger.info('Bid submitted notification', data);
    });

    this.subscribe('bid:evaluated', async (data) => {
      logger.info('Bid evaluated notification', data);
    });

    this.subscribe('bid:accepted', async (data) => {
      logger.info('Bid accepted notification', data);
    });

    this.subscribe('bid:rejected', async (data) => {
      logger.info('Bid rejected notification', data);
    });

    this.subscribe('bid:withdrawn', async (data) => {
      logger.info('Bid withdrawn notification', data);
    });

    this.subscribe('deadline:reminder', async (data) => {
      logger.info('Deadline reminder notification', data);
    });
  }

  async sendTenderPublishedNotification(tenderId, tenderNumber, title, publishedBy) {
    return this.notify('tender:published', {
      tenderId,
      tenderNumber,
      title,
      publishedBy,
      timestamp: new Date().toISOString(),
    });
  }

  async sendTenderClosedNotification(tenderId, tenderNumber, title) {
    return this.notify('tender:closed', {
      tenderId,
      tenderNumber,
      title,
      timestamp: new Date().toISOString(),
    });
  }

  async sendTenderCancelledNotification(tenderId, tenderNumber, title, reason) {
    return this.notify('tender:cancelled', {
      tenderId,
      tenderNumber,
      title,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  async sendTenderAwardedNotification(tenderId, tenderNumber, title, awardedTo) {
    return this.notify('tender:awarded', {
      tenderId,
      tenderNumber,
      title,
      awardedTo,
      timestamp: new Date().toISOString(),
    });
  }

  async sendDocumentUploadedNotification(tenderId, documentId, fileName, uploadedBy) {
    return this.notify('document:uploaded', {
      tenderId,
      documentId,
      fileName,
      uploadedBy,
      timestamp: new Date().toISOString(),
    });
  }

  async sendBidReceivedNotification(tenderId, bidId, bidderName, amount) {
    return this.notify('bid:received', {
      tenderId,
      bidId,
      bidderName,
      amount,
      timestamp: new Date().toISOString(),
    });
  }

  async sendDeadlineReminderNotification(tenderId, tenderNumber, title, deadline, hoursRemaining) {
    return this.notify('deadline:reminder', {
      tenderId,
      tenderNumber,
      title,
      deadline,
      hoursRemaining,
      timestamp: new Date().toISOString(),
    });
  }

  async sendBidSubmittedNotification(bidId, bidNumber, tenderId, tenderTitle, vendorId, bidAmount) {
    return this.notify('bid:submitted', {
      bidId,
      bidNumber,
      tenderId,
      tenderTitle,
      vendorId,
      bidAmount,
      timestamp: new Date().toISOString(),
    });
  }

  async sendBidEvaluatedNotification(bidId, bidNumber, tenderTitle, totalScore, isRecommended) {
    return this.notify('bid:evaluated', {
      bidId,
      bidNumber,
      tenderTitle,
      totalScore,
      isRecommended,
      timestamp: new Date().toISOString(),
    });
  }

  async sendBidAcceptedNotification(bidId, bidNumber, tenderTitle, vendorName) {
    return this.notify('bid:accepted', {
      bidId,
      bidNumber,
      tenderTitle,
      vendorName,
      timestamp: new Date().toISOString(),
    });
  }

  async sendBidRejectedNotification(bidId, bidNumber, tenderTitle, reason) {
    return this.notify('bid:rejected', {
      bidId,
      bidNumber,
      tenderTitle,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  async sendBidWithdrawnNotification(bidId, bidNumber, tenderTitle, reason) {
    return this.notify('bid:withdrawn', {
      bidId,
      bidNumber,
      tenderTitle,
      reason,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new NotificationService();