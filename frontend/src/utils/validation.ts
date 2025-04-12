import { AUTH_CONFIG } from '../config/auth.config';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, message: 'L\'email est requis' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Email invalide' };
  }
  return { isValid: true };
};

export const validateUsername = (username: string): ValidationResult => {
  if (!username) {
    return { isValid: false, message: 'Le nom d\'utilisateur est requis' };
  }
  if (username.length < 3 || username.length > 30) {
    return { isValid: false, message: 'Le nom d\'utilisateur doit contenir entre 3 et 30 caractères' };
  }
  return { isValid: true };
};

export const validatePassword = (password: string, isLogin = false): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Le mot de passe est requis' };
  }

  if (isLogin) {
    return { isValid: true };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (!passwordRegex.test(password)) {
    return { 
      isValid: false, 
      message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial' 
    };
  }

  return { isValid: true };
};

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password, true);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  return { isValid: true };
};

export const validateRegisterForm = (
  email: string,
  username: string,
  password: string
): ValidationResult => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    return usernameValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  return { isValid: true };
};

export interface ValidationErrors {
  [key: string]: string;
}

export const validateAuthForm = (
  email: string,
  password: string,
  username?: string,
  isRegister = false
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!email) {
    errors.email = "L'email est requis";
  } else if (!AUTH_CONFIG.EMAIL_PATTERN.test(email)) {
    errors.email = "Email invalide";
  }

  if (isRegister && !username) {
    errors.username = "Le nom d'utilisateur est requis";
  }

  if (!password) {
    errors.password = "Le mot de passe est requis";
  } else if (password.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.password = `Le mot de passe doit contenir au moins ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} caractères`;
  } else if (!new RegExp(AUTH_CONFIG.PASSWORD_PATTERN).test(password)) {
    errors.password = "Le format du mot de passe est invalide";
  }

  return errors;
}; 