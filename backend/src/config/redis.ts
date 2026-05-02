import { createClient } from 'redis';
import { config } from './index';
import { logger } from './logger';

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

export async function connectRedis(): Promise<RedisClient> {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    url: config.redis.url,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('Redis reconnection failed after 10 attempts');
          return new Error('Redis reconnection limit exceeded');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

  redisClient.on('error', (err) => {
    // Log error but don't crash
    if (err.message !== 'read ECONNRESET') {
      logger.error({ err }, 'Redis client error');
    }
  });

  redisClient.on('connect', () => {
    logger.info('Redis client connected');
  });

  redisClient.on('ready', () => {
    logger.info('Redis client ready');
  });

  redisClient.on('reconnecting', () => {
    logger.warn('Redis client reconnecting');
  });

  try {
    await redisClient.connect();
  } catch (err) {
    logger.error({ err }, 'Failed to connect to Redis');
    throw err;
  }

  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis client disconnected');
  }
}

export function getRedisClient(): RedisClient | null {
  return redisClient;
}
