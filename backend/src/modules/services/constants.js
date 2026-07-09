const SERVICE_CATEGORY = {
  GEM_REGISTRATION: 'gem-registration',
  TENDER_BIDDING: 'tender-bidding',
  CONSULTING: 'consulting',
  TRAINING: 'training',
  CERTIFICATION: 'certification',
  OEM_PANEL: 'oem-panel',
  OTHER: 'other',
};

const SERVICE_CATEGORY_VALUES = Object.values(SERVICE_CATEGORY);

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const SORT_FIELDS = {
  name: 'name',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

module.exports = {
  SERVICE_CATEGORY,
  SERVICE_CATEGORY_VALUES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  SORT_FIELDS,
  SORT_ORDER,
};