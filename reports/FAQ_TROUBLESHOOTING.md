# Dashboard Module - FAQ & Troubleshooting

## Frequently Asked Questions

### Q1: How do I get started?
**A:** 
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure
3. Start server: `npm run dev`
4. Test endpoints with the API reference

### Q2: What authentication method is used?
**A:** 
JWT (JSON Web Tokens) via Authorization header:
```
Authorization: Bearer <token>
```

### Q3: How do I create a test token?
**A:**
See the Dashboard module test file for examples, or integrate with your auth module.

### Q4: Can I modify the activity types?
**A:**
Yes, edit `src/modules/dashboard/dashboard.model.js` and update the enum values.

### Q5: What's the maximum pagination limit?
**A:**
Default is 10, maximum is 100 items per page.

### Q6: How do statistics affect each other?
**A:**
They're independent. Update them separately via API endpoints.

### Q7: Can I delete individual activities?
**A:**
Currently only bulk operations are supported. For individual deletion, extend the API.

### Q8: What database is required?
**A:**
MongoDB 4.4 or higher. Connection string specified in MONGO_URI.

### Q9: Is real-time updates supported?
**A:**
No, but you can implement polling or WebSockets for real-time updates.

### Q10: How do I extend this module?
**A:**
Add new methods in service layer, create controller handlers, and define routes.

---

## Common Issues & Solutions

### Issue: "No token provided. Access denied."

**Cause:** Missing or malformed Authorization header

**Solution:**
```bash
# ❌ Wrong
GET /api/dashboard/overview

# ✅ Correct
GET /api/dashboard/overview
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### Issue: "Invalid token. Please login again."

**Cause:** Token is invalid or expired

**Possible Reasons:**
- Token signature doesn't match JWT_SECRET
- Token has expired
- Token was manually modified

**Solution:**
1. Verify JWT_SECRET in `.env` matches token generation
2. Generate new token from auth module
3. Check token expiration time

---

### Issue: "Session expired or revoked"

**Cause:** Token exists but session in database is invalid

**Possible Reasons:**
- Session was manually deleted
- Session expiry time passed
- User logged out

**Solution:**
1. Check Session collection in MongoDB
2. Generate new session after login
3. Ensure expiresAt date is in future

---

### Issue: "User not found"

**Cause:** User ID doesn't exist in database

**Solution:**
1. Verify userId format is valid MongoDB ObjectId
2. Check User collection for user existence
3. Ensure user was created during registration

---

### Issue: "Validation failed"

**Cause:** Input data doesn't match schema requirements

**Example Error:**
```json
{
  "errors": [
    { "field": "userId", "message": "Invalid user ID format" },
    { "field": "activityType", "message": "Invalid activity type" }
  ]
}
```

**Solution:**
1. Check all required fields are provided
2. Verify data types match (string, number, boolean, array)
3. Review validation rules in `dashboard.validators.js`

---

### Issue: "MongoDB Connection Failed"

**Cause:** Can't connect to MongoDB

**Possible Reasons:**
- MongoDB service not running
- MONGO_URI is incorrect
- Network access denied

**Solution:**
1. Check MongoDB is running: `mongodb://localhost:27017`
2. Verify MONGO_URI format: `mongodb://host:port/database`
3. Check firewall and network settings
4. Test connection separately

---

### Issue: "Cannot find module"

**Cause:** File path incorrect or file missing

**Solution:**
1. Verify all files are created in correct locations
2. Check relative paths in require statements
3. Use absolute paths if needed

```javascript
// Correct relative path
const User = require('../../models/User');

// Check path exists
node -e "require('./src/models/User.js')"
```

---

### Issue: "CORS Error in Frontend"

**Cause:** Frontend and backend on different origins

**Example Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
Update `.env` CORS_ORIGIN to include frontend URL:
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:5000
```

Or modify `server.js`:
```javascript
app.use(cors({
  origin: '*',  // Allow all origins (development only)
  credentials: true,
}));
```

---

### Issue: "Port already in use"

**Cause:** Another application using port 5000

**Solution:**
1. Change PORT in `.env`
```env
PORT=5001
```

2. Or find and kill process using port:
```bash
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000
```

---

### Issue: "Unread notifications count not updating"

**Cause:** Statistics not being updated when marking as read

**Solution:**
When marking activities as read, also update stats:
```javascript
POST /activities/mark-all-as-read
Body: { userId }

// This should automatically update:
// stats.notificationsUnreadCount = 0
```

---

### Issue: "Activities pagination not working"

**Cause:** Query parameters not properly parsed

**Solution:**
Ensure query parameters are properly formatted:
```bash
# ✅ Correct
GET /api/dashboard/activities?page=1&limit=10&type=tender_saved

# ❌ Wrong (missing query params)
GET /api/dashboard/activities
```

---

### Issue: "Profile completion percentage > 100"

**Cause:** Invalid data validation

**Possible Reasons:**
- Validation middleware not applied
- Direct database update
- Calculation error

**Solution:**
Ensure validation is active:
```javascript
// In route handler
PUT /api/dashboard/statistics
// Should validate: profileCompletionPercentage must be 0-100
```

---

### Issue: "Preferences not persisting"

**Cause:** Update endpoint returning success but DB not updating

**Possible Reasons:**
- Upsert not enabled
- Update query not matching user
- Database constraints

**Solution:**
Check service method uses proper MongoDB operations:
```javascript
// Should use upsert: true
await Preferences.findOneAndUpdate(
  { userId },
  updates,
  { new: true, upsert: true }
);
```

---

## Performance Tips

### 1. Pagination
Always use pagination for activities:
```bash
GET /api/dashboard/activities?page=1&limit=20
```

### 2. Caching
Implement client-side caching:
```javascript
const cachedData = localStorage.getItem('dashboardCache');
if (cachedData && !isExpired(cacheTime)) {
  return JSON.parse(cachedData);
}
```

### 3. Batch Operations
Update multiple stats in one request:
```bash
PUT /api/dashboard/statistics
Body: { userId, savedTendersCount: 10, applicationsCount: 5 }
```

### 4. Database Indexes
Ensure indexes exist on frequently queried fields:
```javascript
// In model
userSchema.index({ userId: 1, createdAt: -1 });
```

---

## Debugging

### Enable Debug Logging

Add to server.js:
```javascript
process.env.DEBUG = 'dashboard:*';
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```

### Test Endpoints with Postman

1. Import API collection
2. Set Authorization header with token
3. Send requests
4. Check response status and body

### MongoDB Query Debugging

Check records in MongoDB:
```javascript
// Connect to MongoDB
use tender_portal

// Check activities
db.dashboardactivities.find({ userId: ObjectId("...") }).pretty()

// Check stats
db.dashboardstats.findOne({ userId: ObjectId("...") })

// Check preferences
db.dashboardpreferences.findOne({ userId: ObjectId("...") })
```

---

## Best Practices

### 1. Always Use Try-Catch
```javascript
try {
  const result = await dashboardService.getOverview(userId);
} catch (error) {
  console.error(error);
  res.status(500).json({ success: false, message: error.message });
}
```

### 2. Validate Token Before Use
```javascript
const userId = req.user?.id;
if (!userId) {
  return res.status(401).json({ success: false });
}
```

### 3. Use DTOs for Responses
```javascript
return new APIResponseDTO(true, 'Success', data);
```

### 4. Log Important Operations
```javascript
console.log(`User ${userId} saved tender ${tenderId}`);
```

### 5. Handle Edge Cases
```javascript
if (!stats) {
  stats = await Stats.create({ userId });
}
```

---

## Resources

- [Dashboard Module Documentation](./src/modules/dashboard/README.md)
- [Integration Guide](./INTEGRATION_GUIDE.md)
- [API Quick Reference](./API_QUICK_REFERENCE.md)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)

---

## Getting Help

1. Check this FAQ first
2. Review module documentation
3. Check example tests in `dashboard.test.js`
4. Review error messages carefully
5. Check MongoDB logs
6. Enable debug mode

---

## Reporting Bugs

When reporting issues, include:
- Error message and stack trace
- Request payload (without sensitive data)
- Environment details (OS, Node version, MongoDB version)
- Steps to reproduce
- Expected vs actual behavior

---

## Feature Requests

To request new features:
1. Check if it's already in roadmap
2. Provide clear use case
3. Suggest implementation approach
4. Provide example usage

---

Last Updated: 2026-06-27
Version: 1.0.0
