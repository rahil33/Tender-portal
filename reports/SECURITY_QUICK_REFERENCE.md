# Phoenix Tender Portal - Security Quick Reference

## 🚨 CRITICAL: Immediate Actions Required

### 1. Replace Hardcoded Secrets (DO THIS NOW)

```bash
# Generate new JWT secret (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output: <copy this 64-character string>

# Edit backend/.env
JWT_SECRET=<paste new secret here>

# Change MongoDB password via Atlas dashboard
# Update backend/.env with new connection string
```

### 2. Update .env File

```bash
# NEVER commit .env to git
echo ".env" >> .gitignore

# Generate new secrets for production
# Use secrets manager (AWS/Azure/HashiCorp)
```

---

## 🔐 Authentication Security

### Password Requirements
- ✅ Minimum 12 characters
- ✅ Uppercase + lowercase + numbers + special chars
- ✅ No common passwords
- ✅ No sequential characters

### Account Lockout
- 🔒 Locks after **5 failed attempts**
- ⏱️ **15-minute** lockout duration
- 📊 Tracked by email and IP

### Token Security
- ⏰ Access token: **1 hour** (reduced from 7 days)
- 🔄 Refresh token: **7 days**
- 🔢 Max **5 concurrent sessions**

---

## 🛡️ Authorization Improvements

### IDOR Protection
All endpoints now verify:
1. ✅ Authentication (valid token)
2. ✅ Authorization (correct role)
3. ✅ Ownership (resource belongs to user)
4. ✅ Membership (organization access)

### Role-Based Access Control
- **Admin**: Full access
- **Evaluator**: View + evaluate bids
- **Buyer**: Create/view own bids
- **Vendor**: View bids on own tenders

---

## 📝 Input Validation

### All Inputs Validated For:
- ✅ NoSQL injection
- ✅ Regex injection
- ✅ ObjectId format
- ✅ Pagination limits (max 100)
- ✅ Content-Type
- ✅ File uploads

### Usage Example
```javascript
const { validatePassword } = require('./middleware/securityMiddleware');

router.post('/register', 
  validatePassword,  // Enforces password policy
  authController.register
);
```

---

## 📁 File Upload Security

### Allowed File Types
- Documents: PDF, DOC, DOCX, XLS, XLSX
- Images: PNG, JPG, JPEG

### Limits
- Max size: **10MB**
- Max files: **10 per request**

### Validation
- ✅ MIME type checking
- ✅ Filename sanitization
- ✅ Path traversal prevention
- ⚠️ Magic number validation (framework ready)

---

## 🌐 Security Headers

### All Responses Include:
```
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

## ⏱️ Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 3 requests | 15 minutes |
| General API | 100 requests | 15 minutes |
| Admin | 50 requests | 15 minutes |
| Critical Ops | 10 requests | 1 hour |

---

## 📊 Security Monitoring

### Logged Events
- ✅ Login attempts (success/failure)
- ✅ Account lockouts
- ✅ Unauthorized access attempts
- ✅ Rate limit breaches
- ✅ File uploads
- ✅ Permission changes

### Request Tracing
Every request gets a unique ID:
```
X-Request-ID: <token>
```

---

## 🧪 Security Testing

### Test Password Policy
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"weak"}'
# Should fail with validation error
```

### Test Account Lockout
```bash
# Try logging in 5 times with wrong password
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
# 6th attempt should return "Account locked"
```

### Test IDOR
```bash
# Login as User A, try to access User B's bid
curl -X GET http://localhost:5000/api/bids/:bidId \
  -H "Authorization: Bearer <User_A_token>"
# Should return 403 if not authorized
```

### Test Rate Limiting
```bash
# Make 100 requests quickly
for i in {1..100}; do
  curl http://localhost:5000/api/tenders
done
# Should return 429 after limit
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Generate new JWT secret
- [ ] Change MongoDB password
- [ ] Update CORS origins
- [ ] Configure SMTP
- [ ] Set NODE_ENV=production
- [ ] Run `npm audit`
- [ ] Test all security features

### Post-Deployment
- [ ] Verify security headers
- [ ] Test authentication
- [ ] Check rate limiting
- [ ] Monitor logs
- [ ] Schedule penetration test

---

## 🆘 Security Incidents

### If You Suspect a Breach:

1. **Immediate Actions:**
   - Rotate all secrets
   - Invalidate all sessions
   - Review audit logs
   - Check for unauthorized access

2. **Contact:**
   - Security Team: security@phoenix-tender-portal.com
   - Priority: Critical (24-hour response)

3. **Documentation:**
   - Log all findings
   - Preserve evidence
   - Document timeline
   - Identify affected users

---

## 📚 Documentation

### Full Reports
- **SECURITY_AUDIT_REPORT.md** - Complete audit findings
- **SECURITY.md** - Security policies
- **SECURITY_FIXES_IMPLEMENTATION.md** - Implementation guide
- **SECURITY_AUDIT_SUMMARY.md** - Executive summary

### Code Files
- **backend/src/utils/security.js** - Security utilities
- **backend/src/middleware/securityMiddleware.js** - Validation
- **backend/src/modules/auth/LoginAttempt.js** - Login tracking
- **backend/src/modules/auth/auth.service.secure.js** - Enhanced auth

---

## 🎯 Security Scores

| Category | Score | Status |
|----------|-------|--------|
| Overall | 72/100 | ⚠️ Needs Work |
| Authentication | 85/100 | ✅ Good |
| Authorization | 90/100 | ✅ Good |
| API Security | 80/100 | ✅ Good |
| Upload Security | 75/100 | ⚠️ Fair |

**Production Ready:** ❌ No (until secrets are rotated)

---

## 🔄 Maintenance

### Daily
- Review security logs
- Check failed logins
- Monitor rate limits

### Weekly
- Update dependencies
- Review audit logs
- Check for suspicious patterns

### Monthly
- Security audit
- Penetration testing
- Access control review
- Documentation updates

---

## ✅ Quick Win Checklist

Want to improve security in 5 minutes?

- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Verify .env is in .gitignore
- [ ] Check security headers with browser dev tools
- [ ] Test password policy with weak password
- [ ] Review recent login attempts in logs

---

*Last Updated: July 13, 2026*  
*Next Review: August 13, 2026*  
*Security Status: ⚠️ IMPROVED - ACTION REQUIRED*