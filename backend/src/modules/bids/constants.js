/**
 * Bids Module Constants
 */

const BID_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

const BID_STATUS_VALUES = Object.values(BID_STATUS);

const BID_TYPE = {
  TECHNICAL: 'technical',
  FINANCIAL: 'financial',
  COMBINED: 'combined',
};

const BID_TYPE_VALUES = Object.values(BID_TYPE);

const DOCUMENT_TYPE = {
  TECHNICAL_PROPOSAL: 'technical_proposal',
  FINANCIAL_PROPOSAL: 'financial_proposal',
  BID_SECURITY: 'bid_security',
  EXPERIENCE_CERTIFICATE: 'experience_certificate',
  FINANCIAL_STATEMENT: 'financial_statement',
  LICENSE_PERMIT: 'license_permit',
  OTHER: 'other',
};

const DOCUMENT_TYPE_VALUES = Object.values(DOCUMENT_TYPE);

const EVALUATION_STATUS = {
  PENDING: 'pending',
  TECHNICAL_EVALUATED: 'technical_evaluated',
  FINANCIAL_EVALUATED: 'financial_evaluated',
  COMPLETED: 'completed',
};

const EVALUATION_STATUS_VALUES = Object.values(EVALUATION_STATUS);

const SORT_FIELDS = {
  createdAt: 'createdAt',
  submittedAt: 'submittedAt',
  bidAmount: 'bidAmount',
  bidNumber: 'bidNumber',
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
  BID_STATUS,
  BID_STATUS_VALUES,
  BID_TYPE,
  BID_TYPE_VALUES,
  DOCUMENT_TYPE,
  DOCUMENT_TYPE_VALUES,
  EVALUATION_STATUS,
  EVALUATION_STATUS_VALUES,
  SORT_FIELDS,
  SORT_FIELDS_VALUES,
  SORT_ORDER,
  SORT_ORDER_VALUES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};