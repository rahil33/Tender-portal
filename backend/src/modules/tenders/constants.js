/**
 * Tenders Module Constants
 */

const TENDER_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  OPEN: 'open',
  CLOSED: 'closed',
  AWARDED: 'awarded',
  CANCELLED: 'cancelled',
};

const TENDER_STATUS_VALUES = Object.values(TENDER_STATUS);

const VALID_TRANSITIONS = {
  [TENDER_STATUS.DRAFT]: [TENDER_STATUS.PUBLISHED, TENDER_STATUS.CANCELLED],
  [TENDER_STATUS.PUBLISHED]: [TENDER_STATUS.OPEN, TENDER_STATUS.DRAFT, TENDER_STATUS.CANCELLED],
  [TENDER_STATUS.OPEN]: [TENDER_STATUS.CLOSED, TENDER_STATUS.CANCELLED],
  [TENDER_STATUS.CLOSED]: [TENDER_STATUS.AWARDED, TENDER_STATUS.CANCELLED],
  [TENDER_STATUS.AWARDED]: [],
  [TENDER_STATUS.CANCELLED]: [],
};

const TENDER_CATEGORY = {
  GOODS: 'goods',
  SERVICES: 'services',
  WORKS: 'works',
  CONSULTANCY: 'consultancy',
  IT_SOFTWARE: 'it_software',
  MEDICAL: 'medical',
  CONSTRUCTION: 'construction',
  TRANSPORTATION: 'transportation',
  AGRICULTURE: 'agriculture',
  EDUCATION: 'education',
  OTHER: 'other',
};

const TENDER_CATEGORY_VALUES = Object.values(TENDER_CATEGORY);

const TENDER_VISIBILITY = {
  PUBLIC: 'public',
  RESTRICTED: 'restricted',
  PRIVATE: 'private',
};

const TENDER_VISIBILITY_VALUES = Object.values(TENDER_VISIBILITY);

const EVALUATION_CRITERIA_TYPE = {
  PRICE: 'price',
  TECHNICAL: 'technical',
  EXPERIENCE: 'experience',
  QUALITY: 'quality',
  COMPLIANCE: 'compliance',
  CUSTOM: 'custom',
};

const EVALUATION_CRITERIA_TYPE_VALUES = Object.values(EVALUATION_CRITERIA_TYPE);

const DOCUMENT_TYPE = {
  NOTICE: 'notice',
  SPECIFICATION: 'specification',
  BOQ: 'boq',
  TERMS: 'terms',
  AMENDMENT: 'amendment',
  CORRIGENDUM: 'corrigendum',
  ADDENDUM: 'addendum',
  OTHER: 'other',
};

const DOCUMENT_TYPE_VALUES = Object.values(DOCUMENT_TYPE);

const SORT_FIELDS = {
  createdAt: 'createdAt',
  submissionDeadline: 'submissionDeadline',
  budget: 'budget',
  title: 'title',
  openingDate: 'openingDate',
};

const SORT_FIELDS_VALUES = Object.values(SORT_FIELDS);

const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

const SORT_ORDER_VALUES = Object.values(SORT_ORDER);

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

module.exports = {
  TENDER_STATUS,
  TENDER_STATUS_VALUES,
  TENDER_CATEGORY,
  TENDER_CATEGORY_VALUES,
  TENDER_VISIBILITY,
  TENDER_VISIBILITY_VALUES,
  EVALUATION_CRITERIA_TYPE,
  EVALUATION_CRITERIA_TYPE_VALUES,
  DOCUMENT_TYPE,
  DOCUMENT_TYPE_VALUES,
  SORT_FIELDS,
  SORT_FIELDS_VALUES,
  SORT_ORDER,
  SORT_ORDER_VALUES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};
