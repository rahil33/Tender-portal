# Security Fixes Implementation Guide

## Phase 1: CRITICAL Fixes (Immediate)

### 1.1 Remove Hardcoded Secrets

**Files to Update:**
- `backend/.env` - Replace with environment variables
- `backend/.env.example` - Already updated with placeholders

**Action Required:**
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env with new secret
# NEVER commit .env with real secrets to git
```

**Updated .env Structure:**
```env
# Use secrets manager or environment variables
MONGO_URI=${MONGO_URI_FROM_SECRETS_MANAGER}
JWT_SECRET=${JWT_SECRET_FROM_SECRETS_MANAGER}
```

### 1.2 Password Policy Enforcement

**Files Created:**
- `backend/src/utils/security.js` - Security utilities
- `backend/src/middleware/securityMiddleware.js` - Validation middleware

**Files Modified:**
- `backend/src/modules/auth/constants.js` - Added password requirements

**Implementation:**
```javascript
// In auth/validator.js, add password validation
const { validatePassword } = require('../middleware/securityMiddleware');

router.post('/register', 
  authLimiter, 
  validatePassword,  // Add this
  authValidators.register, 
  authController.register
);
```

### 1.3 Account Lockout Mechanism

**Files Created:**
- `backend/src/modules/auth/LoginAttempt.js` - Login attempt tracking model

**Files Modified:**
- `backend/src/modules/auth/constants.js` - Added lockout configuration
- `backend/src/modules/auth/auth.service.secure.js` - Enhanced auth service with lockout

**Implementation:**
```javascript
// In auth/service.js, replace with auth.service.secure.js
// OR merge the login method with lockout logic

// The new service includes:
// - Failed attempt tracking
// - Automatic account lockout after 5 attempts
// - 15-minute lockout duration
// - Successful login clears lockout
```

### 1.4 Fix IDOR Vulnerabilities

**Files Modified:**
- `backend/src/modules/bids/controller.js` - Added authorization checks

**Implementation:**
```javascript
// In bids/controller.js getBidById:
// - Check if user is admin/evaluator
// - Check if user is bid owner
// - Check if user is associated with tender
// - Return 403 if unauthorized
```

### 1.5 JWT Token Hardening

**Files Modified:**
- `backend/src/modules/auth/constants.js`

**Changes:**
- Reduced JWT expiration from 7 days to 1 hour
- Added refresh token mechanism (7 days)
- Added concurrent session limit (5 sessions)

**Action Required:**
```env
# Update .env
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
MAX_CONCURRENT_SESSIONS=5
```

## Phase 2: HIGH Priority Fixes (Within 7 Days)

### 2.1 Enhanced Security Headers

**Files to Modify:**
- `backend/server.js`

**Implementation:**
```javascript
// Add after helmet()
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

### 2.2 Enhanced Rate Limiting

**Files Modified:**
- `backend/src/middleware/rateLimiter.js`

**Implementation:**
```javascript
// Add stricter limits for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 attempts
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count failed attempts
});
```

### 2.3 File Upload Security

**Files Created:**
- `backend/src/utils/security.js` - Magic number validation utilities

**Files Modified:**
- `backend/src/config/upload.js`

**Implementation:**
```javascript
// Add magic number validation
const validateFileMagicNumber = (file) => {
  const allowedMagicNumbers = {
    pdf: '25504446',
    png: '89504e47',
    jpg: 'ffd8ffe0',
    jpeg: 'ffd8ffe1',
  };
  
  // Read first bytes and compare
  // Implementation in upload.js
};
```

### 2.4 NoSQL Injection Protection

**Files Created:**
- `backend/src/utils/security.js` - Input sanitization
- `backend/src/middleware/securityMiddleware.js` - Validation

**Implementation:**
```javascript
// In all service files, sanitize input before queries
const { sanitizeNoSQLInput } = require('../utils/security');

// Before query:
const sanitizedSearch = sanitizeNoSQLInput(searchTerm);
const results = await Model.find({ field: sanitizedSearch });
```

## Phase 3: MEDIUM Priority Fixes (Within 30 Days)

### 3.1 CSRF Protection

**Package Required:**
```bash
npm install csurf
```

**Implementation:**
```javascript
// In server.js
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: { httpOnly: true, secure: true } });

// Apply to state-changing routes
app.post('/api/*', csrfProtection, (req, res) => { ... });
```

### 3.2 Email Verification

**Files to Create:**
- `backend/src/modules/auth/verification.service.js`
- `backend/src/models/VerificationToken.js`

**Implementation:**
```javascript
// Generate verification token on registration
// Send email with verification link
// Verify token before activating account
```

### 3.3 Request Tracing

**Files to Modify:**
- `backend/src/middleware/requestLogger.js`

**Implementation:**
```javascript
// Add request ID to all requests
const requestLogger = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || generateSecureToken(16);
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  // Include in logs
  logger.info(`${req.method} ${req.originalUrl}`, {
    requestId,
    // ... other fields
  });
};
```

### 3.4 Pagination Limits

**Files Modified:**
- `backend/src/middleware/securityMiddleware.js` - validatePagination

**Implementation:**
```javascript
// Already implemented in securityMiddleware.js
// Apply to all endpoints with pagination
router.get('/', validatePagination, controller.getAll);
```

## Phase 4: Testing & Validation

### 4.1 Security Tests

**Create Tests For:**
1. Password policy enforcement
2. Account lockout after 5 failed attempts
3. IDOR protection on bids/tenders
4. NoSQL injection prevention
5. Rate limiting effectiveness
6. JWT expiration and refresh

### 4.2 Penetration Testing Checklist

- [ ] Attempt brute-force login
- [ ] Test IDOR on all endpoints
- [ ] Try NoSQL injection in search
- [ ] Test file upload with malicious files
- [ ] Attempt CSRF attacks
- [ ] Test JWT token manipulation
- [ ] Verify rate limiting works

### 4.3 Monitoring Setup

**Implement:**
1. Security event logging
2. Failed login alerts
3. Suspicious activity detection
4. Rate limit breach notifications

## Deployment Checklist

### Pre-Deployment

- [ ] Generate new JWT secret
- [ ] Change MongoDB password
- [ ] Update all environment variables
- [ ] Remove .env from git (add to .gitignore)
- [ ] Test all security fixes
- [ ] Run security audit: `npm audit`

### Post-Deployment

- [ ] Verify security headers
- [ ] Test authentication flow
- [ ] Verify rate limiting
- [ ] Monitor logs for issues
- [ ] Schedule penetration test

## Monitoring & Maintenance

### Daily
- Review security logs
- Check failed login attempts
- Monitor rate limit breaches

### Weekly
- Review audit logs
- Check for suspicious patterns
- Update dependencies

### Monthly
- Security audit
- Penetration testing
- Review access controls
- Update security documentation

## Contact

For security issues:
- **Email:** security@phoenix-tender-portal.com
- **Priority:** Critical issues responded to within 24 hours

---

*Last Updated: July 13, 2026*