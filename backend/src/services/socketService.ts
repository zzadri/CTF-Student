import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

let socketService: SocketService | null = null;

export class SocketService {
  private io: Server;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(httpServer: HttpServer) {
    console.log('Initialisation du service Socket.IO avec CORS_ORIGIN:', process.env.CORS_ORIGIN);
    
    this.io = new Server(httpServer, {
      cors: {
        origin: [process.env.CORS_ORIGIN || 'http://localhost:5173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Authorization', 'Content-Type']
      },
      allowEIO3: true,
      transports: ['polling', 'websocket'],
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 10000,
      maxHttpBufferSize: 1e6,
      path: '/socket.io/',
      connectTimeout: 45000,
      perMessageDeflate: false,
      httpCompression: false,
      serveClient: false
    });

    // Middleware d'authentification
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Token d\'authentification manquant'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new Error('Token invalide'));
      }
    });

    this.io.engine.on('connection_error', (err) => {
      console.error('Erreur de connexion Engine.IO:', {
        type: err.type,
        message: err.message,
        code: err.code,
        transport: err.transport?.name
      });
    });

    this.io.on('connection', (socket) => {
      console.log('Nouvelle connexion socket:', socket.id);
      console.log('Transport utilisé:', socket.conn.transport.name);
      
      socket.on('error', (error) => {
        console.error('Erreur socket:', error);
      });

      socket.on('authenticate', (userId: string) => {
        if (socket.data.user?.userId !== userId) {
          socket.emit('authenticated', { 
            success: false, 
            error: 'ID utilisateur non autorisé' 
          });
          return;
        }

        try {
          // Nettoyer les anciennes connexions pour cet utilisateur
          const oldSocketId = this.userSockets.get(userId);
          if (oldSocketId && oldSocketId !== socket.id) {
            const oldSocket = this.io.sockets.sockets.get(oldSocketId);
            if (oldSocket) {
              oldSocket.disconnect(true);
            }
          }

          this.userSockets.set(userId, socket.id);
          console.log(`Utilisateur ${userId} authentifié sur le socket ${socket.id}`);
          socket.emit('authenticated', { success: true });
        } catch (error) {
          console.error('Erreur lors de l\'authentification:', error);
          socket.emit('authenticated', { 
            success: false, 
            error: 'Erreur d\'authentification' 
          });
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

      socket.conn.on('upgrade', (transport) => {
        console.log('Transport mis à niveau vers:', transport.name);
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
      return true;
    }
    return false;
  }

  public broadcastNotification(notification: any) {
    this.io.emit('notification', notification);
    return true;
  }
}

export const initializeSocket = (httpServer: HttpServer): SocketService => {
  if (!socketService) {
    socketService = new SocketService(httpServer);
  }
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('Socket service not initialized');
  }
  return socketService;
}; 