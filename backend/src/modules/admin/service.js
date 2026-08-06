const {
  AdminRole,
  AdminUser,
  AuditLog,
  ModerationLog,
  Report,
  SystemSetting,
  SystemHealthLog,
  PlatformStatistic,
} = require('./model');
const User = require('../users/users.model');
const {
  AdminRoleDTO,
  AdminUserDTO,
  AdminUserSummaryDTO,
  AuditLogDTO,
  ModerationLogDTO,
  ReportDTO,
  ReportSummaryDTO,
  SystemSettingDTO,
  SystemHealthDTO,
  PlatformStatisticDTO,
  DashboardStatsDTO,
} = require('./dto');
const {
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  AUDIT_ACTION_TYPES,
  AUDIT_RESOURCE_TYPES,
} = require('./constants');

class AdminService {
  async logAudit(action, resourceType, resourceId, performedBy, details = {}, changes = null, status = 'success') {
    try {
      const user = await User.findById(performedBy).select('email');
      const auditLog = await AuditLog.create({
        action,
        resourceType,
        resourceId,
        performedBy,
        performedByEmail: user?.email || null,
        actionDetails: details,
        changes: changes || { before: null, after: null },
        ipAddress: details.ipAddress || null,
        userAgent: details.userAgent || null,
        status,
        errorMessage: details.errorMessage || null,
      });
      return auditLog;
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  }

  async createRole(roleData, createdBy) {
    try {
      const existingRole = await AdminRole.findOne({ name: roleData.name });
      if (existingRole) {
        throw new Error('Role with this name already exists');
      }

      const permissions = roleData.permissions || DEFAULT_ROLE_PERMISSIONS[roleData.name] || [];

      const role = await AdminRole.create({
        ...roleData,
        permissions,
        createdBy,
      });

      await this.logAudit(
        AUDIT_ACTION_TYPES.CREATE,
        AUDIT_RESOURCE_TYPES.ROLE,
        role._id,
        createdBy,
        { roleName: role.name }
      );

      return {
        success: true,
        data: new AdminRoleDTO(role),
        message: 'Role created successfully',
      };
    } catch (error) {
      throw new Error(`Failed to create role: ${error.message}`);
    }
  }

  async getAllRoles(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;
      const roles = await AdminRole.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await AdminRole.countDocuments({});

      return {
        success: true,
        data: {
          data: roles.map((r) => new AdminRoleDTO(r)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get roles: ${error.message}`);
    }
  }

  async getRoleById(roleId) {
    try {
      const role = await AdminRole.findById(roleId).lean();
      if (!role) {
        throw new Error('Role not found');
      }
      return {
        success: true,
        data: new AdminRoleDTO(role),
      };
    } catch (error) {
      throw new Error(`Failed to get role: ${error.message}`);
    }
  }

  async updateRole(roleId, updates, performedBy) {
    try {
      const role = await AdminRole.findByIdAndUpdate(
        roleId,
        updates,
        { new: true, runValidators: true }
      );

      if (!role) {
        throw new Error('Role not found');
      }

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.ROLE,
        roleId,
        performedBy,
        { roleName: role.name, updates }
      );

      return {
        success: true,
        data: new AdminRoleDTO(role),
        message: 'Role updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update role: ${error.message}`);
    }
  }

  async deleteRole(roleId, performedBy) {
    try {
      const role = await AdminRole.findById(roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      if (role.isSystemRole) {
        throw new Error('Cannot delete system roles');
      }

      await AdminRole.findByIdAndDelete(roleId);

      await this.logAudit(
        AUDIT_ACTION_TYPES.DELETE,
        AUDIT_RESOURCE_TYPES.ROLE,
        roleId,
        performedBy,
        { roleName: role.name }
      );

      return {
        success: true,
        message: 'Role deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete role: ${error.message}`);
    }
  }

  async assignRoleToUser(userId, role, permissions = null, performedBy) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== 'admin') {
        throw new Error('User must have admin role in User model');
      }

      let adminUser = await AdminUser.findOne({ userId });

      if (adminUser) {
        adminUser.role = role;
        if (permissions) adminUser.permissions = permissions;
        adminUser.lastLoginAt = new Date();
        await adminUser.save();
      } else {
        const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
        adminUser = await AdminUser.create({
          userId,
          role,
          permissions: permissions || defaultPermissions,
          isSuperAdmin: role === 'super_admin',
          lastLoginAt: new Date(),
        });
      }

      await this.logAudit(
        AUDIT_ACTION_TYPES.ASSIGN,
        AUDIT_RESOURCE_TYPES.USER,
        userId,
        performedBy,
        { assignedRole: role, targetUser: userId }
      );

      return {
        success: true,
        data: new AdminUserDTO(adminUser),
        message: 'Role assigned successfully',
      };
    } catch (error) {
      throw new Error(`Failed to assign role: ${error.message}`);
    }
  }

  async getAllAdminUsers(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;
      const adminUsers = await AdminUser.find({})
        .populate('userId', 'fullName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await AdminUser.countDocuments({});

      return {
        success: true,
        data: {
          data: adminUsers.map((a) => new AdminUserSummaryDTO(a)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get admin users: ${error.message}`);
    }
  }

  async getAdminUserById(adminUserId) {
    try {
      const adminUser = await AdminUser.findById(adminUserId)
        .populate('userId', 'fullName email role')
        .lean();

      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      return {
        success: true,
        data: new AdminUserDTO(adminUser),
      };
    } catch (error) {
      throw new Error(`Failed to get admin user: ${error.message}`);
    }
  }

  async updateAdminUser(adminUserId, updates, performedBy) {
    try {
      const adminUser = await AdminUser.findByIdAndUpdate(
        adminUserId,
        updates,
        { new: true, runValidators: true }
      );

      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.USER,
        adminUserId,
        performedBy,
        { updates }
      );

      return {
        success: true,
        data: new AdminUserDTO(adminUser),
        message: 'Admin user updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update admin user: ${error.message}`);
    }
  }

  async getAuditLogs(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      if (filters.action) query.action = filters.action;
      if (filters.resourceType) query.resourceType = filters.resourceType;
      if (filters.resourceId) query.resourceId = filters.resourceId;
      if (filters.performedBy) query.performedBy = filters.performedBy;
      if (filters.status) query.status = filters.status;

      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      const logs = await AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await AuditLog.countDocuments(query);

      return {
        success: true,
        data: {
          data: logs.map((l) => new AuditLogDTO(l)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get audit logs: ${error.message}`);
    }
  }

  async moderateResource(resourceType, resourceId, status, moderatedBy, notes = null, rejectionReason = null) {
    try {
      const moderationLog = await ModerationLog.create({
        resourceType,
        resourceId,
        status,
        moderatedBy,
        moderationNotes: notes,
        rejectionReason,
        reviewedAt: new Date(),
      });

      await this.logAudit(
        AUDIT_ACTION_TYPES.MODERATE,
        AUDIT_RESOURCE_TYPES[resourceType.toUpperCase()] || AUDIT_RESOURCE_TYPES.SYSTEM,
        resourceId,
        moderatedBy,
        { moderationStatus: status, resourceType }
      );

      return {
        success: true,
        data: new ModerationLogDTO(moderationLog),
        message: `Resource moderated successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to moderate resource: ${error.message}`);
    }
  }

  async getModerationLogs(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      if (filters.resourceType) query.resourceType = filters.resourceType;
      if (filters.resourceId) query.resourceId = filters.resourceId;
      if (filters.status) query.status = filters.status;
      if (filters.moderatedBy) query.moderatedBy = filters.moderatedBy;

      const logs = await ModerationLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await ModerationLog.countDocuments(query);

      return {
        success: true,
        data: {
          data: logs.map((l) => new ModerationLogDTO(l)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get moderation logs: ${error.message}`);
    }
  }

  async getReports(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      if (filters.reportType) query.reportType = filters.reportType;
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.assignedTo) query.assignedTo = filters.assignedTo;

      const reports = await Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Report.countDocuments(query);

      return {
        success: true,
        data: {
          data: reports.map((r) => new ReportSummaryDTO(r)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get reports: ${error.message}`);
    }
  }

  async getReportById(reportId) {
    try {
      const report = await Report.findById(reportId).lean();
      if (!report) {
        throw new Error('Report not found');
      }
      return {
        success: true,
        data: new ReportDTO(report),
      };
    } catch (error) {
      throw new Error(`Failed to get report: ${error.message}`);
    }
  }

  async createReport(reportData, reportedBy) {
    try {
      const report = await Report.create({
        ...reportData,
        reportedBy,
      });

      await this.logAudit(
        AUDIT_ACTION_TYPES.CREATE,
        AUDIT_RESOURCE_TYPES.REPORT,
        report._id,
        reportedBy,
        { reportType: report.reportType }
      );

      return {
        success: true,
        data: new ReportDTO(report),
        message: 'Report created successfully',
      };
    } catch (error) {
      throw new Error(`Failed to create report: ${error.message}`);
    }
  }

  async updateReport(reportId, updates, performedBy) {
    try {
      const report = await Report.findByIdAndUpdate(
        reportId,
        {
          ...updates,
          reviewedBy: performedBy,
          reviewedAt: new Date(),
        },
        { new: true, runValidators: true }
      );

      if (!report) {
        throw new Error('Report not found');
      }

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.REPORT,
        reportId,
        performedBy,
        { reportStatus: report.status }
      );

      return {
        success: true,
        data: new ReportDTO(report),
        message: 'Report updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update report: ${error.message}`);
    }
  }

  async getSystemSettings(filters = {}) {
    try {
      const query = {};
      if (filters.category) query.category = filters.category;
      if (filters.isPublic !== undefined) {
        query.isPublic = filters.isPublic === 'true' || filters.isPublic === true;
      }

      const settings = await SystemSetting.find(query).sort({ category: 1, key: 1 }).lean();

      return {
        success: true,
        data: settings.map((s) => new SystemSettingDTO(s)),
      };
    } catch (error) {
      throw new Error(`Failed to get system settings: ${error.message}`);
    }
  }

  async getSystemSettingById(settingId) {
    try {
      const setting = await SystemSetting.findById(settingId).lean();
      if (!setting) {
        throw new Error('Setting not found');
      }
      return {
        success: true,
        data: new SystemSettingDTO(setting),
      };
    } catch (error) {
      throw new Error(`Failed to get system setting: ${error.message}`);
    }
  }

  async createSystemSetting(settingData, updatedBy) {
    try {
      const existing = await SystemSetting.findOne({ key: settingData.key });
      if (existing) {
        throw new Error('Setting with this key already exists');
      }

      const setting = await SystemSetting.create({
        ...settingData,
        updatedBy,
      });

      await this.logAudit(
        AUDIT_ACTION_TYPES.CREATE,
        AUDIT_RESOURCE_TYPES.SETTING,
        setting._id,
        updatedBy,
        { settingKey: setting.key }
      );

      return {
        success: true,
        data: new SystemSettingDTO(setting),
        message: 'System setting created successfully',
      };
    } catch (error) {
      throw new Error(`Failed to create system setting: ${error.message}`);
    }
  }

  async updateSystemSetting(settingId, updates, updatedBy) {
    try {
      const setting = await SystemSetting.findByIdAndUpdate(
        settingId,
        { ...updates, updatedBy },
        { new: true, runValidators: true }
      );

      if (!setting) {
        throw new Error('Setting not found');
      }

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.SETTING,
        settingId,
        updatedBy,
        { settingKey: setting.key, updates }
      );

      return {
        success: true,
        data: new SystemSettingDTO(setting),
        message: 'System setting updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update system setting: ${error.message}`);
    }
  }

  async logSystemHealth(component, status, metrics = {}, message = '') {
    try {
      const healthLog = await SystemHealthLog.create({
        component,
        status,
        metrics,
        message,
        checkedAt: new Date(),
      });
      return healthLog;
    } catch (error) {
      console.error('Failed to log system health:', error);
    }
  }

  async getSystemHealth(filters = {}, limit = 50) {
    try {
      const query = {};
      if (filters.component) query.component = filters.component;
      if (filters.status) query.status = filters.status;

      const healthLogs = await SystemHealthLog.find(query)
        .sort({ checkedAt: -1 })
        .limit(limit)
        .lean();

      const components = {};
      healthLogs.forEach((log) => {
        if (!components[log.component]) {
          components[log.component] = new SystemHealthDTO(log);
        }
      });

      return {
        success: true,
        data: {
          components: Object.values(components),
          recentLogs: healthLogs.slice(0, 20).map((l) => new SystemHealthDTO(l)),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get system health: ${error.message}`);
    }
  }

  async getPlatformStatistics(filters = {}) {
    try {
      const query = {};
      if (filters.period) query.period = filters.period;
      if (filters.metricName) query.metricName = filters.metricName;

      const statistics = await PlatformStatistic.find(query).sort({ metricName: 1 }).lean();

      return {
        success: true,
        data: statistics.map((s) => new PlatformStatisticDTO(s)),
      };
    } catch (error) {
      throw new Error(`Failed to get platform statistics: ${error.message}`);
    }
  }

  async updatePlatformStatistic(metricName, value, change = 0, metadata = {}) {
    try {
      const statistic = await PlatformStatistic.findOneAndUpdate(
        { metricName },
        {
          value,
          change,
          changePercentage: change !== 0 ? ((change / (value - change)) * 100) || 0 : 0,
          metadata,
          lastUpdated: new Date(),
        },
        { upsert: true, new: true }
      );

      return {
        success: true,
        data: new PlatformStatisticDTO(statistic),
      };
    } catch (error) {
      throw new Error(`Failed to update platform statistic: ${error.message}`);
    }
  }

  async getDashboardStats() {
    try {
      const User = require('../users/users.model');
      const totalUsers = await User.countDocuments({});
      const newUsersToday = await User.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      });

      const Organization = require('../organizations/model').Organization;
      const totalOrganizations = await Organization.countDocuments({});

      const Tender = require('../tenders/model').Tender;
      const totalTenders = await Tender.countDocuments({});
      const activeTenders = await Tender.countDocuments({ status: 'published' });
      const newTendersToday = await Tender.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      });

      const Bid = require('../bids/model').Bid;
      const totalBids = await Bid.countDocuments({});

      const pendingModeration = await ModerationLog.countDocuments({ status: 'pending' });
      const openReports = await Report.countDocuments({ status: { $in: ['open', 'under_review'] } });

      const healthLogs = await SystemHealthLog.find({})
        .sort({ checkedAt: -1 })
        .limit(10)
        .lean();

      const unhealthyComponents = healthLogs.filter(
        (log) => log.status === 'critical' || log.status === 'down'
      );
      const systemHealth = unhealthyComponents.length > 0 ? 'degraded' : 'healthy';

      return {
        success: true,
        data: new DashboardStatsDTO({
          totalUsers,
          totalOrganizations,
          totalTenders,
          totalBids,
          activeTenders,
          pendingModeration,
          openReports,
          systemHealth,
          newUsersToday,
          newTendersToday,
        }),
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
  }

  async searchUsers(search, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
        ];
      }

      if (filters.role) query.role = filters.role;
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive === 'true' || filters.isActive === true;
      }

      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await User.countDocuments(query);

      return {
        success: true,
        data: {
          data: users.map((u) => ({
            id: u._id,
            fullName: u.fullName,
            email: u.email,
            role: u.role,
            isActive: u.isActive,
            createdAt: u.createdAt,
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }

  async getOrganizations(search, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const Organization = require('../organizations/model').Organization;
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { registrationNumber: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      if (filters.isVerified !== undefined) {
        query.isVerified = filters.isVerified === 'true' || filters.isVerified === true;
      }

      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive === 'true' || filters.isActive === true;
      }

      const organizations = await Organization.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Organization.countDocuments(query);

      return {
        success: true,
        data: {
          data: organizations.map((o) => ({
            id: o._id,
            name: o.name,
            registrationNumber: o.registrationNumber,
            email: o.email,
            isVerified: o.isVerified || false,
            isActive: o.isActive || true,
            createdAt: o.createdAt,
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get organizations: ${error.message}`);
    }
  }

  async verifyOrganization(organizationId, isVerified, verificationNotes = null, performedBy) {
    try {
      const Organization = require('../organizations/model').Organization;
      const organization = await Organization.findByIdAndUpdate(
        organizationId,
        {
          isVerified,
          verificationNotes,
          verifiedAt: isVerified ? new Date() : null,
        },
        { new: true, runValidators: true }
      );

      if (!organization) {
        throw new Error('Organization not found');
      }

      await this.logAudit(
        AUDIT_ACTION_TYPES.VERIFY,
        AUDIT_RESOURCE_TYPES.ORGANIZATION,
        organizationId,
        performedBy,
        { isVerified, verificationNotes }
      );

      return {
        success: true,
        message: 'Organization verification updated',
      };
    } catch (error) {
      throw new Error(`Failed to verify organization: ${error.message}`);
    }
  }

  async getTenders(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const Tender = require('../tenders/model').Tender;
      const query = {};

      if (filters.status) query.status = filters.status;
      if (filters.category) query.category = filters.category;

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { tenderNumber: { $regex: filters.search, $options: 'i' } },
        ];
      }

      const tenders = await Tender.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Tender.countDocuments(query);

      return {
        success: true,
        data: {
          data: tenders.map((t) => ({
            id: t._id,
            title: t.title,
            tenderNumber: t.tenderNumber,
            status: t.status,
            category: t.category,
            createdAt: t.createdAt,
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get tenders: ${error.message}`);
    }
  }

  async getBids(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const Bid = require('../bids/model').Bid;
      const query = {};

      if (filters.status) query.status = filters.status;
      if (filters.tenderId) query.tenderId = filters.tenderId;

      if (filters.search) {
        query.$or = [
          { bidReference: { $regex: filters.search, $options: 'i' } },
          { bidderName: { $regex: filters.search, $options: 'i' } },
        ];
      }

      const bids = await Bid.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Bid.countDocuments(query);

      return {
        success: true,
        data: {
          data: bids.map((b) => ({
            id: b._id,
            bidReference: b.bidReference,
            status: b.status,
            tenderId: b.tenderId,
            createdAt: b.createdAt,
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get bids: ${error.message}`);
    }
  }

  async getCategories(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const Category = require('../categories/model').Category;
      const query = {};

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { code: { $regex: filters.search, $options: 'i' } },
        ];
      }

      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive === 'true' || filters.isActive === true;
      }

      const categories = await Category.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Category.countDocuments(query);

      return {
        success: true,
        data: {
          data: categories.map((c) => ({
            id: c._id,
            name: c.name,
            code: c.code,
            isActive: c.isActive,
            createdAt: c.createdAt,
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  async createCategory(categoryData, createdBy) {
    try {
      const Category = require('../categories/model').Category;
      const category = await Category.create({
        ...categoryData,
        createdBy,
      });

      await this.logAudit(
        AUDIT_ACTION_TYPES.CREATE,
        AUDIT_RESOURCE_TYPES.CATEGORY,
        category._id,
        createdBy,
        { categoryName: category.name }
      );

      return {
        success: true,
        data: {
          id: category._id,
          name: category.name,
          code: category.code,
          isActive: category.isActive,
        },
        message: 'Category created successfully',
      };
    } catch (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  async updateCategory(categoryId, updates, performedBy) {
    try {
      const Category = require('../categories/model').Category;
      const category = await Category.findByIdAndUpdate(
        categoryId,
        updates,
        { new: true, runValidators: true }
      );

      if (!category) {
        throw new Error('Category not found');
      }

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.CATEGORY,
        categoryId,
        performedBy,
        { categoryName: category.name, updates }
      );

      return {
        success: true,
        message: 'Category updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  async deleteCategory(categoryId, performedBy) {
    try {
      const Category = require('../categories/model').Category;
      const category = await Category.findById(categoryId);

      if (!category) {
        throw new Error('Category not found');
      }

      await Category.findByIdAndDelete(categoryId);

      await this.logAudit(
        AUDIT_ACTION_TYPES.DELETE,
        AUDIT_RESOURCE_TYPES.CATEGORY,
        categoryId,
        performedBy,
        { categoryName: category.name }
      );

      return {
        success: true,
        message: 'Category deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }

  async suspendUser(userId, reason, performedBy) {
    try {
      const User = require('../users/users.model');
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      user.isActive = false;
      user.status = 'suspended';
      await user.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.USER,
        userId,
        performedBy,
        { action: 'suspend_user', reason }
      );

      return {
        success: true,
        message: 'User suspended successfully',
      };
    } catch (error) {
      throw new Error(`Failed to suspend user: ${error.message}`);
    }
  }

  async reactivateUser(userId, performedBy) {
    try {
      const User = require('../users/users.model');
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      user.isActive = true;
      user.status = 'active';
      await user.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.USER,
        userId,
        performedBy,
        { action: 'reactivate_user' }
      );

      return {
        success: true,
        message: 'User reactivated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to reactivate user: ${error.message}`);
    }
  }

  async deleteUser(userId, performedBy) {
    try {
      const User = require('../users/users.model');
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      user.isDeleted = true;
      user.deletedAt = new Date();
      await user.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.DELETE,
        AUDIT_RESOURCE_TYPES.USER,
        userId,
        performedBy,
        { action: 'soft_delete_user' }
      );

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async resetUserPassword(userId, newPassword, performedBy) {
    try {
      const User = require('../users/users.model');
      const bcrypt = require('bcryptjs');

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.passwordChangedAt = new Date();
      await user.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.USER,
        userId,
        performedBy,
        { action: 'reset_password' }
      );

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      throw new Error(`Failed to reset password: ${error.message}`);
    }
  }

  async forceLogoutUser(userId, performedBy) {
    try {
      const Session = require('../auth/model').Session;
      await Session.deleteMany({ userId });

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.USER,
        userId,
        performedBy,
        { action: 'force_logout' }
      );

      return {
        success: true,
        message: 'User logged out from all sessions',
      };
    } catch (error) {
      throw new Error(`Failed to force logout: ${error.message}`);
    }
  }

  async getUserLoginHistory(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const AuditLog = require('./model').AuditLog;

      const logs = await AuditLog.find({
        performedBy: userId,
        action: AUDIT_ACTION_TYPES.LOGIN,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await AuditLog.countDocuments({
        performedBy: userId,
        action: AUDIT_ACTION_TYPES.LOGIN,
      });

      return {
        success: true,
        data: {
          data: logs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get login history: ${error.message}`);
    }
  }

  async suspendOrganization(organizationId, reason, performedBy) {
    try {
      const Organization = require('../organizations/model').Organization;
      const org = await Organization.findById(organizationId);

      if (!org) {
        throw new Error('Organization not found');
      }

      org.isActive = false;
      org.status = 'suspended';
      await org.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.ORGANIZATION,
        organizationId,
        performedBy,
        { action: 'suspend_organization', reason }
      );

      return {
        success: true,
        message: 'Organization suspended successfully',
      };
    } catch (error) {
      throw new Error(`Failed to suspend organization: ${error.message}`);
    }
  }

  async reactivateOrganization(organizationId, performedBy) {
    try {
      const Organization = require('../organizations/model').Organization;
      const org = await Organization.findById(organizationId);

      if (!org) {
        throw new Error('Organization not found');
      }

      org.isActive = true;
      org.status = 'active';
      await org.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.ORGANIZATION,
        organizationId,
        performedBy,
        { action: 'reactivate_organization' }
      );

      return {
        success: true,
        message: 'Organization reactivated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to reactivate organization: ${error.message}`);
    }
  }

  async approveOrganizationDocument(documentId, performedBy) {
    try {
      const OrganizationDocument = require('../organizations/model').OrganizationDocument;
      const doc = await OrganizationDocument.findById(documentId);

      if (!doc) {
        throw new Error('Document not found');
      }

      doc.status = 'verified';
      doc.verifiedBy = performedBy;
      doc.verifiedAt = new Date();
      await doc.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.APPROVE,
        AUDIT_RESOURCE_TYPES.ORGANIZATION,
        doc.organizationId,
        performedBy,
        { action: 'approve_document', documentId }
      );

      return {
        success: true,
        message: 'Document approved successfully',
      };
    } catch (error) {
      throw new Error(`Failed to approve document: ${error.message}`);
    }
  }

  async rejectOrganizationDocument(documentId, reason, performedBy) {
    try {
      const OrganizationDocument = require('../organizations/model').OrganizationDocument;
      const doc = await OrganizationDocument.findById(documentId);

      if (!doc) {
        throw new Error('Document not found');
      }

      doc.status = 'rejected';
      doc.rejectionReason = reason;
      doc.verifiedBy = performedBy;
      doc.verifiedAt = new Date();
      await doc.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.REJECT,
        AUDIT_RESOURCE_TYPES.ORGANIZATION,
        doc.organizationId,
        performedBy,
        { action: 'reject_document', documentId }
      );

      return {
        success: true,
        message: 'Document rejected successfully',
      };
    } catch (error) {
      throw new Error(`Failed to reject document: ${error.message}`);
    }
  }

  async publishTender(tenderId, performedBy) {
    try {
      const Tender = require('../tenders/model').Tender;
      const tender = await Tender.findById(tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

      tender.status = 'published';
      tender.publishedAt = new Date();
      await tender.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.PUBLISH,
        AUDIT_RESOURCE_TYPES.TENDER,
        tenderId,
        performedBy,
        { action: 'publish_tender' }
      );

      return {
        success: true,
        message: 'Tender published successfully',
      };
    } catch (error) {
      throw new Error(`Failed to publish tender: ${error.message}`);
    }
  }

  async unpublishTender(tenderId, performedBy) {
    try {
      const Tender = require('../tenders/model').Tender;
      const tender = await Tender.findById(tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

      tender.status = 'draft';
      await tender.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.UNPUBLISH,
        AUDIT_RESOURCE_TYPES.TENDER,
        tenderId,
        performedBy,
        { action: 'unpublish_tender' }
      );

      return {
        success: true,
        message: 'Tender unpublished successfully',
      };
    } catch (error) {
      throw new Error(`Failed to unpublish tender: ${error.message}`);
    }
  }

  async archiveTender(tenderId, performedBy) {
    try {
      const Tender = require('../tenders/model').Tender;
      const tender = await Tender.findById(tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

      tender.isArchived = true;
      tender.archivedAt = new Date();
      await tender.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.TENDER,
        tenderId,
        performedBy,
        { action: 'archive_tender' }
      );

      return {
        success: true,
        message: 'Tender archived successfully',
      };
    } catch (error) {
      throw new Error(`Failed to archive tender: ${error.message}`);
    }
  }

  async restoreTender(tenderId, performedBy) {
    try {
      const Tender = require('../tenders/model').Tender;
      const tender = await Tender.findById(tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

      tender.isArchived = false;
      tender.archivedAt = null;
      await tender.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.TENDER,
        tenderId,
        performedBy,
        { action: 'restore_tender' }
      );

      return {
        success: true,
        message: 'Tender restored successfully',
      };
    } catch (error) {
      throw new Error(`Failed to restore tender: ${error.message}`);
    }
  }

  async deleteTender(tenderId, performedBy) {
    try {
      const Tender = require('../tenders/model').Tender;
      const tender = await Tender.findById(tenderId);

      if (!tender) {
        throw new Error('Tender not found');
      }

      tender.isDeleted = true;
      tender.deletedAt = new Date();
      await tender.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.DELETE,
        AUDIT_RESOURCE_TYPES.TENDER,
        tenderId,
        performedBy,
        { action: 'delete_tender' }
      );

      return {
        success: true,
        message: 'Tender deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete tender: ${error.message}`);
    }
  }

  async forceWithdrawBid(bidId, reason, performedBy) {
    try {
      const Bid = require('../bids/model').Bid;
      const bid = await Bid.findById(bidId);

      if (!bid) {
        throw new Error('Bid not found');
      }

      bid.status = 'withdrawn';
      bid.withdrawalReason = reason;
      bid.withdrawnBy = performedBy;
      bid.withdrawnAt = new Date();
      await bid.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.BID,
        bidId,
        performedBy,
        { action: 'force_withdraw_bid', reason }
      );

      return {
        success: true,
        message: 'Bid withdrawn successfully',
      };
    } catch (error) {
      throw new Error(`Failed to withdraw bid: ${error.message}`);
    }
  }

  async flagBid(bidId, reason, performedBy) {
    try {
      const Bid = require('../bids/model').Bid;
      const bid = await Bid.findById(bidId);

      if (!bid) {
        throw new Error('Bid not found');
      }

      bid.isFlagged = true;
      bid.flagReason = reason;
      bid.flaggedAt = new Date();
      await bid.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.MODERATE,
        AUDIT_RESOURCE_TYPES.BID,
        bidId,
        performedBy,
        { action: 'flag_bid', reason }
      );

      return {
        success: true,
        message: 'Bid flagged successfully',
      };
    } catch (error) {
      throw new Error(`Failed to flag bid: ${error.message}`);
    }
  }

  async broadcastNotification(notificationData, performedBy) {
    try {
      const Notification = require('../notifications/model').Notification;
      const { title, message, type = 'info', targetAudience = 'all' } = notificationData;

      const notifications = [];
      const User = require('../users/users.model');

      let query = {};
      if (targetAudience === 'buyers') {
        query = { role: 'buyer' };
      } else if (targetAudience === 'sellers') {
        query = { role: 'seller' };
      } else if (targetAudience === 'admins') {
        query = { role: 'admin' };
      }

      const users = await User.find(query).select('_id');
      const userIds = users.map(u => u._id);

      const notificationDocs = userIds.map(userId => ({
        userId,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date(),
      }));

      await Notification.insertMany(notificationDocs);

      await this.logAudit(
        AUDIT_ACTION_TYPES.CREATE,
        AUDIT_RESOURCE_TYPES.SYSTEM,
        null,
        performedBy,
        { action: 'broadcast_notification', targetAudience, count: userIds.length }
      );

      return {
        success: true,
        message: `Notification broadcasted to ${userIds.length} users`,
        data: { count: userIds.length },
      };
    } catch (error) {
      throw new Error(`Failed to broadcast notification: ${error.message}`);
    }
  }

  async sendTargetedNotification(userId, notificationData, performedBy) {
    try {
      const Notification = require('../notifications/model').Notification;
      const { title, message, type = 'info' } = notificationData;

      const notification = await Notification.create({
        userId,
        title,
        message,
        type,
        isRead: false,
      });

      await this.logAudit(
        AUDIT_ACTION_TYPES.CREATE,
        AUDIT_RESOURCE_TYPES.SYSTEM,
        null,
        performedBy,
        { action: 'send_targeted_notification', userId }
      );

      return {
        success: true,
        data: notification,
        message: 'Notification sent successfully',
      };
    } catch (error) {
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  async retryFailedNotification(notificationId, performedBy) {
    try {
      const Notification = require('../notifications/model').Notification;
      const notification = await Notification.findById(notificationId);

      if (!notification) {
        throw new Error('Notification not found');
      }

      notification.deliveryStatus = 'pending';
      notification.retryCount = (notification.retryCount || 0) + 1;
      await notification.save();

      await this.logAudit(
        AUDIT_ACTION_TYPES.UPDATE,
        AUDIT_RESOURCE_TYPES.SYSTEM,
        notificationId,
        performedBy,
        { action: 'retry_notification' }
      );

      return {
        success: true,
        message: 'Notification retry initiated',
      };
    } catch (error) {
      throw new Error(`Failed to retry notification: ${error.message}`);
    }
  }

  async getFailedNotifications(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const Notification = require('../notifications/model').Notification;

      const notifications = await Notification.find({
        deliveryStatus: 'failed',
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Notification.countDocuments({
        deliveryStatus: 'failed',
      });

      return {
        success: true,
        data: {
          data: notifications,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get failed notifications: ${error.message}`);
    }
  }

  async getSecurityMetrics() {
    try {
      const AuditLog = require('./model').AuditLog;
      const User = require('../users/users.model');

      const now = new Date();
      const last24Hours = new Date(now - 24 * 60 * 60 * 1000);

      const failedLogins = await AuditLog.countDocuments({
        action: AUDIT_ACTION_TYPES.LOGIN,
        status: 'failure',
        createdAt: { $gte: last24Hours },
      });

      const suspiciousActivities = await AuditLog.countDocuments({
        status: 'failure',
        createdAt: { $gte: last24Hours },
      });

      const activeUsers = await User.countDocuments({
        isActive: true,
      });

      const suspendedUsers = await User.countDocuments({
        status: 'suspended',
      });

      const blockedRequests = await AuditLog.countDocuments({
        action: 'rate_limit_exceeded',
        createdAt: { $gte: last24Hours },
      });

      const roleChanges = await AuditLog.countDocuments({
        action: AUDIT_ACTION_TYPES.ASSIGN,
        resourceType: AUDIT_RESOURCE_TYPES.USER,
        createdAt: { $gte: last24Hours },
      });

      return {
        success: true,
        data: {
          failedLogins,
          suspiciousActivities,
          activeUsers,
          suspendedUsers,
          blockedRequests,
          roleChanges,
          period: 'last_24_hours',
        },
      };
    } catch (error) {
      throw new Error(`Failed to get security metrics: ${error.message}`);
    }
  }

  async getDetailedAnalytics(period = '30d') {
    try {
      const User = require('../users/users.model');
      const Organization = require('../organizations/model').Organization;
      const Tender = require('../tenders/model').Tender;
      const Bid = require('../bids/model').Bid;

      const now = new Date();
      let startDate;
      switch (period) {
        case '7d':
          startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      }

      const newUserCount = await User.countDocuments({
        createdAt: { $gte: startDate },
      });

      const newOrganizationCount = await Organization.countDocuments({
        createdAt: { $gte: startDate },
      });

      const newTenderCount = await Tender.countDocuments({
        createdAt: { $gte: startDate },
      });

      const newBidCount = await Bid.countDocuments({
        createdAt: { $gte: startDate },
      });

      const totalUsers = await User.countDocuments({});
      const totalOrganizations = await Organization.countDocuments({});
      const totalTenders = await Tender.countDocuments({});
      const totalBids = await Bid.countDocuments({});

      const userGrowth = ((newUserCount / (totalUsers - newUserCount || 1)) * 100).toFixed(2);
      const organizationGrowth = ((newOrganizationCount / (totalOrganizations - newOrganizationCount || 1)) * 100).toFixed(2);
      const tenderGrowth = ((newTenderCount / (totalTenders - newTenderCount || 1)) * 100).toFixed(2);
      const bidGrowth = ((newBidCount / (totalBids - newBidCount || 1)) * 100).toFixed(2);

      const topCategories = await Tender.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      const topBuyers = await Tender.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$createdBy', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      const topSellers = await Bid.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$vendorId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      return {
        success: true,
        data: {
          summary: {
            totalUsers,
            totalOrganizations,
            totalTenders,
            totalBids,
            newUserCount,
            newOrganizationCount,
            newTenderCount,
            newBidCount,
            userGrowth: parseFloat(userGrowth),
            organizationGrowth: parseFloat(organizationGrowth),
            tenderGrowth: parseFloat(tenderGrowth),
            bidGrowth: parseFloat(bidGrowth),
          },
          topCategories,
          topBuyers,
          topSellers,
          period,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }
}

module.exports = new AdminService();