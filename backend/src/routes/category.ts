import { Router } from 'express';
import { getAllCategories, getCategoryById } from '../controllers/categoryController';

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

export default router; 