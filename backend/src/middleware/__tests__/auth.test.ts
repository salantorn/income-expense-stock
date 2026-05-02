import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../auth';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');
jest.mock('../../config/logger');

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      cookies: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should authenticate with valid token in cookie', () => {
    const mockPayload = { id: 'user-123', email: 'test@example.com' };
    mockReq.cookies = { token: 'valid-token' };

    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

    authenticate(mockReq as Request, mockRes as Response, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
    expect((mockReq as any).user).toEqual(mockPayload);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should authenticate with valid token in Authorization header', () => {
    const mockPayload = { id: 'user-123', email: 'test@example.com' };
    mockReq.headers = { authorization: 'Bearer valid-token' };

    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

    authenticate(mockReq as Request, mockRes as Response, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
    expect((mockReq as any).user).toEqual(mockPayload);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 if no token provided', () => {
    authenticate(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'UNAUTHORIZED',
      message: 'No token provided',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    mockReq.cookies = { token: 'invalid-token' };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authenticate(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'UNAUTHORIZED',
      message: 'Invalid token',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if token is expired', () => {
    mockReq.cookies = { token: 'expired-token' };

    const error = new Error('Token expired');
    (error as any).name = 'TokenExpiredError';
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw error;
    });

    authenticate(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'UNAUTHORIZED',
      message: 'Token expired',
    });
  });
});
