const { Session } = require('./model');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const { AUTH_ERRORS, SESSION_EXPIRES_IN_DAYS } = require('./constants');
const { LoginDTO, RegisterDTO, SessionDTO } = require('./dto');

class AuthService {
  _generateToken(userId, role) {
    return jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  _getDeviceInfo(req) {
    const ua = req.headers['user-agent'] || 'Unknown Device';
    return ua.substring(0, 200);
  }

  async _createSession(userId, token, req) {
    const expiresAt = new Date(Date.now() + SESSION_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);
    
    await Session.create({
      userId,
      token,
      deviceInfo: this._getDeviceInfo(req),
      ipAddress: req.ip || req.connection.remoteAddress,
      isActive: true,
      expiresAt,
    });
  }

  async register(userData, req) {
    try {
      const { fullName, companyName, phone, email, password, role } = userData;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error(AUTH_ERRORS.EMAIL_EXISTS);
      }

      const user = await User.create({
        fullName,
        companyName,
        phone,
        email,
        password,
        role: role === 'vendor' || role === 'evaluator' ? role : 'vendor',
      });

      const token = this._generateToken(user._id, user.role);
      await this._createSession(user._id, token, req);
      

      return {
        success: true,
        message: 'New user created',
        data: new RegisterDTO({ user, token }),
      };
    } catch (error) {
      if (error.message === AUTH_ERRORS.EMAIL_EXISTS) {
        throw error;
      }
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }

  async login(email, password, req) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
      }

      if (!user.isActive) {
        throw new Error(AUTH_ERRORS.ACCOUNT_DEACTIVATED);
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
      }

      const token = this._generateToken(user._id, user.role);
      await this._createSession(user._id, token, req);

      return {
        success: true,
        message: 'Login successful.',
        data: new LoginDTO({ token, user }),
      };
    } catch (error) {
      if (
        error.message === AUTH_ERRORS.INVALID_CREDENTIALS ||
        error.message === AUTH_ERRORS.ACCOUNT_DEACTIVATED
      ) {
        throw error;
      }
      throw new Error(`Failed to login: ${error.message}`);
    }
  }

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
      throw new Error(`Failed to logout: ${error.message}`);
    }
  }

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
      throw new Error(`Failed to get sessions: ${error.message}`);
    }
  }

  async revokeSession(sessionId, userId) {
    try {
      await Session.findOneAndUpdate(
        { _id: sessionId, userId },
        { isActive: false }
      );

      return {
        success: true,
        message: 'Session revoked successfully.',
      };
    } catch (error) {
      throw new Error(`Failed to revoke session: ${error.message}`);
    }
  }
}

module.exports = new AuthService();