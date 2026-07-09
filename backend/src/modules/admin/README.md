# Admin Module

Comprehensive admin management module for Phoenix Tender Portal.

## Features

- **Admin Dashboard** - Overview of platform statistics and system health
- **User Management** - Search, filter, and manage all users
- **Organization Management** - Verify and manage organizations
- **Tender Moderation** - Review and moderate tenders
- **Bid Moderation** - Review and moderate bids
- **Category Management** - CRUD operations for categories
- **Report Management** - Handle user reports and complaints
- **System Settings** - Manage platform-wide settings
- **Role Management** - Create and manage admin roles
- **Permission Management** - Assign and revoke permissions
- **Audit Logs** - Track all admin actions
- **Activity Logs** - Monitor system activity
- **System Health** - Monitor component health status
- **Platform Statistics** - Track key metrics
- **Search & Filtering** - Advanced search across all resources
- **Pagination** - Efficient data loading with pagination

## API Endpoints

All endpoints require authentication via `Authorization: Bearer <token>` header and admin role.

### Dashboard

```
GET /api/admin/dashboard/stats
```
Get dashboard statistics including total users, organizations, tenders, bids, and system health.

### Role Management

```
POST   /api/admin/roles                    - Create new role
GET    /api/admin/roles                    - Get all roles (paginated)
GET    /api/admin/roles/:roleId            - Get role by ID
PUT    /api/admin/roles/:roleId            - Update role
DELETE /api/admin/roles/:roleId            - Delete role
```

### Admin User Management

```
GET    /api/admin/users/admin              - Get all admin users
GET    /api/admin/users/admin/:adminUserId - Get admin user by ID
PUT    /api/admin/users/admin/:adminUserId - Update admin user
POST   /api/admin/users/assign-role        - Assign role to user
```

### User Management

```
GET    /api/admin/users                    - Search and filter users
```

### Organization Management

```
GET    /api/admin/organizations                         - Get all organizations
PUT    /api/admin/organizations/:organizationId/verify  - Verify/unverify organization
```

### Tender Moderation

```
GET    /api/admin/tenders                    - Get all tenders with filters
```

### Bid Moderation

```
GET    /api/admin/bids                       - Get all bids with filters
```

### Category Management

```
GET    /api/admin/categories                 - Get all categories
POST   /api/admin/categories                 - Create category
PUT    /api/admin/categories/:categoryId     - Update category
DELETE /api/admin/categories/:categoryId     - Delete category
```

### Report Management

```
GET    /api/admin/reports                    - Get all reports
GET    /api/admin/reports/:reportId          - Get report by ID
POST   /api/admin/reports                    - Create report
PUT    /api/admin/reports/:reportId          - Update report
```

### Moderation Logs

```
GET    /api/admin/moderation/logs                           - Get moderation logs
POST   /api/admin/moderation/:resourceType/:resourceId      - Moderate resource
```

### Audit Logs

```
GET    /api/admin/audit/logs                 - Get audit logs with filters
```

### System Settings

```
GET    /api/admin/settings                   - Get all settings
GET    /api/admin/settings/:settingId        - Get setting by ID
POST   /api/admin/settings                   - Create setting
PUT    /api/admin/settings/:settingId        - Update setting
```

### System Health

```
GET    /api/admin/health                     - Get system health status
```

### Platform Statistics

```
GET    /api/admin/statistics                 - Get platform statistics
```

## Request/Response Examples

### Create Role

**Request:**
```json
POST /api/admin/roles
{
  "name": "moderator",
  "description": "Content moderator role",
  "permissions": ["tenders:view", "tenders:moderate", "bids:view", "bids:moderate"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "id": "60d5ecb5c7f6a92c2c9d8b45",
    "name": "moderator",
    "description": "Content moderator role",
    "permissions": ["tenders:view", "tenders:moderate", "bids:view", "bids:moderate"],
    "isSystemRole": false,
    "isActive": true,
    "createdAt": "2026-06-29T10:00:00.000Z",
    "updatedAt": "2026-06-29T10:00:00.000Z"
  },
  "timestamp": "2026-06-29T10:00:00.000Z"
}
```

### Get Audit Logs

**Request:**
```
GET /api/admin/audit/logs?action=update&resourceType=tender&status=success&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "message": "Audit logs retrieved",
  "data": {
    "data": [
      {
        "id": "60d5ecb5c7f6a92c2c9d8b46",
        "action": "update",
        "resourceType": "tender",
        "resourceId": "60d5ecb5c7f6a92c2c9d8b47",
        "performedBy": "60d5ecb5c7f6a92c2c9d8b48",
        "performedByEmail": "admin@example.com",
        "actionDetails": { "updates": { "status": "published" } },
        "changes": { "before": null, "after": null },
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "status": "success",
        "createdAt": "2026-06-29T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  },
  "timestamp": "2026-06-29T10:00:00.000Z"
}
```

### Moderate Resource

**Request:**
```json
POST /api/admin/moderation/tender/60d5ecb5c7f6a92c2c9d8b47
{
  "status": "approved",
  "moderationNotes": "All requirements met"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resource moderated successfully",
  "data": {
    "id": "60d5ecb5c7f6a92c2c9d8b49",
    "resourceType": "tender",
    "resourceId": "60d5ecb5c7f6a92c2c9d8b47",
    "status": "approved",
    "moderatedBy": "60d5ecb5c7f6a92c2c9d8b48",
    "moderationNotes": "All requirements met",
    "reviewedAt": "2026-06-29T10:00:00.000Z",
    "createdAt": "2026-06-29T10:00:00.000Z",
    "updatedAt": "2026-06-29T10:00:00.000Z"
  },
  "timestamp": "2026-06-29T10:00:00.000Z"
}
```

## Permissions

The following permissions are available:

### User Permissions
- `users:view` - View user information
- `users:create` - Create new users
- `users:update` - Update user information
- `users:delete` - Delete users
- `users:manage_roles` - Manage user roles

### Organization Permissions
- `organizations:view` - View organizations
- `organizations:create` - Create organizations
- `organizations:update` - Update organizations
- `organizations:delete` - Delete organizations
- `organizations:verify` - Verify organizations

### Tender Permissions
- `tenders:view` - View tenders
- `tenders:create` - Create tenders
- `tenders:update` - Update tenders
- `tenders:delete` - Delete tenders
- `tenders:publish` - Publish tenders
- `tenders:moderate` - Moderate tenders

### Bid Permissions
- `bids:view` - View bids
- `bids:create` - Create bids
- `bids:update` - Update bids
- `bids:delete` - Delete bids
- `bids:moderate` - Moderate bids

### Category Permissions
- `categories:view` - View categories
- `categories:create` - Create categories
- `categories:update` - Update categories
- `categories:delete` - Delete categories

### Report Permissions
- `reports:view` - View reports
- `reports:create` - Create reports
- `reports:moderate` - Moderate reports

### Settings Permissions
- `settings:view` - View settings
- `settings:update` - Update settings

### Role & Permission Permissions
- `roles:view` - View roles
- `roles:create` - Create roles
- `roles:update` - Update roles
- `roles:delete` - Delete roles
- `permissions:view` - View permissions
- `permissions:assign` - Assign permissions

### Log Permissions
- `audit_logs:view` - View audit logs
- `activity_logs:view` - View activity logs

### System Permissions
- `system_health:view` - View system health
- `platform_stats:view` - View platform statistics

## Default Roles

- **super_admin** - All permissions
- **admin** - Most administrative permissions
- **moderator** - Content moderation permissions only

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Filtering
- `search` - Search term for text search
- `status` - Filter by status
- `isActive` - Filter by active status
- `role` - Filter by role
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order: asc or desc (default: desc)
- `startDate` - Filter by start date (ISO 8601)
- `endDate` - Filter by end date (ISO 8601)

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Specific error message"],
  "timestamp": "2026-06-29T10:00:00.000Z"
}
```

## Security

- All endpoints require JWT authentication
- All endpoints require admin role
- Actions are logged in audit logs
- IP address and user agent are recorded
- Sensitive operations require specific permissions