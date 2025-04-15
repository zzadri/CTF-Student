import { Router } from 'express';
import { getAllChallenges, getChallengeById, getResource, verifyFlag } from '../controllers/challengeController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /challenges:
 *   get:
 *     summary: Récupérer tous les challenges
 *     tags: [Challenges]
 *     responses:
 *       200:
 *         description: Liste des challenges récupérée avec succès
 */
router.get('/', getAllChallenges);

/**
 * @swagger
 * /challenges/{id}:
 *   get:
 *     summary: Récupérer un challenge par son ID
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du challenge
 *     responses:
 *       200:
 *         description: Challenge récupéré avec succès
 *       404:
 *         description: Challenge non trouvé
 */
router.get('/:id', getChallengeById);

/**
 * @swagger
 * /challenges/resources/{id}:
 *   get:
 *     summary: Récupérer une ressource
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la ressource
 */
router.get('/resources/:id', getResource);

/**
 * @swagger
 * /challenges/{id}/verify:
 *   post:
 *     summary: Vérifier un flag pour un challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du challenge
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               flag:
 *                 type: string
 *                 required: true
 *                 description: Le flag à vérifier
 *     responses:
 *       200:
 *         description: Flag correct, points attribués
 *       400:
 *         description: Flag incorrect ou challenge déjà résolu
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Challenge non trouvé
 */
router.post('/:id/verify', authenticateToken, verifyFlag);

export default router; 