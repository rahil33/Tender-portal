/**
 * Admin Module
 * Comprehensive admin management for Phoenix Tender Portal
 * 
 * Features:
 * - Admin Dashboard
 * - User Management
 * - Organization Management
 * - Tender Moderation
 * - Bid Moderation
 * - Category Management
 * - Report Management
 * - System Settings Management
 * - Role Management
 * - Permission Management
 * - Audit Logs
 * - Activity Logs
 * - System Health
 * - Platform Statistics
 * - Search
 * - Filtering
 * - Pagination
 */

module.exports = {
  controller: require('./controller'),
  service: require('./service'),
  routes: require('./routes'),
  models: require('./model'),
  validators: require('./validator'),
  dtos: require('./dto'),
  constants: require('./constants'),
};