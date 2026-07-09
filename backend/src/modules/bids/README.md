# Bids Module Documentation

## Overview

The Bids Module manages the complete bid lifecycle on the Phoenix Tender Portal. It enables vendors to submit, update, and withdraw bids for published tenders, while providing evaluators with comprehensive tools for bid assessment, scoring, and recommendation.

## Features

- **Complete Bid Management**: Create, update, submit, and withdraw bids
- **Bid Status Workflow**: Draft, Submitted, Under Review, Accepted, Rejected, Withdrawn
- **Dual Proposal System**: Separate technical and financial proposals
- **Document Management**: Multiple supporting documents per bid
- **Version History**: Track all bid revisions with change logs
- **Bid Evaluation**: Comprehensive scoring system with technical and financial evaluation
- **Vendor Validation**: One bid per vendor per tender (configurable)
- **Organization Ownership**: Link bids to vendor organizations
- **Soft Delete**: Bid deletion with audit trail
- **Audit Logging**: Complete action history for compliance
- **Search & Filtering**: Search by bid number, proposal content, filter by status, type, tender
- **Pagination & Sorting**: Configurable pagination with multiple sort options
- **Statistics Dashboard**: Bid counts by status, type, and evaluation progress
- **Role-Based Authorization**: Vendor, evaluator, and admin role support

## Database Models

### Bid
| Field | Type | Description |
|-------|------|-------------|
| bidNumber | String | Auto-generated unique identifier |
| tenderId | ObjectId | Reference to Tender (required) |
| vendorId | ObjectId | Reference to User/Vendor (required) |
| organizationId | ObjectId | Reference to Organization (required) |
| status | Enum | draft, submitted, under_review, accepted, rejected, withdrawn |
| bidType | Enum | technical, financial, combined |
| bidAmount | Number | Bid value (required) |
| currency | String | Currency code (default: INR) |
| technicalProposal | String | Technical proposal text (max 10000 chars) |
| financialProposal | String | Financial proposal text (max 5000 chars) |
| documents | Array | Supporting documents |
| versionHistory | Array | Historical versions with changes |
| currentVersion | Number | Current version number |
| evaluation | Object | Evaluator, scores, remarks, recommendation |
| evaluationStatus | Enum | pending, technical_evaluated, financial_evaluated, completed |
| submittedAt | Date | Submission timestamp |
| withdrawnAt | Date | Withdrawal timestamp |
| withdrawalReason | String | Reason for withdrawal |
| isWithdrawn | Boolean | Withdrawal flag |
| isDeleted | Boolean | Soft delete flag |
| deletedAt | Date | Deletion timestamp |
| deletedBy | ObjectId | Reference to User |
| auditLog | Array | Action history with timestamps |
| metadata | Object | Additional custom data |

### BidDocument (Embedded)
| Field | Type | Description |
|-------|------|-------------|
| documentType | Enum | technical_proposal, financial_proposal, bid_security, experience_certificate, financial_statement, license_permit, other |
| documentName | String | Display name |
| documentUrl | String | Storage URL |
| fileSize | Number | Size in bytes |
| mimeType | String | File MIME type |
| uploadedBy | ObjectId | Reference to User |

### BidVersion (Embedded)
| Field | Type | Description |
|-------|------|-------------|
| versionNumber | Number | Version identifier |
| bidAmount | Number | Bid amount at version |
| technicalProposal | String | Technical proposal |
| financialProposal | String | Financial proposal |
| documents | Array | Documents at version |
| submittedBy | ObjectId | Reference to User |
| submittedAt | Date | Version timestamp |
| changes | String | Change description |

### Evaluation (Embedded)
| Field | Type | Description |
|-------|------|-------------|
| evaluatorId | ObjectId | Reference to evaluator User |
| technicalScore | Number | Score 0-100 |
| financialScore | Number | Score 0-100 |
| totalScore | Number | Average score |
| technicalRemarks | String | Technical evaluation notes |
| financialRemarks | String | Financial evaluation notes |
| overallRemarks | String | Overall assessment |
| isRecommended | Boolean | Recommendation flag |
| evaluatedAt | Date | Evaluation timestamp |

### AuditLog (Embedded)
| Field | Type | Description |
|-------|------|-------------|
| action | String | Action performed |
| performedBy | ObjectId | Reference to User |
| timestamp | Date | Action timestamp |
| details | String | Action details |

## API Endpoints

Base URL: `/api/bids`

All endpoints require JWT authentication via `Authorization: Bearer <token>`.

### Bid CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create new bid (Draft status) |
| GET | `/` | List all bids (paginated, filterable) |
| GET | `/search?q=term` | Search bids |
| GET | `/statistics` | Get bid statistics |
| GET | `/vendor/:vendorId` | Get bids by vendor |
| GET | `/tender/:tenderId` | Get bids for tender |
| GET | `/:bidId` | Get bid by ID |
| PUT | `/:bidId` | Update bid details |
| DELETE | `/:bidId` | Soft delete bid |

### Status Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/:bidId/submit` | Submit draft bid |
| PUT | `/:bidId/withdraw` | Withdraw bid with reason |
| PUT | `/:bidId/status` | Update bid status |

### Evaluation

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/:bidId/evaluate` | Evaluate bid with scores |

### Document Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:bidId/documents` | Add supporting document |
| DELETE | `/:bidId/documents/:documentId` | Remove document |

## Query Parameters

### GET /bids

| Parameter | Type | Description |
|-----------|------|-------------|
| page | Integer | Page number (default: 1) |
| limit | Integer | Items per page (1-100, default: 10) |
| status | Enum | Filter by status |
| bidType | Enum | Filter by bid type |
| evaluationStatus | Enum | Filter by evaluation status |
| tenderId | ObjectId | Filter by tender |
| vendorId | ObjectId | Filter by vendor |
| organizationId | ObjectId | Filter by organization |
| sortBy | Enum | Sort field: createdAt, submittedAt, bidAmount, bidNumber |
| sortOrder | Enum | Sort order: asc, desc |

## Request Examples

### Create Bid
```http
POST /api/bids
Content-Type: application/json
Authorization: Bearer <token>

{
  "tenderId": "507f1f77bcf86cd799439011",
  "organizationId": "507f1f77bcf86cd799439012",
  "bidType": "combined",
  "bidAmount": 450000,
  "currency": "INR",
  "technicalProposal": "Our company proposes to deliver high-quality office equipment meeting all specified requirements...",
  "financialProposal": "Total cost breakdown: Hardware: ₹350,000, Installation: ₹50,000, AMC: ₹50,000..."
}
```

### Submit Bid
```http
PUT /api/bids/:bidId/submit
Content-Type: application/json
Authorization: Bearer <token>
```

### Add Document
```http
POST /api/bids/:bidId/documents
Content-Type: application/json
Authorization: Bearer <token>

{
  "documentType": "bid_security",
  "documentName": "Bid Security Deposit Certificate",
  "documentUrl": "https://storage.example.com/bids/doc123.pdf",
  "fileSize": 102400,
  "mimeType": "application/pdf"
}
```

### Evaluate Bid
```http
PUT /api/bids/:bidId/evaluate
Content-Type: application/json
Authorization: Bearer <token>

{
  "technicalScore": 85,
  "financialScore": 90,
  "technicalRemarks": "Excellent technical proposal with comprehensive implementation plan",
  "financialRemarks": "Competitive pricing with good value for money",
  "overallRemarks": "Highly recommended vendor with strong track record",
  "isRecommended": true
}
```

### Withdraw Bid
```http
PUT /api/bids/:bidId/withdraw
Content-Type: application/json
Authorization: Bearer <token>

{
  "withdrawalReason": "Unable to meet revised delivery timeline"
}
```

## Response Format

```json
{
  "success": true,
  "message": "Bid retrieved",
  "data": { },
  "timestamp": "2026-06-28T10:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Bids retrieved",
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
DRAFT ──submit──> SUBMITTED ──under_review──> UNDER_REVIEW
   │                    │                          │
   │                    │                          ├──accept──> ACCEPTED
   │                    │                          │
   │                    │                          └──reject──> REJECTED
   │                    │
   │                    └──withdraw──> WITHDRAWN
   │
   └──delete (soft)
```

- **DRAFT**: Initial state, can be updated or deleted
- **SUBMITTED**: Submitted for evaluation, can be updated before deadline
- **UNDER_REVIEW**: Being evaluated by evaluators
- **ACCEPTED**: Recommended and accepted
- **REJECTED**: Not recommended or rejected
- **WITHDRAWN**: Withdrawn by vendor

## Business Rules

1. **Create**: Vendors can create bids only for published tenders before deadline
2. **One Bid Per Tender**: Each vendor can submit only one bid per tender (enforced)
3. **Update**: Draft bids can be updated freely; submitted bids can be updated before deadline
4. **Submit**: Requires bid amount; changes status to SUBMITTED
5. **Withdraw**: Can withdraw submitted/under_review bids with reason
6. **Delete**: Only draft bids can be soft deleted
7. **Evaluate**: Only evaluators can evaluate submitted/under_review bids
8. **Documents**: Can add/remove documents only from draft bids
9. **Version History**: Automatically tracked on bid amount/proposal changes

## Module Structure

```
bids/
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

- References `Tender` model for tender validation and deadline checks
- References `User` model for vendor, evaluator, and audit tracking
- References `Organization` model for vendor organization linkage
- Uses existing JWT auth middleware from `src/middleware/authMiddleware.js`
- Follows same response format as other modules
- Uses express-validator for input validation
- Compatible with existing error handling middleware

## Error Handling

| Status | Description |
|--------|-------------|
| 400 | Validation failed, business rule error |
| 401 | Missing or invalid JWT token |
| 404 | Bid not found |
| 500 | Internal server error |

## Statistics Endpoint

Returns comprehensive bid analytics:
- Total bids count
- Count by status (draft, submitted, under_review, accepted, rejected, withdrawn)
- Bids by type breakdown

```json
{
  "success": true,
  "message": "Bid statistics retrieved",
  "data": {
    "totalBids": 150,
    "draftBids": 30,
    "submittedBids": 45,
    "underReviewBids": 25,
    "acceptedBids": 20,
    "rejectedBids": 15,
    "withdrawnBids": 15,
    "bidsByType": {
      "combined": 80,
      "technical": 40,
      "financial": 30
    }
  }
}
```