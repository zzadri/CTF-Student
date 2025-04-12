import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { defaultAvatars } from '../utils/avatars';
import { LoginBody, RegisterBody } from '../interfaces/auth.interface';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const setAuthCookie = (res: Response, token: string) => {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
  });
};

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  try {
    const { email, password, username } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Un utilisateur avec cet email ou ce nom d'utilisateur existe déjà"
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Sélectionner un avatar aléatoire de manière cryptographiquement sûre
    const randomIndex = crypto.randomInt(defaultAvatars.length);
    const randomAvatar = defaultAvatars[randomIndex];

    // Création de l'utilisateur avec la langue par défaut (fr)
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        avatar: randomAvatar
      }
    });

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription'
    });
  }
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    console.log('Corps de la requête complet:', req.body);
    console.log('Type de req.body:', typeof req.body);
    
    const { email, password } = req.body;
    
    console.log('Données extraites:', {
      email: email,
      emailType: typeof email,
      passwordLength: password ? password.length : 0
    });

    // Vérification des données
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Format d'email invalide"
      });
    }

    // Recherche de l'utilisateur avec email simple
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    console.log('Résultat de la recherche:', {
      userFound: !!user,
      userEmail: user?.email
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect"
      });
    }

    // Vérification du mot de passe
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect"
      });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Envoi de la réponse
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la connexion"
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        score: true,
        languageId: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    return res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
}; 