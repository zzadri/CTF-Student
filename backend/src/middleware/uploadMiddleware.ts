import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { validateAndConvertImage } from '../utils/imageUtils';

// Configuration de multer pour stocker les fichiers en mémoire
const storage = multer.memoryStorage();

// Filtre pour n'accepter que les images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Le fichier doit être une image'));
  }
};

// Configuration de multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

// Middleware de validation et conversion d'image
export const processImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next();
    }

    const base64Image = await validateAndConvertImage(req.file.buffer, req.file.mimetype);
    
    if (!base64Image) {
      return res.status(400).json({
        success: false,
        message: 'Le fichier fourni n\'est pas une image valide'
      });
    }

    // Stocker l'image base64 dans req pour le contrôleur
    req.body.base64Image = base64Image;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erreur lors du traitement de l\'image'
    });
  }
}; 