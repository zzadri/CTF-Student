import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { notifications } from '@mantine/notifications';
import axios from 'axios';

interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/notifications`);
      if (response.data.success) {
        setUnreadNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/notifications/${notificationId}`
      );
      if (response.data.success) {
        setUnreadNotifications(prev =>
          prev.filter(notification => notification.id !== notificationId)
        );
        
        if (socket?.connected) {
          socket.emit('notification_read', notificationId);
        }
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
    unreadNotifications,
    markAsRead,
    connected
  };
}; 