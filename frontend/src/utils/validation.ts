export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  // Limiter la taille de l'email
  if (!email) {
    return {
      isValid: false,
      message: "L'email est requis"
    };
  }

  if (email.length > 254) {
    return {
      isValid: false,
      message: "L'email est trop long"
    };
  }

  // Vérification simple de la structure
  const parts = email.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      message: "Format d'email invalide"
    };
  }

  const [localPart, domain] = parts;

  // Vérification des longueurs
  if (localPart.length > 64) {
    return {
      isValid: false,
      message: "La partie locale de l'email est trop longue"
    };
  }

  if (domain.length > 255) {
    return {
      isValid: false,
      message: "Le domaine est trop long"
    };
  }

  // Vérification des caractères
  const validLocalChars = /^[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~.]+$/;
  const validDomainChars = /^[a-zA-Z0-9.-]+$/;

  if (!validLocalChars.test(localPart)) {
    return {
      isValid: false,
      message: "L'email contient des caractères non autorisés"
    };
  }

  if (!validDomainChars.test(domain)) {
    return {
      isValid: false,
      message: "Le domaine contient des caractères non autorisés"
    };
  }

  // Vérification des points consécutifs et position
  if (localPart.includes('..') || domain.includes('..')) {
    return {
      isValid: false,
      message: "L'email ne peut pas contenir deux points consécutifs"
    };
  }

  if (localPart.startsWith('.') || localPart.endsWith('.') || 
      domain.startsWith('.') || domain.endsWith('.') ||
      domain.startsWith('-') || domain.endsWith('-')) {
    return {
      isValid: false,
      message: "Format d'email invalide"
    };
  }

  return { isValid: true };
};

export const validateUsername = (username: string): ValidationResult => {
  if (!username) {
    return {
      isValid: false,
      message: "Le nom d'utilisateur est requis"
    };
  }

  // Limiter la taille
  if (username.length > 30) {
    return {
      isValid: false,
      message: "Le nom d'utilisateur est trop long (maximum 30 caractères)"
    };
  }

  if (username.length < 3) {
    return {
      isValid: false,
      message: "Le nom d'utilisateur doit contenir au moins 3 caractères"
    };
  }

  // Vérification des caractères autorisés
  const validChars = /^[a-zA-Z0-9_-]+$/;
  if (!validChars.test(username)) {
    return {
      isValid: false,
      message: "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres, des tirets et des underscores"
    };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return {
      isValid: false,
      message: "Le mot de passe est requis"
    };
  }

  // Limiter la taille du mot de passe
  if (password.length > 72) {
    return {
      isValid: false,
      message: "Le mot de passe est trop long (maximum 72 caractères)"
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins 8 caractères"
    };
  }

  // Vérification de la complexité
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const missing = [];
  if (!hasUpperCase) missing.push("une majuscule");
  if (!hasLowerCase) missing.push("une minuscule");
  if (!hasNumbers) missing.push("un chiffre");
  if (!hasSpecialChars) missing.push("un caractère spécial");

  if (missing.length > 0) {
    return {
      isValid: false,
      message: `Le mot de passe doit contenir ${missing.join(", ")}`
    };
  }

  return { isValid: true };
};

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);
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