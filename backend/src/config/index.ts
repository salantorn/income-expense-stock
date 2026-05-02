import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  database: z.object({
    url: z.string().url(),
  }),
  redis: z.object({
    url: z.string().url(),
  }),
  jwt: z.object({
    secret: z.string().min(32),
    expiresIn: z.string(),
  }),
  server: z.object({
    port: z.number().int().positive(),
    nodeEnv: z.enum(['development', 'production', 'test']),
  }),
  cors: z.object({
    origin: z.string().url(),
  }),
  email: z.object({
    smtp: z.object({
      host: z.string(),
      port: z.number().int().positive(),
      secure: z.boolean(),
      user: z.string().email(),
      pass: z.string(),
    }),
    from: z.string().email(),
  }),
  finnhub: z.object({
    apiKey: z.string().min(1),
  }),
  rateLimit: z.object({
    windowMs: z.number().int().positive(),
    maxRequests: z.number().int().positive(),
  }),
});

export type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
  const rawConfig = {
    database: {
      url: process.env.DATABASE_URL || '',
    },
    redis: {
      url: process.env.REDIS_URL || '',
    },
    jwt: {
      secret: process.env.JWT_SECRET || '',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    server: {
      port: parseInt(process.env.PORT || '3000', 10),
      nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },
    email: {
      smtp: {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
      from: process.env.EMAIL_FROM || '',
    },
    finnhub: {
      apiKey: process.env.FINNHUB_API_KEY || '',
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10),
    },
  };

  const result = configSchema.safeParse(rawConfig);

  if (!result.success) {
    console.error('Configuration validation failed:');
    console.error(result.error.format());
    throw new Error('Invalid configuration');
  }

  return result.data;
}

export const config = loadConfig();
