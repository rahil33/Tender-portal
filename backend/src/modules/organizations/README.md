# Organizations Module Documentation

## Overview

The Organizations Module manages business entities on the Phoenix Tender Portal. It supports vendor company profiles, member management, compliance documents, verification workflows, and featured partner organizations for the homepage "Trusted by Leading Organizations" section.

## Features

- **Organization Profiles**: Company details aligned with frontend profile fields (name, GST, PAN, address, GeM seller ID)
- **Member Management**: Link users to organizations with roles (owner, admin, member, viewer)
- **Document Management**: Upload and verify GST, PAN, incorporation, GeM certificates, and more
- **Verification Workflow**: Admin verification of organizations and documents
- **Featured Partners**: Manage trusted organization logos for marketing display
- **Search & Filtering**: Search by name, GST, PAN, registration number, or GeM ID
- **Statistics**: Organization profile completeness, member count, document status

## Database Models

### Organization
| Field | Type | Description |
|-------|------|-------------|
| name | String | Organization name (required) |
| slug | String | URL-friendly identifier |
| type | Enum | vendor, consultant, government, partner, other |
| registrationNumber | String | CIN/LLP registration |
| gstNumber | String | GST registration number |
| panNumber | String | PAN number |
| gemSellerId | String | GeM seller registration ID |
| email, phone, website | String | Contact information |
| address | Object | street, city, state, zipCode, country |
| verificationStatus | Enum | pending, verified, rejected, suspended |
| ownerId | ObjectId | User who owns the organization |
| isFeatured | Boolean | Show on homepage trusted partners |
| profileCompleteness | Number | 0-100 completion score |

### OrganizationMember
Links users to organizations with roles.

### OrganizationDocument
Stores compliance documents with verification status.

## API Endpoints

Base URL: `/api/organizations`

All endpoints require JWT authentication via `Authorization: Bearer <token>`.

### Organization CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create organization |
| GET | `/` | List organizations (paginated, filterable) |
| GET | `/search?q=term` | Search organizations |
| GET | `/featured` | Get featured/trusted partners |
| GET | `/user/:userId` | Get organizations for a user |
| GET | `/:organizationId` | Get organization by ID |
| PUT | `/:organizationId` | Update organization |
| DELETE | `/:organizationId` | Deactivate organization |

### Verification & Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/:organizationId/verify` | Update verification status (admin) |
| GET | `/:organizationId/statistics` | Get organization statistics |

### Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/members` | Add member to organization |
| GET | `/:organizationId/members` | List organization members |
| PUT | `/members/:memberId` | Update member role |
| DELETE | `/members/:memberId` | Remove member |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents` | Upload organization document |
| GET | `/:organizationId/documents` | List organization documents |
| DELETE | `/documents/:documentId` | Delete document |
| PUT | `/documents/:documentId/verify` | Verify document (admin) |

## Request Examples

### Create Organization
```http
POST /api/organizations
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "ABC Technologies Pvt Ltd",
  "type": "vendor",
  "gstNumber": "24AABCU9603R1ZM",
  "panNumber": "AABCU9603R",
  "email": "contact@abctech.com",
  "phone": "9876543210",
  "address": {
    "street": "123 Business Park",
    "city": "Ahmedabad",
    "state": "Gujarat",
    "zipCode": "380001"
  },
  "description": "IT services and government tender consultancy"
}
```

### Add Member
```http
POST /api/organizations/members
Content-Type: application/json

{
  "organizationId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "role": "admin",
  "designation": "Operations Manager"
}
```

### Upload Document
```http
POST /api/organizations/documents
Content-Type: application/json

{
  "organizationId": "507f1f77bcf86cd799439011",
  "documentType": "gst",
  "documentName": "GST Certificate 2026",
  "documentUrl": "https://storage.example.com/docs/gst-cert.pdf"
}
```

## Response Format

```json
{
  "success": true,
  "message": "Organization retrieved",
  "data": { },
  "timestamp": "2026-06-27T10:00:00.000Z"
}
```

## Module Structure

```
organizations/
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

- Maps to frontend `profiles.company`, `profiles.gst`, and `applications.company_name` fields
- Featured organizations power the homepage "Trusted by Leading Organizations" section
- Organization verification aligns with GeM registration document requirements
- Uses existing JWT auth middleware from `src/middleware/authMiddleware.js`

## Error Handling

| Status | Description |
|--------|-------------|
| 400 | Validation failed or business rule error |
| 401 | Missing or invalid JWT token |
| 404 | Organization not found |
| 500 | Internal server error |
