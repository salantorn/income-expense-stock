import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import * as authController from '../auth.controller';
import * as authService from '../../services/auth.service';

jest.mock('../../services/auth.service');
jest.mock('../../config/logger');

const app: Express = express();
app.use(express.json());
app.post('/register', authController.register);
app.post('/login', authController.login);

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
      };

      (authService.register as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/register')
        .send({ email: 'invalid-email', password: 'password123' });

      expect(response.status).toBe(400);
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/register')
        .send({ email: 'test@example.com', password: '123' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /login', () => {
    it('should login user with valid credentials', async () => {
      const mockResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          settings: { theme: 'DARK', currency: 'USD' },
        },
        token: 'jwt-token',
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
    });
  });
});
