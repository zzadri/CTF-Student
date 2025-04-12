import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import { 
  getAllUsers,
  resetUsername,
  resetScore,
  resetAvatar,
  sendNotification,
  toggleBlock,
  getStats,
  deleteUser
} from '../controllers/adminController';

const router = Router();

/**
 * @swagger
 * /api/admin/check:
 *   get:
 *     summary: Vérifier les droits administrateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accès administrateur validé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé (droits admin requis)
 */
router.get('/check', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Accès administrateur validé',
    user: req.user
  });
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Récupérer la liste de tous les utilisateurs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       score:
 *                         type: number
 *                       avatar:
 *                         type: string
 *                       isBlocked:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/users', authenticateToken, requireAdmin, getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}/reset-username:
 *   put:
 *     summary: Réinitialiser le pseudo d'un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Pseudo réinitialisé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put('/users/:id/reset-username', authenticateToken, requireAdmin, resetUsername);

/**
 * @swagger
 * /api/admin/users/{id}/reset-score:
 *   put:
 *     summary: Réinitialiser le score d'un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Score réinitialisé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put('/users/:id/reset-score', authenticateToken, requireAdmin, resetScore);

/**
 * @swagger
 * /api/admin/users/{id}/reset-avatar:
 *   put:
 *     summary: Réinitialiser l'avatar d'un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Avatar réinitialisé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put('/users/:id/reset-avatar', authenticateToken, requireAdmin, resetAvatar);

/**
 * @swagger
 * /api/admin/users/{id}/notify:
 *   post:
 *     summary: Envoyer une notification à un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message de la notification
 *     responses:
 *       200:
 *         description: Notification envoyée avec succès
 *       404:
 *         description: Utilisateur non trouvé
 */
router.post('/users/:id/notify', authenticateToken, requireAdmin, sendNotification);

/**
 * @swagger
 * /api/admin/users/{id}/toggle-block:
 *   put:
 *     summary: Bloquer ou débloquer un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Statut de blocage modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     score:
 *                       type: number
 *                     avatar:
 *                       type: string
 *                     isBlocked:
 *                       type: boolean
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put('/users/:id/toggle-block', authenticateToken, requireAdmin, toggleBlock);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Récupérer les statistiques globales
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                 totalChallenges:
 *                   type: number
 *                 totalCategories:
 *                   type: number
 *                 activeUsers:
 *                   type: number
 *                 completionRate:
 *                   type: number
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé (droits admin requis)
 */
router.get('/stats', authenticateToken, requireAdmin, getStats);

/**
 * @swagger
 * /api/admin/users/{id}/delete:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nom d'utilisateur pour confirmation
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *       400:
 *         description: Le nom d'utilisateur ne correspond pas
 *       403:
 *         description: Impossible de supprimer un administrateur
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete('/users/:id/delete', authenticateToken, requireAdmin, deleteUser);

export default router; 