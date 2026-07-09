# Dashboard Module Integration Guide

## Overview

The Dashboard module has been successfully created and integrated into the Phoenix Tender Tech Backend. This guide explains how to use the Dashboard API and integrate it with your frontend.

## Module Components

### 1. Models (`dashboard.model.js`)
- **DashboardActivity**: Tracks all user interactions
- **DashboardStats**: Stores aggregated user metrics
- **DashboardPreferences**: User dashboard preferences and settings

### 2. Service Layer (`dashboard.service.js`)
Core business logic for:
- Fetching dashboard data
- Logging activities
- Managing user statistics
- Handling preferences

Key Methods:
```javascript
// Get complete overview
dashboardService.getDashboardOverview(userId)

// Get activities with pagination
dashboardService.getActivities(userId, page, limit, type)

// Log new activity
dashboardService.logActivity(userId, type, description, relatedId, metadata)

// Manage statistics
dashboardService.getStatistics(userId)
dashboardService.updateStatistics(userId, updates)
dashboardService.incrementStatistic(userId, field, amount)

// Manage preferences
dashboardService.getPreferences(userId)
dashboardService.updatePreferences(userId, updates)
```

### 3. Controller Layer (`dashboard.controller.js`)
HTTP request handlers for all dashboard endpoints.

### 4. Routes (`dashboard.routes.js`)
All endpoints are under `/api/dashboard`:
- Overview & Summary endpoints
- Activity management endpoints
- Statistics endpoints
- Preferences endpoints

### 5. Validators (`dashboard.validators.js`)
Express-validator middleware for input validation and error handling.

### 6. DTOs (`dashboard.dto.js`)
Data transfer objects for consistent API responses.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
# Copy and update .env
cp .env.example .env
```

Add to `.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/tender_portal
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:5000
```

### 3. Start Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints Reference

### Dashboard Overview
```http
GET /api/dashboard/overview
Authorization: Bearer <JWT_TOKEN>
```
Returns complete dashboard with stats, activities, and profile info.

### Dashboard Summary
```http
GET /api/dashboard/summary
Authorization: Bearer <JWT_TOKEN>
```
Returns quick metrics summary.

### Get Activities
```http
GET /api/dashboard/activities?page=1&limit=10&type=tender_saved
Authorization: Bearer <JWT_TOKEN>
```

### Log Activity
```http
POST /api/dashboard/activities
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "userId": "user_id",
  "activityType": "tender_saved",
  "description": "Saved tender XYZ",
  "relatedId": "tender_id",
  "metadata": {}
}
```

### Get Statistics
```http
GET /api/dashboard/statistics/:userId
Authorization: Bearer <JWT_TOKEN>
```

### Update Statistics
```http
PUT /api/dashboard/statistics
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "userId": "user_id",
  "savedTendersCount": 15,
  "profileCompletionPercentage": 90
}
```

### Increment Statistic
```http
POST /api/dashboard/statistics/increment
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "userId": "user_id",
  "field": "savedTendersCount",
  "amount": 1
}
```

### Get Preferences
```http
GET /api/dashboard/preferences/:userId
Authorization: Bearer <JWT_TOKEN>
```

### Update Preferences
```http
PUT /api/dashboard/preferences
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "userId": "user_id",
  "emailNotifications": true,
  "tenderAlerts": true,
  "dashboard_view": "grid",
  "itemsPerPage": 10
}
```

### Mark Activities as Read
```http
POST /api/dashboard/activities/mark-as-read
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "activityIds": ["id1", "id2", "id3"]
}
```

## Frontend Integration Examples

### React Example

```typescript
import axios from 'axios';

const dashboardAPI = axios.create({
  baseURL: 'http://localhost:5000/api/dashboard',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
dashboardAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get dashboard overview
async function getDashboardOverview() {
  try {
    const response = await dashboardAPI.get('/overview');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
  }
}

// Log activity
async function logTenderSaved(tenderId) {
  try {
    const response = await dashboardAPI.post('/activities', {
      userId: getCurrentUserId(),
      activityType: 'tender_saved',
      description: `Saved tender ${tenderId}`,
      relatedId: tenderId,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// Update preferences
async function updateUserPreferences(preferences) {
  try {
    const response = await dashboardAPI.put('/preferences', {
      userId: getCurrentUserId(),
      ...preferences,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update preferences:', error);
  }
}
```

### TypeScript Types

```typescript
interface DashboardOverview {
  userInfo: {
    id: string;
    fullName: string;
    companyName: string;
    email: string;
    phone: string;
    role: 'admin' | 'vendor' | 'evaluator';
  };
  statistics: {
    savedTendersCount: number;
    applicationsCount: number;
    successfulBidsCount: number;
    failedBidsCount: number;
    profileCompletionPercentage: number;
    notificationsUnreadCount: number;
  };
  recentActivities: Activity[];
  lastUpdated: string;
}

interface Activity {
  id: string;
  userId: string;
  activityType: ActivityType;
  description: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

type ActivityType = 
  | 'tender_saved'
  | 'tender_unsaved'
  | 'application_submitted'
  | 'application_viewed'
  | 'bid_placed'
  | 'profile_updated';

interface UserPreferences {
  emailNotifications: boolean;
  tenderAlerts: boolean;
  applicationReminders: boolean;
  preferredCategories: string[];
  dashboard_view: 'grid' | 'list';
  itemsPerPage: number;
}

interface DashboardStats {
  userId: string;
  savedTendersCount: number;
  applicationsCount: number;
  successfulBidsCount: number;
  failedBidsCount: number;
  profileCompletionPercentage: number;
  lastActivityDate?: string;
  notificationsUnreadCount: number;
}
```

## Activity Types and Usage

### tender_saved
```javascript
// When user bookmarks a tender
await dashboardAPI.post('/activities', {
  userId,
  activityType: 'tender_saved',
  description: `Saved tender: ${tenderTitle}`,
  relatedId: tenderId,
  metadata: { category: 'IT Services', value: '₹50 Lakhs' },
});
```

### application_submitted
```javascript
// When user submits an application
await dashboardAPI.post('/activities', {
  userId,
  activityType: 'application_submitted',
  description: `Submitted application for: ${tenderTitle}`,
  relatedId: tenderId,
  metadata: { applicationId, submittedAt: new Date() },
});
```

### bid_placed
```javascript
// When user places a bid
await dashboardAPI.post('/activities', {
  userId,
  activityType: 'bid_placed',
  description: `Placed bid: ₹${bidAmount}`,
  relatedId: tenderId,
  metadata: { bidAmount, status: 'pending' },
});
```

## Workflow Examples

### Dashboard Page Load Flow

```
1. User navigates to /dashboard
2. Frontend calls GET /api/dashboard/overview
3. Backend returns user stats, activities, and profile
4. Display stats cards, recent activities, and profile info
5. User can mark activities as read, update preferences
```

### Tender Saved Flow

```
1. User clicks "Save Tender" button
2. Frontend calls POST /api/dashboard/activities
   - activityType: 'tender_saved'
   - relatedId: tenderId
3. Service creates activity record
4. Service increments savedTendersCount
5. Activity appears in user's dashboard
```

### Preference Update Flow

```
1. User changes dashboard settings
2. Frontend calls PUT /api/dashboard/preferences
3. Backend validates and updates preferences
4. Frontend updates local state and UI
5. Preferences persist across sessions
```

## Statistics Management

### Profile Completion Calculation

```javascript
// Calculate based on filled fields
const calculateProfileCompletion = (profile) => {
  const fields = [
    'fullName',
    'email',
    'phone',
    'companyName',
    'address',
    'gstNumber',
    'panNumber',
    'yearEstablished',
    'employeeCount',
    'websiteUrl',
  ];
  
  const filled = fields.filter(f => profile[f] && profile[f].trim()).length;
  return Math.round((filled / fields.length) * 100);
};

// Update in dashboard
await dashboardAPI.put('/statistics', {
  userId,
  profileCompletionPercentage: calculateProfileCompletion(profile),
});
```

## Best Practices

### 1. Error Handling
```javascript
try {
  const response = await dashboardAPI.get('/overview');
  // Handle response
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  } else if (error.response?.status === 400) {
    // Show validation errors
  } else {
    // Show generic error
  }
}
```

### 2. Token Management
```javascript
// Ensure token is always fresh
dashboardAPI.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 3. Caching
```javascript
// Cache dashboard data for 5 minutes
const cachedDashboard = localStorage.getItem('dashboardCache');
const cacheTime = localStorage.getItem('dashboardCacheTime');

if (cachedDashboard && Date.now() - cacheTime < 5 * 60 * 1000) {
  return JSON.parse(cachedDashboard);
}

// Fetch fresh data
const data = await getDashboardOverview();
localStorage.setItem('dashboardCache', JSON.stringify(data));
localStorage.setItem('dashboardCacheTime', Date.now());
```

## Troubleshooting

### "No token provided" Error
- Ensure JWT token is in Authorization header
- Format: `Bearer <token>` (note the space)
- Token must be valid and not expired

### "Session expired or revoked"
- Token has been revoked from database
- User needs to login again
- Check Session collection in MongoDB

### "Validation failed" Error
- Review error messages for specific fields
- Ensure all required fields are provided
- Check data types match schema

### MongoDB Connection Issues
- Verify MONGO_URI is correct
- Check MongoDB service is running
- Ensure database credentials are valid

## Performance Tips

1. **Pagination**: Always use pagination for large datasets
2. **Caching**: Cache statistics and preferences client-side
3. **Batch Updates**: Update multiple stats in one request
4. **Lazy Loading**: Load activities on-demand

## Next Steps

1. Integrate with Authentication module for user signup/login
2. Add Tender module to track tender saves
3. Implement Application module for bid tracking
4. Add WebSocket support for real-time updates
5. Create analytics dashboard with trends

## Support & Documentation

- [Dashboard Module README](./src/modules/dashboard/README.md)
- [Main Backend README](./README.md)
- API Base URL: `http://localhost:5000`
- Dashboard Routes Prefix: `/api/dashboard`
