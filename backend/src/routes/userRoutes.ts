import { Router } from 'express';
import { getLeaderboard, updateProfile, getProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
import { upload, processImage } from '../middleware/uploadMiddleware';

const router = Router();

// Route protégée pour le leaderboard
router.get('/leaderboard', authenticateToken, getLeaderboard);

// Routes du profil
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, upload.single('avatar'), processImage, updateProfile);

export default router; 