import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../validate';

describe('Validate Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should pass validation with valid body', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    mockReq.body = {
      email: 'test@example.com',
      password: 'password123',
    };

    const middleware = validate(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 400 with validation errors', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    mockReq.body = {
      email: 'invalid-email',
      password: '123',
    };

    const middleware = validate(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'VALIDATION_ERROR',
        message: expect.any(String),
        details: expect.any(Array),
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should validate query parameters', () => {
    const schema = z.object({
      page: z.string().regex(/^\d+$/),
      limit: z.string().regex(/^\d+$/),
    });

    mockReq.query = {
      page: '1',
      limit: '20',
    };

    const middleware = validate(schema, 'query');
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should validate params', () => {
    const schema = z.object({
      id: z.string().uuid(),
    });

    mockReq.params = {
      id: '123e4567-e89b-12d3-a456-426614174000',
    };

    const middleware = validate(schema, 'params');
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle missing required fields', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    mockReq.body = {};

    const middleware = validate(schema);
    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'VALIDATION_ERROR',
        details: expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
          expect.objectContaining({ field: 'password' }),
        ]),
      })
    );
  });
});
