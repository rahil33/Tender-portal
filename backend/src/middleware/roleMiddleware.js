const { ROLES } = require('../modules/auth/constants');

const roleMiddleware = (...allowedRoles) => {
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
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

const isAdmin = roleMiddleware(ROLES.ADMIN);

const isVendor = roleMiddleware(ROLES.VENDOR);

const isEvaluator = roleMiddleware(ROLES.EVALUATOR);

const isVendorOrAdmin = roleMiddleware(ROLES.VENDOR, ROLES.ADMIN);

const isEvaluatorOrAdmin = roleMiddleware(ROLES.EVALUATOR, ROLES.ADMIN);

module.exports = {
  roleMiddleware,
  isAdmin,
  isVendor,
  isEvaluator,
  isVendorOrAdmin,
  isEvaluatorOrAdmin,
};