import { Router } from 'express';
import { body } from 'express-validator';
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
import { createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { upload, processFiles } from '../middleware/uploadMiddleware';
import { createChallenge, updateChallenge, deleteChallenge } from '../controllers/challengeController';

const router = Router();

/**
 * @swagger
 * /admin/check:
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
 * /admin/users:
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
 * /admin/users/{id}/reset-username:
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
 * /admin/users/{id}/reset-score:
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
 * /admin/users/{id}/reset-avatar:
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
 * /admin/users/{id}/notify:
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
 * /admin/users/{id}/toggle-block:
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
 * /admin/stats:
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
 * /admin/users/{id}/delete:
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

/**
 * @swagger
 * /admin/categories:
 *   post:
 *     summary: Créer une nouvelle catégorie
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Le nom de la catégorie
 *               color:
 *                 type: string
 *                 description: La couleur de la catégorie (format hexadécimal)
 *               icon:
 *                 type: string
 *                 description: L'icône de la catégorie (classe FontAwesome)
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 */
router.post('/categories', authenticateToken, requireAdmin, createCategory);

/**
 * @swagger
 * /admin/categories/{id}:
 *   put:
 *     summary: Modifier une catégorie existante
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/categories/:id', authenticateToken, requireAdmin, updateCategory);

/**
 * @swagger
 * /admin/categories/{id}:
 *   delete:
 *     summary: Supprimer une catégorie
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/categories/:id', authenticateToken, requireAdmin, deleteCategory);

/**
 * @swagger
 * /admin/challenges:
 *   post:
 *     summary: Créer un nouveau challenge
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               subtitle:
 *                 type: string
 *               description:
 *                 type: string
 *               difficulty:
 *                 type: string
 *               points:
 *                 type: number
 *               flag:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               resources:
 *                 type: array
 *                 items:
 *                   type: object
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 */
router.post('/challenges',
  authenticateToken,
  requireAdmin,
  upload.challenge,
  processFiles,
  [
    body('title').notEmpty().trim(),
    body('subtitle').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('difficulty').isIn(['EZ', 'EASY', 'NORMAL', 'HARD', 'EXPERT']),
    body('points').isInt({ min: 1 }),
    body('flag').notEmpty().trim(),
    body('categoryId').notEmpty(),
    body('type').isIn(['URL', 'IMAGE', 'FILE'])
  ],
  createChallenge
);

/**
 * @swagger
 * /admin/challenges/{id}:
 *   put:
 *     summary: Mettre à jour un challenge
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du challenge
 */
router.put('/challenges/:id',
  authenticateToken,
  requireAdmin,
  upload.challenge,
  processFiles,
  [
    body('title').optional().trim(),
    body('subtitle').optional().trim(),
    body('description').optional().trim(),
    body('difficulty').optional().isIn(['EZ', 'EASY', 'NORMAL', 'HARD', 'EXPERT']),
    body('points').optional().isInt({ min: 1 }),
    body('flag').optional().trim(),
    body('categoryId').optional(),
    body('type').optional().isIn(['URL', 'IMAGE', 'FILE'])
  ],
  updateChallenge
);

/**
 * @swagger
 * /admin/challenges/{id}:
 *   delete:
 *     summary: Supprimer un challenge
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du challenge
 */
router.delete('/challenges/:id', authenticateToken, requireAdmin, deleteChallenge);

export default router; 