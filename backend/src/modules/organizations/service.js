const {
  Organization,
  OrganizationMember,
  OrganizationDocument,
} = require('./model');
const {
  OrganizationDTO,
  OrganizationSummaryDTO,
  OrganizationMemberDTO,
  OrganizationDocumentDTO,
  FeaturedOrganizationDTO,
} = require('./dto');
const {
  PROFILE_COMPLETENESS_FIELDS,
  VERIFICATION_STATUS,
  MEMBER_ROLES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
} = require('./constants');

class OrganizationsService {
  _generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  _calculateProfileCompleteness(data) {
    const filledFields = PROFILE_COMPLETENESS_FIELDS.filter((field) => {
      const value = data[field];
      if (field === 'address') {
        return value && (value.city || value.street || value.state);
      }
      return value && value.toString().trim();
    });

    return Math.round((filledFields.length / PROFILE_COMPLETENESS_FIELDS.length) * 100);
  }

  async createOrganization(ownerId, organizationData) {
    try {
      const slug = organizationData.slug || this._generateSlug(organizationData.name);
      const profileCompleteness = this._calculateProfileCompleteness({
        ...organizationData,
        ownerId,
      });

      const organization = await Organization.create({
        ...organizationData,
        slug,
        ownerId,
        profileCompleteness,
      });

      await OrganizationMember.create({
        organizationId: organization._id,
        userId: ownerId,
        role: MEMBER_ROLES.OWNER,
        designation: 'Owner',
      });

      return {
        success: true,
        data: new OrganizationDTO(organization),
        message: 'Organization created successfully',
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Organization with this slug or registration already exists');
      }
      throw new Error(`Failed to create organization: ${error.message}`);
    }
  }

  async getOrganizationById(organizationId) {
    try {
      const organization = await Organization.findById(organizationId).lean();

      if (!organization || !organization.isActive) {
        throw new Error('Organization not found');
      }

      return {
        success: true,
        data: new OrganizationDTO(organization),
      };
    } catch (error) {
      throw new Error(`Failed to get organization: ${error.message}`);
    }
  }

  async updateOrganization(organizationId, updates) {
    try {
      const existing = await Organization.findById(organizationId);

      if (!existing || !existing.isActive) {
        throw new Error('Organization not found');
      }

      if (updates.name && !updates.slug) {
        updates.slug = this._generateSlug(updates.name);
      }

      const completenessData = { ...existing.toObject(), ...updates };
      updates.profileCompleteness = this._calculateProfileCompleteness(completenessData);

      const organization = await Organization.findByIdAndUpdate(
        organizationId,
        updates,
        { new: true, runValidators: true }
      );

      return {
        success: true,
        data: new OrganizationDTO(organization),
        message: 'Organization updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update organization: ${error.message}`);
    }
  }

  async deleteOrganization(organizationId) {
    try {
      const organization = await Organization.findByIdAndUpdate(
        organizationId,
        { isActive: false },
        { new: true }
      );

      if (!organization) {
        throw new Error('Organization not found');
      }

      await OrganizationMember.updateMany(
        { organizationId },
        { isActive: false }
      );

      return {
        success: true,
        message: 'Organization deactivated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete organization: ${error.message}`);
    }
  }

  async getAllOrganizations(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = { isActive: true };

      if (filters.type) query.type = filters.type;
      if (filters.verificationStatus) query.verificationStatus = filters.verificationStatus;
      if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured === 'true' || filters.isFeatured === true;

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { gstNumber: { $regex: filters.search, $options: 'i' } },
          { registrationNumber: { $regex: filters.search, $options: 'i' } },
          { panNumber: { $regex: filters.search, $options: 'i' } },
        ];
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
          data: organizations.map((org) => new OrganizationSummaryDTO(org)),
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

  async searchOrganizations(searchTerm, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;
      const query = {
        isActive: true,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { gstNumber: { $regex: searchTerm, $options: 'i' } },
          { registrationNumber: { $regex: searchTerm, $options: 'i' } },
          { panNumber: { $regex: searchTerm, $options: 'i' } },
          { gemSellerId: { $regex: searchTerm, $options: 'i' } },
        ],
      };

      const results = await Organization.find(query)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Organization.countDocuments(query);

      return {
        success: true,
        data: {
          data: results.map((org) => new OrganizationSummaryDTO(org)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to search organizations: ${error.message}`);
    }
  }

  async getFeaturedOrganizations(limit = 10) {
    try {
      const organizations = await Organization.find({
        isActive: true,
        isFeatured: true,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
      })
        .sort({ featuredOrder: 1, name: 1 })
        .limit(limit)
        .lean();

      return {
        success: true,
        data: organizations.map((org) => new FeaturedOrganizationDTO(org)),
      };
    } catch (error) {
      throw new Error(`Failed to get featured organizations: ${error.message}`);
    }
  }

  async getUserOrganizations(userId) {
    try {
      const memberships = await OrganizationMember.find({
        userId,
        isActive: true,
      }).lean();

      const organizationIds = memberships.map((m) => m.organizationId);

      const organizations = await Organization.find({
        _id: { $in: organizationIds },
        isActive: true,
      }).lean();

      const roleMap = memberships.reduce((acc, member) => {
        acc[member.organizationId.toString()] = member.role;
        return acc;
      }, {});

      return {
        success: true,
        data: organizations.map((org) => ({
          ...new OrganizationSummaryDTO(org),
          memberRole: roleMap[org._id.toString()] || 'member',
        })),
      };
    } catch (error) {
      throw new Error(`Failed to get user organizations: ${error.message}`);
    }
  }

  async verifyOrganization(organizationId, status, verificationNotes = null, verifiedBy = null) {
    try {
      const organization = await Organization.findByIdAndUpdate(
        organizationId,
        {
          verificationStatus: status,
          verificationNotes,
          verifiedBy,
          verificationDate: new Date(),
        },
        { new: true, runValidators: true }
      );

      if (!organization) {
        throw new Error('Organization not found');
      }

      return {
        success: true,
        data: new OrganizationDTO(organization),
        message: 'Organization verification status updated',
      };
    } catch (error) {
      throw new Error(`Failed to verify organization: ${error.message}`);
    }
  }

  async getOrganizationStatistics(organizationId) {
    try {
      const organization = await Organization.findById(organizationId).lean();

      if (!organization) {
        throw new Error('Organization not found');
      }

      const membersCount = await OrganizationMember.countDocuments({
        organizationId,
        isActive: true,
      });

      const documentsCount = await OrganizationDocument.countDocuments({ organizationId });
      const verifiedDocuments = await OrganizationDocument.countDocuments({
        organizationId,
        status: 'verified',
      });

      return {
        success: true,
        data: {
          profileCompleteness: organization.profileCompleteness || 0,
          verificationStatus: organization.verificationStatus,
          membersCount,
          documentsCount,
          verifiedDocuments,
          isFeatured: organization.isFeatured || false,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get organization statistics: ${error.message}`);
    }
  }

  async addMember(organizationId, userId, role = 'member', designation = null) {
    try {
      const organization = await Organization.findOne({ _id: organizationId, isActive: true });

      if (!organization) {
        throw new Error('Organization not found');
      }

      const existingMember = await OrganizationMember.findOne({ organizationId, userId });

      if (existingMember) {
        if (existingMember.isActive) {
          throw new Error('User is already a member of this organization');
        }

        existingMember.isActive = true;
        existingMember.role = role;
        existingMember.designation = designation;
        existingMember.joinedAt = new Date();
        await existingMember.save();

        return {
          success: true,
          data: new OrganizationMemberDTO(existingMember),
          message: 'Member reactivated successfully',
        };
      }

      const member = await OrganizationMember.create({
        organizationId,
        userId,
        role,
        designation,
      });

      return {
        success: true,
        data: new OrganizationMemberDTO(member),
        message: 'Member added successfully',
      };
    } catch (error) {
      throw new Error(`Failed to add member: ${error.message}`);
    }
  }

  async getMembers(organizationId, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;

      const members = await OrganizationMember.find({
        organizationId,
        isActive: true,
      })
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await OrganizationMember.countDocuments({
        organizationId,
        isActive: true,
      });

      return {
        success: true,
        data: {
          data: members.map((m) => new OrganizationMemberDTO(m)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get members: ${error.message}`);
    }
  }

  async updateMember(memberId, updates) {
    try {
      const member = await OrganizationMember.findByIdAndUpdate(
        memberId,
        updates,
        { new: true, runValidators: true }
      );

      if (!member) {
        throw new Error('Member not found');
      }

      return {
        success: true,
        data: new OrganizationMemberDTO(member),
        message: 'Member updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update member: ${error.message}`);
    }
  }

  async removeMember(memberId) {
    try {
      const member = await OrganizationMember.findByIdAndUpdate(
        memberId,
        { isActive: false },
        { new: true }
      );

      if (!member) {
        throw new Error('Member not found');
      }

      if (member.role === MEMBER_ROLES.OWNER) {
        throw new Error('Cannot remove organization owner');
      }

      return {
        success: true,
        message: 'Member removed successfully',
      };
    } catch (error) {
      throw new Error(`Failed to remove member: ${error.message}`);
    }
  }

  async uploadDocument(organizationId, uploadedBy, documentData) {
    try {
      const organization = await Organization.findOne({ _id: organizationId, isActive: true });

      if (!organization) {
        throw new Error('Organization not found');
      }

      const document = await OrganizationDocument.create({
        organizationId,
        uploadedBy,
        ...documentData,
      });

      return {
        success: true,
        data: new OrganizationDocumentDTO(document),
        message: 'Document uploaded successfully',
      };
    } catch (error) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  async getDocuments(organizationId, status = null, documentType = null, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;
      const query = { organizationId };

      if (status) query.status = status;
      if (documentType) query.documentType = documentType;

      const documents = await OrganizationDocument.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await OrganizationDocument.countDocuments(query);

      return {
        success: true,
        data: {
          data: documents.map((d) => new OrganizationDocumentDTO(d)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get documents: ${error.message}`);
    }
  }

  async deleteDocument(documentId) {
    try {
      const document = await OrganizationDocument.findByIdAndDelete(documentId);

      if (!document) {
        throw new Error('Document not found');
      }

      return {
        success: true,
        message: 'Document deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  async updateDocumentVerification(documentId, status, verificationNotes = null, verifiedBy = null) {
    try {
      const document = await OrganizationDocument.findByIdAndUpdate(
        documentId,
        {
          status,
          verificationNotes,
          verifiedBy,
          verificationDate: new Date(),
        },
        { new: true, runValidators: true }
      );

      if (!document) {
        throw new Error('Document not found');
      }

      if (status === 'verified') {
        const orgDocuments = await OrganizationDocument.find({
          organizationId: document.organizationId,
        });

        const allVerified = orgDocuments.every(
          (doc) => doc.status === 'verified' || doc.status === 'expired'
        );

        if (allVerified && orgDocuments.length > 0) {
          await Organization.updateOne(
            { _id: document.organizationId },
            {
              verificationStatus: VERIFICATION_STATUS.VERIFIED,
              verificationDate: new Date(),
            }
          );
        }
      }

      return {
        success: true,
        data: new OrganizationDocumentDTO(document),
        message: 'Document verification status updated',
      };
    } catch (error) {
      throw new Error(`Failed to update document verification: ${error.message}`);
    }
  }
}

module.exports = new OrganizationsService();
