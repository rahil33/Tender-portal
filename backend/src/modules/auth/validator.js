const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

const authValidators = {
  register: [
    body('fullName')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Full name is required')
      .isLength({ max: 200 })
      .withMessage('Full name must be max 200 characters'),
    body('companyName')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Company name is required')
      .isLength({ max: 200 })
      .withMessage('Company name must be max 200 characters'),
    body('phone')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Phone number is required'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .notEmpty()
      .withMessage('Email is required')
      .withMessage('Email must be valid'),
    body('password')
      .isString()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    handleValidationErrors,
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .notEmpty()
      .withMessage('Email is required'),
    body('password')
      .isString()
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors,
  ],

  revokeSession: [
    param('sessionId')
      .isMongoId()
      .withMessage('Session ID must be valid'),
    handleValidationErrors,
  ],
};

module.exports = authValidators;