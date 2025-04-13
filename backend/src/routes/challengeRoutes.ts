import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Route de base pour tester
router.get('/', authenticateToken, async (req, res) => {
    try {
        res.json({ message: 'Challenge routes fonctionnelles' });
    } catch (error) {
        console.error('Erreur dans la route /challenges:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

export default router; 