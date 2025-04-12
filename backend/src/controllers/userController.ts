import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLeaderboard = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatar: true,
        score: true,
        solves: {
          select: {
            challenge: {
              select: {
                title: true,
                points: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            },
            solvedAt: true
          }
        }
      },
      orderBy: {
        score: 'desc'
      },
      take: 10 // Limite aux 10 premiers
    });

    const formattedLeaderboard = users.map((user) => ({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      score: user.score,
      challengesCompleted: user.solves.length,
      recentAchievements: user.solves
        .sort((a, b) => new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime())
        .slice(0, 3)
        .map(solve => ({
          challengeName: solve.challenge.title,
          points: solve.challenge.points,
          category: solve.challenge.category.name,
          completedAt: solve.solvedAt
        }))
    }));

    return res.json({
      success: true,
      data: formattedLeaderboard
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du leaderboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du leaderboard'
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { username, base64Image } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    // Vérifier si le nom d'utilisateur est déjà pris
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { username },
            { id: { not: userId } }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Ce nom d\'utilisateur est déjà utilisé'
        });
      }
    }

    // Préparer les données à mettre à jour
    const updateData: any = {};
    if (username) {
      updateData.username = username;
    }
    if (base64Image) {
      updateData.avatar = base64Image;
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        score: true
      }
    });

    return res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
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
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        score: true,
        solves: {
          select: {
            challenge: {
              select: {
                title: true,
                points: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            },
            solvedAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    return res.json({
      success: true,
      data: {
        ...user,
        challengesCompleted: user.solves.length,
        recentAchievements: user.solves
          .sort((a, b) => new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime())
          .slice(0, 5)
          .map(solve => ({
            challengeName: solve.challenge.title,
            points: solve.challenge.points,
            category: solve.challenge.category.name,
            completedAt: solve.solvedAt
          }))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
}; 