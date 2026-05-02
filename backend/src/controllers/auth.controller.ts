import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { config } from '../config';
import { AuthenticatedRequest } from '../middleware/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const resetRequestSchema = z.object({
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
});

function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.server.nodeEnv === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = registerSchema.parse(req.body);
    const user = await authService.registerUser(email, password);
    res.status(201).json({ message: 'Registration successful', user });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { token, user } = await authService.loginUser(email, password);
    res.cookie('token', token, cookieOptions());
    res.json({ message: 'Login successful', user, token });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    next(error);
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
}

export async function requestReset(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = resetRequestSchema.parse(req.body);
    await authService.requestPasswordReset(email);
    res.json({ message: 'If this email exists, an OTP has been sent' });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp } = verifyOtpSchema.parse(req.body);
    await authService.verifyOtp(email, otp);
    res.json({ message: 'OTP verified successfully' });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);
    await authService.resetPassword(email, otp, newPassword);
    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    next(error);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.id);
    res.json({ user });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    next(error);
  }
}
