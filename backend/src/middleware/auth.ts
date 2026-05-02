import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../config/logger';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Try cookie first, then Authorization header
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn({ error }, 'Invalid JWT token');
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }
}
