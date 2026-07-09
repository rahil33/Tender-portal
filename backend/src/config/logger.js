const env = require('./env');

const LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const COLORS = {
  ERROR: '\x1b[31m',
  WARN: '\x1b[33m',
  INFO: '\x1b[36m',
  DEBUG: '\x1b[90m',
  RESET: '\x1b[0m',
};

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const color = COLORS[level] || COLORS.RESET;
  
  const logObject = {
    timestamp,
    level,
    message,
    ...meta,
  };
  
  if (env.NODE_ENV === 'development') {
    return `${color}[${timestamp}] ${level}: ${message}${COLORS.RESET}`;
  }
  
  return JSON.stringify(logObject);
};

const logger = {
  error: (message, meta = {}) => {
    console.error(formatMessage(LEVELS.ERROR, message, meta));
  },
  
  warn: (message, meta = {}) => {
    console.warn(formatMessage(LEVELS.WARN, message, meta));
  },
  
  info: (message, meta = {}) => {
    console.info(formatMessage(LEVELS.INFO, message, meta));
  },
  
  debug: (message, meta = {}) => {
    if (env.NODE_ENV === 'development') {
      console.log(formatMessage(LEVELS.DEBUG, message, meta));
    }
  },
  
  request: (req) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  },
  
  database: (operation, details = {}) => {
    logger.debug(`Database: ${operation}`, details);
  },
  
  auth: (action, userId, details = {}) => {
    logger.info(`Auth: ${action}`, { userId, ...details });
  },
};

module.exports = logger;