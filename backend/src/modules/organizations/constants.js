/**
 * Organizations Module Constants
 */

const ORGANIZATION_TYPES = {
  VENDOR: 'vendor',
  CONSULTANT: 'consultant',
  GOVERNMENT: 'government',
  PARTNER: 'partner',
  OTHER: 'other',
};

const ORGANIZATION_TYPE_VALUES = Object.values(ORGANIZATION_TYPES);

const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

const VERIFICATION_STATUS_VALUES = Object.values(VERIFICATION_STATUS);

const MEMBER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
};

const MEMBER_ROLE_VALUES = Object.values(MEMBER_ROLES);

const DOCUMENT_TYPES = {
  GST: 'gst',
  PAN: 'pan',
  INCORPORATION: 'incorporation',
  GEM_CERTIFICATE: 'gem_certificate',
  BANK_STATEMENT: 'bank_statement',
  MSME: 'msme',
  OTHER: 'other',
};

const DOCUMENT_TYPE_VALUES = Object.values(DOCUMENT_TYPES);

const DOCUMENT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
};

const DOCUMENT_STATUS_VALUES = Object.values(DOCUMENT_STATUS);

const PROFILE_COMPLETENESS_FIELDS = [
  'name',
  'email',
  'phone',
  'gstNumber',
  'panNumber',
  'registrationNumber',
  'address',
  'description',
];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

module.exports = {
  ORGANIZATION_TYPES,
  ORGANIZATION_TYPE_VALUES,
  VERIFICATION_STATUS,
  VERIFICATION_STATUS_VALUES,
  MEMBER_ROLES,
  MEMBER_ROLE_VALUES,
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_VALUES,
  DOCUMENT_STATUS,
  DOCUMENT_STATUS_VALUES,
  PROFILE_COMPLETENESS_FIELDS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};
