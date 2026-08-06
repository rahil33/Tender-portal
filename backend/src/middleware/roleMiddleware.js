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

const isBuyer = roleMiddleware(ROLES.BUYER);

const isVendorOrAdmin = roleMiddleware(ROLES.VENDOR, ROLES.ADMIN);

const isEvaluatorOrAdmin = roleMiddleware(ROLES.EVALUATOR, ROLES.ADMIN);

const isBuyerOrAdmin = roleMiddleware(ROLES.BUYER, ROLES.ADMIN);

const isVendorOrBuyer = roleMiddleware(ROLES.VENDOR, ROLES.BUYER);

const isVendorOrBuyerOrAdmin = roleMiddleware(ROLES.VENDOR, ROLES.BUYER, ROLES.ADMIN);

module.exports = {
  roleMiddleware,
  isAdmin,
  isVendor,
  isEvaluator,
  isBuyer,
  isVendorOrAdmin,
  isEvaluatorOrAdmin,
  isBuyerOrAdmin,
  isVendorOrBuyer,
  isVendorOrBuyerOrAdmin,
};