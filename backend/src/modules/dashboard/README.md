# Dashboard Module Documentation

## Overview
The Dashboard module handles user dashboard operations, including statistics, activities, preferences, and notifications. It provides a comprehensive set of APIs for retrieving and managing user dashboard data.

## Architecture

### Components

1. **Model** (`dashboard.model.js`)
   - `DashboardActivity`: Tracks user interactions with tenders and applications
   - `DashboardStats`: Stores aggregated metrics for quick retrieval
   - `DashboardPreferences`: User preferences for dashboard layout and notifications

2. **Service** (`dashboard.service.js`)
   - Business logic layer
   - Handles database operations
   - Manages data transformation

3. **Controller** (`dashboard.controller.js`)
   - HTTP request handlers
   - Request validation and response formatting
   - Error handling

4. **Routes** (`dashboard.routes.js`)
   - API endpoint definitions
   - Route handlers binding
   - Validator middleware application

5. **Validators** (`dashboard.validators.js`)
   - Input validation rules
   - Error handling middleware

6. **DTOs** (`dashboard.dto.js`)
   - Data transfer objects for request/response structures
   - API response standardization

## API Endpoints

### Overview & Summary

#### Get Dashboard Overview
```
GET /api/dashboard/overview
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "userInfo": {
      "id": "userId",
      "fullName": "User Name",
      "companyName": "Company",
      "email": "user@company.com",
      "phone": "+91XXXXXXXXXX",
      "role": "vendor"
    },
    "statistics": {
      "savedTendersCount": 10,
      "applicationsCount": 5,
      "successfulBidsCount": 2,
      "failedBidsCount": 1,
      "profileCompletionPercentage": 85,
      "notificationsUnreadCount": 3
    },
    "recentActivities": [
      {
        "id": "activityId",
        "userId": "userId",
        "activityType": "tender_saved",
        "description": "Saved tender XYZ",
        "relatedId": "tenderId",
        "isRead": false,
        "createdAt": "2026-06-27T10:00:00Z",
        "metadata": {}
      }
    ],
    "lastUpdated": "2026-06-27T10:00:00Z"
  },
  "timestamp": "2026-06-27T10:00:00Z"
}
```

#### Get Dashboard Summary
```
GET /api/dashboard/summary
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "savedTendersCount": 10,
    "applicationsCount": 5,
    "successfulBidsCount": 2,
    "failedBidsCount": 1,
    "profileCompletionPercentage": 85,
    "unreadNotifications": 3,
    "successRate": 40
  }
}
```

### Activities

#### Get Activities
```
GET /api/dashboard/activities?page=1&limit=10&type=tender_saved
Authorization: Bearer <token>

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10, max: 100)
- type: Activity type filter (optional)
  - tender_saved
  - tender_unsaved
  - application_submitted
  - application_viewed
  - bid_placed
  - profile_updated
```

Response:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "activityId",
        "userId": "userId",
        "activityType": "tender_saved",
        "description": "Saved tender ABC123",
        "relatedId": "tenderId",
        "isRead": false,
        "createdAt": "2026-06-27T10:00:00Z",
        "metadata": {}
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

#### Log Activity
```
POST /api/dashboard/activities
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "userId": "userId",
  "activityType": "tender_saved",
  "description": "Saved tender ABC123",
  "relatedId": "tenderId",
  "metadata": {}
}
```

#### Mark Activities as Read
```
POST /api/dashboard/activities/mark-as-read
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "activityIds": ["id1", "id2", "id3"]
}
```

#### Mark All Activities as Read
```
POST /api/dashboard/activities/mark-all-as-read
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "userId": "userId"
}
```

#### Clear All Activities
```
DELETE /api/dashboard/activities
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "userId": "userId"
}
```

### Statistics

#### Get Statistics
```
GET /api/dashboard/statistics/:userId
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "userId": "userId",
    "savedTendersCount": 10,
    "applicationsCount": 5,
    "successfulBidsCount": 2,
    "failedBidsCount": 1,
    "profileCompletionPercentage": 85,
    "lastActivityDate": "2026-06-27T10:00:00Z",
    "notificationsUnreadCount": 3
  }
}
```

#### Update Statistics
```
PUT /api/dashboard/statistics
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "userId": "userId",
  "savedTendersCount": 15,
  "applicationsCount": 7,
  "profileCompletionPercentage": 90
}
```

#### Increment Statistic
```
POST /api/dashboard/statistics/increment
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "userId": "userId",
  "field": "savedTendersCount",
  "amount": 1
}
```

### Preferences

#### Get Preferences
```
GET /api/dashboard/preferences/:userId
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "userId": "userId",
    "emailNotifications": true,
    "tenderAlerts": true,
    "applicationReminders": true,
    "preferredCategories": ["IT Services", "Construction"],
    "dashboard_view": "grid",
    "itemsPerPage": 10
  }
}
```

#### Update Preferences
```
PUT /api/dashboard/preferences
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "userId": "userId",
  "emailNotifications": true,
  "tenderAlerts": true,
  "applicationReminders": true,
  "preferredCategories": ["IT Services", "Construction"],
  "dashboard_view": "grid",
  "itemsPerPage": 10
}
```

## Activity Types

- **tender_saved**: When a user saves a tender
- **tender_unsaved**: When a user removes a saved tender
- **application_submitted**: When a user submits an application
- **application_viewed**: When a user views an application
- **bid_placed**: When a user places a bid
- **profile_updated**: When a user updates their profile

## Database Models

### DashboardActivity
```javascript
{
  userId: ObjectId (required),
  activityType: String (enum),
  description: String,
  relatedId: ObjectId,
  metadata: Mixed,
  isRead: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### DashboardStats
```javascript
{
  userId: ObjectId (required, unique),
  savedTendersCount: Number (default: 0),
  applicationsCount: Number (default: 0),
  successfulBidsCount: Number (default: 0),
  failedBidsCount: Number (default: 0),
  profileCompletionPercentage: Number (0-100, default: 0),
  lastActivityDate: Date,
  notificationsUnreadCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### DashboardPreferences
```javascript
{
  userId: ObjectId (required, unique),
  emailNotifications: Boolean (default: true),
  tenderAlerts: Boolean (default: true),
  applicationReminders: Boolean (default: true),
  preferredCategories: [String],
  dashboard_view: String (enum: 'grid', 'list', default: 'grid'),
  itemsPerPage: Number (5-100, default: 10),
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Examples

### Example 1: Get User Dashboard Overview
```bash
curl -X GET http://localhost:5000/api/dashboard/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Example 2: Log Tender Saved Activity
```bash
curl -X POST http://localhost:5000/api/dashboard/activities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id_here",
    "activityType": "tender_saved",
    "description": "Saved government tender",
    "relatedId": "tender_id_here"
  }'
```

### Example 3: Get User Preferences
```bash
curl -X GET http://localhost:5000/api/dashboard/preferences/user_id_here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Error Handling

The module implements comprehensive error handling with standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ],
  "timestamp": "2026-06-27T10:00:00Z"
}
```

## Security

- All endpoints require JWT authentication via `Authorization: Bearer <token>` header
- Token validation is handled by the `protect` middleware
- Session-based validation ensures token hasn't been revoked
- Input validation prevents injection attacks
- CORS enabled for specified origins

## Performance Considerations

- Statistics are cached in the database for quick retrieval
- Activities are paginated to handle large datasets
- Database indexes on userId and timestamps for fast queries
- Activity deletion can be performed for cleanup if needed

## Future Enhancements

- Real-time notifications via WebSockets
- Export dashboard data to CSV/PDF
- Dashboard analytics and trend analysis
- Automated activity archival
- Activity filtering and search
- Custom dashboard widgets
- Bulk activity operations

## Module Integration

To integrate this module in other parts of the application:

```javascript
const { dashboardService, dashboardController } = require('./modules/dashboard');

// Use service directly
const overview = await dashboardService.getDashboardOverview(userId);

// Or use through routes
app.use('/api/dashboard', dashboardRoutes);
```

## Testing

Run tests with:
```bash
npm test
```

## Troubleshooting

### Issue: "Session expired or revoked"
- Ensure the JWT token is valid and hasn't expired
- Verify the session exists in the database
- Check that the token matches the stored session

### Issue: "User not found"
- Verify the userId is correct and exists in the database
- Ensure authentication middleware is properly configured

### Issue: "Validation failed"
- Check all required fields are provided
- Verify field formats match expected types
- Review error messages for specific field validation details
