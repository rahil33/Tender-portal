const crypto = require('crypto');
const env = require('./env');

/**
 * Secure random token generator
 * @param {number} bytes - Number of bytes (default 32 for 256-bit)
 * @returns {string} Hex-encoded secure token
 */
const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate a secure JWT secret
 * @returns {string} 64-character hex string (256-bit)
 */
const generateJWTSecret = () => {
  return generateSecureToken(32);
};

/**
 * Hash sensitive data for storage
 * @param {string} data - Data to hash
 * @param {string} salt - Salt for hashing
 * @returns {string} Hashed data
 */
const hashData = (data, salt) => {
  const hmac = crypto.createHmac('sha256', salt);
  hmac.update(data);
  return hmac.digest('hex');
};

/**
 * Validate JWT secret strength
 * @param {string} secret - JWT secret to validate
 * @returns {object} Validation result
 */
const validateJWTSecret = (secret) => {
  if (!secret) {
    return { valid: false, message: 'JWT secret is required' };
  }

  if (secret.length < 32) {
    return { 
      valid: false, 
      message: 'JWT secret must be at least 32 characters (256-bit)' 
    };
  }

  // Check for sufficient entropy
  const uniqueChars = new Set(secret).size;
  if (uniqueChars < 16) {
    return { 
      valid: false, 
      message: 'JWT secret lacks sufficient entropy' 
    };
  }

  return { valid: true };
};

/**
 * Sanitize string to prevent regex injection
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeForRegex = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  // Escape special regex characters
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * Validate and sanitize MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId format
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  // MongoDB ObjectId is 24 hex characters
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitize user input to prevent NoSQL injection
 * @param {any} input - Input to sanitize
 * @returns {any} Sanitized input
 */
const sanitizeNoSQLInput = (input) => {
  if (typeof input === 'string') {
    return sanitizeForRegex(input);
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeNoSQLInput(item));
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      // Block MongoDB operator keys
      if (key.startsWith('$')) {
        continue;
      }
      sanitized[key] = sanitizeNoSQLInput(value);
    }
    return sanitized;
  }
  
  return input;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result
 */
const validatePasswordStrength = (password) => {
  if (!password) {
    return { 
      valid: false, 
      message: 'Password is required' 
    };
  }

  if (password.length < 12) {
    return { 
      valid: false, 
      message: 'Password must be at least 12 characters long' 
    };
  }

  if (password.length > 128) {
    return { 
      valid: false, 
      message: 'Password must not exceed 128 characters' 
    };
  }

  // Check for complexity
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecial) {
    return { 
      valid: false, 
      message: 'Password must contain uppercase, lowercase, numbers, and special characters' 
    };
  }

  // Check for common passwords
  const commonPasswords = [
    'password', '123456', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon'
  ];
  
  const lowerPassword = password.toLowerCase();
  if (commonPasswords.some(common => lowerPassword.includes(common))) {
    return { 
      valid: false, 
      message: 'Password is too common or predictable' 
    };
  }

  // Check for sequential characters
  const sequentialPatterns = [
    /012|123|234|345|456|567|678|789|890/,
    /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/,
    /zyx|wvu|tsr|qpo|onm|lml|kji|jih|ihg|hgf|gfe|fed|edc|dcb|cba/
  ];

  if (sequentialPatterns.some(pattern => pattern.test(lowerPassword))) {
    return { 
      valid: false, 
      message: 'Password contains sequential characters' 
    };
  }

  return { valid: true };
};

/**
 * Mask sensitive data for logging
 * @param {string} data - Data to mask
 * @param {number} visibleChars - Number of characters to show
 * @returns {string} Masked data
 */
const maskSensitiveData = (data, visibleChars = 4) => {
  if (!data || typeof data !== 'string') {
    return data;
  }
  
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  
  return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
};

/**
 * Mask email for logging
 * @param {string} email - Email to mask
 * @returns {string} Masked email
 */
const maskEmail = (email) => {
  if (!email || !email.includes('@')) {
    return email;
  }
  
  const [username, domain] = email.split('@');
  const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 1);
  return `${maskedUsername}@${domain}`;
};

/**
 * Validate IP address format
 * @param {string} ip - IP address to validate
 * @returns {boolean} True if valid IP
 */
const isValidIP = (ip) => {
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  
  // IPv4
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Pattern.test(ip)) {
    const parts = ip.split('.').map(Number);
    return parts.every(part => part >= 0 && part <= 255);
  }
  
  // IPv6 (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv6Pattern.test(ip);
};

/**
 * Get client IP from request
 * @param {object} req - Express request object
 * @returns {string} Client IP
 */
const getClientIP = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim();
    return isValidIP(ip) ? ip : req.ip;
  }
  return req.ip || req.connection.remoteAddress;
};

/**
 * Rate limit key generator
 * @param {object} req - Express request object
 * @returns {string} Rate limit key
 */
const getRateLimitKey = (req) => {
  const ip = getClientIP(req);
  const path = req.path.replace(/\/\d+/g, '/:id'); // Normalize paths with IDs
  return `${ip}:${path}`;
};

module.exports = {
  generateSecureToken,
  generateJWTSecret,
  hashData,
  validateJWTSecret,
  sanitizeForRegex,
  isValidObjectId,
  sanitizeNoSQLInput,
  validatePasswordStrength,
  maskSensitiveData,
  maskEmail,
  isValidIP,
  getClientIP,
  getRateLimitKey,
};