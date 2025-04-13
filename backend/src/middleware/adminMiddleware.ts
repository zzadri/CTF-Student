import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Droits administrateur requis'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des droits admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des droits'
    });
  }
}; 