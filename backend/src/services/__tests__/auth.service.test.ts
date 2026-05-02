import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as authService from '../auth.service';
import { getPrismaClient } from '../../config/database';

// Mock Prisma
jest.mock('../../config/database');
jest.mock('../../config/logger');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  userSettings: {
    create: jest.fn(),
  },
};

(getPrismaClient as jest.Mock).mockReturnValue(mockPrisma);

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: '1',
        email,
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.userSettings.create.mockResolvedValue({});

      const result = await authService.register(email, password);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(email);
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com' });

      await expect(authService.register('test@example.com', 'password'))
        .rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should return user and token for valid credentials', async () => {
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        settings: { theme: 'DARK', currency: 'USD' },
      });

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error for invalid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login('wrong@example.com', 'password'))
        .rejects.toThrow('Invalid credentials');
    });
  });
});
