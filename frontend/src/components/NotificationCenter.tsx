import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { Menu, ActionIcon, Badge, Text } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck } from '@fortawesome/free-solid-svg-icons';

interface Notification {
  id: string;
  message: string;
  type: string;
  createdAt: string;
}

export function NotificationCenter() {
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/notifications`);
      setUserNotifications(response.data.notifications);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Rafraîchir les notifications toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/users/notifications/${notificationId}`);
      setUserNotifications(prev => prev.filter(n => n.id !== notificationId));
      notifications.show({
        title: 'Succès',
        message: 'Notification marquée comme lue',
        color: 'green'
      });
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de marquer la notification comme lue',
        color: 'red'
      });
    }
  };

  return (
    <Menu position="bottom-end" styles={{
      dropdown: {
        backgroundColor: '#2d3748', // bg-gray-800
        border: '1px solid #4a5568', // border-gray-700
        color: 'white'
      },
      item: {
        color: 'white',
        '&:hover': {
          backgroundColor: '#4a5568' // bg-gray-700
        }
      },
      label: {
        color: '#a0aec0' // text-gray-400
      }
    }}>
      <Menu.Target>
        <div className="relative">
          <ActionIcon 
            variant="light"
            color="blue"
            size="lg"
            className="hover:bg-blue-600 transition-colors"
            title="Centre de notifications"
          >
            <FontAwesomeIcon icon={faBell} size="lg" className="text-white" />
          </ActionIcon>
          {userNotifications.length > 0 && (
            <Badge 
              className="absolute -top-1 -right-1" 
              size="sm" 
              variant="filled" 
              color="red"
              styles={{
                root: {
                  border: '2px solid #2d3748'
                }
              }}
            >
              {userNotifications.length}
            </Badge>
          )}
        </div>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Notifications</Menu.Label>
        {userNotifications.length === 0 ? (
          <Menu.Item>Aucune notification</Menu.Item>
        ) : (
          userNotifications.map((notification) => (
            <Menu.Item
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
              rightSection={<FontAwesomeIcon icon={faCheck} className="text-green-500" />}
            >
              <div>
                <Text size="sm" className="text-gray-100">{notification.message}</Text>
                <Text size="xs" className="text-gray-400">
                  {new Date(notification.createdAt).toLocaleString()}
                </Text>
              </div>
            </Menu.Item>
          ))
        )}
      </Menu.Dropdown>
    </Menu>
  );
} 