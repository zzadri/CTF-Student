import { Router } from 'express';
import { getNotifications, markAsRead, createNotification } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';

const router = Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Récupérer les notifications non lues de l'utilisateur
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications non lues
 *       401:
 *         description: Non autorisé
 */
router.get('/', authenticateToken, getNotifications);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *       401:
 *         description: Non autorisé
 */
router.put('/:notificationId/read', authenticateToken, markAsRead);

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Créer une nouvelle notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [ADMIN, SYSTEM]
 *     responses:
 *       200:
 *         description: Notification créée
 *       401:
 *         description: Non autorisé
 */
router.post('/', authenticateToken, requireAdmin, createNotification);

export default router; 