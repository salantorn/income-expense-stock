import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { config } from '../config';
import { logger } from '../config/logger';

export function createRateLimiter(maxRequests?: number, windowMs?: number) {
  const max = maxRequests ?? config.rateLimit.maxRequests;
  const window = windowMs ?? config.rateLimit.windowMs;
  const windowSecs = Math.floor(window / 1000);

  return async (req: Request, res: Response, next: NextFunction) => {
    const redis = getRedisClient();
    if (!redis) {
      return next(); // Skip rate limiting if Redis is not available
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate_limit:${ip}:${req.path}`;

    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSecs);
      }

      if (current > max) {
        logger.warn({ ip, path: req.path, count: current }, 'Rate limit exceeded');
        return res.status(429).json({
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
          retryAfter: windowSecs,
        });
      }

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));
      next();
    } catch (error) {
      logger.error({ error }, 'Rate limiting error');
      next(); // Don't block requests on Redis errors
    }
  };
}
