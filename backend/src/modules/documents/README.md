# Documents Module Documentation

## Overview

The Documents Module provides comprehensive document management for the Phoenix Tender Portal. It supports secure file uploads, versioning, metadata management, and organization-specific document storage with full audit trails.

## Features

- **Upload Documents**: Secure file upload with validation
- **Download Documents**: Track downloads with count
- **Delete & Restore**: Soft delete with restore capability
- **Document Versioning**: Automatic version history tracking
- **Metadata Management**: Title, description, tags, custom metadata
- **Multiple File Upload**: Support for batch uploads
- **Tender Attachments**: Link documents to tenders
- **Bid Attachments**: Link documents to bids
- **Organization Documents**: Organization-specific document storage
- **Organization Ownership Validation**: Access control based on organization
- **Secure Access Control**: Public/private document flags
- **Search**: Full-text search across fileName, title, description, tags
- **Filtering**: By status, type, tender, bid, organization, visibility
- **Sorting**: By fileName, createdAt, updatedAt, fileSize
- **Pagination**: Configurable pagination
- **Soft Delete**: With audit trail
- **Audit Logging**: Complete action history
- **File Validation**: Size, MIME type validation
- **File Hash**: SHA hash for integrity verification

## Database Models

### Document
| Field | Type | Description |
|-------|------|-------------|
| fileName | String | Display filename (required) |
| fileUrl | String | Storage URL (required) |
| originalFileName | String | Original upload filename |
| fileSize | Number | Size in bytes (required) |
| mimeType | String | MIME type (required) |
| fileHash | String | SHA hash for integrity |
| documentType | Enum | Document type classification |
| title | String | Document title (max 300) |
| description | String | Description (max 1000) |
| tags | Array | Searchable tags |
| tenderId | ObjectId | Reference to Tender |
| bidId | ObjectId | Reference to Bid |
| organizationId | ObjectId | Reference to Organization |
| uploadedBy | ObjectId | Reference to User (required) |
| versionHistory | Array | Version history |
| currentVersion | Number | Current version number |
| status | Enum | active, inactive, archived |
| isPublic | Boolean | Public access flag |
| downloadCount | Number | Download counter |
| metadata | Object | Custom metadata |
| isDeleted | Boolean | Soft delete flag |
| deletedAt | Date | Deletion timestamp |
| deletedBy | ObjectId | Reference to User |
| auditLog | Array | Action history |

### DocumentVersion (Embedded)
| Field | Type | Description |
|-------|------|-------------|
| versionNumber | Number | Version identifier |
| fileUrl | String | File URL |
| fileName | String | Filename |
| fileSize | Number | Size in bytes |
| mimeType | String | MIME type |
| uploadedBy | ObjectId | Reference to User |
| uploadedAt | Date | Upload timestamp |
| changes | String | Change description |

## API Endpoints

Base URL: `/api/documents`

All endpoints require JWT authentication via `Authorization: Bearer <token>`.

### Document CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Upload new document |
| GET | `/` | List all documents |
| GET | `/search?q=term` | Search documents |
| GET | `/statistics` | Get document statistics |
| GET | `/tender/:tenderId` | Get tender documents |
| GET | `/bid/:bidId` | Get bid documents |
| GET | `/organization/:organizationId` | Get organization documents |
| GET | `/:documentId` | Get document by ID |
| PUT | `/:documentId` | Update document metadata |
| DELETE | `/:documentId` | Soft delete document |

### Document Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/:documentId/restore` | Restore deleted document |
| GET | `/:documentId/download` | Download document |
| POST | `/:documentId/versions` | Upload new version |

## Query Parameters

### GET /documents

| Parameter | Type | Description |
|-----------|------|-------------|
| page | Integer | Page number (default: 1) |
| limit | Integer | Items per page (1-100, default: 10) |
| status | Enum | Filter by status |
| documentType | Enum | Filter by document type |
| tenderId | ObjectId | Filter by tender |
| bidId | ObjectId | Filter by bid |
| organizationId | ObjectId | Filter by organization |
| isPublic | Boolean | Filter by visibility |
| sortBy | Enum | Sort field |
| sortOrder | Enum | Sort order: asc, desc |

## Document Types

- **tender_notice**: Tender notices
- **tender_specification**: Technical specifications
- **tender_boq**: Bill of quantities
- **tender_terms**: Terms and conditions
- **tender_amendment**: Tender amendments
- **tender_corrigendum**: Corrigendums
- **bid_technical**: Technical bids
- **bid_financial**: Financial bids
- **bid_security**: Bid security deposits
- **bid_experience**: Experience certificates
- **bid_financial_statement**: Financial statements
- **bid_license**: Licenses and permits
- **organization_gst**: GST certificates
- **organization_pan**: PAN cards
- **organization_incorporation**: Incorporation certificates
- **organization_gem**: GeM certificates
- **organization_msme**: MSME certificates
- **organization_bank**: Bank statements
- **other**: Other documents

## Allowed MIME Types

- PDF: `application/pdf`
- Word: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/msword`
- Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/vnd.ms-excel`
- Images: `image/jpeg`, `image/png`, `image/jpg`
- Text: `text/plain`, `text/csv`
- Archives: `application/zip`, `application/x-rar-compressed`

## File Size Limits

- **Minimum**: 1 byte
- **Maximum**: 50MB (52,428,800 bytes)

## Request Examples

### Upload Document
```http
POST /api/documents
Content-Type: application/json
Authorization: Bearer <token>

{
  "fileName": "tender-specification.pdf",
  "fileUrl": "https://storage.example.com/docs/abc123.pdf",
  "fileSize": 2048576,
  "mimeType": "application/pdf",
  "documentType": "tender_specification",
  "title": "Technical Specifications v2.0",
  "description": "Detailed technical specifications for the tender",
  "tenderId": "507f1f77bcf86cd799439011",
  "isPublic": true,
  "tags": ["specification", "technical", "tender"]
}
```

### Upload New Version
```http
POST /api/documents/:documentId/versions
Content-Type: application/json
Authorization: Bearer <token>

{
  "fileUrl": "https://storage.example.com/docs/abc124.pdf",
  "fileName": "tender-specification-v3.pdf",
  "fileSize": 2150000,
  "mimeType": "application/pdf",
  "changes": "Updated technical specifications with revised requirements"
}
```

### Download Document
```http
GET /api/documents/:documentId/download
Authorization: Bearer <token>
```

## Response Format

```json
{
  "success": true,
  "message": "Document uploaded",
  "data": { },
  "timestamp": "2026-06-28T10:00:00.000Z"
}
```

## Business Rules

1. **Upload**: Requires valid MIME type and file size within limits
2. **Organization Validation**: Users can only upload to their organization (configurable)
3. **Version**: New versions preserve history and increment version number
4. **Download**: Increments download counter and logs action
5. **Delete**: Soft delete only; can be restored
6. **Restore**: Can restore if not permanently deleted
7. **Access**: Public documents accessible to all; private documents require authorization
8. **Tender/Bid/Org**: Document can be linked to one of these entities

## Module Structure

```
documents/
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

- References `Tender`, `Bid`, `Organization`, and `User` models
- Uses existing JWT auth middleware
- Follows same response format as other modules
- Compatible with existing error handling
- Supports file storage integration (AWS S3, Azure, local)

## Error Handling

| Status | Description |
|--------|-------------|
| 400 | Validation failed, invalid MIME type, file size exceeded |
| 401 | Missing or invalid JWT token |
| 403 | Insufficient permissions |
| 404 | Document not found |
| 500 | Internal server error |

## Statistics Endpoint

Returns comprehensive document analytics:

```json
{
  "success": true,
  "message": "Document statistics retrieved",
  "data": {
    "totalDocuments": 500,
    "activeDocuments": 450,
    "archivedDocuments": 30,
    "deletedDocuments": 20,
    "publicDocuments": 200,
    "documentsByType": {
      "tender_specification": 100,
      "bid_technical": 80,
      "organization_gst": 50
    },
    "totalStorageSize": 10737418240
  }
}
```