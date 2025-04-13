import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Connexion au serveur Socket.IO avec la bonne URL
      const socketUrl = import.meta.env.VITE_WS_URL;
      console.log('Tentative de connexion socket à:', socketUrl);
      const newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ['polling', 'websocket'],
        auth: {
          token: localStorage.getItem('token')
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        console.log('Connecté au serveur de notifications avec l\'ID:', newSocket.id);
        // Authentifier le socket avec l'ID de l'utilisateur
        newSocket.emit('authenticate', user.id);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Erreur de connexion socket:', error.message);
        console.log('État du transport:', newSocket.io.engine?.transport?.name);
        notifications.show({
          title: 'Erreur de connexion',
          message: `Impossible de se connecter au serveur de notifications: ${error.message}`,
          color: 'red'
        });
      });

      newSocket.on('notification', (notification: Notification) => {
        // Ajouter la nouvelle notification à la liste
        setUnreadNotifications(prev => [notification, ...prev]);
        
        // Afficher une notification toast
        notifications.show({
          title: notification.type === 'ADMIN' ? 'Message administrateur' : 'Nouvelle notification',
          message: notification.message,
          color: notification.type === 'ADMIN' ? 'blue' : 'green',
          autoClose: 5000
        });
      });

      setSocket(newSocket);

      // Charger les notifications non lues au démarrage
      fetchUnreadNotifications();

      return () => {
        if (newSocket.connected) {
          newSocket.disconnect();
        }
      };
    }
  }, [user]);

  const fetchUnreadNotifications = async () => {
    try {
      // Correction de l'URL en retirant le /api/ en double
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
        
        // Informer le serveur via socket que la notification a été lue
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
    connected: socket?.connected || false
  };
}; 