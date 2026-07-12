const { verifyToken } = require('../utils/jwt');
const { Session } = require('../modules/auth/model');
const logger = require('../config/logger');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('No token provided', { path: req.path });
      return res.status(401).json({
        success: false,
        message: 'No token provided. Access denied.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyToken(token);

    const session = await Session.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      logger.warn('Session expired or revoked', { userId: decoded.id });
      return res.status(401).json({
        success: false,
        message: 'Session expired or revoked. Please login again.',
      });
    }

    req.user = decoded;
    next();

  } catch (error) {
    logger.error('Token verification failed', { error: error.message });
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.',
    });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'User information not available.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
