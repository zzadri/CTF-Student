import axios, { API_URL } from './axios.config';
import { 
  normalizeResponse, 
  handleError, 
  Category, 
  Challenge, 
  Stats,
  cache,
  CACHE_DURATION
} from './api.service';

// Classe service pour les fonctionnalités d'administration
class AdminApiService {
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

  // === GESTION DES CATÉGORIES (ADMIN) ===

  // Créer une nouvelle catégorie
  async createCategory(category: Partial<Category>): Promise<Category> {
    try {
      const response = await axios.post(`${API_URL}/admin/categories`, category);
      return normalizeResponse(response.data);
    } catch (error) {
      return handleError(error, 'Erreur lors de la création de la catégorie');
    }
  }

  // Mettre à jour une catégorie
  async updateCategory(categoryId: string, category: Partial<Category>): Promise<Category> {
    try {
      const response = await axios.put(`${API_URL}/admin/categories/${categoryId}`, category);
      return normalizeResponse(response.data);
    } catch (error) {
      return handleError(error, 'Erreur lors de la mise à jour de la catégorie');
    }
  }

  // Supprimer une catégorie
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/admin/categories/${categoryId}`);
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression de la catégorie');
    }
  }

  // === GESTION DES CHALLENGES (ADMIN) ===

  // Créer un nouveau challenge
  async createChallenge(challenge: FormData): Promise<Challenge> {
    try {
      const response = await axios.post(`${API_URL}/admin/challenges`, challenge, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return normalizeResponse(response.data);
    } catch (error) {
      return handleError(error, 'Erreur lors de la création du challenge');
    }
  }

  // Mettre à jour un challenge
  async updateChallenge(challengeId: string, challenge: FormData): Promise<Challenge> {
    try {
      const response = await axios.put(`${API_URL}/admin/challenges/${challengeId}`, challenge, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return normalizeResponse(response.data);
    } catch (error) {
      return handleError(error, 'Erreur lors de la mise à jour du challenge');
    }
  }

  // Supprimer un challenge
  async deleteChallenge(challengeId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/admin/challenges/${challengeId}`);
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression du challenge');
    }
  }

  // === GESTION DES UTILISATEURS ET STATISTIQUES (ADMIN) ===
  
  // Récupérer les statistiques admin
  async getAdminStats(): Promise<Stats> {
    return this.fetchWithCache<Stats>(`${API_URL}/admin/stats`);
  }

  // Récupérer les utilisateurs (admin)
  async getUsers(): Promise<any[]> {
    return this.fetch<any[]>(`${API_URL}/admin/users`);
  }

  // Mettre à jour un utilisateur (admin)
  async updateUser(userId: string, userData: any): Promise<any> {
    try {
      const response = await axios.put(`${API_URL}/admin/users/${userId}`, userData);
      return normalizeResponse(response.data);
    } catch (error) {
      return handleError(error, 'Erreur lors de la mise à jour de l\'utilisateur');
    }
  }

  // Supprimer un utilisateur (admin)
  async deleteUser(userId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`);
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression de l\'utilisateur');
    }
  }
}

// Export singleton
export const adminApiService = new AdminApiService(); 