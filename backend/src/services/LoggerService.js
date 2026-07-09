const logger = require('../config/logger');

class LoggerService {
  log(level, message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    };

    switch (level) {
      case 'error':
        logger.error(message, meta);
        break;
      case 'warn':
        logger.warn(message, meta);
        break;
      case 'info':
        logger.info(message, meta);
        break;
      case 'debug':
        logger.debug(message, meta);
        break;
      default:
        logger.info(message, meta);
    }

    return logEntry;
  }

  error(message, meta = {}) {
    return this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    return this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    return this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    return this.log('debug', message, meta);
  }

  audit(action, userId, resourceType, resourceId, details = {}) {
    return this.log('info', `Audit: ${action}`, {
      userId,
      resourceType,
      resourceId,
      action,
      ...details,
    });
  }

  request(req, res, duration) {
    return this.log('info', `${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  database(operation, collection, query, duration) {
    return this.log('debug', `DB: ${operation} ${collection}`, {
      operation,
      collection,
      query,
      duration: `${duration}ms`,
    });
  }

  auth(action, userId, details = {}) {
    return this.log('info', `Auth: ${action}`, {
      action,
      userId,
      ...details,
    });
  }

  performance(operation, startTime) {
    const duration = Date.now() - startTime;
    return this.log('info', `Performance: ${operation}`, {
      operation,
      duration: `${duration}ms`,
    });
  }

  errorWithContext(error, context = {}) {
    return this.log('error', error.message, {
      stack: error.stack,
      name: error.name,
      ...context,
    });
  }
}

module.exports = new LoggerService();