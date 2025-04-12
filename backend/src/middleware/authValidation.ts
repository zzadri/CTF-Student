import { Request, Response, NextFunction } from 'express';
import { validateEmail, validatePassword, validateUsername } from '../utils/validation';

export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, username } = req.body;

  // Vérification des champs requis
  if (!email || !password || !username) {
    return res.status(400).json({
      success: false,
      message: 'Tous les champs sont requis'
    });
  }

  // Validation de l'email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: emailValidation.message
    });
  }

  // Validation du mot de passe
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: passwordValidation.message
    });
  }

  // Validation du nom d'utilisateur
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: usernameValidation.message
    });
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Vérification des champs requis
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email et mot de passe requis'
    });
  }

  // Validation de l'email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: emailValidation.message
    });
  }

  // Validation basique du mot de passe (longueur uniquement pour le login)
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({
      success: false,
      message: 'Format de mot de passe invalide'
    });
  }

  next();
}; 