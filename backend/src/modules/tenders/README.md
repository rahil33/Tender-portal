# Tenders Module Documentation

## Overview

The Tenders Module manages the complete tender lifecycle on the Phoenix Tender Portal. It supports creation, publishing, evaluation, and closure of tenders with comprehensive features including budget management, document attachments, evaluation criteria, and status workflows.

## Features

- **Complete CRUD Operations**: Create, read, update, and delete tenders
- **Status Management**: Draft, Published, Closed, Cancelled status workflow
- **Tender Categories**: Goods, Services, Works, Consultancy, IT Software, Medical, Construction, Transportation, Agriculture, Education, Other
- **Budget Management**: Fixed or range-based budgets with currency support
- **Timeline Management**: Submission deadline and opening date tracking
- **Evaluation Criteria**: Configurable criteria with weightage, mandatory flags, and passing scores
- **Document Management**: Multiple file attachments per tender (notices, specifications, BOQ, terms, amendments, corrigendums)
- **Visibility Control**: Public, Restricted, or Private visibility levels
- **Organization Ownership**: Link tenders to issuing organizations
- **Archive/Restore**: Soft delete with archive functionality and restore capability
- **Search & Filtering**: Full-text search across title, description, tender number, and tags
- **Pagination & Sorting**: Configurable pagination with multiple sort options
- **Statistics Dashboard**: Tender counts by status, category breakdown, upcoming deadlines

## Database Models

### Tender
| Field | Type | Description |
|-------|------|-------------|
| title | String | Tender title (required, max 300 chars) |
| tenderNumber | String | Auto-generated unique identifier |
| slug | String | URL-friendly identifier |
| description | String | Detailed description (max 5000 chars) |
| category | Enum | goods, services, works, consultancy, it_software, medical, construction, transportation, agriculture, education, other |
| status | Enum | draft, published, closed, cancelled |
| visibility | Enum | public, restricted, private |
| budget | Object | estimated, currency, budgetType, minBudget, maxBudget |
| submissionDeadline | Date | Last date for submissions (required) |
| openingDate | Date | Technical bid opening date |
| evaluationCriteria | Array | Criteria with type, name, weightage, isMandatory, passingScore |
| documents | Array | Attached documents with type, name, URL, fileSize, mimeType |
| issuingOrganization | ObjectId | Reference to Organization |
| createdBy | ObjectId | Reference to User (required) |
| publishedAt | Date | Publication timestamp |
| publishedBy | ObjectId | Reference to User who published |
| closedAt | Date | Closure timestamp |
| cancelledAt | Date | Cancellation timestamp |
| cancellationReason | String | Reason for cancellation |
| isArchived | Boolean | Soft delete flag |
| archivedAt | Date | Archive timestamp |
| tags | Array | Searchable tags |
| location | String | Tender location |
| contactPerson | Object | name, email, phone |
| metadata | Object | Additional custom data |

### TenderDocument (Embedded)
| Field | Type | Description |
|-------|------|-------------|
| documentType | Enum | notice, specification, boq, terms, amendment, corrigendum, addendum, other |
| documentName | String | Display name |
| documentUrl | String | Storage URL |
| fileSize | Number | Size in bytes |
| mimeType | String | File MIME type |
| uploadedBy | ObjectId | Reference to User |

### EvaluationCriteria (Embedded)
| Field | Type | Description |
|-------|------|-------------|
| criteriaType | String | Type of criteria |
| name | String | Criteria name |
| description | String | Detailed description |
| weightage | Number | Weight percentage (0-100) |
| isMandatory | Boolean | Must-pass flag |
| passingScore | Number | Minimum required score |

## API Endpoints

Base URL: `/api/tenders`

All endpoints require JWT authentication via `Authorization: Bearer <token>`.

### Tender CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create new tender (Draft status) |
| GET | `/` | List all tenders (paginated, filterable) |
| GET | `/search?q=term` | Search tenders by title, number, description, tags |
| GET | `/statistics` | Get tender statistics dashboard |
| GET | `/:tenderId` | Get tender by ID with full details |
| PUT | `/:tenderId` | Update tender details |
| DELETE | `/:tenderId` | Delete tender (draft only) |

### Status Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/:tenderId/publish` | Publish draft tender |
| PUT | `/:tenderId/unpublish` | Unpublish back to draft |
| PUT | `/:tenderId/close` | Close published tender |
| PUT | `/:tenderId/cancel` | Cancel tender with reason |

### Archive Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/:tenderId/archive` | Archive tender (soft delete) |
| PUT | `/:tenderId/unarchive` | Restore archived tender |

### Document Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:tenderId/documents` | Add document attachment |
| DELETE | `/:tenderId/documents/:documentId` | Remove document |

## Query Parameters

### GET /tenders

| Parameter | Type | Description |
|-----------|------|-------------|
| page | Integer | Page number (default: 1) |
| limit | Integer | Items per page (1-100, default: 10) |
| status | Enum | Filter by status: draft, published, closed, cancelled |
| category | Enum | Filter by category |
| visibility | Enum | Filter by visibility |
| isArchived | Boolean | Filter archived tenders |
| search | String | Full-text search |
| createdBy | ObjectId | Filter by creator |
| issuingOrganization | ObjectId | Filter by organization |
| sortBy | Enum | Sort field: createdAt, submissionDeadline, budget, title, openingDate |
| sortOrder | Enum | Sort order: asc, desc |

## Request Examples

### Create Tender
```http
POST /api/tenders
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Supply of Office Equipment",
  "category": "goods",
  "description": "Tender for supply of computers, printers, and office furniture",
  "visibility": "public",
  "budget": {
    "estimated": 500000,
    "currency": "INR",
    "budgetType": "fixed"
  },
  "submissionDeadline": "2026-07-30T17:00:00.000Z",
  "openingDate": "2026-08-01T10:00:00.000Z",
  "location": "New Delhi",
  "tags": ["computers", "office equipment", "IT"],
  "contactPerson": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "evaluationCriteria": [
    {
      "criteriaType": "price",
      "name": "Financial Bid",
      "description": "Price competitiveness",
      "weightage": 40,
      "isMandatory": false
    },
    {
      "criteriaType": "technical",
      "name": "Technical Specifications",
      "description": "Compliance with technical requirements",
      "weightage": 40,
      "isMandatory": true,
      "passingScore": 70
    },
    {
      "criteriaType": "experience",
      "name": "Past Experience",
      "description": "Similar projects completed",
      "weightage": 20,
      "isMandatory": false
    }
  ]
}
```

### Add Document
```http
POST /api/tenders/:tenderId/documents
Content-Type: application/json
Authorization: Bearer <token>

{
  "documentType": "specification",
  "documentName": "Technical Specifications v2.0",
  "documentUrl": "https://storage.example.com/tenders/doc123.pdf",
  "fileSize": 2048576,
  "mimeType": "application/pdf"
}
```

### Publish Tender
```http
PUT /api/tenders/:tenderId/publish
Content-Type: application/json
Authorization: Bearer <token>
```

### Cancel Tender
```http
PUT /api/tenders/:tenderId/cancel
Content-Type: application/json
Authorization: Bearer <token>

{
  "cancellationReason": "Insufficient responses received"
}
```

## Response Format

```json
{
  "success": true,
  "message": "Tender retrieved",
  "data": { },
  "timestamp": "2026-06-28T10:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Tenders retrieved",
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

## Status Workflow

```
DRAFT ──publish──> PUBLISHED ──close──> CLOSED
  │                    │
  │                    └──cancel──> CANCELLED
  │
  └──delete (permanent)
```

- **DRAFT**: Initial state, can be edited or deleted
- **PUBLISHED**: Visible to vendors, submissions open
- **CLOSED**: Submission deadline passed, evaluation phase
- **CANCELLED**: Tender cancelled with reason

## Business Rules

1. **Create**: Tenders are created in DRAFT status
2. **Update**: Only DRAFT tenders can be updated
3. **Publish**: Requires submission deadline and category
4. **Unpublish**: Only PUBLISHED tenders can be unpublished
5. **Close**: Only PUBLISHED tenders can be closed
6. **Cancel**: Cannot cancel CLOSED tenders
7. **Delete**: Only DRAFT tenders can be deleted
8. **Archive**: Any tender can be archived (soft delete)
9. **Documents**: Can be added/removed from any non-deleted tender

## Module Structure

```
tenders/
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

- Uses existing JWT auth middleware from `src/middleware/authMiddleware.js`
- References `Organization` model for issuing organization
- References `User` model for createdBy, publishedBy, uploadedBy
- Follows same response format as Organizations and Users modules
- Uses express-validator for input validation
- Compatible with existing error handling middleware

## Error Handling

| Status | Description |
|--------|-------------|
| 400 | Validation failed, business rule error |
| 401 | Missing or invalid JWT token |
| 404 | Tender not found |
| 500 | Internal server error |

## Statistics Endpoint

Returns comprehensive tender analytics:
- Total tenders count
- Count by status (published, draft, closed, cancelled)
- Archived tenders count
- Tenders by category breakdown
- Upcoming deadlines (next 5)

```json
{
  "success": true,
  "message": "Tender statistics retrieved",
  "data": {
    "totalTenders": 150,
    "publishedTenders": 45,
    "draftTenders": 30,
    "closedTenders": 50,
    "cancelledTenders": 15,
    "archivedTenders": 10,
    "tendersByCategory": {
      "goods": 40,
      "services": 35,
      "construction": 25
    },
    "upcomingDeadlines": [ ]
  }
}
```