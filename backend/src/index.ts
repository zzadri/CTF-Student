import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/category';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';
import { specs } from './config/swagger';
import path from 'path';

const prisma = new PrismaClient();
const app = express();

// Désactiver l'en-tête X-Powered-By pour des raisons de sécurité
app.disable('x-powered-by');

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

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

// Servir les fichiers statiques
app.use('/avatars', express.static(path.join(__dirname, '../public/avatars')));

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT;

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

main(); 