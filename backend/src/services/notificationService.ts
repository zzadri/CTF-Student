import { PrismaClient } from '@prisma/client';
import { getSocketService } from './socketService';

const prisma = new PrismaClient();

export class NotificationService {
  public static async createNotification(userId: string, message: string, type: string = 'ADMIN') {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          message,
          type,
          read: false
        }
      });

      // Envoyer la notification via Socket.IO
      const socketService = getSocketService();
      socketService.sendNotification(userId, {
        id: notification.id,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt
      });

      return notification;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  }

  public static async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId
        },
        data: {
          read: true
        }
      });

      return notification;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
      throw error;
    }
  }

  public static async getUnreadNotifications(userId: string) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          read: false
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return notifications;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  }
} 