import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getPrismaClient } from '../config/database';
import { getRedisClient } from '../config/redis';
import { config } from '../config';
import { logger } from '../config/logger';

const SALT_ROUNDS = 12;
const OTP_TTL = 600; // 10 minutes
const OTP_LENGTH = 6;

import { createMailTransporter } from '../utils/email';

async function sendOtpEmail(email: string, otp: string) {
  const isDev = config.server.nodeEnv === 'development';

  if (isDev && (!config.email.smtp.user || config.email.smtp.user === 'your_email@gmail.com' || config.email.smtp.user === 'your-email@gmail.com')) {
    // In development without SMTP configured — log OTP to console
    logger.info({ email, otp }, '🔑 [DEV MODE] OTP Code (no email sent)');
    console.log('\n=========================================');
    console.log(`📧 OTP for ${email}: ${otp}`);
    console.log('=========================================\n');
    return;
  }

  const transporter = createMailTransporter();
  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: 'Password Reset OTP — Dashboard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
        <h2 style="color: #1e1b4b; margin-bottom: 8px;">Password Reset</h2>
        <p style="color: #6b7280; margin-bottom: 24px;">Your OTP code is:</p>
        <div style="background: #312e81; color: white; font-size: 32px; letter-spacing: 8px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px;">
          ${otp}
        </div>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">
          This code expires in 10 minutes. Do not share it with anyone.
        </p>
      </div>
    `,
  });
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export async function registerUser(email: string, password: string) {
  const prisma = getPrismaClient();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw Object.assign(new Error('Email already registered'), { statusCode: 409, code: 'EMAIL_EXISTS' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      portfolio: { create: {} },
      settings: { create: { theme: 'LIGHT', currency: 'USD' } },
    },
    select: { id: true, email: true, createdAt: true },
  });

  logger.info({ userId: user.id }, 'New user registered');
  return user;
}

export async function loginUser(email: string, password: string) {
  const prisma = getPrismaClient();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as any }
  );

  logger.info({ userId: user.id }, 'User logged in');
  return { token, user: { id: user.id, email: user.email } };
}

export async function requestPasswordReset(email: string) {
  const prisma = getPrismaClient();
  const redis = getRedisClient();

  if (!redis) {
    throw Object.assign(
      new Error('Password reset feature requires Redis to be available'),
      { statusCode: 503, code: 'SERVICE_UNAVAILABLE' }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal whether email exists
    return;
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const redisKey = `otp:${email}`;

  await redis.setEx(redisKey, OTP_TTL, JSON.stringify({ otp, attempts: 0 }));
  await sendOtpEmail(email, otp);

  logger.info({ email }, 'OTP sent for password reset');
}

export async function verifyOtp(email: string, otp: string) {
  const redis = getRedisClient();

  if (!redis) {
    throw Object.assign(
      new Error('OTP verification requires Redis to be available'),
      { statusCode: 503, code: 'SERVICE_UNAVAILABLE' }
    );
  }

  const redisKey = `otp:${email}`;

  const stored = await redis.get(redisKey);
  if (!stored) {
    throw Object.assign(new Error('OTP expired or not found'), { statusCode: 400, code: 'OTP_INVALID' });
  }

  const data = JSON.parse(stored) as { otp: string; attempts: number };

  if (data.attempts >= 5) {
    await redis.del(redisKey);
    throw Object.assign(new Error('Too many attempts, request a new OTP'), { statusCode: 429, code: 'OTP_MAX_ATTEMPTS' });
  }

  if (data.otp !== otp) {
    data.attempts += 1;
    const ttl = await redis.ttl(redisKey);
    if (ttl > 0) {
      await redis.setEx(redisKey, ttl, JSON.stringify(data));
    }
    throw Object.assign(new Error('Invalid OTP'), { statusCode: 400, code: 'OTP_INVALID' });
  }

  // Mark OTP as verified (keep for reset step, but mark verified)
  await redis.setEx(redisKey, 300, JSON.stringify({ ...data, verified: true }));
  logger.info({ email }, 'OTP verified');
}

export async function resetPassword(email: string, otp: string, newPassword: string) {
  const prisma = getPrismaClient();
  const redis = getRedisClient();

  if (!redis) {
    throw Object.assign(
      new Error('Password reset requires Redis to be available'),
      { statusCode: 503, code: 'SERVICE_UNAVAILABLE' }
    );
  }

  const redisKey = `otp:${email}`;

  const stored = await redis.get(redisKey);
  if (!stored) {
    throw Object.assign(new Error('OTP expired'), { statusCode: 400, code: 'OTP_INVALID' });
  }

  const data = JSON.parse(stored) as { otp: string; verified?: boolean };
  if (data.otp !== otp || !data.verified) {
    throw Object.assign(new Error('Invalid or unverified OTP'), { statusCode: 400, code: 'OTP_INVALID' });
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { email }, data: { passwordHash } });
  await redis.del(redisKey);

  logger.info({ email }, 'Password reset successfully');
}

export async function getMe(userId: string) {
  const prisma = getPrismaClient();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      settings: { select: { theme: true, currency: true } },
    },
  });

  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'USER_NOT_FOUND' });
  }

  return user;
}
