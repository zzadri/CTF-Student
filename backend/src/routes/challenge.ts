import { Router } from 'express';
import { getAllChallenges, getChallengeById, getResource } from '../controllers/challengeController';

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

export default router; 