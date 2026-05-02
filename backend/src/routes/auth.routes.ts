import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rateLimit';

const router = Router();
const strictLimiter = createRateLimiter(10, 60000); // 10 req/min for sensitive routes

router.post('/register', strictLimiter, authController.register);
router.post('/login', strictLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/request-reset', strictLimiter, authController.requestReset);
router.post('/verify-otp', strictLimiter, authController.verifyOtp);
router.post('/reset-password', strictLimiter, authController.resetPassword);
router.get('/me', authenticate, authController.getMe);

export default router;
