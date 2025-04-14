import axios from 'axios';

// URL de base de l'API
export const API_URL = import.meta.env.VITE_API_URL;

// Configuration globale d'axios
axios.defaults.baseURL = API_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true; // Important pour les cookies - cela permet l'envoi automatique des cookies avec chaque requête

// Nous n'avons plus besoin d'ajouter manuellement le token car il sera envoyé automatiquement via le cookie
// L'intercepteur n'a plus besoin d'ajouter le token dans les headers

// Intercepteur pour gérer les erreurs de réponse
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs d'authentification (401)
    if (error.response && error.response.status === 401) {
      console.warn('Session expirée ou non authentifié');
      
      // Éviter de rediriger si on est déjà sur la page d'authentification
      if (!window.location.pathname.includes('/auth') && !window.location.pathname.includes('/register')) {
        // Rediriger vers la page de connexion
        window.location.href = '/auth';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios; 