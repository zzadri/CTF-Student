export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  role: string;
  score: number;
  languageId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface UpdateProfileData {
  username?: string;
  avatar?: string;
  languageId?: string;
} 