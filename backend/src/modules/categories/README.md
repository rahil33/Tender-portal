# Categories Module Documentation

## Overview

The Categories Module provides a hierarchical category management system for the Phoenix Tender Portal. It supports parent-child relationships, multi-level categorization, and comprehensive organization of tenders by type and classification.

## Features

- **Complete CRUD Operations**: Create, read, update, and delete categories
- **Parent & Child Categories**: Hierarchical category structure with unlimited nesting
- **Category Hierarchy**: Automatic path tracking and level management
- **Category Status**: Active, Inactive, Archived status management
- **Category Types**: Predefined types aligned with tender categories
- **Search & Filtering**: Search by name, description, filter by status, type, parent
- **Sorting & Pagination**: Configurable sorting and pagination
- **Soft Delete & Restore**: Delete categories with ability to restore
- **Category Statistics**: Dashboard with counts by status, type, hierarchy
- **Featured Categories**: Mark categories as featured for homepage display
- **Audit Logging**: Complete action history for compliance
- **Visual Customization**: Icon and color support for UI display

## Database Models

### Category
| Field | Type | Description |
|-------|------|-------------|
| name | String | Category name (required, max 200 chars) |
| slug | String | URL-friendly identifier (auto-generated) |
| description | String | Category description (max 1000 chars) |
| parentCategory | ObjectId | Reference to parent Category |
| level | Number | Hierarchy level (0 = root) |
| path | String | Full path from root (e.g., /id1/id2/id3) |
| type | Enum | goods, services, works, consultancy, it_software, medical, construction, transportation, agriculture, education, other |
| status | Enum | active, inactive, archived |
| icon | String | Icon identifier for UI |
| color | String | Color code for UI |
| order | Number | Display order priority |
| isFeatured | Boolean | Featured flag for homepage |
| metadata | Object | Additional custom data |
| createdBy | ObjectId | Reference to User (required) |
| updatedBy | ObjectId | Reference to User |
| isDeleted | Boolean | Soft delete flag |
| deletedAt | Date | Deletion timestamp |
| deletedBy | ObjectId | Reference to User |
| auditLog | Array | Action history |

### AuditLog (Embedded)
| Field | Type | Description |
|-------|------|-------------|
| action | String | Action performed |
| performedBy | ObjectId | Reference to User |
| timestamp | Date | Action timestamp |
| details | String | Action details |

## API Endpoints

Base URL: `/api/categories`

All endpoints require JWT authentication via `Authorization: Bearer <token>`.

### Category CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create new category |
| GET | `/` | List all categories (paginated, filterable) |
| GET | `/search?q=term` | Search categories |
| GET | `/tree` | Get hierarchical category tree |
| GET | `/featured` | Get featured categories |
| GET | `/statistics` | Get category statistics |
| GET | `/:categoryId` | Get category by ID |
| PUT | `/:categoryId` | Update category |
| DELETE | `/:categoryId` | Soft delete category |
| PUT | `/:categoryId/restore` | Restore deleted category |

## Query Parameters

### GET /categories

| Parameter | Type | Description |
|-----------|------|-------------|
| page | Integer | Page number (default: 1) |
| limit | Integer | Items per page (1-100, default: 10) |
| status | Enum | Filter by status: active, inactive, archived |
| type | Enum | Filter by category type |
| parentCategory | ObjectId | Filter by parent category |
| isFeatured | Boolean | Filter featured categories |
| sortBy | Enum | Sort field: name, createdAt, updatedAt, order |
| sortOrder | Enum | Sort order: asc, desc |

## Request Examples

### Create Category (Root Level)
```http
POST /api/categories
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Information Technology",
  "description": "IT hardware, software, and services",
  "type": "it_software",
  "icon": "fa-laptop",
  "color": "#3498db",
  "order": 1,
  "isFeatured": true
}
```

### Create Subcategory
```http
POST /api/categories
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Software Development",
  "description": "Custom software development and maintenance",
  "parentCategory": "507f1f77bcf86cd799439011",
  "type": "it_software",
  "order": 1
}
```

### Update Category
```http
PUT /api/categories/:categoryId
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "IT Services & Software",
  "description": "Updated description",
  "isFeatured": true,
  "order": 2
}
```

### Get Category Tree
```http
GET /api/categories/tree?status=active
```

### Search Categories
```http
GET /api/categories/search?q=construction
```

## Response Format

```json
{
  "success": true,
  "message": "Category retrieved",
  "data": { },
  "timestamp": "2026-06-28T10:00:00.000Z"
}
```

### Category Tree Response
```json
{
  "success": true,
  "message": "Category tree retrieved",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Information Technology",
      "slug": "information-technology",
      "level": 0,
      "type": "it_software",
      "children": [
        {
          "id": "507f1f77bcf86cd799439012",
          "name": "Software Development",
          "level": 1,
          "children": []
        }
      ]
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Categories retrieved",
  "data": {
    "data": [ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  },
  "timestamp": "2026-06-28T10:00:00.000Z"
}
```

## Business Rules

1. **Create**: Categories can be root level or child of existing category
2. **Slug**: Auto-generated from name, must be unique
3. **Level**: Automatically calculated based on parent (0 for root, parent.level + 1 for children)
4. **Path**: Full hierarchy path automatically maintained
5. **Update**: Can change parent, level and path recalculated
6. **Delete**: Soft delete only; cannot delete if has children
7. **Restore**: Can restore if parent category is active
8. **Featured**: Featured categories displayed on homepage
9. **Status**: Active categories visible, inactive hidden, archived for historical reference

## Module Structure

```
categories/
├── index.js        # Module exports
├── controller.js   # HTTP request handlers
├── service.js      # Business logic
├── model.js        # MongoDB schemas
├── routes.js       # Express routes
├── validator.js    # Input validation
├── dto.js          # Response DTOs
├── constants.js    # Enums and constants
└── README.md       # This file
```

## Integration Notes

- References `User` model for createdBy, updatedBy, deletedBy, audit tracking
- Used by Tenders module for category classification
- Uses existing JWT auth middleware from `src/middleware/authMiddleware.js`
- Follows same response format as other modules
- Uses express-validator for input validation
- Compatible with existing error handling middleware

## Error Handling

| Status | Description |
|--------|-------------|
| 400 | Validation failed, business rule error |
| 401 | Missing or invalid JWT token |
| 404 | Category not found |
| 500 | Internal server error |

## Statistics Endpoint

Returns comprehensive category analytics:

```json
{
  "success": true,
  "message": "Category statistics retrieved",
  "data": {
    "totalCategories": 150,
    "activeCategories": 120,
    "inactiveCategories": 20,
    "archivedCategories": 10,
    "deletedCategories": 5,
    "categoriesByType": {
      "goods": 40,
      "services": 35,
      "it_software": 25,
      "construction": 20
    },
    "rootCategories": 50,
    "childCategories": 100
  }
}
```

## Category Types

Aligned with tender categories for consistent classification:
- **goods**: Physical goods and supplies
- **services**: Service contracts
- **works**: Construction and infrastructure works
- **consultancy**: Consulting services
- **it_software**: IT and software solutions
- **medical**: Medical equipment and supplies
- **construction**: Construction projects
- **transportation**: Transport and logistics
- **agriculture**: Agricultural products
- **education**: Educational materials and services
- **other**: Other categories