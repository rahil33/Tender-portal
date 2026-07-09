# Auth Module

Authentication and authorization module for Phoenix Tender Portal.

## Features

- **User Registration** - Register new users with validation
- **User Login** - Authenticate users with JWT tokens
- **User Logout** - Invalidate user sessions
- **Session Management** - Multi-device session support
- **Session Revocation** - Revoke specific or all sessions
- **Role-Based Authorization** - Protect routes by user roles
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Secure password storage with bcrypt
- **Session Persistence** - Store sessions in MongoDB with auto-expiry

## API Endpoints

### Public Endpoints (No Authentication Required)

```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login user
```

### Protected Endpoints (Authentication Required)

```
POST   /api/auth/logout             - Logout user
GET    /api/auth/sessions           - Get active sessions
DELETE /api/auth/sessions/:id       - Revoke specific session
```

## Request/Response Examples

### Register User

**Request:**
```json
POST /api/auth/register
{
  "fullName": "John Doe",
  "companyName": "Acme Corp",
  "phone": "+1234567890",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "New user created",
  "data": {
    "user": {
      "id": "60d5ecb5c7f6a92c2c9d8b45",
      "fullName": "John Doe",
      "companyName": "Acme Corp",
      "phone": "+1234567890",
      "email": "john@example.com",
      "role": "vendor"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-06-29T10:00:00.000Z"
}
```

### Login

**Request:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ecb5c7f6a92c2c9d8b45",
      "fullName": "John Doe",
      "companyName": "Acme Corp",
      "phone": "+1234567890",
      "email": "john@example.com",
      "role": "vendor"
    }
  },
  "timestamp": "2026-06-29T10:00:00.000Z"
}
```

### Get Active Sessions

**Request:**
```
GET /api/auth/sessions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Sessions retrieved",
  "data": {
    "sessions": [
      {
        "id": "60d5ecb5c7f6a92c2c9d8b46",
        "userId": "60d5ecb5c7f6a92c2c9d8b45",
        "deviceInfo": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        "ipAddress": "192.168.1.1",
        "isActive": true,
        "expiresAt": "2026-07-06T10:00:00.000Z",
        "createdAt": "2026-06-29T10:00:00.000Z",
        "updatedAt": "2026-06-29T10:00:00.000Z"
      }
    ]
  },
  "timestamp": "2026-06-29T10:00:00.000Z"
}
```

### Revoke Session

**Request:**
```
DELETE /api/auth/sessions/60d5ecb5c7f6a92c2c9d8b46
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Session revoked successfully.",
  "timestamp": "2026-06-29T10:00:00.000Z"
}
```

## User Roles

The system supports three user roles:

- **admin** - Full system access
- **vendor** - Can create tenders and submit bids
- **evaluator** - Can review and evaluate bids

## Authentication Middleware

### protect Middleware

Requires valid JWT token and active session.

```javascript
const { protect } = require('../../middleware/authMiddleware');

router.get('/protected', protect, protectedController);
```

### authorize Middleware

Requires specific user roles.

```javascript
const { protect, authorize } = require('../../middleware/authMiddleware');

// Only admin can access
router.get('/admin-only', protect, authorize('admin'), adminController);

// Admin or evaluator can access
router.get('/review', protect, authorize('admin', 'evaluator'), reviewController);
```

## JWT Configuration

- **Secret**: `process.env.JWT_SECRET`
- **Expiry**: `process.env.JWT_EXPIRES_IN` (default: 7 days)
- **Algorithm**: HS256

## Session Management

- Sessions are stored in MongoDB
- Auto-expiry after 7 days (configurable)
- Multi-device support (multiple active sessions per user)
- Sessions are invalidated on logout
- Expired sessions are automatically deleted by MongoDB TTL index

## Password Security

- Passwords are hashed using bcrypt with 12 salt rounds
- Minimum password length: 6 characters
- Passwords are never returned in API responses
- Password comparison uses constant-time algorithm

## Error Responses

### Authentication Errors

```json
{
  "success": false,
  "message": "Invalid email or password.",
  "errors": ["Invalid email or password."],
  "timestamp": "2026-06-29T10:00:00.000Z"
}
```

### Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "timestamp": "2026-06-29T10:00:00.000Z"
}
```

### Authorization Errors

```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions.",
  "timestamp": "2026-06-29T10:00:00.000Z"
}
```

## Security Features

1. **JWT Token Verification** - All protected routes require valid JWT
2. **Session Validation** - Tokens are validated against active sessions in DB
3. **Password Hashing** - bcrypt with 12 salt rounds
4. **Email Normalization** - Emails are normalized and lowercased
5. **Input Validation** - All inputs are validated using express-validator
6. **Auto Session Expiry** - Sessions auto-expire after configured duration
7. **Multi-Device Support** - Users can have multiple active sessions
8. **Session Revocation** - Sessions can be revoked individually or via logout

## Integration

### With Other Modules

All modules can use the authentication middleware:

```javascript
const { protect, authorize } = require('../../middleware/authMiddleware');

// Example: Protected route in tenders module
router.post('/tenders', protect, authorize('admin', 'vendor'), createTender);
```

### User Model Integration

The User model (src/models/User.js) includes:
- Password hashing pre-save hook
- Password comparison method
- Role field with enum validation
- isActive field for account status

## Environment Variables

```env
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
MONGO_URI=mongodb://localhost:27017/tender_portal
```

## Usage Flow

1. **Register** - User creates account via `/api/auth/register`
2. **Login** - User authenticates via `/api/auth/login`
3. **Receive Token** - JWT token returned in response
4. **Use Token** - Include token in Authorization header: `Bearer <token>`
5. **Access Protected Routes** - Token validated by `protect` middleware
6. **Role-Based Access** - Roles validated by `authorize` middleware
7. **Logout** - Invalidate token via `/api/auth/logout`

## Best Practices

- Always use HTTPS in production
- Store JWT_SECRET securely in environment variables
- Rotate JWT_SECRET periodically
- Implement rate limiting on auth endpoints
- Monitor failed login attempts
- Log out users on password change
- Revoke sessions on suspicious activity