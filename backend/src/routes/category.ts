import { Router } from 'express';
import { getAllCategories, getCategoryById, deleteCategory } from '../controllers/categoryController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Récupérer toutes les catégories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Liste des catégories récupérée avec succès
 */
router.get('/', getAllCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Récupérer une catégorie par son ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la catégorie
 *     responses:
 *       200:
 *         description: Catégorie récupérée avec succès
 *       404:
 *         description: Catégorie non trouvée
 */
router.get('/:id', getCategoryById);

/**
 * @swagger
 * /categories/{id}:
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
 *         description: ID de la catégorie
 *     responses:
 *       200:
 *         description: Catégorie supprimée avec succès
 *       400:
 *         description: Impossible de supprimer une catégorie contenant des challenges
 *       404:
 *         description: Catégorie non trouvée
 */
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

export default router; 