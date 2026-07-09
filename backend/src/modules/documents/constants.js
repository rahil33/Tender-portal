/**
 * Documents Module Constants
 */

const DOCUMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
};

const DOCUMENT_STATUS_VALUES = Object.values(DOCUMENT_STATUS);

const DOCUMENT_TYPE = {
  TENDER_NOTICE: 'tender_notice',
  TENDER_SPECIFICATION: 'tender_specification',
  TENDER_BOQ: 'tender_boq',
  TENDER_TERMS: 'tender_terms',
  TENDER_AMENDMENT: 'tender_amendment',
  TENDER_CORRIGENDUM: 'tender_corrigendum',
  BID_TECHNICAL: 'bid_technical',
  BID_FINANCIAL: 'bid_financial',
  BID_SECURITY: 'bid_security',
  BID_EXPERIENCE: 'bid_experience',
  BID_FINANCIAL_STATEMENT: 'bid_financial_statement',
  BID_LICENSE: 'bid_license',
  ORGANIZATION_GST: 'organization_gst',
  ORGANIZATION_PAN: 'organization_pan',
  ORGANIZATION_INCORPORATION: 'organization_incorporation',
  ORGANIZATION_GEM: 'organization_gem',
  ORGANIZATION_MSME: 'organization_msme',
  ORGANIZATION_BANK: 'organization_bank',
  OTHER: 'other',
};

const DOCUMENT_TYPE_VALUES = Object.values(DOCUMENT_TYPE);

const MIME_TYPES = {
  PDF: 'application/pdf',
  WORD: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  WORD_LEGACY: 'application/msword',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  EXCEL_LEGACY: 'application/vnd.ms-excel',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_JPG: 'image/jpg',
  TEXT: 'text/plain',
  CSV: 'text/csv',
  ZIP: 'application/zip',
  RAR: 'application/x-rar-compressed',
};

const ALLOWED_MIME_TYPES = Object.values(MIME_TYPES);

const MAX_FILE_SIZE = 52428800; // 50MB in bytes
const MIN_FILE_SIZE = 1; // 1 byte

const SORT_FIELDS = {
  fileName: 'fileName',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  fileSize: 'fileSize',
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
  DOCUMENT_STATUS,
  DOCUMENT_STATUS_VALUES,
  DOCUMENT_TYPE,
  DOCUMENT_TYPE_VALUES,
  MIME_TYPES,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MIN_FILE_SIZE,
  SORT_FIELDS,
  SORT_FIELDS_VALUES,
  SORT_ORDER,
  SORT_ORDER_VALUES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};