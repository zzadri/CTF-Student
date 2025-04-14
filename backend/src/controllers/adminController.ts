import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { defaultAvatars } from '../utils/defaultAvatars';
import { tokenBlacklist } from '../utils/tokenBlacklist';

const prisma = new PrismaClient();

// Récupérer tous les utilisateurs
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        score: true,
        avatar: true,
        createdAt: true
      }
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Réinitialiser le pseudo d'un utilisateur
export const resetUsername = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { username: `user${Math.floor(Math.random() * 10000)}` },
      select: { id: true, username: true }
    });
    res.json({ success: true, user });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du pseudo:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Réinitialiser les points d'un utilisateur
export const resetScore = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { score: 0 },
      select: { id: true, score: true }
    });
    res.json({ success: true, user });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des points:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Réinitialiser l'avatar d'un utilisateur
export const resetAvatar = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Sélectionner un avatar aléatoire parmi les avatars par défaut
    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
    
    const user = await prisma.user.update({
      where: { id },
      data: { avatar: randomAvatar },
      select: { id: true, avatar: true }
    });
    res.json({ success: true, user });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation de l\'avatar:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Envoyer une notification à un utilisateur
export const sendNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;
  
  try {
    // Vérifier si l'utilisateur existe
    const userExists = await prisma.user.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!userExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Valider le message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le message de notification est requis et ne peut pas être vide' 
      });
    }

    // Créer la notification
    const notification = await prisma.notification.create({
      data: {
        message: message.trim(),
        userId: id,
        type: 'ADMIN'
      },
      select: {
        id: true,
        message: true,
        type: true,
        read: true,
        createdAt: true,
        userId: true
      }
    });

    return res.json({ 
      success: true, 
      message: 'Notification envoyée avec succès',
      notification 
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi de la notification' 
    });
  }
};

export const toggleBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { isBlocked: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isBlocked: !user.isBlocked
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        score: true,
        avatar: true,
        isBlocked: true
      }
    });

    // Mettre à jour la blacklist
    if (updatedUser.isBlocked) {
      tokenBlacklist.addToBlacklist(id);
    } else {
      tokenBlacklist.removeFromBlacklist(id);
    }

    return res.json({
      success: true,
      message: `Utilisateur ${updatedUser.isBlocked ? 'bloqué' : 'débloqué'} avec succès`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors du blocage/déblocage de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du blocage/déblocage de l\'utilisateur'
    });
  }
};

// Récupérer les statistiques
export const getStats = async (_req: Request, res: Response) => {
  try {
    const [totalUsers, totalChallenges, totalCategories, activeUsers, solves] = await Promise.all([
      prisma.user.count(),
      prisma.challenge.count(),
      prisma.category.count(),
      prisma.user.count({
        where: {
          solves: {
            some: {
              solvedAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Actif dans les 30 derniers jours
              }
            }
          }
        }
      }),
      prisma.solve.count()
    ]);

    const completionRate = totalChallenges > 0 ? (solves / (totalUsers * totalChallenges)) * 100 : 0;

    return res.json({
      totalUsers,
      totalChallenges,
      totalCategories,
      activeUsers,
      completionRate: Math.min(completionRate, 100) // Plafonner à 100%
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// Supprimer un utilisateur
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        username: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si le nom d'utilisateur correspond
    if (user.username !== username) {
      return res.status(400).json({
        success: false,
        message: 'Le nom d\'utilisateur ne correspond pas'
      });
    }

    // Empêcher la suppression d'un administrateur
    if (user.role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Impossible de supprimer un compte administrateur'
      });
    }

    // Supprimer toutes les données associées dans une transaction
    await prisma.$transaction(async (tx) => {
      // Supprimer les notifications
      await tx.notification.deleteMany({
        where: { userId: id }
      });

      // Supprimer les résolutions de défis
      await tx.solve.deleteMany({
        where: { userId: id }
      });

      // Mettre à null l'userId des défis créés par l'utilisateur
      await tx.challenge.updateMany({
        where: { userId: id },
        data: { userId: null }
      });

      // Finalement, supprimer l'utilisateur
      await tx.user.delete({
        where: { id }
      });
    });

    return res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
}; 