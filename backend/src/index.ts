import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/category';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import challengeRoutes from './routes/challenge';
import { errorHandler } from './middleware/errorHandler';
import { specs } from './config/swagger';
import path from 'path';
import { tokenBlacklist } from './utils/tokenBlacklist';
import { config } from 'dotenv';
import { createServer } from 'http';
import { initializeSocket } from './services/socketService';
import notificationRoutes from './routes/notificationRoutes';

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);

config();

// Initialiser la blacklist au démarrage
tokenBlacklist.initialize().catch(error => {
  console.error('Erreur lors de l\'initialisation de la blacklist:', error);
});

// Désactiver l'en-tête X-Powered-By pour des raisons de sécurité
app.disable('x-powered-by');

// Configuration CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Origin', 'Accept']
}));

// Middleware pour les options CORS préflight
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware pour parser les cookies
app.use(cookieParser());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Documentation Swagger
app.use('/api-backend-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/notifications', notificationRoutes);

// Servir les fichiers statiques
app.use('/avatars', express.static(path.join(__dirname, '../public/avatars')));

// Error handling
app.use(errorHandler);

// Initialiser Socket.IO
console.log('Tentative d\'initialisation de Socket.IO...');
const socketService = initializeSocket(httpServer);
console.log('Socket.IO initialisé avec succès');

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    console.log('Tentative de connexion à la base de données...');
    await prisma.$connect();
    console.log('Connecté à la base de données avec succès');
    
    httpServer.listen(PORT, () => {
      console.log('=================================');
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`CORS autorisé pour: ${process.env.CORS_ORIGIN}`);
      console.log(`Socket.IO en écoute sur le port ${PORT}`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Erreur fatale lors du démarrage:', error);
  process.exit(1);
}); 