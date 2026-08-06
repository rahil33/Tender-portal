const { validatePasswordStrength } = require('../utils/security');

/**
 * Password validation middleware
 * Ensures passwords meet security requirements
 */
const validatePassword = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
    });
  }

  const validation = validatePasswordStrength(password);
  
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
      requirements: {
        minLength: 12,
        maxLength: 128,
        requiresUppercase: true,
        requiresLowercase: true,
        requiresNumbers: true,
        requiresSpecialChars: true,
      },
    });
  }

  next();
};

/**
 * Validate password update
 * Allows optional oldPassword for verification
 */
const validatePasswordUpdate = (req, res, next) => {
  const { password, oldPassword } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'New password is required',
    });
  }

  // Validate new password strength
  const validation = validatePasswordStrength(password);
  
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
      requirements: {
        minLength: 12,
        maxLength: 128,
        requiresUppercase: true,
        requiresLowercase: true,
        requiresNumbers: true,
        requiresSpecialChars: true,
      },
    });
  }

  // Ensure new password is different from old password
  if (oldPassword && password === oldPassword) {
    return res.status(400).json({
      success: false,
      message: 'New password must be different from current password',
    });
  }

  next();
};

/**
 * Sanitize string input to prevent regex injection
 */
const sanitizeString = (req, res, next) => {
  const { sanitizeFields } = req;
  
  if (!sanitizeFields || !Array.isArray(sanitizeFields)) {
    return next();
  }

  sanitizeFields.forEach(field => {
    if (req.body[field] && typeof req.body[field] === 'string') {
      // Remove potential regex injection characters
      req.body[field] = req.body[field].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '');
    }
  });

  next();
};

/**
 * Validate pagination parameters
 * Prevents DoS via unbounded pagination
 */
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  // Default values
  const DEFAULT_PAGE = 1;
  const DEFAULT_LIMIT = 10;
  const MAX_LIMIT = 100;

  // Validate page
  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer',
      });
    }
    req.query.page = pageNum;
  } else {
    req.query.page = DEFAULT_PAGE;
  }

  // Validate limit
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be a positive integer',
      });
    }
    if (limitNum > MAX_LIMIT) {
      return res.status(400).json({
        success: false,
        message: `Limit cannot exceed ${MAX_LIMIT}`,
      });
    }
    req.query.limit = limitNum;
  } else {
    req.query.limit = DEFAULT_LIMIT;
  }

  next();
};

/**
 * Validate ObjectId parameters
 * Prevents invalid MongoDB queries
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName] || req.query[paramName];

    if (!id) {
      return next(); // Let other validation handle required fields
    }

    // MongoDB ObjectId is 24 hex characters
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    
    if (!objectIdPattern.test(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
      });
    }

    next();
  };
};

/**
 * Validate sort parameters
 * Prevents NoSQL injection via sort fields
 */
const validateSort = (allowedFields = []) => {
  return (req, res, next) => {
    const { sortBy, sortOrder } = req.query;

    if (sortBy) {
      if (!allowedFields.includes(sortBy)) {
        return res.status(400).json({
          success: false,
          message: `Invalid sort field. Allowed: ${allowedFields.join(', ')}`,
        });
      }
    }

    if (sortOrder) {
      const validOrders = ['asc', 'desc', 'ASC', 'DESC', 1, -1];
      if (!validOrders.includes(sortOrder)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sort order. Must be asc or desc',
        });
      }
    }

    next();
  };
};

/**
 * Validate search query
 * Prevents regex injection and ReDoS attacks
 */
const validateSearchQuery = (maxLength = 100) => {
  return (req, res, next) => {
    const { q, search, query } = req.query;
    const searchTerm = q || search || query;

    if (searchTerm) {
      // Length limit
      if (searchTerm.length > maxLength) {
        return res.status(400).json({
          success: false,
          message: `Search term cannot exceed ${maxLength} characters`,
        });
      }

      // Block MongoDB operators
      if (/^\s*\$/.test(searchTerm)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid search term',
        });
      }

      // Remove regex special characters to prevent injection
      const sanitized = searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '');
      
      // Store sanitized version for use in queries
      req.sanitizedSearch = sanitized;
    }

    next();
  };
};

/**
 * Validate file upload
 * Basic validation before multer processes
 */
const validateFileUpload = (options = {}) => {
  const {
    maxFiles = 10,
    allowedMimeTypes = [],
    maxSizeMB = 10,
  } = options;

  return (req, res, next) => {
    // Check if files exist
    if (!req.files || req.files.length === 0) {
      if (options.required) {
        return res.status(400).json({
          success: false,
          message: 'At least one file is required',
        });
      }
      return next();
    }

    // Check file count
    if (req.files.length > maxFiles) {
      return res.status(400).json({
        success: false,
        message: `Cannot upload more than ${maxFiles} files at once`,
      });
    }

    // Check each file
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    for (const file of req.files) {
      // Size check
      if (file.size > maxSizeBytes) {
        return res.status(400).json({
          success: false,
          message: `File size cannot exceed ${maxSizeMB}MB`,
        });
      }

      // MIME type check
      if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File type ${file.mimetype} is not allowed`,
        });
      }
    }

    next();
  };
};

/**
 * Validate content type
 * Prevents content-type confusion attacks
 */
const validateContentType = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
    // Skip for GET requests and file uploads
    if (req.method === 'GET' || req.is('multipart/form-data')) {
      return next();
    }

    const contentType = req.headers['content-type'];

    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type header is required',
      });
    }

    // Check if content type matches
    const matches = allowedTypes.some(type => contentType.includes(type));
    
    if (!matches) {
      return res.status(400).json({
        success: false,
        message: `Content-Type must be one of: ${allowedTypes.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Validate email format
 */
const validateEmail = (fieldName = 'email') => {
  return (req, res, next) => {
    const email = req.body[fieldName] || req.query[fieldName];

    if (!email) {
      return next(); // Let other validation handle required fields
    }

    // Basic email regex
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Additional length check
    if (email.length > 254) {
      return res.status(400).json({
        success: false,
        message: 'Email address is too long',
      });
    }

    next();
  };
};

module.exports = {
  validatePassword,
  validatePasswordUpdate,
  sanitizeString,
  validatePagination,
  validateObjectId,
  validateSort,
  validateSearchQuery,
  validateFileUpload,
  validateContentType,
  validateEmail,
};