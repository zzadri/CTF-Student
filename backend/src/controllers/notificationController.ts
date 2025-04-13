import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    const notifications = await NotificationService.getUnreadNotifications(userId);
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

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    const notification = await NotificationService.markAsRead(notificationId, userId);
    return res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage de la notification'
    });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, message, type } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        message: 'userId et message sont requis'
      });
    }

    const notification = await NotificationService.createNotification(userId, message, type);
    return res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la notification'
    });
  }
}; 