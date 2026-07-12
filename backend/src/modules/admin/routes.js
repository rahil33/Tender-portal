const express = require('express');
const adminController = require('./controller');
const adminValidators = require('./validator');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { ROLES } = require('../auth/constants');

const router = express.Router();

// All admin routes require authentication AND admin role
router.use(protect);
router.use(authorize(ROLES.ADMIN));

/**
 * Admin Dashboard Routes
 */
router.get('/dashboard/stats', adminController.getDashboardStats);

/**
 * Role Management Routes
 */
router.post('/roles', adminValidators.createRole, adminController.createRole);
router.get('/roles', adminController.getAllRoles);
router.get('/roles/:roleId', adminController.getRoleById);
router.put('/roles/:roleId', adminValidators.updateRole, adminController.updateRole);
router.delete('/roles/:roleId', adminController.deleteRole);

/**
 * Admin User Management Routes
 */
router.get('/users/admin', adminController.getAllAdminUsers);
router.get('/users/admin/:adminUserId', adminController.getAdminUserById);
router.put('/users/admin/:adminUserId', adminValidators.updateUserRole, adminController.updateAdminUser);
router.post('/users/assign-role', adminValidators.assignRoleToUser, adminController.assignRoleToUser);

/**
 * User Management Routes
 */
router.get('/users', adminValidators.getAllUsers, adminController.searchUsers);

/**
 * Organization Management Routes
 */
router.get('/organizations', adminValidators.getOrganizations, adminController.getOrganizations);
router.put('/organizations/:organizationId/verify', adminValidators.verifyOrganization, adminController.verifyOrganization);

/**
 * Tender Moderation Routes
 */
router.get('/tenders', adminValidators.getTenders, adminController.getTenders);

/**
 * Bid Moderation Routes
 */
router.get('/bids', adminValidators.getBids, adminController.getBids);

/**
 * Category Management Routes
 */
router.get('/categories', adminValidators.getCategories, adminController.getCategories);
router.post('/categories', adminValidators.createCategory, adminController.createCategory);
router.put('/categories/:categoryId', adminValidators.updateCategory, adminController.updateCategory);
router.delete('/categories/:categoryId', adminController.deleteCategory);

/**
 * Report Management Routes
 */
router.get('/reports', adminValidators.getReports, adminController.getReports);
router.get('/reports/:reportId', adminController.getReportById);
router.post('/reports', adminValidators.createReport, adminController.createReport);
router.put('/reports/:reportId', adminValidators.updateReport, adminController.updateReport);

/**
 * Moderation Logs Routes
 */
router.get('/moderation/logs', adminValidators.getModerationLogs, adminController.getModerationLogs);
router.post('/moderation/:resourceType/:resourceId', adminValidators.moderateResource, adminController.moderateResource);

/**
 * Audit Logs Routes
 */
router.get('/audit/logs', adminValidators.getAuditLogs, adminController.getAuditLogs);

/**
 * System Settings Routes
 */
router.get('/settings', adminValidators.getSystemSettings, adminController.getSystemSettings);
router.get('/settings/:settingId', adminController.getSystemSettingById);
router.post('/settings', adminValidators.createSystemSetting, adminController.createSystemSetting);
router.put('/settings/:settingId', adminValidators.updateSystemSetting, adminController.updateSystemSetting);

/**
 * System Health Routes
 */
router.get('/health', adminValidators.getSystemHealth, adminController.getSystemHealth);

/**
 * Platform Statistics Routes
 */
router.get('/statistics', adminValidators.getPlatformStatistics, adminController.getPlatformStatistics);

module.exports = router;