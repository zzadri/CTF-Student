import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { tokenBlacklist } from '../utils/tokenBlacklist';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token d\'authentification manquant'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Vérifier si l'utilisateur est dans la blacklist
    if (tokenBlacklist.isBlacklisted(decoded.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Votre compte a été bloqué. Veuillez contacter un administrateur.',
        isBlocked: true
      });
    }

    // Vérifier si l'utilisateur existe toujours et récupérer son rôle actuel
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        role: true,
        isBlocked: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'utilisateur est bloqué
    if (user.isBlocked) {
      // Ajouter à la blacklist si ce n'est pas déjà fait
      tokenBlacklist.addToBlacklist(decoded.userId);
      return res.status(403).json({
        success: false,
        message: 'Votre compte a été bloqué. Veuillez contacter un administrateur.',
        isBlocked: true
      });
    }

    // Mettre à jour le payload avec le rôle actuel de l'utilisateur
    req.user = {
      userId: decoded.userId,
      role: user.role
    };
    
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Non authentifié'
    });
  }

  try {
    // Double vérification du rôle en base de données
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé - Droits administrateur requis'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des droits admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des droits administrateur'
    });
  }
}; 