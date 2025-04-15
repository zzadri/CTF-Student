import axios, { API_URL } from './axios.config';
import { normalizeResponse, handleError } from './api.service';
import { User, LoginCredentials, RegisterCredentials, UpdateProfileData } from '../types/auth.types';

class AuthService {
  private user: User | null = null;

  // Vérifier si l'utilisateur est connecté et récupérer ses informations
  async getCurrentUser(): Promise<User | null> {
    try {
      // Si nous avons déjà les informations utilisateur en mémoire, les retourner
      if (this.user) {
        return this.user;
      }

      const response = await axios.get(`${API_URL}/auth/me`);
      
      if (response.data.success) {
        this.user = response.data.user;
        return this.user;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      return null;
    }
  }

  // Se connecter
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      if (response.data.success && response.data.user) {
        this.user = response.data.user;
        return response.data.user;
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (error) {
      return handleError(error, 'Identifiants invalides');
    }
  }

  // S'inscrire
  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, credentials);
      
      if (response.data.success && response.data.user) {
        this.user = response.data.user;
        return response.data.user;
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (error) {
      return handleError(error, 'Erreur lors de l\'inscription');
    }
  }

  // Se déconnecter
  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/logout`);
      this.user = null;
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      window.location.href = '/auth';
    }
  }

  // Rafraîchir le token
  async refreshToken(): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh`);
      return response.data.success === true;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      return false;
    }
  }

  // Vérifier les droits admin
  async checkAdminRights(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/admin/check`);
      return response.data.success === true;
    } catch (error) {
      console.error('Erreur lors de la vérification des droits administrateur:', error);
      return false;
    }
  }

  // Mettre à jour le profil utilisateur
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await axios.put(`${API_URL}/users/profile`, data);
      if (response.data.success && response.data.user) {
        this.user = response.data.user;
        return response.data.user;
      }
      throw new Error('Mise à jour du profil échouée');
    } catch (error) {
      return handleError(error, 'Erreur lors de la mise à jour du profil');
    }
  }
}

export const authService = new AuthService(); 