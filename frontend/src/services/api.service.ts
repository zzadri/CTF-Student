import { notifications } from '@mantine/notifications';
import axios, { API_URL } from './axios.config';
import { FlagValidationResponse } from '../types/challenge.types';

// Interfaces pour les types de données
export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  _count?: {
    challenges: number;
  };
}

export interface Challenge {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  difficulty: 'EZ' | 'EASY' | 'NORMAL' | 'HARD' | 'EXPERT';
  points: number;
  categoryId: string;
  category: {
    name: string;
    color: string;
    icon?: string;
  };
  resources: Resource[];
  isSolved?: boolean;
  solvedBy?: {
    _count: number;
  };
  type: 'URL' | 'FILE' | 'IMAGE';
  url?: string;
  imageb64?: string;
}

export interface Resource {
  id: string;
  type: 'LINK' | 'FILE';
  value: string;
  name?: string;
}

export interface Stats {
  totalUsers: number;
  totalChallenges: number;
  totalCategories: number;
  activeUsers: number;
  completionRate: number;
}

// Cache de données
interface CachedData {
  data: any;
  timestamp: number;
}

export const cache: { [key: string]: CachedData } = {};
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fonction utilitaire pour normaliser les réponses de l'API
export const normalizeResponse = (response: any) => {
  if (Array.isArray(response)) {
    return response;
  } else if (response.data && Array.isArray(response.data)) {
    return response.data;
  } else if (response.data) {
    return response.data;
  }
  return response;
};

// Fonction utilitaire pour gérer les erreurs
export const handleError = (error: any, customMessage?: string) => {
  console.error('Erreur API:', error);
  notifications.show({
    title: 'Erreur',
    message: customMessage ?? 'Une erreur est survenue lors de la communication avec le serveur',
    color: 'red'
  });
  throw error;
};

// Classe principale du service API
class ApiService {
  // Fonction pour les requêtes GET avec cache
  async fetchWithCache<T>(url: string): Promise<T> {
    try {
      const cachedData = cache[url];
      const now = Date.now();

      if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
        return cachedData.data as T;
      }

      const response = await axios.get(url);
      const normalizedData = normalizeResponse(response.data);
      
      cache[url] = {
        data: normalizedData,
        timestamp: now
      };
      
      return normalizedData as T;
    } catch (error) {
      return handleError(error);
    }
  }

  // Fonction pour les requêtes GET sans cache
  async fetch<T>(url: string, params?: any): Promise<T> {
    try {
      const response = await axios.get(url, { params });
      return normalizeResponse(response.data) as T;
    } catch (error) {
      return handleError(error);
    }
  }

  // Fonction pour vider le cache
  clearCache(): void {
    Object.keys(cache).forEach(key => delete cache[key]);
  }

  // === API CATEGORIES ===
  
  // Récupérer toutes les catégories
  async getCategories(): Promise<Category[]> {
    return this.fetchWithCache<Category[]>(`${API_URL}/categories`);
  }

  // Récupérer une catégorie par son ID
  async getCategory(categoryId: string): Promise<Category> {
    return this.fetch<Category>(`${API_URL}/categories/${categoryId}`);
  }

  // === API CHALLENGES ===
  
  // Récupérer tous les challenges
  async getChallenges(params?: { categoryId?: string }): Promise<Challenge[]> {
    return this.fetch<Challenge[]>(`${API_URL}/challenges`, params);
  }

  // Récupérer un challenge par son ID
  async getChallenge(challengeId: string): Promise<Challenge> {
    return this.fetch<Challenge>(`${API_URL}/challenges/${challengeId}`);
  }

  // Vérifier un flag
  async verifyFlag(challengeId: string, flag: string): Promise<FlagValidationResponse> {
    try {
      const response = await axios.post(`${API_URL}/challenges/${challengeId}/verify`, { flag });
      const data = normalizeResponse(response.data);

      if (data.success) {
        // Mettre à jour le cache des challenges pour marquer celui-ci comme résolu
        this.clearCache();
        
        return {
          success: true,
          message: data.message ?? 'Félicitations ! Flag correct',
          points: data.points
        };
      }

      return {
        success: false,
        message: data.message ?? 'Flag incorrect'
      };
    } catch (error: any) {
      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data.message ?? 'Flag incorrect ou challenge déjà résolu'
        };
      }
      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Vous devez être connecté pour soumettre un flag'
        };
      }
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Challenge introuvable'
        };
      }
      
      return handleError(error, 'Une erreur est survenue lors de la vérification du flag');
    }
  }

  // === API PROFILE ===
  
  // Récupérer le profil utilisateur
  async getUserProfile(): Promise<any> {
    return this.fetch<any>(`${API_URL}/user/profile`);
  }

  // Mettre à jour le profil utilisateur
  async updateUserProfile(profileData: any): Promise<any> {
    try {
      const response = await axios.put(`${API_URL}/user/profile`, profileData);
      return normalizeResponse(response.data);
    } catch (error) {
      return handleError(error, 'Erreur lors de la mise à jour du profil');
    }
  }
}

// Export singleton
export const apiService = new ApiService();