import React, { createContext, useContext, useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { authService, User, LoginCredentials, RegisterCredentials, UpdateProfileData } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: UpdateProfileData) => Promise<User>;
  checkAdminRights: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await authService.login({ email, password });
      setUser(userData);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const userData = await authService.register({ username, email, password });
      setUser(userData);
      notifications.show({
        title: 'Succès',
        message: 'Inscription réussie !',
        color: 'green',
      });
    } catch (error: any) {
      const message = error.message || 'Une erreur est survenue lors de l\'inscription';
      notifications.show({
        title: 'Erreur',
        message: message,
        color: 'red',
      });
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = async (userData: UpdateProfileData): Promise<User> => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : null);
      return updatedUser;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  };

  const checkAdminRights = async (): Promise<boolean> => {
    return authService.checkAdminRights();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, checkAdminRights }}>
      {children}
    </AuthContext.Provider>
  );
} 