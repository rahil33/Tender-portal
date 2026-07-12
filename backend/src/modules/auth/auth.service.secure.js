const { Session } = require('./model');
const { LoginAttempt } = require('./LoginAttempt');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const { 
  AUTH_ERRORS, 
  SESSION_EXPIRES_IN_DAYS, 
  JWT_EXPIRES_IN, 
  JWT_REFRESH_EXPIRES_IN,
  MAX_CONCURRENT_SESSIONS 
} = require('./constants');
const { LoginDTO, RegisterDTO, SessionDTO } = require('./dto');
const { 
  validatePasswordStrength, 
  generateSecureToken,
  getClientIP 
} = require('../../utils/security');
const logger = require('../../config/logger');

class AuthService {
  /**
   * Generate access token
   * SECURITY: Short-lived access token (1 hour default)
   */
  _generateAccessToken(userId, role, email) {
    return jwt.sign(
      { id: userId, role, email, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Generate refresh token
   * SECURITY: Separate refresh token for token rotation
   */
  _generateRefreshToken(userId) {
    return jwt.sign(
      { id: userId, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
  }

  /**
   * Get device information securely
   */
  _getDeviceInfo(req) {
    const ua = req.headers['user-agent'] || 'Unknown Device';
    // Truncate to prevent log injection
    return ua.substring(0, 200).replace(/[\r\n]/g, '');
  }

  /**
   * Create session with security checks
   */
  async _createSession(userId, token, req) {
    const { ACCOUNT_LOCKOUT_DURATION_MS } = require('./constants');
    const expiresAt = new Date(Date.now() + ACCOUNT_LOCKOUT_DURATION_MS);
    
    // Check concurrent session limit
    const activeSessions = await Session.countDocuments({
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (activeSessions >= MAX_CONCURRENT_SESSIONS) {
      // Invalidate oldest session
      const oldestSession = await Session.findOne({
        userId,
        isActive: true,
      }).sort({ createdAt: 1 });

      if (oldestSession) {
        await Session.updateOne(
          { _id: oldestSession._id },
          { isActive: false }
        );
      }
    }

    await Session.create({
      userId,
      token,
      deviceInfo: this._getDeviceInfo(req),
      ipAddress: getClientIP(req),
      isActive: true,
      expiresAt,
    });
  }

  /**
   * Invalidate all sessions for a user
   */
  async _invalidateAllSessions(userId) {
    await Session.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );
  }

  /**
   * Register with security enhancements
   */
  async register(userData, req) {
    try {
      const { fullName, companyName, phone, email, password, role } = userData;

      // SECURITY: Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        throw new Error(AUTH_ERRORS.PASSWORD_TOO_WEAK);
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new Error(AUTH_ERRORS.EMAIL_EXISTS);
      }

      const user = await User.create({
        fullName,
        companyName,
        phone,
        email: email.toLowerCase(),
        password,
        role: role === 'vendor' || role === 'evaluator' || role === 'buyer' ? role : 'vendor',
      });

      // Generate tokens
      const accessToken = this._generateAccessToken(user._id, user.role, user.email);
      const refreshToken = this._generateRefreshToken(user._id);
      
      await this._createSession(user._id, accessToken, req);

      // Log registration
      logger.info('New user registered', { 
        userId: user._id, 
        email: user.email,
        ip: getClientIP(req) 
      });

      return {
        success: true,
        message: 'New user created',
        data: new RegisterDTO({ 
          user, 
          token: accessToken,
          refreshToken 
        }),
      };
    } catch (error) {
      if (error.message === AUTH_ERRORS.EMAIL_EXISTS || error.message === AUTH_ERRORS.PASSWORD_TOO_WEAK) {
        throw error;
      }
      logger.error('Registration failed', { error: error.message, email: userData.email });
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }

  /**
   * Login with account lockout protection
   */
  async login(email, password, req) {
    try {
      const clientIP = getClientIP(req);
      const userAgent = this._getDeviceInfo(req);
      const normalizedEmail = email.toLowerCase();

      // SECURITY: Check if account is locked
      const isLocked = await LoginAttempt.isAccountLocked(normalizedEmail);
      if (isLocked) {
        logger.warn('Login attempt on locked account', { email: normalizedEmail, ip: clientIP });
        throw new Error(AUTH_ERRORS.ACCOUNT_LOCKED);
      }

      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        // SECURITY: Record failed attempt even for non-existent users (prevent enumeration)
        await LoginAttempt.recordFailedAttempt(normalizedEmail, clientIP, userAgent, 'INVALID_PASSWORD');
        throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
      }

      if (!user.isActive) {
        await LoginAttempt.recordFailedAttempt(normalizedEmail, clientIP, userAgent, 'ACCOUNT_INACTIVE');
        throw new Error(AUTH_ERRORS.ACCOUNT_DEACTIVATED);
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // SECURITY: Record failed attempt with lockout check
        const lockStatus = await LoginAttempt.recordFailedAttempt(
          normalizedEmail, 
          clientIP, 
          userAgent, 
          'INVALID_PASSWORD'
        );
        
        if (lockStatus.locked) {
          logger.warn('Account locked due to failed attempts', { 
            email: normalizedEmail, 
            ip: clientIP,
            lockedUntil: lockStatus.lockedUntil 
          });
          throw new Error(AUTH_ERRORS.ACCOUNT_LOCKED);
        }

        logger.warn('Failed login attempt', { 
          email: normalizedEmail, 
          ip: clientIP,
          attemptsRemaining: lockStatus.attemptsRemaining 
        });
        
        throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
      }

      // SECURITY: Clear lockout on successful login
      await LoginAttempt.recordSuccessfulLogin(normalizedEmail, clientIP, userAgent);

      // Generate tokens
      const accessToken = this._generateAccessToken(user._id, user.role, user.email);
      const refreshToken = this._generateRefreshToken(user._id);
      
      await this._createSession(user._id, accessToken, req);

      // Log successful login
      logger.info('User logged in', { 
        userId: user._id, 
        email: user.email,
        ip: clientIP 
      });

      return {
        success: true,
        message: 'Login successful.',
        data: new LoginDTO({ 
          token: accessToken, 
          user,
          refreshToken 
        }),
      };
    } catch (error) {
      if (
        error.message === AUTH_ERRORS.INVALID_CREDENTIALS ||
        error.message === AUTH_ERRORS.ACCOUNT_DEACTIVATED ||
        error.message === AUTH_ERRORS.ACCOUNT_LOCKED
      ) {
        throw error;
      }
      logger.error('Login failed', { error: error.message, email });
      throw new Error(`Failed to login: ${error.message}`);
    }
  }

  /**
   * Logout with token blacklisting
   */
  async logout(token) {
    try {
      if (token) {
        await Session.findOneAndUpdate(
          { token },
          { isActive: false }
        );
      }

      return {
        success: true,
        message: 'Logged out successfully.',
      };
    } catch (error) {
      logger.error('Logout failed', { error: error.message });
      throw new Error(`Failed to logout: ${error.message}`);
    }
  }

  /**
   * Invalidate all sessions (force logout everywhere)
   */
  async invalidateUserSessions(userId) {
    try {
      await this._invalidateAllSessions(userId);

      logger.info('All sessions invalidated', { userId });

      return {
        success: true,
        message: 'All sessions invalidated successfully.',
      };
    } catch (error) {
      logger.error('Session invalidation failed', { error: error.message });
      throw new Error(`Failed to invalidate sessions: ${error.message}`);
    }
  }

  /**
   * Get active sessions
   */
  async getSessions(userId) {
    try {
      const sessions = await Session.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() },
      }).select('-token');

      return {
        success: true,
        data: {
          sessions: sessions.map((s) => new SessionDTO(s)),
        },
      };
    } catch (error) {
      logger.error('Get sessions failed', { error: error.message });
      throw new Error(`Failed to get sessions: ${error.message}`);
    }
  }

  /**
   * Revoke specific session
   */
  async revokeSession(sessionId, userId) {
    try {
      await Session.findOneAndUpdate(
        { _id: sessionId, userId },
        { isActive: false }
      );

      logger.info('Session revoked', { sessionId, userId });

      return {
        success: true,
        message: 'Session revoked successfully.',
      };
    } catch (error) {
      logger.error('Session revocation failed', { error: error.message });
      throw new Error(`Failed to revoke session: ${error.message}`);
    }
  }

  /**
   * Refresh access token
   * SECURITY: Token rotation mechanism
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Verify session still exists
      const session = await Session.findOne({
        userId: decoded.id,
        isActive: true,
        expiresAt: { $gt: new Date() },
      });

      if (!session) {
        throw new Error('Session expired or revoked');
      }

      // Get user to check if still active
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new access token
      const newAccessToken = this._generateAccessToken(user._id, user.role, user.email);

      return {
        success: true,
        data: {
          token: newAccessToken,
        },
      };
    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Get login history for user
   */
  async getLoginHistory(email, limit = 20) {
    try {
      const history = await LoginAttempt.getLoginHistory(email, limit);
      
      return {
        success: true,
        data: {
          history: history.map(h => ({
            timestamp: h.createdAt,
            success: h.success,
            ipAddress: h.ipAddress,
            deviceInfo: h.userAgent,
            failureReason: h.failureReason,
          })),
        },
      };
    } catch (error) {
      logger.error('Get login history failed', { error: error.message });
      throw new Error(`Failed to get login history: ${error.message}`);
    }
  }
}

module.exports = new AuthService();