import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginBody, RegisterBody } from '../interfaces/auth.interface';

const prisma = new PrismaClient();
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  try {
    const { email, password, username } = req.body;

    // Vérification des données
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis"
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email ? "Cet email est déjà utilisé" : "Ce nom d'utilisateur est déjà utilisé"
      });
    }

    // Vérifier si la langue française existe
    const frLanguage = await prisma.language.findUnique({
      where: { id: 'fr' }
    });

    if (!frLanguage) {
      // Créer la langue française si elle n'existe pas
      await prisma.language.create({
        data: {
          id: 'fr',
          name: 'Français'
        }
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        languageId: 'fr', // Définir la langue par défaut
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iIzllMjdiMCIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjEwMCIgcj0iNjQiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMjU2LDI1NkgwVjE5MmMwLTM1LjMsMjguNy02NCw2NC02NGgxMjhjMzUuMywwLDY0LDI4LjcsNjQsNjRWMjU2eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==' // Avatar par défaut
      },
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

    // Générer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Stocker le token dans un cookie HTTP-only
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE
    });

    return res.status(201).json({
      success: true,
      message: "Compte créé avec succès",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        score: user.score,
        languageId: user.languageId
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création du compte"
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
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
        avatar: true,
        isBlocked: true,
        score: true,
        languageId: true
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

    // Vérifier si l'utilisateur est bloqué
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Votre compte a été bloqué. Veuillez contacter un administrateur."
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
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Stocker le token dans un cookie HTTP-only
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE
    });

    // Envoi de la réponse sans inclure le token
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        score: user.score,
        languageId: user.languageId
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

// Ajouter une route de déconnexion pour effacer le cookie
export const logout = async (req: Request, res: Response) => {
  try {
    // Supprimer le cookie d'authentification
    res.clearCookie('auth_token');
    
    return res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion'
    });
  }
}; 