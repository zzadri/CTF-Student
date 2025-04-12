export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  // Limiter la taille de l'email pour éviter les attaques DoS
  if (email.length > 254) { // RFC 5321
    return {
      isValid: false,
      message: "L'email est trop long"
    };
  }

  // Vérification simple de la structure de l'email
  const [localPart, domain] = email.split('@');
  
  if (!localPart || !domain) {
    return {
      isValid: false,
      message: "Format d'email invalide"
    };
  }

  // Vérification de la partie locale
  if (localPart.length > 64) { // RFC 5321
    return {
      isValid: false,
      message: "La partie locale de l'email est trop longue"
    };
  }

  // Vérification du domaine
  if (domain.length > 255) {
    return {
      isValid: false,
      message: "Le domaine est trop long"
    };
  }

  // Vérification des caractères valides dans la partie locale et le domaine
  const validLocalChars = /^[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~.]+$/;
  const validDomainChars = /^[a-zA-Z0-9.-]+$/;

  if (!validLocalChars.test(localPart) || !validDomainChars.test(domain)) {
    return {
      isValid: false,
      message: "L'email contient des caractères non autorisés"
    };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  // Limiter la taille du mot de passe
  if (password.length > 72) { // Limite bcrypt
    return {
      isValid: false,
      message: "Le mot de passe est trop long"
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins 8 caractères"
    };
  }

  // Vérification de la complexité du mot de passe
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars)) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
    };
  }

  return { isValid: true };
};

export const validateUsername = (username: string): ValidationResult => {
  // Limiter la taille du nom d'utilisateur
  if (username.length > 30) {
    return {
      isValid: false,
      message: "Le nom d'utilisateur est trop long"
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