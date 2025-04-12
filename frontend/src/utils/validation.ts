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