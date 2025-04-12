import { Router } from 'express';
import { getLeaderboard, updateProfile, getProfile, getLanguages, getPublicProfile, getNotifications, markNotificationAsRead } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
import { upload, processImage } from '../middleware/uploadMiddleware';

const router = Router();

/**
 * @swagger
 * /users/{userId}/profile:
 *   get:
 *     summary: Récupérer le profil public d'un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Profil public de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     score:
 *                       type: number
 *                     language:
 *                       type: string
 *                     rank:
 *                       type: number
 *                     solvedChallenges:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         recent:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               category:
 *                                 type: string
 *                               points:
 *                                 type: number
 *                               solvedAt:
 *                                 type: string
 *                                 format: date-time
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/:userId/profile', authenticateToken, getPublicProfile);

/**
 * @swagger
 * /users/languages:
 *   get:
 *     summary: Récupérer les langues disponibles
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des langues disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       401:
 *         description: Non authentifié
 */
router.get('/languages', authenticateToken, getLanguages);

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

/**
 * @swagger
 * /users/notifications:
 *   get:
 *     summary: Récupérer les notifications non lues de l'utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       message:
 *                         type: string
 *                       type:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/notifications', authenticateToken, getNotifications);

/**
 * @swagger
 * /users/notifications/{notificationId}:
 *   put:
 *     summary: Marquer une notification comme lue
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *       404:
 *         description: Notification non trouvée
 */
router.put('/notifications/:notificationId', authenticateToken, markNotificationAsRead);

export default router; 