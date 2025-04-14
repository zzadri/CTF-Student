import axios, { API_URL } from './axios.config';
import { normalizeResponse, handleError } from './api.service';

// Interface pour les utilisateurs dans le tableau admin
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  score: number;
  avatar: string | null;
  createdAt: string;
  isBlocked?: boolean;
}

class AdminUsersService {
  // Récupérer tous les utilisateurs (admin)
  async getUsers(): Promise<AdminUser[]> {
    try {
      const response = await axios.get(`${API_URL}/admin/users`);
      return response.data.users;
    } catch (error) {
      return handleError(error, 'Erreur lors de la récupération des utilisateurs');
    }
  }

  // Réinitialiser le nom d'utilisateur
  async resetUsername(userId: string): Promise<any> {
    try {
      const response = await axios.put(`${API_URL}/admin/users/${userId}/reset-username`);
      return normalizeResponse(response.data);
    } catch (error) {
      return handleError(error, 'Erreur lors de la réinitialisation du nom d\'utilisateur');
    }
  }

  // Réinitialiser le score
  async resetScore(userId: string): Promise<any> {
    try {
      const response = await axios.put(`${API_URL}/admin/users/${userId}/reset-score`);
      return normalizeResponse(response.data);
    } catch (error) {
      return handleError(error, 'Erreur lors de la réinitialisation du score');
    }
  }

  // Réinitialiser l'avatar
  async resetAvatar(userId: string): Promise<any> {
    try {
      const response = await axios.put(`${API_URL}/admin/users/${userId}/reset-avatar`);
      return normalizeResponse(response.data);
    } catch (error) {
      return handleError(error, 'Erreur lors de la réinitialisation de l\'avatar');
    }
  }

  // Bloquer/débloquer un utilisateur
  async toggleBlock(userId: string): Promise<any> {
    try {
      const response = await axios.put(`${API_URL}/admin/users/${userId}/toggle-block`);
      return normalizeResponse(response.data);
    } catch (error) {
      return handleError(error, 'Erreur lors de la modification du statut de blocage');
    }
  }

  // Envoyer une notification à un utilisateur
  async sendNotification(userId: string, message: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/admin/users/${userId}/notify`, { message });
    } catch (error) {
      handleError(error, 'Erreur lors de l\'envoi de la notification');
    }
  }

  // Supprimer un utilisateur
  async deleteUser(userId: string, username: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}/delete`, {
        data: { username }
      });
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression de l\'utilisateur');
    }
  }
}

export const adminUsersService = new AdminUsersService(); 