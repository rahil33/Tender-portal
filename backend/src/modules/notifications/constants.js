const NOTIFICATION_TYPE = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
};

const NOTIFICATION_TYPE_VALUES = Object.values(NOTIFICATION_TYPE);

const NOTIFICATION_CATEGORY = {
  TENDER: 'tender',
  BID: 'bid',
  ORGANIZATION: 'organization',
  USER: 'user',
  SYSTEM: 'system',
  BROADCAST: 'broadcast',
  REMINDER: 'reminder',
  ALERT: 'alert',
};

const NOTIFICATION_CATEGORY_VALUES = Object.values(NOTIFICATION_CATEGORY);

const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
};

const NOTIFICATION_PRIORITY_VALUES = Object.values(NOTIFICATION_PRIORITY);

const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  SCHEDULED: 'scheduled',
  CANCELLED: 'cancelled',
};

const NOTIFICATION_STATUS_VALUES = Object.values(NOTIFICATION_STATUS);

const NOTIFICATION_CHANNEL = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WHATSAPP: 'whatsapp',
};

const NOTIFICATION_CHANNEL_VALUES = Object.values(NOTIFICATION_CHANNEL);

const TENDER_NOTIFICATION_EVENT = {
  TENDER_CREATED: 'tender_created',
  TENDER_PUBLISHED: 'tender_published',
  TENDER_UPDATED: 'tender_updated',
  TENDER_CANCELLED: 'tender_cancelled',
  TENDER_CLOSED: 'tender_closed',
  TENDER_DEADLINE_APPROACHING: 'tender_deadline_approaching',
  TENDER_EXTENDED: 'tender_extended',
  TENDER_AWARDED: 'tender_awarded',
  TENDER_REJECTED: 'tender_rejected',
};

const TENDER_NOTIFICATION_EVENT_VALUES = Object.values(TENDER_NOTIFICATION_EVENT);

const BID_NOTIFICATION_EVENT = {
  BID_SUBMITTED: 'bid_submitted',
  BID_UPDATED: 'bid_updated',
  BID_WITHDRAWN: 'bid_withdrawn',
  BID_EVALUATED: 'bid_evaluated',
  BID_AWARDED: 'bid_awarded',
  BID_REJECTED: 'bid_rejected',
  BID_SHORTLISTED: 'bid_shortlisted',
  BID_CLARIFICATION_REQUESTED: 'bid_clarification_requested',
};

const BID_NOTIFICATION_EVENT_VALUES = Object.values(BID_NOTIFICATION_EVENT);

const ORGANIZATION_NOTIFICATION_EVENT = {
  ORGANIZATION_CREATED: 'organization_created',
  ORGANIZATION_UPDATED: 'organization_updated',
  ORGANIZATION_VERIFIED: 'organization_verified',
  ORGANIZATION_REJECTED: 'organization_rejected',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',
  MEMBER_ROLE_CHANGED: 'member_role_changed',
};

const ORGANIZATION_NOTIFICATION_EVENT_VALUES = Object.values(ORGANIZATION_NOTIFICATION_EVENT);

const USER_NOTIFICATION_EVENT = {
  PROFILE_UPDATED: 'profile_updated',
  PASSWORD_CHANGED: 'password_changed',
  ACCOUNT_ACTIVATED: 'account_activated',
  ACCOUNT_DEACTIVATED: 'account_deactivated',
  DOCUMENT_VERIFIED: 'document_verified',
  DOCUMENT_REJECTED: 'document_rejected',
};

const USER_NOTIFICATION_EVENT_VALUES = Object.values(USER_NOTIFICATION_EVENT);

const SCHEDULE_TYPE = {
  ONCE: 'once',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom',
};

const SCHEDULE_TYPE_VALUES = Object.values(SCHEDULE_TYPE);

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const SORT_FIELDS = {
  createdAt: 'createdAt',
  scheduledAt: 'scheduledAt',
  sentAt: 'sentAt',
  priority: 'priority',
};

const SORT_FIELDS_VALUES = Object.values(SORT_FIELDS);

const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

const SORT_ORDER_VALUES = Object.values(SORT_ORDER);

module.exports = {
  NOTIFICATION_TYPE,
  NOTIFICATION_TYPE_VALUES,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_CATEGORY_VALUES,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_PRIORITY_VALUES,
  NOTIFICATION_STATUS,
  NOTIFICATION_STATUS_VALUES,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_CHANNEL_VALUES,
  TENDER_NOTIFICATION_EVENT,
  TENDER_NOTIFICATION_EVENT_VALUES,
  BID_NOTIFICATION_EVENT,
  BID_NOTIFICATION_EVENT_VALUES,
  ORGANIZATION_NOTIFICATION_EVENT,
  ORGANIZATION_NOTIFICATION_EVENT_VALUES,
  USER_NOTIFICATION_EVENT,
  USER_NOTIFICATION_EVENT_VALUES,
  SCHEDULE_TYPE,
  SCHEDULE_TYPE_VALUES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  SORT_FIELDS,
  SORT_FIELDS_VALUES,
  SORT_ORDER,
  SORT_ORDER_VALUES,
};