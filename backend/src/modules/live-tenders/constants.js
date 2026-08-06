/**
 * Live Tenders Module Constants
 */

const SOURCE_PORTALS = {
  CPPP: 'CPPP',
  EPROCUREMENT: 'eProcurement',
  EPUBLISH: 'ePublish',
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

const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const SYNC_INTERVAL_FAST_MS = 30 * 60 * 1000; // 30 minutes

module.exports = {
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