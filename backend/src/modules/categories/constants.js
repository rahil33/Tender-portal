/**
 * Categories Module Constants
 */

const CATEGORY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
};

const CATEGORY_STATUS_VALUES = Object.values(CATEGORY_STATUS);

const CATEGORY_TYPE = {
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

const CATEGORY_TYPE_VALUES = Object.values(CATEGORY_TYPE);

const SORT_FIELDS = {
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  order: 'order',
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
  CATEGORY_STATUS,
  CATEGORY_STATUS_VALUES,
  CATEGORY_TYPE,
  CATEGORY_TYPE_VALUES,
  SORT_FIELDS,
  SORT_FIELDS_VALUES,
  SORT_ORDER,
  SORT_ORDER_VALUES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};