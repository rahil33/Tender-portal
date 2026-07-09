const { validationResult } = require('express-validator');

const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  
  next();
};

const validate = (validations) => {
  return [
    ...validations,
    validationMiddleware,
  ];
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors: error.details.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Params validation failed',
        errors: error.details.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    
    next();
  };
};

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Body validation failed',
        errors: error.details.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    
    next();
  };
};

module.exports = {
  validationMiddleware,
  validate,
  validateQuery,
  validateParams,
  validateBody,
};