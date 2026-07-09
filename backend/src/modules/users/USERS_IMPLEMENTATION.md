# Users Module Implementation Guide

**Version**: 1.0.0  
**Module**: User Management & Profile  
**Status**: Production Ready

---

## Overview

The Users Module provides comprehensive user management functionality for the Phoenix Tender Portal. It handles user profiles, settings management, document verification workflows, activity tracking, and comprehensive user search capabilities.

## Architecture

### MVC Pattern with Service Layer

```
Request Flow:
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│   Express Middleware (CORS, Auth, etc)  │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│   Routes (users.routes.js)              │
│   - Route definition                    │
│   - Protect middleware                  │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│   Validators (users.validators.js)      │
│   - Input validation                    │
│   - Error handling                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│   Controllers (users.controller.js)     │
│   - Request handling                    │
│   - Response formatting                 │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│   Services (users.service.js)           │
│   - Business logic                      │
│   - Database queries                    │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│   Models (users.model.js)               │
│   - Schema definition                   │
│   - Mongoose models                     │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│   MongoDB Database                      │
│   - Collections                         │
│   - Indexes                             │
└─────────────────────────────────────────┘
```

## Database Schema

### UserProfile Collection

**Purpose**: Store user profile information

**Fields**:
- `userId` (ObjectId) - Reference to user (indexed)
- `firstName` (String) - User first name
- `lastName` (String) - User last name
- `email` (String) - User email (indexed)
- `phone` (String) - Contact number
- `address` (Object)
  - `street`: Street address
  - `city`: City
  - `state`: State
  - `zipCode`: Postal code
  - `country`: Country
- `companyName` (String) - Company name
- `companyRegistration` (String) - Registration number
- `designation` (String) - Job designation
- `profileCompleteness` (Number) - 0-100, calculated field
- `bio` (String) - User bio (max 500 chars)
- `profileImage` (String) - Image URL
- `documentVerification` (Boolean) - Verified flag
- `verificationDate` (Date) - Verification timestamp
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Update timestamp

**Indexes**:
```javascript
- userId (unique)
- email (unique)
```

**Profile Completeness Calculation**:
```javascript
// Algorithm calculates based on filled fields
// 0-20%: Basic info (firstName, lastName)
// 20-40%: Contact info (email, phone)
// 40-60%: Address info (complete address)
// 60-80%: Company info (companyName, designation)
// 80-100%: Additional info (bio, profileImage, documents)
```

### UserSettings Collection

**Purpose**: Store user preferences and settings

**Fields**:
- `userId` (ObjectId) - Reference to user (unique, indexed)
- `emailNotifications` (Boolean) - Email notification preference
- `smsNotifications` (Boolean) - SMS notification preference
- `pushNotifications` (Boolean) - Push notification preference
- `tenderAlerts` (Boolean) - Tender alert preference
- `applicationReminders` (Boolean) - Application reminder preference
- `preferredCategories` (Array) - Tender categories of interest
- `preferredLanguage` (String) - Language preference
- `theme` (String) - UI theme (light|dark)
- `timezone` (String) - User timezone
- `twoFactorEnabled` (Boolean) - 2FA setting
- `createdAt` (Date)
- `updatedAt` (Date)

**Indexes**:
```javascript
- userId (unique)
```

### UserDocument Collection

**Purpose**: Store user document information

**Fields**:
- `userId` (ObjectId) - Reference to user (indexed)
- `documentType` (String) - Type of document
- `documentName` (String) - Document name
- `documentUrl` (String) - URL to document
- `expiryDate` (Date) - Document expiry
- `status` (String) - pending|verified|rejected|expired
- `verificationNotes` (String) - Admin notes
- `verifiedBy` (ObjectId) - Admin who verified
- `verificationDate` (Date) - Verification timestamp
- `createdAt` (Date)
- `updatedAt` (Date)

**Indexes**:
```javascript
- userId (index)
```

**Document Types**:
- `aadhar` - Aadhar Card
- `pan` - PAN Card
- `gst` - GST Certificate
- `certificate` - Certificate
- `license` - License
- `incorporation` - Company Incorporation
- `other` - Other documents

**Status Workflow**:
```
pending ──→ verified
    ↓
   rejected

verified ──→ expired (manual or date-based)
```

### UserActivity Collection

**Purpose**: Audit log of user activities

**Fields**:
- `userId` (ObjectId) - Reference to user (indexed)
- `action` (String) - Action description
- `actionType` (String) - Categorized action type
- `ipAddress` (String) - Client IP
- `userAgent` (String) - Browser/client info
- `status` (String) - success|failure
- `createdAt` (Date) - Activity timestamp

**Indexes**:
```javascript
- userId (index)
- createdAt (with TTL: 365 days)
```

**Auto-Cleanup**: Records automatically deleted after 1 year via TTL index

**Action Types**:
- `login` - User login
- `logout` - User logout
- `profile_update` - Profile updated
- `document_upload` - Document uploaded
- `tender_applied` - Tender application
- `bid_placed` - Bid submitted
- `settings_changed` - Settings modified
- `password_changed` - Password changed
- `other` - Other actions

### UserVerification Collection

**Purpose**: Track verification workflows

**Fields**:
- `userId` (ObjectId) - Reference to user (indexed)
- `verificationType` (String) - email|phone|document|identity
- `token` (String) - Verification token (unique, indexed)
- `status` (String) - pending|verified|expired
- `expiresAt` (Date) - Token expiry (with TTL index)
- `attemptCount` (Number) - Failed attempts
- `verificationData` (Mixed) - Additional data
- `createdAt` (Date)
- `updatedAt` (Date)

**Indexes**:
```javascript
- token (unique)
- expiresAt (TTL index)
```

## Service Methods

### Profile Service

#### getUserProfile(userId)
**Purpose**: Fetch user profile

**Parameters**:
- `userId` (String) - User ID

**Returns**:
```javascript
{
  userId: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  companyName: String,
  profileCompleteness: Number,
  documentVerification: Boolean,
  // ... other fields
}
```

**Error Handling**:
- Throws if user not found
- Sanitizes sensitive fields

#### createUserProfile(profileData)
**Purpose**: Create new user profile

**Parameters**:
```javascript
{
  userId: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  companyName: String,
  // ... other fields
}
```

**Returns**: Created profile object

**Validation**:
- First name and last name required
- Email must be unique
- Phone format validation

#### updateUserProfile(userId, updateData)
**Purpose**: Update user profile

**Parameters**:
- `userId` (String) - User ID
- `updateData` (Object) - Fields to update

**Returns**: Updated profile object

**Special Logic**:
- Auto-recalculates `profileCompleteness`
- Updates `updatedAt` timestamp
- Validates all fields if provided

### Settings Service

#### getUserSettings(userId)
**Purpose**: Get user settings

**Parameters**:
- `userId` (String) - User ID

**Returns**:
```javascript
{
  userId: ObjectId,
  emailNotifications: Boolean,
  smsNotifications: Boolean,
  theme: String,
  timezone: String,
  // ... other fields
}
```

#### updateUserSettings(userId, settingsData)
**Purpose**: Update user settings

**Parameters**:
- `userId` (String) - User ID
- `settingsData` (Object) - Settings to update

**Returns**: Updated settings object

**Defaults**:
- emailNotifications: true
- smsNotifications: false
- pushNotifications: true
- theme: 'light'

### Document Service

#### uploadUserDocument(documentData)
**Purpose**: Upload user document

**Parameters**:
```javascript
{
  userId: ObjectId,
  documentType: String,
  documentName: String,
  documentUrl: String,
  expiryDate: Date
}
```

**Returns**: Created document object

**Status**: Defaults to 'pending'

#### getUserDocuments(userId, filters)
**Purpose**: Fetch user documents

**Parameters**:
- `userId` (String) - User ID
- `filters` (Object) - Optional filters
  - `status`: Filter by status
  - `documentType`: Filter by type
  - `page`: Pagination (default: 1)
  - `limit`: Page size (default: 10, max: 100)

**Returns**:
```javascript
{
  data: [{ document objects }],
  pagination: {
    page: Number,
    limit: Number,
    total: Number,
    pages: Number
  }
}
```

#### updateDocumentVerification(documentId, verificationData)
**Purpose**: Verify/reject document (admin)

**Parameters**:
- `documentId` (String) - Document ID
- `verificationData` (Object)
  - `status`: 'verified'|'rejected'|'expired'
  - `verificationNotes`: String
  - `verifiedBy`: Admin ID

**Returns**: Updated document

**Side Effects**:
- If all documents verified, update `UserProfile.documentVerification = true`
- Updates `UserProfile.verificationDate`

### Activity Service

#### getUserActivity(userId, filters)
**Purpose**: Fetch user activity log

**Parameters**:
- `userId` (String) - User ID
- `filters` (Object) - Optional filters
  - `actionType`: Filter by action
  - `page`: Pagination (default: 1)
  - `limit`: Page size (default: 10, max: 100)

**Returns**:
```javascript
{
  data: [{ activity objects }],
  pagination: { ... }
}
```

**Auto-Cleanup**: Old records deleted after 1 year

#### logUserActivity(activityData)
**Purpose**: Log user activity

**Parameters**:
```javascript
{
  userId: ObjectId,
  action: String,
  actionType: String,
  ipAddress: String,
  userAgent: String,
  status: String
}
```

**Returns**: Created activity record

### Search Service

#### searchUsers(query, filters)
**Purpose**: Search users

**Parameters**:
- `query` (String) - Search term
- `filters` (Object) - Optional
  - `page`: Pagination
  - `limit`: Page size

**Returns**: Paginated user summaries

**Search Fields**:
- firstName
- lastName
- email
- companyName
- phone

**Performance**: Regex search with indexed fields

#### getAllUsers(filters)
**Purpose**: Get all users (admin)

**Parameters**:
- `filters` (Object)
  - `page`: Pagination (default: 1)
  - `limit`: Page size (default: 10)
  - `search`: Optional search term

**Returns**: Paginated user list

### Statistics Service

#### getUserStatistics(userId)
**Purpose**: Generate user statistics

**Parameters**:
- `userId` (String) - User ID

**Returns**:
```javascript
{
  profileCompleteness: Number,
  documentsCount: Number,
  verifiedDocuments: Number,
  activitiesCount: Number,
  documentVerificationStatus: Boolean
}
```

## Validation Rules

### Profile Validation
```javascript
{
  userId: ObjectId (required),
  firstName: String (1-50 chars, required),
  lastName: String (1-50 chars, required),
  email: String (valid email, required),
  phone: String (optional),
  companyName: String (1-100 chars, optional),
  bio: String (0-500 chars, optional)
}
```

### Settings Validation
```javascript
{
  userId: ObjectId (required),
  emailNotifications: Boolean,
  smsNotifications: Boolean,
  pushNotifications: Boolean,
  theme: Enum('light', 'dark'),
  timezone: String
}
```

### Document Validation
```javascript
{
  userId: ObjectId (required),
  documentType: Enum(valid types, required),
  documentName: String (required),
  documentUrl: String (URL format, required),
  expiryDate: Date (optional)
}
```

## Response Format

### Success Response
```javascript
{
  success: true,
  message: "Operation successful",
  data: { /* result data */ },
  timestamp: "2026-06-27T10:30:00.000Z"
}
```

### Error Response
```javascript
{
  success: false,
  message: "Error description",
  errors: ["Specific error message"],
  timestamp: "2026-06-27T10:30:00.000Z"
}
```

### Status Codes
- `200`: Success
- `201`: Created
- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `500`: Server error

## Integration Points

### Server Registration
```javascript
// server.js
const usersRoutes = require('./modules/users/users.routes');
app.use('/api/users', usersRoutes);
```

### Middleware Stack
1. **CORS**: Configured for frontend
2. **Body Parser**: JSON and URL-encoded
3. **Auth Middleware**: JWT validation
4. **Validators**: Input validation
5. **Error Handler**: Global error handling

### Authentication
- All routes require valid JWT token
- Token extracted from `Authorization: Bearer <token>` header
- Invalid tokens return 401 Unauthorized
- Token verified via `protect` middleware

## Best Practices

1. **Profile Completeness**
   - Always update when modifying profile
   - Used for user onboarding tracking
   - Drives document verification requirement

2. **Document Verification**
   - Verify documents promptly
   - Update user profile when all verified
   - Keep verification notes for audit

3. **Activity Logging**
   - Log all significant actions
   - Include IP and user agent
   - Use for compliance and debugging

4. **Pagination**
   - Always paginate large datasets
   - Enforce max 100 items per page
   - Include total count in response

5. **Search**
   - Use indexed fields
   - Support partial matches
   - Return limited fields in list view

## Performance Considerations

- ✅ Indexed fields for common queries
- ✅ Lean queries for read-only operations
- ✅ Pagination for large datasets
- ✅ TTL indexes for auto-cleanup
- ✅ Connection pooling via MongoDB driver

## Security Considerations

- ✅ JWT authentication on all routes
- ✅ Input validation via express-validator
- ✅ Password hashing not exposed
- ✅ Activity audit trail
- ✅ Error message sanitization
- ✅ CORS configured
- ✅ Auto-cleanup of tokens

## Troubleshooting

### User Profile Not Found
**Check**:
- User ID is valid ObjectId
- User has created profile
- User ID matches database record

### Document Verification Not Working
**Check**:
- Admin has proper permissions
- Document ID is valid
- Status transition is valid

### Search Returns No Results
**Check**:
- Search term matches indexed fields
- User has proper permissions
- Database connection is active

### Activity Log Missing Records
**Check**:
- Verify logging is called
- Check TTL index (90 days)
- Ensure database connection

---

## References

- **API Documentation**: [README.md](./README.md)
- **Delivery Summary**: [USERS_DELIVERY_SUMMARY.md](./USERS_DELIVERY_SUMMARY.md)
- **API Reference**: [USERS_API_REFERENCE.md](./USERS_API_REFERENCE.md)

---

**Last Updated**: 2026-06-27  
**Status**: Production Ready ✅
