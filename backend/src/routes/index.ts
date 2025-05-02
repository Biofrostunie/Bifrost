import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import financeRoutes from './finance.routes';
import educationRoutes from './education.routes';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/finance', financeRoutes);
router.use('/education', educationRoutes);

export default router;