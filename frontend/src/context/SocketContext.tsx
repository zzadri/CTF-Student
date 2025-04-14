import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socketUrl = import.meta.env.VITE_WS_URL;
      const newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 45000,
        path: '/socket.io/'
      });

      newSocket.on('connect', () => {
        console.log('Connecté au serveur de notifications');
        setConnected(true);
        newSocket.emit('authenticate', user.id);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Erreur de connexion socket:', error.message);
        setConnected(false);
        
        if (newSocket.io.engine?.transport?.name !== 'websocket') {
          newSocket.io.opts.transports = ['polling', 'websocket'];
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Déconnecté du serveur de notifications');
        setConnected(false);
      });

      newSocket.connect();
      setSocket(newSocket);

      return () => {
        newSocket.removeAllListeners();
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}; 