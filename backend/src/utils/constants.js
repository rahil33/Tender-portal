const GLOBAL_CONSTANTS = {
  ROLES: {
    ADMIN: 'admin',
    VENDOR: 'vendor',
    EVALUATOR: 'evaluator',
  },
  
  TENDER_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    CLOSED: 'closed',
    CANCELLED: 'cancelled',
    ARCHIVED: 'archived',
  },
  
  BID_STATUS: {
    PENDING: 'pending',
    SUBMITTED: 'submitted',
    EVALUATED: 'evaluated',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
  },
  
  DOCUMENT_STATUS: {
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
    ARCHIVED: 'archived',
  },
  
  NOTIFICATION_PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },
  
  NOTIFICATION_TYPE: {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success',
  },
  
  ORGANIZATION_TYPE: {
    GOVERNMENT: 'government',
    PRIVATE: 'private',
    NGO: 'ngo',
    INTERNATIONAL: 'international',
  },
  
  VERIFICATION_STATUS: {
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
  },
  
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  
  FILE_SIZE: {
    MAX: 10 * 1024 * 1024,
    MIN: 1,
  },
  
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
  },
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
};

const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

module.exports = {
  GLOBAL_CONSTANTS,
  HTTP_STATUS,
  SORT_ORDER,
};