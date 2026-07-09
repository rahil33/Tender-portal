const logger = require('../config/logger');

class NotificationService {
  constructor() {
    this.subscribers = new Map();
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

  async notifyUser(userId, message, type = 'info', metadata = {}) {
    logger.info('User notification', { userId, type, message });
    
    return this.notify('user:notification', {
      userId,
      message,
      type,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyUsers(userIds, message, type = 'info', metadata = {}) {
    const results = { total: userIds.length, success: 0, failed: 0 };

    for (const userId of userIds) {
      try {
        await this.notifyUser(userId, message, type, metadata);
        results.success++;
      } catch (error) {
        results.failed++;
        logger.error('Failed to notify user', { userId, error: error.message });
      }
    }

    return results;
  }

  async broadcast(message, type = 'info', metadata = {}) {
    logger.info('Broadcast notification', { type, message });
    
    return this.notify('broadcast', {
      message,
      type,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  async sendInAppNotification(userId, data) {
    return this.notify('inapp:notification', {
      userId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  async sendEmailNotification(userId, emailData) {
    return this.notify('email:notification', {
      userId,
      ...emailData,
      timestamp: new Date().toISOString(),
    });
  }

  async sendPushNotification(userId, pushData) {
    return this.notify('push:notification', {
      userId,
      ...pushData,
      timestamp: new Date().toISOString(),
    });
  }

  getSubscribers(eventType) {
    return this.subscribers.get(eventType) || [];
  }

  clearSubscribers(eventType) {
    if (this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
      logger.debug('All subscribers cleared', { eventType });
    }
  }
}

module.exports = new NotificationService();