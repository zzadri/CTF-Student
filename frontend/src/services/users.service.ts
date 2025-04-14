import axios, { API_URL } from './axios.config';
import { normalizeResponse, handleError } from './api.service';

// Interfaces
export interface Language {
  id: string;
  name: string;
}

export interface PublicProfile {
  id: string;
  username: string;
  avatar: string;
  score: number;
  language: string;
  rank: number;
  solvedChallenges: {
    total: number;
    recent: Array<{
      id: string;
      name: string;
      category: string;
      points: number;
      solvedAt: string;
    }>;
  };
}

export interface LeaderboardUser {
  id: string;
  username: string;
  avatar: string;
  score: number;
  challengesCompleted: number;
  recentAchievements: Array<{
    challengeName: string;
    points: number;
    category: string;
    completedAt: string;
  }>;
  rank?: number;
}

export interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

class UsersService {
  // Récupérer les langues disponibles
  async getLanguages(): Promise<Language[]> {
    try {
      const response = await axios.get(`${API_URL}/users/languages`);
      return normalizeResponse(response.data);
    } catch (error) {
      return handleError(error, 'Erreur lors du chargement des langues');
    }
  }

  // Récupérer le classement des utilisateurs
  async getLeaderboard(): Promise<LeaderboardUser[]> {
    try {
      const response = await axios.get(`${API_URL}/users/leaderboard`);
      const data = normalizeResponse(response.data);
      
      // Ajouter le rang aux utilisateurs
      return data.map((user: LeaderboardUser, index: number) => ({
        ...user,
        rank: index + 1
      }));
    } catch (error) {
      return handleError(error, 'Erreur lors du chargement du classement');
    }
  }

  // Récupérer le profil public d'un utilisateur
  async getPublicProfile(userId: string): Promise<PublicProfile> {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/profile`);
      return normalizeResponse(response.data);
    } catch (error) {
      return handleError(error, 'Erreur lors du chargement du profil');
    }
  }

  // Récupérer les notifications d'un utilisateur
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await axios.get(`${API_URL}/notifications`);
      const data = normalizeResponse(response.data);
      
      // S'assurer que nous renvoyons un tableau
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object' && 'notifications' in data) {
        return data.notifications || [];
      } else {
        console.warn('Format de données inattendu pour les notifications', data);
        return [];
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      return [];
    }
  }

  // Marquer une notification comme lue
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`);
    } catch (error) {
      handleError(error, 'Erreur lors de la mise à jour de la notification');
    }
  }
}

export const usersService = new UsersService(); 