# Users Module API Reference

**Version**: 1.0.0  
**Base URL**: `http://localhost:5000/api/users`  
**Authentication**: Required (JWT Bearer Token)

---

## Quick Start

### Authentication Header
All requests require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Response Format
All responses follow a standard format:

```json
{
  "success": true|false,
  "message": "Description of result",
  "data": { /* response data */ },
  "errors": [ /* error details if any */ ],
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

---

## Profile Endpoints

### 1. Get User Profile

**Endpoint**: `GET /profile/:userId`

**Description**: Retrieve a user's profile information

**Parameters**:
| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| userId | String | Path | Yes | User ID (MongoDB ObjectId) |

**Example Request**:
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:5000/api/users/profile/507f1f77bcf86cd799439011
```

**Example Response (200)**:
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
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "companyName": "ABC Corporation",
    "companyRegistration": "REG123456",
    "designation": "Senior Manager",
    "profileCompleteness": 85,
    "bio": "Experienced professional in tender management",
    "profileImage": "https://example.com/images/profile.jpg",
    "documentVerification": true,
    "verificationDate": "2026-06-20T10:30:00.000Z",
    "createdAt": "2026-06-15T10:00:00.000Z",
    "updatedAt": "2026-06-25T14:30:00.000Z"
  },
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

**Error Response (404)**:
```json
{
  "success": false,
  "message": "User profile not found",
  "errors": ["No profile exists for user ID 507f1f77bcf86cd799439011"],
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

---

### 2. Create User Profile

**Endpoint**: `POST /profile`

**Description**: Create a new user profile

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | String | Yes | User ID (MongoDB ObjectId) |
| firstName | String | Yes | First name (1-50 chars) |
| lastName | String | Yes | Last name (1-50 chars) |
| email | String | Yes | Email address (unique) |
| phone | String | No | Phone number |
| companyName | String | No | Company name (max 100) |
| companyRegistration | String | No | Company registration |
| designation | String | No | Job designation |
| bio | String | No | Bio (max 500 chars) |
| profileImage | String | No | Profile image URL |
| address | Object | No | Address details |

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "companyName": "ABC Corporation",
    "designation": "Manager",
    "bio": "Experienced professional"
  }'
```

**Example Response (201)**:
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "companyName": "ABC Corporation",
    "designation": "Manager",
    "bio": "Experienced professional",
    "profileCompleteness": 60,
    "documentVerification": false,
    "createdAt": "2026-06-27T10:30:00.000Z",
    "updatedAt": "2026-06-27T10:30:00.000Z"
  },
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "First name must be between 1 and 50 characters",
    "Email is required"
  ],
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

---

### 3. Update User Profile

**Endpoint**: `PUT /profile/:userId`

**Description**: Update existing user profile

**Parameters**:
| Name | Type | Location | Required |
|------|------|----------|----------|
| userId | String | Path | Yes |

**Request Body**:
Same as Create Profile endpoint - all fields optional

**Example Request**:
```bash
curl -X PUT http://localhost:5000/api/users/profile/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "designation": "Senior Manager",
    "bio": "Updated bio"
  }'
```

**Example Response (200)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "john@example.com",
    "designation": "Senior Manager",
    "bio": "Updated bio",
    "profileCompleteness": 65,
    "updatedAt": "2026-06-27T10:35:00.000Z"
  },
  "timestamp": "2026-06-27T10:35:00.000Z"
}
```

---

## Settings Endpoints

### 4. Get User Settings

**Endpoint**: `GET /settings/:userId`

**Description**: Retrieve user settings and preferences

**Parameters**:
| Name | Type | Location | Required |
|------|------|----------|----------|
| userId | String | Path | Yes |

**Example Request**:
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:5000/api/users/settings/507f1f77bcf86cd799439011
```

**Example Response (200)**:
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
    "applicationReminders": true,
    "preferredCategories": ["Construction", "IT"],
    "preferredLanguage": "en",
    "theme": "light",
    "timezone": "IST",
    "twoFactorEnabled": false,
    "createdAt": "2026-06-15T10:00:00.000Z",
    "updatedAt": "2026-06-25T14:30:00.000Z"
  },
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

---

### 5. Update User Settings

**Endpoint**: `PUT /settings/:userId`

**Description**: Update user settings and preferences

**Parameters**:
| Name | Type | Location | Required |
|------|------|----------|----------|
| userId | String | Path | Yes |

**Request Body**:
| Field | Type | Description |
|-------|------|-------------|
| emailNotifications | Boolean | Email notification preference |
| smsNotifications | Boolean | SMS notification preference |
| pushNotifications | Boolean | Push notification preference |
| tenderAlerts | Boolean | Tender alert preference |
| applicationReminders | Boolean | Application reminder preference |
| preferredCategories | Array | Tender categories |
| preferredLanguage | String | Language preference |
| theme | String | UI theme (light\|dark) |
| timezone | String | User timezone |
| twoFactorEnabled | Boolean | 2FA setting |

**Example Request**:
```bash
curl -X PUT http://localhost:5000/api/users/settings/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "emailNotifications": true,
    "theme": "dark",
    "tenderAlerts": true,
    "timezone": "UTC"
  }'
```

**Example Response (200)**:
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "emailNotifications": true,
    "smsNotifications": false,
    "pushNotifications": true,
    "tenderAlerts": true,
    "theme": "dark",
    "timezone": "UTC",
    "updatedAt": "2026-06-27T10:35:00.000Z"
  },
  "timestamp": "2026-06-27T10:35:00.000Z"
}
```

---

## Document Endpoints

### 6. Upload User Document

**Endpoint**: `POST /documents`

**Description**: Upload a user document for verification

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | String | Yes | User ID |
| documentType | String | Yes | Type of document |
| documentName | String | Yes | Document name |
| documentUrl | String | Yes | Document URL |
| expiryDate | String | No | Expiry date (ISO format) |

**Allowed Document Types**:
- `aadhar` - Aadhar Card
- `pan` - PAN Card
- `gst` - GST Certificate
- `certificate` - Certificate
- `license` - License
- `incorporation` - Company Incorporation
- `other` - Other documents

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/users/documents \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "documentType": "aadhar",
    "documentName": "Aadhar Card",
    "documentUrl": "https://example.com/docs/aadhar.pdf",
    "expiryDate": "2027-12-31"
  }'
```

**Example Response (201)**:
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "documentType": "aadhar",
    "documentName": "Aadhar Card",
    "documentUrl": "https://example.com/docs/aadhar.pdf",
    "expiryDate": "2027-12-31",
    "status": "pending",
    "createdAt": "2026-06-27T10:30:00.000Z"
  },
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

---

### 7. Get User Documents

**Endpoint**: `GET /:userId/documents`

**Description**: Retrieve user's documents with filters

**Parameters**:
| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| userId | String | Path | Yes | User ID |
| status | String | Query | No | Filter by status |
| documentType | String | Query | No | Filter by document type |
| page | Number | Query | No | Page number (default: 1) |
| limit | Number | Query | No | Results per page (1-100, default: 10) |

**Allowed Status Values**:
- `pending` - Awaiting verification
- `verified` - Verified
- `rejected` - Rejected
- `expired` - Expired

**Example Request**:
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  "http://localhost:5000/api/users/507f1f77bcf86cd799439011/documents?status=verified&page=1&limit=10"
```

**Example Response (200)**:
```json
{
  "success": true,
  "message": "User documents retrieved",
  "data": {
    "data": [
      {
        "id": "507f1f77bcf86cd799439012",
        "documentType": "aadhar",
        "documentName": "Aadhar Card",
        "status": "verified",
        "expiryDate": "2027-12-31",
        "verificationDate": "2026-06-20T10:30:00.000Z",
        "createdAt": "2026-06-27T10:30:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439013",
        "documentType": "pan",
        "documentName": "PAN Card",
        "status": "verified",
        "expiryDate": "2028-12-31",
        "createdAt": "2026-06-26T09:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "pages": 1
    }
  },
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

---

### 8. Delete User Document

**Endpoint**: `DELETE /documents/:documentId`

**Description**: Delete a user document

**Parameters**:
| Name | Type | Location | Required |
|------|------|----------|----------|
| documentId | String | Path | Yes |

**Example Request**:
```bash
curl -X DELETE http://localhost:5000/api/users/documents/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer eyJhbGc..."
```

**Example Response (200)**:
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

---

### 9. Update Document Verification (Admin)

**Endpoint**: `PUT /documents/:documentId/verify`

**Description**: Verify or reject a document (Admin only)

**Parameters**:
| Name | Type | Location | Required |
|------|------|----------|----------|
| documentId | String | Path | Yes |

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | String | Yes | verified\|rejected\|expired |
| verificationNotes | String | No | Admin notes |

**Example Request**:
```bash
curl -X PUT http://localhost:5000/api/users/documents/507f1f77bcf86cd799439012/verify \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "verified",
    "verificationNotes": "Document verified successfully"
  }'
```

**Example Response (200)**:
```json
{
  "success": true,
  "message": "Document verified successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "status": "verified",
    "verificationNotes": "Document verified successfully",
    "verificationDate": "2026-06-27T10:35:00.000Z",
    "verifiedBy": "admin-user-id"
  },
  "timestamp": "2026-06-27T10:35:00.000Z"
}
```

---

## Activity Endpoints

### 10. Get User Activity

**Endpoint**: `GET /:userId/activity`

**Description**: Retrieve user activity log

**Parameters**:
| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| userId | String | Path | Yes | User ID |
| actionType | String | Query | No | Filter by action type |
| page | Number | Query | No | Page number (default: 1) |
| limit | Number | Query | No | Results per page (1-100, default: 10) |

**Allowed Action Types**:
- `login` - User login
- `logout` - User logout
- `profile_update` - Profile updated
- `document_upload` - Document uploaded
- `tender_applied` - Tender applied
- `bid_placed` - Bid placed
- `settings_changed` - Settings changed
- `password_changed` - Password changed
- `other` - Other actions

**Example Request**:
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  "http://localhost:5000/api/users/507f1f77bcf86cd799439011/activity?actionType=login&page=1"
```

**Example Response (200)**:
```json
{
  "success": true,
  "message": "User activity retrieved",
  "data": {
    "data": [
      {
        "id": "507f1f77bcf86cd799439020",
        "action": "User logged in",
        "actionType": "login",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "status": "success",
        "createdAt": "2026-06-27T10:25:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439021",
        "action": "Profile updated",
        "actionType": "profile_update",
        "ipAddress": "192.168.1.100",
        "status": "success",
        "createdAt": "2026-06-27T10:20:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  },
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

---

### 11. Log User Activity

**Endpoint**: `POST /activity/log`

**Description**: Log user activity (usually called internally)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | String | Yes | User ID |
| action | String | Yes | Action description |
| actionType | String | Yes | Action type (see allowed types) |
| ipAddress | String | No | Client IP address |
| userAgent | String | No | Browser user agent |
| status | String | No | success\|failure |

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/users/activity/log \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "action": "Document uploaded",
    "actionType": "document_upload",
    "ipAddress": "192.168.1.100",
    "status": "success"
  }'
```

**Example Response (201)**:
```json
{
  "success": true,
  "message": "Activity logged successfully",
  "data": {
    "id": "507f1f77bcf86cd799439025",
    "action": "Document uploaded",
    "actionType": "document_upload",
    "status": "success",
    "createdAt": "2026-06-27T10:30:00.000Z"
  },
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

---

## Management Endpoints

### 12. Get All Users (Admin)

**Endpoint**: `GET /`

**Description**: Retrieve all users (Admin only)

**Parameters**:
| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| search | String | Query | No | Search term |
| page | Number | Query | No | Page number (default: 1) |
| limit | Number | Query | No | Results per page (1-100, default: 10) |

**Example Request**:
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  "http://localhost:5000/api/users?search=john&page=1&limit=20"
```

**Example Response (200)**:
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": {
    "data": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "companyName": "ABC Corp",
        "profileCompleteness": 85,
        "createdAt": "2026-06-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  },
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

---

### 13. Search Users

**Endpoint**: `GET /search`

**Description**: Search users by query

**Parameters**:
| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| q | String | Query | Yes | Search term |
| page | Number | Query | No | Page number (default: 1) |
| limit | Number | Query | No | Results per page (default: 10) |

**Search Fields**:
- firstName
- lastName
- email
- companyName
- phone

**Example Request**:
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  "http://localhost:5000/api/users/search?q=ABC&limit=10"
```

**Example Response (200)**:
```json
{
  "success": true,
  "message": "Search results retrieved",
  "data": {
    "data": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "companyName": "ABC Corporation",
        "phone": "9876543210"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  },
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

---

### 14. Get User Statistics

**Endpoint**: `GET /:userId/statistics`

**Description**: Get user statistics and metrics

**Parameters**:
| Name | Type | Location | Required |
|------|------|----------|----------|
| userId | String | Path | Yes |

**Example Request**:
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:5000/api/users/507f1f77bcf86cd799439011/statistics
```

**Example Response (200)**:
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
  },
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

---

### 15. Deactivate User Account

**Endpoint**: `POST /:userId/deactivate`

**Description**: Deactivate user account

**Parameters**:
| Name | Type | Location | Required |
|------|------|----------|----------|
| userId | String | Path | Yes |

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | String | No | Reason for deactivation |

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/users/507f1f77bcf86cd799439011/deactivate \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "User requested deactivation"
  }'
```

**Example Response (200)**:
```json
{
  "success": true,
  "message": "User account deactivated successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "deactivatedAt": "2026-06-27T10:35:00.000Z"
  },
  "timestamp": "2026-06-27T10:35:00.000Z"
}
```

---

## Error Handling

### Common Error Codes

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Field is required", "Email format is invalid"],
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": ["No token provided", "Invalid token"],
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden",
  "errors": ["You don't have permission to perform this action"],
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Not found",
  "errors": ["User not found"],
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

#### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "errors": ["An unexpected error occurred"],
  "timestamp": "2026-06-27T10:30:00.000Z"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Recommended implementation:
- 100 requests per minute per user
- 1000 requests per hour per user

---

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page`: Page number (default: 1, minimum: 1)
- `limit`: Results per page (default: 10, maximum: 100)

**Response includes**:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

---

## Sorting

Currently no sorting is implemented. Recommended fields:
- `createdAt`
- `updatedAt`
- `profileCompleteness`
- `firstName`
- `lastName`

---

## Filtering

Supported filters vary by endpoint:

**Documents**:
- `status`: pending, verified, rejected, expired
- `documentType`: aadhar, pan, gst, certificate, license, incorporation, other

**Activity**:
- `actionType`: login, logout, profile_update, etc.

---

## Integration Example (JavaScript/Fetch)

```javascript
// Get user profile
async function getUserProfile(userId, token) {
  const response = await fetch(`/api/users/profile/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

// Update profile
async function updateProfile(userId, data, token) {
  const response = await fetch(`/api/users/profile/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

// Upload document
async function uploadDocument(data, token) {
  const response = await fetch('/api/users/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

// Search users
async function searchUsers(query, token) {
  const response = await fetch(`/api/users/search?q=${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}
```

---

## Support & Troubleshooting

**Common Issues**:

1. **"User not found"**
   - Verify user ID is correct
   - Ensure user has created a profile

2. **"Invalid token"**
   - Check token format
   - Verify token hasn't expired
   - Ensure Authorization header is correct

3. **"Validation error"**
   - Check request body format
   - Verify all required fields present
   - Check field value types and lengths

---

**Last Updated**: 2026-06-27  
**Status**: Production Ready ✅
