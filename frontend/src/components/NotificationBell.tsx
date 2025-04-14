import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const NotificationBell: React.FC = () => {
  const { unreadNotifications, markAsRead, connected } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Garantir que unreadNotifications est toujours un tableau
  const notifications = Array.isArray(unreadNotifications) ? unreadNotifications : [];

  // Fermer le menu des notifications lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    for (const notification of notifications) {
      await markAsRead(notification.id);
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full hover:bg-gray-700 focus:outline-none transition-all duration-200 ${
          isOpen ? 'bg-gray-700 text-white' : 'text-gray-400'
        }`}
        title={connected ? 'Connecté au serveur de notifications' : 'Déconnecté du serveur de notifications'}
      >
        <FontAwesomeIcon 
          icon={faBell} 
          className={`text-xl transform transition-transform duration-200 ${
            isOpen ? 'rotate-[15deg]' : ''
          }`}
        />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {notifications.length}
          </span>
        )}
        <FontAwesomeIcon
          icon={faCircle}
          className={`absolute bottom-0 right-0 text-xs transform scale-75 ${
            connected ? 'text-green-500' : 'text-red-500'
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-96 bg-gray-800 rounded-lg shadow-xl overflow-hidden z-50 transform transition-all duration-200 ease-out border border-gray-700">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                connected ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {connected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-1"
                >
                  <FontAwesomeIcon icon={faCheck} className="text-xs" />
                  <span>Tout marquer comme lu</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200 hover:bg-gray-700 rounded-full p-1"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>

          <div className="max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 bg-gray-800/50">
                <FontAwesomeIcon icon={faBell} className="text-3xl mb-3 opacity-50" />
                <p>Aucune notification non lue</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-700/50 transition-colors duration-200 group relative"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white break-words leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </p>
                          {notification.type === 'ADMIN' && (
                            <span className="px-2 py-0.5 text-xs font-medium text-blue-300 bg-blue-500/20 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-white transition-all duration-200 hover:bg-gray-600 px-2 py-1 rounded"
                      >
                        <FontAwesomeIcon icon={faCheck} className="mr-1" />
                        Lu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 