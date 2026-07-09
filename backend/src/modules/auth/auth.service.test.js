/**
 * Unit Test Example - Auth Service
 */

const authService = require('../../src/modules/auth/service');
const User = require('../../src/models/User');
const { Session } = require('../../src/modules/auth/model');

// Mock dependencies
jest.mock('../../src/models/User');
jest.mock('../../src/modules/auth/model');
jest.mock('jsonwebtoken');

describe('Auth Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Test@123',
        companyName: 'Test Corp',
        phone: '+1-555-0100',
      };

      const mockUser = {
        _id: 'mock-user-id',
        ...userData,
        role: 'vendor',
        isActive: true,
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      Session.create.mockResolvedValue({ _id: 'session-id' });

      const result = await authService.register(userData, {
        headers: { 'user-agent': 'test' },
        ip: '127.0.0.1',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('New user created');
      expect(result.data).toBeDefined();
      expect(result.data.token).toBeDefined();
    });

    it('should fail if email already exists', async () => {
      const userData = {
        fullName: 'Test User',
        email: 'existing@example.com',
        password: 'Test@123',
        companyName: 'Test Corp',
        phone: '+1-555-0100',
      };

      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await expect(
        authService.register(userData, {})
      ).rejects.toThrow('Email is already registered');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        role: 'vendor',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);
      Session.create.mockResolvedValue({ _id: 'session-id' });

      const result = await authService.login('test@example.com', 'correct-password', {
        headers: { 'user-agent': 'test' },
        ip: '127.0.0.1',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Login successful.');
      expect(result.data.token).toBeDefined();
    });

    it('should fail with invalid credentials', async () => {
      const mockUser = {
        email: 'test@example.com',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      User.findOne.mockResolvedValue(mockUser);

      await expect(
        authService.login('test@example.com', 'wrong-password', {})
      ).rejects.toThrow('Invalid email or password');
    });

    it('should fail with deactivated account', async () => {
      const mockUser = {
        email: 'test@example.com',
        isActive: false,
      };

      User.findOne.mockResolvedValue(mockUser);

      await expect(
        authService.login('test@example.com', 'password', {})
      ).rejects.toThrow('Account is deactivated');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      Session.findOneAndUpdate.mockResolvedValue({});

      const result = await authService.logout('token-123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Logged out successfully.');
    });
  });
});