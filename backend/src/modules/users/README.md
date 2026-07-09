# Users Module Documentation

## Overview

The Users Module provides comprehensive user management, profile management, document handling, and activity tracking for the Phoenix Tender Portal. It manages user profiles, settings, documents, and tracks all user activities.

## Features

- **User Profiles**: Manage user information and details
- **User Settings**: Configure user preferences and notifications
- **Document Management**: Upload, verify, and manage user documents
- **Activity Tracking**: Track and log all user activities
- **User Search**: Search users by various criteria
- **User Statistics**: Get user metrics and statistics
- **Account Management**: Deactivate and manage user accounts
- **Document Verification**: Verify user documents with admin controls

## API Endpoints

### User Profile Management

#### Get User Profile
```
GET /api/users/profile/:userId
Authentication: Required (JWT Bearer Token)
Parameters:
  - userId: User ID (path parameter)
```

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "companyName": "ABC Corp",
    "profileCompleteness": 85,
    "documentVerification": true
  }
}
```

#### Create User Profile
```
POST /api/users/profile
Authentication: Required
Body:
{
  "userId": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "companyName": "ABC Corp",
  "designation": "Manager",
  "bio": "User bio"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {...}
}
```

#### Update User Profile
```
PUT /api/users/profile/:userId
Authentication: Required
Parameters:
  - userId: User ID (path parameter)
Body:
{
  "firstName": "Jane",
  "phone": "9876543210",
  "designation": "Senior Manager"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {...}
}
```

### User Settings Management

#### Get User Settings
```
GET /api/users/settings/:userId
Authentication: Required
Parameters:
  - userId: User ID (path parameter)
```

**Response:**
```json
{
  "success": true,
  "message": "User settings retrieved",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "emailNotifications": true,
    "smsNotifications": false,
    "pushNotifications": true,
    "tenderAlerts": true,
    "preferredLanguage": "en",
    "theme": "light",
    "timezone": "UTC"
  }
}
```

#### Update User Settings
```
PUT /api/users/settings/:userId
Authentication: Required
Parameters:
  - userId: User ID (path parameter)
Body:
{
  "emailNotifications": true,
  "theme": "dark",
  "tenderAlerts": true,
  "preferredLanguage": "en"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {...}
}
```

### User Documents Management

#### Upload User Document
```
POST /api/users/documents
Authentication: Required
Body:
{
  "userId": "507f1f77bcf86cd799439011",
  "documentType": "aadhar",
  "documentName": "Aadhar Card",
  "documentUrl": "https://...",
  "expiryDate": "2027-12-31"
}
```

**Document Types:**
- `aadhar`: Aadhar Card
- `pan`: PAN Card
- `gst`: GST Certificate
- `certificate`: Certificate
- `license`: License
- `incorporation`: Company Incorporation
- `other`: Other documents

**Response (201):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "...",
    "documentType": "aadhar",
    "status": "pending",
    "createdAt": "2026-06-27T10:30:00Z"
  }
}
```

#### Get User Documents
```
GET /api/users/:userId/documents
Authentication: Required
Parameters:
  - userId: User ID (path parameter)
Query Parameters:
  - status (optional): pending, verified, rejected, expired
  - documentType (optional): Document type
  - page (optional, default: 1): Page number
  - limit (optional, default: 10, max: 100): Results per page
```

**Response:**
```json
{
  "success": true,
  "message": "User documents retrieved",
  "data": {
    "data": [
      {
        "id": "...",
        "documentType": "aadhar",
        "documentName": "Aadhar Card",
        "status": "verified",
        "createdAt": "2026-06-27T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

#### Delete User Document
```
DELETE /api/users/documents/:documentId
Authentication: Required
Parameters:
  - documentId: Document ID (path parameter)
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

#### Update Document Verification (Admin)
```
PUT /api/users/documents/:documentId/verify
Authentication: Required (Admin)
Parameters:
  - documentId: Document ID (path parameter)
Body:
{
  "status": "verified",
  "verificationNotes": "Document verified successfully"
}
```

**Document Status:**
- `pending`: Awaiting verification
- `verified`: Document verified
- `rejected`: Document rejected
- `expired`: Document expired

### User Activity Tracking

#### Get User Activity
```
GET /api/users/:userId/activity
Authentication: Required
Parameters:
  - userId: User ID (path parameter)
Query Parameters:
  - actionType (optional): login, logout, profile_update, etc.
  - page (optional, default: 1): Page number
  - limit (optional, default: 10, max: 100): Results per page
```

**Response:**
```json
{
  "success": true,
  "message": "User activity retrieved",
  "data": {
    "data": [
      {
        "id": "...",
        "action": "Profile updated",
        "actionType": "profile_update",
        "ipAddress": "192.168.1.1",
        "status": "success",
        "createdAt": "2026-06-27T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

#### Log User Activity
```
POST /api/users/activity/log
Authentication: Required
Body:
{
  "userId": "507f1f77bcf86cd799439011",
  "action": "Profile updated",
  "actionType": "profile_update",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/...",
  "status": "success"
}
```

**Action Types:**
- `login`: User login
- `logout`: User logout
- `profile_update`: Profile updated
- `document_upload`: Document uploaded
- `tender_applied`: Tender applied
- `bid_placed`: Bid placed
- `settings_changed`: Settings changed
- `password_changed`: Password changed
- `other`: Other actions

### User Management

#### Get All Users (Admin)
```
GET /api/users
Authentication: Required (Admin)
Query Parameters:
  - search (optional): Search term
  - page (optional, default: 1): Page number
  - limit (optional, default: 10, max: 100): Results per page
```

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": {
    "data": [...],
    "pagination": {...}
  }
}
```

#### Search Users
```
GET /api/users/search
Authentication: Required
Query Parameters:
  - q (required): Search term
  - page (optional, default: 1): Page number
  - limit (optional, default: 10): Results per page
```

#### Get User Statistics
```
GET /api/users/:userId/statistics
Authentication: Required
Parameters:
  - userId: User ID (path parameter)
```

**Response:**
```json
{
  "success": true,
  "message": "User statistics retrieved",
  "data": {
    "profileCompleteness": 85,
    "documentsCount": 3,
    "verifiedDocuments": 2,
    "activitiesCount": 45,
    "documentVerificationStatus": true
  }
}
```

#### Deactivate User Account
```
POST /api/users/:userId/deactivate
Authentication: Required
Parameters:
  - userId: User ID (path parameter)
Body:
{
  "reason": "User requested deactivation"
}
```

## Database Models

### UserProfile
User profile information
```javascript
{
  userId: ObjectId (required, indexed),
  firstName: String,
  lastName: String,
  email: String (indexed),
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  companyName: String,
  companyRegistration: String,
  designation: String,
  profileCompleteness: Number (0-100),
  bio: String (max 500),
  profileImage: String,
  documentVerification: Boolean,
  verificationDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### UserSettings
User preferences and settings
```javascript
{
  userId: ObjectId (required, unique, indexed),
  emailNotifications: Boolean,
  smsNotifications: Boolean,
  pushNotifications: Boolean,
  tenderAlerts: Boolean,
  applicationReminders: Boolean,
  preferredCategories: [String],
  preferredLanguage: String,
  theme: String (light|dark),
  timezone: String,
  twoFactorEnabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### UserDocument
User uploaded documents
```javascript
{
  userId: ObjectId (required, indexed),
  documentType: String (required),
  documentName: String,
  documentUrl: String,
  expiryDate: Date,
  status: String (pending|verified|rejected|expired),
  verificationNotes: String,
  verifiedBy: ObjectId,
  verificationDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### UserActivity
User activity log
```javascript
{
  userId: ObjectId (required, indexed),
  action: String,
  actionType: String (required),
  ipAddress: String,
  userAgent: String,
  status: String (success|failure),
  createdAt: Date
  // TTL: Auto-deleted after 1 year
}
```

### UserVerification
Verification tokens and data
```javascript
{
  userId: ObjectId (required, indexed),
  verificationType: String (required),
  token: String (unique, indexed),
  status: String (pending|verified|expired),
  expiresAt: Date (with TTL index),
  attemptCount: Number,
  verificationData: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

## Integration Examples

### React/TypeScript Example

```typescript
// Get user profile
async function getUserProfile(userId: string) {
  const response = await fetch(`/api/users/profile/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}

// Update profile
async function updateProfile(userId: string, data: any) {
  const response = await fetch(`/api/users/profile/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

// Log activity
async function logActivity(userId: string, action: string) {
  const response = await fetch('/api/users/activity/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      userId,
      action,
      actionType: 'profile_update'
    })
  });
  return response.json();
}
```

### cURL Examples

```bash
# Get user profile
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/users/profile/507f1f77bcf86cd799439011

# Update profile
curl -X PUT http://localhost:5000/api/users/profile/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "phone": "9876543210"
  }'

# Get user settings
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/users/settings/507f1f77bcf86cd799439011

# Upload document
curl -X POST http://localhost:5000/api/users/documents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "documentType": "aadhar",
    "documentName": "Aadhar Card",
    "documentUrl": "https://..."
  }'

# Get user activity
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/users/507f1f77bcf86cd799439011/activity

# Search users
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/users/search?q=john&limit=10"
```

## Error Handling

All errors return standardized format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error message"],
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Validation error or bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `500`: Server error

## Best Practices

1. **Profile Completeness**: Always update profile completeness when user updates profile
2. **Document Verification**: Implement document verification workflow
3. **Activity Logging**: Log all important user actions
4. **Pagination**: Use pagination for large datasets (max 100 items)
5. **Search**: Use search for user lookup instead of full list
6. **Privacy**: Always check user authorization before accessing data
7. **Cleanup**: Page events auto-delete after 1 year (TTL index)

## Testing

Run tests with:
```bash
npm test
```

## File Structure

```
src/modules/users/
├── users.controller.js   - HTTP request handlers
├── users.service.js      - Business logic
├── users.model.js        - Database schemas
├── users.routes.js       - API routes
├── users.validators.js   - Input validation
├── users.dto.js          - Data transfer objects
├── index.js              - Module exports
└── README.md             - This file
```

## Security

- ✅ JWT authentication on all endpoints
- ✅ Session validation via authMiddleware
- ✅ Input validation via express-validator
- ✅ Error message sanitization
- ✅ Document storage with URL references
- ✅ Activity logging for audit trail
- ✅ Automatic cleanup of old activities

## Future Enhancements

- [ ] Document OCR and validation
- [ ] KYC verification workflow
- [ ] Advanced search with filters
- [ ] User verification badges
- [ ] Bulk user import
- [ ] User analytics dashboard
- [ ] Role-based access control
- [ ] Multi-language support

## Support

For issues or questions, refer to:
- Main README: `../../README.md`
- Integration Guide: `../../INTEGRATION_GUIDE.md`
- API Quick Reference: `../../ANALYTICS_API_REFERENCE.md`
