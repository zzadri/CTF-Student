import { Router } from 'express';
import { login, register, getCurrentUser } from '../controllers/authController';
import { validateRegister, validateLogin } from '../middleware/authValidation';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticateToken, getCurrentUser);

export default router; 