const { UserProfile, UserSettings, UserDocument, UserActivity, UserVerification } = require('./users.model');
const { UserProfileDTO, UserSettingsDTO, UserDocumentDTO, UserActivityDTO, UserSummaryDTO } = require('./users.dto');

class UsersService {
  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      let profile = await UserProfile.findOne({ userId });
      if (!profile) {
        profile = await UserProfile.create({ userId });
      }

      return {
        success: true,
        data: new UserProfileDTO(profile),
      };
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  /**
   * Create user profile
   */
  async createUserProfile(userId, profileData) {
    try {
      const existingProfile = await UserProfile.findOne({ userId });
      if (existingProfile) {
        throw new Error('Profile already exists for this user');
      }

      const profile = await UserProfile.create({
        userId,
        ...profileData,
      });

      return {
        success: true,
        data: new UserProfileDTO(profile),
        message: 'Profile created successfully',
      };
    } catch (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updates) {
    try {
      // Calculate profile completeness
      const profile = await UserProfile.findOne({ userId });
      if (!profile) {
        throw new Error('Profile not found');
      }

      const completenessData = { ...profile.toObject(), ...updates };
      let completeness = 0;
      const fields = ['firstName', 'lastName', 'email', 'phone', 'companyName', 'designation', 'bio'];
      const filledFields = fields.filter(field => completenessData[field] && completenessData[field].toString().trim());
      completeness = Math.round((filledFields.length / fields.length) * 100);

      const updatedProfile = await UserProfile.findOneAndUpdate(
        { userId },
        { ...updates, profileCompleteness: completeness },
        { new: true, runValidators: true }
      );

      return {
        success: true,
        data: new UserProfileDTO(updatedProfile),
        message: 'Profile updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId) {
    try {
      let settings = await UserSettings.findOne({ userId });
      if (!settings) {
        settings = await UserSettings.create({ userId });
      }

      return {
        success: true,
        data: new UserSettingsDTO(settings),
      };
    } catch (error) {
      throw new Error(`Failed to get user settings: ${error.message}`);
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId, updates) {
    try {
      const settings = await UserSettings.findOneAndUpdate(
        { userId },
        updates,
        { new: true, upsert: true, runValidators: true }
      );

      return {
        success: true,
        data: new UserSettingsDTO(settings),
        message: 'Settings updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update user settings: ${error.message}`);
    }
  }

  /**
   * Upload user document
   */
  async uploadUserDocument(userId, documentData) {
    try {
      const document = await UserDocument.create({
        userId,
        ...documentData,
      });

      return {
        success: true,
        data: new UserDocumentDTO(document),
        message: 'Document uploaded successfully',
      };
    } catch (error) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Get user documents
   */
  async getUserDocuments(userId, status = null, documentType = null, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = { userId };

      if (status) query.status = status;
      if (documentType) query.documentType = documentType;

      const documents = await UserDocument.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await UserDocument.countDocuments(query);

      return {
        success: true,
        data: {
          data: documents.map(d => new UserDocumentDTO(d)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get user documents: ${error.message}`);
    }
  }

  /**
   * Delete user document
   */
  async deleteUserDocument(documentId) {
    try {
      const document = await UserDocument.findByIdAndDelete(documentId);

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

  /**
   * Get user activity
   */
  async getUserActivity(userId, actionType = null, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = { userId };

      if (actionType) query.actionType = actionType;

      const activities = await UserActivity.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await UserActivity.countDocuments(query);

      return {
        success: true,
        data: {
          data: activities.map(a => new UserActivityDTO(a)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get user activity: ${error.message}`);
    }
  }

  /**
   * Log user activity
   */
  async logUserActivity(userId, action, actionType, ipAddress = null, userAgent = null, status = 'success') {
    try {
      const activity = await UserActivity.create({
        userId,
        action,
        actionType,
        ipAddress,
        userAgent,
        status,
      });

      return {
        success: true,
        data: new UserActivityDTO(activity),
        message: 'Activity logged',
      };
    } catch (error) {
      throw new Error(`Failed to log activity: ${error.message}`);
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(page = 1, limit = 10, search = null) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
        ];
      }

      const profiles = await UserProfile.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await UserProfile.countDocuments(query);

      return {
        success: true,
        data: {
          data: profiles.map(p => new UserSummaryDTO(p)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get all users: ${error.message}`);
    }
  }

  /**
   * Update document verification status
   */
  async updateDocumentVerification(documentId, status, verificationNotes = null, verifiedBy = null) {
    try {
      const document = await UserDocument.findByIdAndUpdate(
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

      // Update user profile verification status if all documents verified
      if (status === 'verified') {
        const userDocuments = await UserDocument.find({ userId: document.userId });
        const allVerified = userDocuments.every(doc => doc.status === 'verified' || doc.status === 'expired');

        if (allVerified) {
          await UserProfile.updateOne(
            { userId: document.userId },
            { documentVerification: true, verificationDate: new Date() }
          );
        }
      }

      return {
        success: true,
        data: new UserDocumentDTO(document),
        message: 'Document verification status updated',
      };
    } catch (error) {
      throw new Error(`Failed to update document verification: ${error.message}`);
    }
  }

  /**
   * Search users
   */
  async searchUsers(searchTerm, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = {
        $or: [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { companyName: { $regex: searchTerm, $options: 'i' } },
          { companyRegistration: { $regex: searchTerm, $options: 'i' } },
        ],
      };

      const results = await UserProfile.find(query)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await UserProfile.countDocuments(query);

      return {
        success: true,
        data: {
          data: results.map(r => new UserSummaryDTO(r)),
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

  /**
   * Get user statistics
   */
  async getUserStatistics(userId) {
    try {
      const profile = await UserProfile.findOne({ userId });
      const documents = await UserDocument.countDocuments({ userId });
      const activities = await UserActivity.countDocuments({ userId });
      const verifiedDocs = await UserDocument.countDocuments({ userId, status: 'verified' });

      return {
        success: true,
        data: {
          profileCompleteness: profile?.profileCompleteness || 0,
          documentsCount: documents,
          verifiedDocuments: verifiedDocs,
          activitiesCount: activities,
          documentVerificationStatus: profile?.documentVerification || false,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get user statistics: ${error.message}`);
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUserAccount(userId, reason = null) {
    try {
      // Log the deactivation activity
      await UserActivity.create({
        userId,
        action: 'User account deactivated',
        actionType: 'other',
        status: 'success',
      });

      return {
        success: true,
        message: 'User account deactivation initiated',
      };
    } catch (error) {
      throw new Error(`Failed to deactivate account: ${error.message}`);
    }
  }
}

module.exports = new UsersService();
