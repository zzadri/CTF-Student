import { Router } from 'express';
import { getLeaderboard, updateProfile, getProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
import { upload, processImage } from '../middleware/uploadMiddleware';

const router = Router();

/**
 * @swagger
 * /users/leaderboard:
 *   get:
 *     summary: Récupérer le classement des utilisateurs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs triée par score
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   score:
 *                     type: number
 *                   avatar:
 *                     type: string
 *       401:
 *         description: Non authentifié
 */
router.get('/leaderboard', authenticateToken, getLeaderboard);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 username:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 score:
 *                   type: number
 *       401:
 *         description: Non authentifié
 *   put:
 *     summary: Mettre à jour le profil de l'utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nouveau nom d'utilisateur
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Nouvelle image de profil
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 avatar:
 *                   type: string
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 */
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, upload.single('avatar'), processImage, updateProfile);

export default router; 