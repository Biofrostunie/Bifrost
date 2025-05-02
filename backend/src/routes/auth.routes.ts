import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/reset-password/confirm', authController.confirmResetPassword);

export default router;