import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketService {
  private io: Server;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(httpServer: HttpServer) {
    console.log('Initialisation du service Socket.IO avec CORS_ORIGIN:', process.env.CORS_ORIGIN);
    
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Authorization', 'Content-Type']
      },
      allowEIO3: true,
      transports: ['polling', 'websocket'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.io.engine.on('connection_error', (err) => {
      console.error('Erreur de connexion Engine.IO:', err);
    });

    this.io.on('connection', (socket) => {
      console.log('Nouvelle connexion socket:', socket.id);
      
      socket.on('error', (error) => {
        console.error('Erreur socket:', error);
      });

      socket.on('authenticate', (userId: string) => {
        try {
          this.userSockets.set(userId, socket.id);
          console.log(`Utilisateur ${userId} authentifié sur le socket ${socket.id}`);
          socket.emit('authenticated', { success: true });
        } catch (error) {
          console.error('Erreur lors de l\'authentification:', error);
          socket.emit('authenticated', { success: false, error: 'Erreur d\'authentification' });
        }
      });

      socket.on('disconnect', () => {
        console.log('Déconnexion socket:', socket.id);
        // Supprimer l'utilisateur de la map
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId);
            console.log(`Utilisateur ${userId} déconnecté`);
            break;
          }
        }
      });
    });

    this.io.on('error', (error) => {
      console.error('Erreur générale Socket.IO:', error);
    });

    console.log('Service Socket.IO initialisé avec succès');
  }

  public sendNotification(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  public broadcastNotification(notification: any) {
    this.io.emit('notification', notification);
  }
}

let socketService: SocketService | null = null;

export const initializeSocket = (httpServer: HttpServer) => {
  socketService = new SocketService(httpServer);
  return socketService;
};

export const getSocketService = () => {
  if (!socketService) {
    throw new Error('Socket service not initialized');
  }
  return socketService;
}; 