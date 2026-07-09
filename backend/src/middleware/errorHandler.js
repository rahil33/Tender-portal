const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err.isOperational || false;

  const response = {
    success: false,
    message: err.message || 'Internal server error',
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err.details;
  }

  if (!isOperational && statusCode === 500) {
    logger.error('Critical error:', err);
  }

  res.status(statusCode).json(response);
};

const createError = (message, statusCode = 400, isOperational = true) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.status = statusCode;
  error.isOperational = isOperational;
  return error;
};

const asyncErrorHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  createError,
  asyncErrorHandler,
};