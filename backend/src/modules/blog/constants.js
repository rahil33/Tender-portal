const BLOG_CATEGORY = {
  GEM_PORTAL: 'gem-portal',
  TENDER_TIPS: 'tender-tips',
  CERTIFICATES: 'certificates',
  TRAINING: 'training',
  INDUSTRY_NEWS: 'industry-news',
  CASE_STUDIES: 'case-studies',
  OTHER: 'other',
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const SORT_FIELDS = {
  publishedAt: 'publishedAt',
  views: 'views',
  createdAt: 'createdAt',
};

const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

module.exports = {
  BLOG_CATEGORY,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  SORT_FIELDS,
  SORT_ORDER,
};