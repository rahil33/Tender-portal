const adminService = require('./service');
const { AdminResponseDTO } = require('./dto');

class AdminController {
  async createRole(req, res) {
    try {
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.createRole(req.body, performedBy);

      return res.status(201).json(
        new AdminResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to create role', null, [error.message])
      );
    }
  }

  async getAllRoles(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await adminService.getAllRoles(parseInt(page), parseInt(limit));

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Roles retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get roles', null, [error.message])
      );
    }
  }

  async getRoleById(req, res) {
    try {
      const { roleId } = req.params;
      const result = await adminService.getRoleById(roleId);

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Role retrieved', result.data)
      );
    } catch (error) {
      return res.status(404).json(
        new AdminResponseDTO(false, 'Failed to get role', null, [error.message])
      );
    }
  }

  async updateRole(req, res) {
    try {
      const { roleId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.updateRole(roleId, req.body, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to update role', null, [error.message])
      );
    }
  }

  async deleteRole(req, res) {
    try {
      const { roleId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.deleteRole(roleId, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to delete role', null, [error.message])
      );
    }
  }

  async assignRoleToUser(req, res) {
    try {
      const { userId, role, permissions } = req.body;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.assignRoleToUser(userId, role, permissions, performedBy);

      return res.status(201).json(
        new AdminResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to assign role', null, [error.message])
      );
    }
  }

  async getAllAdminUsers(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await adminService.getAllAdminUsers(parseInt(page), parseInt(limit));

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Admin users retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get admin users', null, [error.message])
      );
    }
  }

  async getAdminUserById(req, res) {
    try {
      const { adminUserId } = req.params;
      const result = await adminService.getAdminUserById(adminUserId);

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Admin user retrieved', result.data)
      );
    } catch (error) {
      return res.status(404).json(
        new AdminResponseDTO(false, 'Failed to get admin user', null, [error.message])
      );
    }
  }

  async updateAdminUser(req, res) {
    try {
      const { adminUserId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.updateAdminUser(adminUserId, req.body, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to update admin user', null, [error.message])
      );
    }
  }

  async getAuditLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        action,
        resourceType,
        resourceId,
        performedBy,
        status,
        sortBy,
        sortOrder,
        startDate,
        endDate,
      } = req.query;

      const result = await adminService.getAuditLogs(
        parseInt(page),
        parseInt(limit),
        { action, resourceType, resourceId, performedBy, status, sortBy, sortOrder, startDate, endDate }
      );

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Audit logs retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get audit logs', null, [error.message])
      );
    }
  }

  async moderateResource(req, res) {
    try {
      const { resourceType, resourceId } = req.params;
      const { status, moderationNotes, rejectionReason } = req.body;
      const moderatedBy = req.user?.id || req.user?.userId;
      const result = await adminService.moderateResource(
        resourceType,
        resourceId,
        status,
        moderatedBy,
        moderationNotes,
        rejectionReason
      );

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to moderate resource', null, [error.message])
      );
    }
  }

  async getModerationLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        resourceType,
        resourceId,
        status,
        moderatedBy,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await adminService.getModerationLogs(
        parseInt(page),
        parseInt(limit),
        { resourceType, resourceId, status, moderatedBy, sortBy, sortOrder }
      );

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Moderation logs retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get moderation logs', null, [error.message])
      );
    }
  }

  async getReports(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        reportType,
        status,
        priority,
        assignedTo,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await adminService.getReports(
        parseInt(page),
        parseInt(limit),
        { reportType, status, priority, assignedTo, sortBy, sortOrder }
      );

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Reports retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get reports', null, [error.message])
      );
    }
  }

  async getReportById(req, res) {
    try {
      const { reportId } = req.params;
      const result = await adminService.getReportById(reportId);

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Report retrieved', result.data)
      );
    } catch (error) {
      return res.status(404).json(
        new AdminResponseDTO(false, 'Failed to get report', null, [error.message])
      );
    }
  }

  async createReport(req, res) {
    try {
      const reportedBy = req.user?.id || req.user?.userId;
      const result = await adminService.createReport(req.body, reportedBy);

      return res.status(201).json(
        new AdminResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to create report', null, [error.message])
      );
    }
  }

  async updateReport(req, res) {
    try {
      const { reportId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.updateReport(reportId, req.body, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to update report', null, [error.message])
      );
    }
  }

  async getSystemSettings(req, res) {
    try {
      const { category, isPublic } = req.query;
      const result = await adminService.getSystemSettings({ category, isPublic });

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'System settings retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get system settings', null, [error.message])
      );
    }
  }

  async getSystemSettingById(req, res) {
    try {
      const { settingId } = req.params;
      const result = await adminService.getSystemSettingById(settingId);

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'System setting retrieved', result.data)
      );
    } catch (error) {
      return res.status(404).json(
        new AdminResponseDTO(false, 'Failed to get system setting', null, [error.message])
      );
    }
  }

  async createSystemSetting(req, res) {
    try {
      const updatedBy = req.user?.id || req.user?.userId;
      const result = await adminService.createSystemSetting(req.body, updatedBy);

      return res.status(201).json(
        new AdminResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to create system setting', null, [error.message])
      );
    }
  }

  async updateSystemSetting(req, res) {
    try {
      const { settingId } = req.params;
      const updatedBy = req.user?.id || req.user?.userId;
      const result = await adminService.updateSystemSetting(settingId, req.body, updatedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to update system setting', null, [error.message])
      );
    }
  }

  async getSystemHealth(req, res) {
    try {
      const { component, status, limit = 50 } = req.query;
      const result = await adminService.getSystemHealth({ component, status }, parseInt(limit));

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'System health retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get system health', null, [error.message])
      );
    }
  }

  async getPlatformStatistics(req, res) {
    try {
      const { period, metricName } = req.query;
      const result = await adminService.getPlatformStatistics({ period, metricName });

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Platform statistics retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get platform statistics', null, [error.message])
      );
    }
  }

  async getDashboardStats(req, res) {
    try {
      const result = await adminService.getDashboardStats();

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Dashboard stats retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get dashboard stats', null, [error.message])
      );
    }
  }

  async searchUsers(req, res) {
    try {
      const { q, page = 1, limit = 10, role, isActive } = req.query;

      if (!q) {
        return res.status(400).json(
          new AdminResponseDTO(false, 'Search term is required', null, ['q parameter is missing'])
        );
      }

      const result = await adminService.searchUsers(
        q,
        parseInt(page),
        parseInt(limit),
        { role, isActive }
      );

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Search results', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to search users', null, [error.message])
      );
    }
  }

  async getOrganizations(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        isVerified,
        isActive,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await adminService.getOrganizations(
        search,
        parseInt(page),
        parseInt(limit),
        { isVerified, isActive, sortBy, sortOrder }
      );

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Organizations retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get organizations', null, [error.message])
      );
    }
  }

  async verifyOrganization(req, res) {
    try {
      const { organizationId } = req.params;
      const { isVerified, verificationNotes } = req.body;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.verifyOrganization(
        organizationId,
        isVerified,
        verificationNotes,
        performedBy
      );

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to verify organization', null, [error.message])
      );
    }
  }

  async getTenders(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        category,
        search,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await adminService.getTenders(
        parseInt(page),
        parseInt(limit),
        { status, category, search, sortBy, sortOrder }
      );

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Tenders retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get tenders', null, [error.message])
      );
    }
  }

  async getBids(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        tenderId,
        search,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await adminService.getBids(
        parseInt(page),
        parseInt(limit),
        { status, tenderId, search, sortBy, sortOrder }
      );

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Bids retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get bids', null, [error.message])
      );
    }
  }

  async getCategories(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        isActive,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await adminService.getCategories(
        search,
        parseInt(page),
        parseInt(limit),
        { isActive, sortBy, sortOrder }
      );

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Categories retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get categories', null, [error.message])
      );
    }
  }

  async createCategory(req, res) {
    try {
      const createdBy = req.user?.id || req.user?.userId;
      const result = await adminService.createCategory(req.body, createdBy);

      return res.status(201).json(
        new AdminResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to create category', null, [error.message])
      );
    }
  }

  async updateCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.updateCategory(categoryId, req.body, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to update category', null, [error.message])
      );
    }
  }

  async deleteCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.deleteCategory(categoryId, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to delete category', null, [error.message])
      );
    }
  }

  async suspendUser(req, res) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.suspendUser(userId, reason, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to suspend user', null, [error.message])
      );
    }
  }

  async reactivateUser(req, res) {
    try {
      const { userId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.reactivateUser(userId, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to reactivate user', null, [error.message])
      );
    }
  }

  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.deleteUser(userId, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to delete user', null, [error.message])
      );
    }
  }

  async resetUserPassword(req, res) {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.resetUserPassword(userId, newPassword, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to reset password', null, [error.message])
      );
    }
  }

  async forceLogoutUser(req, res) {
    try {
      const { userId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.forceLogoutUser(userId, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to force logout', null, [error.message])
      );
    }
  }

  async getUserLoginHistory(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const result = await adminService.getUserLoginHistory(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Login history retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get login history', null, [error.message])
      );
    }
  }

  async suspendOrganization(req, res) {
    try {
      const { organizationId } = req.params;
      const { reason } = req.body;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.suspendOrganization(organizationId, reason, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to suspend organization', null, [error.message])
      );
    }
  }

  async reactivateOrganization(req, res) {
    try {
      const { organizationId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.reactivateOrganization(organizationId, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to reactivate organization', null, [error.message])
      );
    }
  }

  async approveOrganizationDocument(req, res) {
    try {
      const { documentId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.approveOrganizationDocument(documentId, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to approve document', null, [error.message])
      );
    }
  }

  async rejectOrganizationDocument(req, res) {
    try {
      const { documentId } = req.params;
      const { reason } = req.body;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.rejectOrganizationDocument(documentId, reason, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to reject document', null, [error.message])
      );
    }
  }

  async publishTender(req, res) {
    try {
      const { tenderId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.publishTender(tenderId, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to publish tender', null, [error.message])
      );
    }
  }

  async unpublishTender(req, res) {
    try {
      const { tenderId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.unpublishTender(tenderId, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to unpublish tender', null, [error.message])
      );
    }
  }

  async archiveTender(req, res) {
    try {
      const { tenderId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.archiveTender(tenderId, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to archive tender', null, [error.message])
      );
    }
  }

  async restoreTender(req, res) {
    try {
      const { tenderId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.restoreTender(tenderId, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to restore tender', null, [error.message])
      );
    }
  }

  async deleteTender(req, res) {
    try {
      const { tenderId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.deleteTender(tenderId, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to delete tender', null, [error.message])
      );
    }
  }

  async forceWithdrawBid(req, res) {
    try {
      const { bidId } = req.params;
      const { reason } = req.body;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.forceWithdrawBid(bidId, reason, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to withdraw bid', null, [error.message])
      );
    }
  }

  async flagBid(req, res) {
    try {
      const { bidId } = req.params;
      const { reason } = req.body;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.flagBid(bidId, reason, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to flag bid', null, [error.message])
      );
    }
  }

  async broadcastNotification(req, res) {
    try {
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.broadcastNotification(req.body, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to broadcast notification', null, [error.message])
      );
    }
  }

  async sendTargetedNotification(req, res) {
    try {
      const { userId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.sendTargetedNotification(userId, req.body, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to send notification', null, [error.message])
      );
    }
  }

  async retryFailedNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const performedBy = req.user?.id || req.user?.userId;
      const result = await adminService.retryFailedNotification(notificationId, performedBy);

      return res.status(200).json(
        new AdminResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AdminResponseDTO(false, 'Failed to retry notification', null, [error.message])
      );
    }
  }

  async getFailedNotifications(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await adminService.getFailedNotifications(
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Failed notifications retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get failed notifications', null, [error.message])
      );
    }
  }

  async getSecurityMetrics(req, res) {
    try {
      const result = await adminService.getSecurityMetrics();

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Security metrics retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get security metrics', null, [error.message])
      );
    }
  }

  async getDetailedAnalytics(req, res) {
    try {
      const { period = '30d' } = req.query;
      const result = await adminService.getDetailedAnalytics(period);

      return res.status(200).json(
        new AdminResponseDTO(result.success, 'Analytics retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AdminResponseDTO(false, 'Failed to get analytics', null, [error.message])
      );
    }
  }
}

module.exports = new AdminController();