import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Challenge, UserProfile, UserUpdateData } from '../interfaces/user.interface';

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
      take: 10
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
    const { username, languageId } = req.body;
    let avatar = req.body.avatar;

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
            { NOT: { id: userId } }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Ce nom d\'utilisateur est déjà pris'
        });
      }
    }

    // Vérifier si la langue existe
    if (languageId) {
      const language = await prisma.language.findUnique({
        where: { id: languageId }
      });

      if (!language) {
        return res.status(400).json({
          success: false,
          message: 'Langue invalide'
        });
      }
    }

    // Mise à jour du profil
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(languageId && { languageId }),
        ...(avatar && { avatar })
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        score: true,
        languageId: true
      }
    });

    return res.json({
      success: true,
      user: updatedUser
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

export const getLanguages = async (req: Request, res: Response) => {
  try {
    const languages = await prisma.language.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: languages
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des langues:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des langues'
    });
  }
};

export const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatar: true,
        score: true,
        languageId: true,
        language: {
          select: {
            name: true
          }
        },
        solves: {
          select: {
            challenge: {
              select: {
                id: true,
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
          },
          orderBy: {
            solvedAt: 'desc'
          },
          take: 10
        }
      }
    }) as UserProfile | null;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Récupérer le rang de l'utilisateur
    const userRank = await prisma.user.count({
      where: {
        score: {
          gt: user.score
        }
      }
    });

    return res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        score: user.score,
        language: user.language.name,
        rank: userRank + 1,
        solvedChallenges: {
          total: user.solves.length,
          recent: user.solves.map(solve => ({
            id: solve.challenge.id,
            name: solve.challenge.title,
            category: solve.challenge.category.name,
            points: solve.challenge.points,
            solvedAt: solve.solvedAt
          }))
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil public:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil public'
    });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    const notifications = await prisma.notification.findMany({
      where: { 
        userId,
        read: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        message: true,
        type: true,
        createdAt: true
      }
    });

    return res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications'
    });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    return res.json({
      success: true,
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la notification'
    });
  }
}; 