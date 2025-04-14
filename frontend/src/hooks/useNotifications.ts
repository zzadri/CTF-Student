import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { notifications } from '@mantine/notifications';
import { usersService } from '../services/users.service';
import axios from '../services/axios.config';

interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  success: boolean;
}

export const useNotifications = () => {
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('notification', (notification: Notification) => {
        setUnreadNotifications(prev => [notification, ...prev]);
        
        notifications.show({
          title: notification.type === 'ADMIN' ? 'Message administrateur' : 'Nouvelle notification',
          message: notification.message,
          color: notification.type === 'ADMIN' ? 'blue' : 'green',
          autoClose: 5000
        });
      });

      // Charger les notifications non lues au démarrage
      fetchUnreadNotifications();

      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);

  const fetchUnreadNotifications = async () => {
    try {
      const notificationsData = await usersService.getNotifications();
      // S'assurer que c'est un tableau
      if (Array.isArray(notificationsData)) {
        setUnreadNotifications(notificationsData);
      } else {
        // Si c'est un objet avec une propriété notifications
        const response = notificationsData as unknown as NotificationsResponse;
        setUnreadNotifications(response.notifications || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      setUnreadNotifications([]); // Définir un tableau vide en cas d'erreur
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await usersService.markNotificationAsRead(notificationId);
      
      setUnreadNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
      
      if (socket?.connected) {
        socket.emit('notification_read', notificationId);
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de marquer la notification comme lue',
        color: 'red'
      });
    }
  };

  return {
    unreadNotifications: Array.isArray(unreadNotifications) ? unreadNotifications : [],
    markAsRead,
    connected
  };
}; 