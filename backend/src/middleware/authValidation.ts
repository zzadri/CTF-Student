import { Request, Response, NextFunction } from 'express';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { email, username, password } = req.body;

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email invalide'
    });
  }

  // Validation du nom d'utilisateur
  if (!username || username.length < 3 || username.length > 30) {
    return res.status(400).json({
      success: false,
      message: 'Le nom d\'utilisateur doit contenir entre 3 et 30 caractères'
    });
  }

  // Validation du mot de passe
  if (!password || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Le mot de passe doit contenir au moins 8 caractères'
    });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    });
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email invalide'
    });
  }

  // Validation basique du mot de passe
  if (!password || password.length < 1) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez entrer un mot de passe'
    });
  }

  next();
}; 