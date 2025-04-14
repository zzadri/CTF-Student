import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import categoryRoutes from './category';
import challengeRoutes from './challenge';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/challenges', challengeRoutes);

export default router; 