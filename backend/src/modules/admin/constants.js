/**
 * Admin Module Constants
 */

const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

const ADMIN_ROLES_VALUES = Object.values(ADMIN_ROLES);

const PERMISSIONS = {
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE_ROLES: 'users:manage_roles',
  
  ORGANIZATIONS_VIEW: 'organizations:view',
  ORGANIZATIONS_CREATE: 'organizations:create',
  ORGANIZATIONS_UPDATE: 'organizations:update',
  ORGANIZATIONS_DELETE: 'organizations:delete',
  ORGANIZATIONS_VERIFY: 'organizations:verify',
  
  TENDERS_VIEW: 'tenders:view',
  TENDERS_CREATE: 'tenders:create',
  TENDERS_UPDATE: 'tenders:update',
  TENDERS_DELETE: 'tenders:delete',
  TENDERS_PUBLISH: 'tenders:publish',
  TENDERS_MODERATE: 'tenders:moderate',
  
  BIDS_VIEW: 'bids:view',
  BIDS_CREATE: 'bids:create',
  BIDS_UPDATE: 'bids:update',
  BIDS_DELETE: 'bids:delete',
  BIDS_MODERATE: 'bids:moderate',
  
  CATEGORIES_VIEW: 'categories:view',
  CATEGORIES_CREATE: 'categories:create',
  CATEGORIES_UPDATE: 'categories:update',
  CATEGORIES_DELETE: 'categories:delete',
  
  REPORTS_VIEW: 'reports:view',
  REPORTS_CREATE: 'reports:create',
  REPORTS_MODERATE: 'reports:moderate',
  
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
  
  ROLES_VIEW: 'roles:view',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  
  PERMISSIONS_VIEW: 'permissions:view',
  PERMISSIONS_ASSIGN: 'permissions:assign',
  
  AUDIT_LOGS_VIEW: 'audit_logs:view',
  ACTIVITY_LOGS_VIEW: 'activity_logs:view',
  
  SYSTEM_HEALTH_VIEW: 'system_health:view',
  PLATFORM_STATS_VIEW: 'platform_stats:view',
};

const PERMISSIONS_VALUES = Object.values(PERMISSIONS);

const DEFAULT_ROLE_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: PERMISSIONS_VALUES,
  [ADMIN_ROLES.ADMIN]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.ORGANIZATIONS_VIEW,
    PERMISSIONS.ORGANIZATIONS_UPDATE,
    PERMISSIONS.ORGANIZATIONS_VERIFY,
    PERMISSIONS.TENDERS_VIEW,
    PERMISSIONS.TENDERS_MODERATE,
    PERMISSIONS.TENDERS_PUBLISH,
    PERMISSIONS.BIDS_VIEW,
    PERMISSIONS.BIDS_MODERATE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_MODERATE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.ACTIVITY_LOGS_VIEW,
    PERMISSIONS.SYSTEM_HEALTH_VIEW,
    PERMISSIONS.PLATFORM_STATS_VIEW,
  ],
  [ADMIN_ROLES.MODERATOR]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.ORGANIZATIONS_VIEW,
    PERMISSIONS.TENDERS_VIEW,
    PERMISSIONS.TENDERS_MODERATE,
    PERMISSIONS.BIDS_VIEW,
    PERMISSIONS.BIDS_MODERATE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.ACTIVITY_LOGS_VIEW,
  ],
};

const AUDIT_ACTION_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  APPROVE: 'approve',
  REJECT: 'reject',
  PUBLISH: 'publish',
  UNPUBLISH: 'unpublish',
  VERIFY: 'verify',
  MODERATE: 'moderate',
  ASSIGN: 'assign',
  REVOKE: 'revoke',
  LOGIN: 'login',
  LOGOUT: 'logout',
  SYSTEM: 'system',
};

const AUDIT_ACTION_TYPES_VALUES = Object.values(AUDIT_ACTION_TYPES);

const AUDIT_RESOURCE_TYPES = {
  USER: 'user',
  ORGANIZATION: 'organization',
  TENDER: 'tender',
  BID: 'bid',
  CATEGORY: 'category',
  REPORT: 'report',
  ROLE: 'role',
  PERMISSION: 'permission',
  SETTING: 'setting',
  SYSTEM: 'system',
};

const AUDIT_RESOURCE_TYPES_VALUES = Object.values(AUDIT_RESOURCE_TYPES);

const MODERATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged',
};

const MODERATION_STATUS_VALUES = Object.values(MODERATION_STATUS);

const REPORT_TYPES = {
  USER_MISCONDUCT: 'user_misconduct',
  FRAUDULENT_TENDER: 'fraudulent_tender',
  BID_COLLUSION: 'bid_collusion',
  SYSTEM_ABUSE: 'system_abuse',
  CONTENT_VIOLATION: 'content_violation',
  OTHER: 'other',
};

const REPORT_TYPES_VALUES = Object.values(REPORT_TYPES);

const REPORT_STATUS = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
};

const REPORT_STATUS_VALUES = Object.values(REPORT_STATUS);

const SYSTEM_HEALTH_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  CRITICAL: 'critical',
  DOWN: 'down',
};

const SYSTEM_HEALTH_STATUS_VALUES = Object.values(SYSTEM_HEALTH_STATUS);

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const SORT_FIELDS = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  name: 'name',
  email: 'email',
  status: 'status',
  role: 'role',
};

const SORT_FIELDS_VALUES = Object.values(SORT_FIELDS);

const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

const SORT_ORDER_VALUES = Object.values(SORT_ORDER);

module.exports = {
  ADMIN_ROLES,
  ADMIN_ROLES_VALUES,
  PERMISSIONS,
  PERMISSIONS_VALUES,
  DEFAULT_ROLE_PERMISSIONS,
  AUDIT_ACTION_TYPES,
  AUDIT_ACTION_TYPES_VALUES,
  AUDIT_RESOURCE_TYPES,
  AUDIT_RESOURCE_TYPES_VALUES,
  MODERATION_STATUS,
  MODERATION_STATUS_VALUES,
  REPORT_TYPES,
  REPORT_TYPES_VALUES,
  REPORT_STATUS,
  REPORT_STATUS_VALUES,
  SYSTEM_HEALTH_STATUS,
  SYSTEM_HEALTH_STATUS_VALUES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  SORT_FIELDS,
  SORT_FIELDS_VALUES,
  SORT_ORDER,
  SORT_ORDER_VALUES,
};