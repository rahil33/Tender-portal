/**
 * Live Tenders Module Constants
 */

const SOURCE_PORTALS = {
  GEM: 'GEM',
};

const SOURCE_PORTAL_VALUES = Object.values(SOURCE_PORTALS);

const DOCUMENT_TYPE = {
  TENDER_NOTICE: 'tender_notice',
  TENDER_DOCUMENT: 'tender_document',
  CORRIGENDUM: 'corrigendum',
  BOQ: 'boq',
  ADDENDUM: 'addendum',
};

const DOCUMENT_TYPE_VALUES = Object.values(DOCUMENT_TYPE);

const TENDER_STATUS = {
  PUBLISHED: 'published',
  OPEN: 'open',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
};

const TENDER_STATUS_VALUES = Object.values(TENDER_STATUS);

const CATEGORY = {
  GOODS: 'goods',
  SERVICES: 'services',
  WORKS: 'works',
  CONSTRUCTION: 'construction',
  IT_SOFTWARE: 'it_software',
  MEDICAL: 'medical',
  TRANSPORTATION: 'transportation',
  AGRICULTURE: 'agriculture',
  EDUCATION: 'education',
  CONSULTANCY: 'consultancy',
  OTHER: 'other',
};

const CATEGORY_VALUES = Object.values(CATEGORY);

const CLASSIFICATION = {
  PRODUCT: 'product',
  SERVICE: 'service',
  UNCLASSIFIED: 'unclassified',
};

const UNCLASSIFIED_CATEGORY = { key: 'unclassified', name: 'Unclassified' };

// Bid-type codes as used by GeM's own listing (b_bid_type). Labels are display
// names only; filters are built from the codes actually present in the data.
const BID_TYPE_LABELS = {
  1: 'Product Bid/RA',
  2: 'Service Bid/RA',
  3: 'Bid To RA',
  4: 'BOQ Bid',
  5: 'Product Custom Bid/RA',
  6: 'Rate Contract Bid',
};

const ARCHIVE_REASON = {
  DEADLINE_PASSED: 'deadline_passed',
  NOT_LISTED_ON_GEM: 'not_listed_on_gem',
};

const SYNC_TYPE = { TENDERS: 'tenders', CATEGORIES: 'categories' };

const SYNC_STATUS = {
  IDLE: 'idle',
  IN_PROGRESS: 'in_progress',
  SUCCESS: 'success',
  FAILED: 'failed',
};

const SYNC_STATUS_VALUES = Object.values(SYNC_STATUS);

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const SYNC_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const SYNC_INTERVAL_FAST_MS = 5 * 60 * 1000; // 5 minutes

module.exports = {
  CLASSIFICATION,
  UNCLASSIFIED_CATEGORY,
  BID_TYPE_LABELS,
  ARCHIVE_REASON,
  SYNC_TYPE,
  SOURCE_PORTALS,
  SOURCE_PORTAL_VALUES,
  DOCUMENT_TYPE,
  DOCUMENT_TYPE_VALUES,
  TENDER_STATUS,
  TENDER_STATUS_VALUES,
  CATEGORY,
  CATEGORY_VALUES,
  SYNC_STATUS,
  SYNC_STATUS_VALUES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  SYNC_INTERVAL_MS,
  SYNC_INTERVAL_FAST_MS,
};