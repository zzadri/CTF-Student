import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { validateAndConvertImage } from '../utils/imageUtils';

// Configuration de multer pour stocker les fichiers en mémoire
const storage = multer.memoryStorage();

// Filtre pour accepter les images et les fichiers selon le type de challenge
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const challengeType = req.body.type;

  // Pour les routes de profil utilisateur, on autorise les images
  if (file.fieldname === 'avatar' && !file.mimetype.startsWith('image/')) {
    cb(new Error('L\'avatar doit être une image'));
    return;
  }

  // Pour les challenges de type IMAGE, on vérifie que c'est bien une image
  if (challengeType === 'IMAGE' && !file.mimetype.startsWith('image/')) {
    cb(new Error('Le fichier doit être une image pour un challenge de type IMAGE'));
    return;
  }

  cb(null, true);
};

// Configuration de multer
const multerUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Exporter différentes configurations d'upload
export const upload = {
  // Pour les avatars des utilisateurs
  single: (fieldName: string) => multerUpload.single(fieldName),
  
  // Pour les fichiers des challenges
  fields: (fields: { name: string, maxCount: number }[]) => multerUpload.fields(fields),
  
  // Configuration par défaut pour les challenges
  challenge: multerUpload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'resources', maxCount: 10 }
  ])
};

// Middleware de traitement d'image pour les avatars
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

// Middleware de traitement des fichiers pour les challenges
export const processFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Log pour déboguer
    console.log('FILES REÇUS:', {
      hasFiles: !!files,
      fileFields: files ? Object.keys(files) : [],
      mainFile: files && files.file ? files.file.length : 0,
      resources: files && files.resources ? files.resources.length : 0,
      body: {
        title: req.body.title,
        subtitle: req.body.subtitle,
        description: req.body.description,
        difficulty: req.body.difficulty,
        points: req.body.points,
        flag: req.body.flag,
        categoryId: req.body.categoryId,
        type: req.body.type,
        url: req.body.url,
        resourcesData: req.body.resourcesData
      }
    });
    
    if (!files || (!files.file && !files.resources)) {
      return next();
    }

    // Traiter le fichier principal
    if (files.file && files.file[0]) {
      const mainFile = files.file[0];
      if (req.body.type === 'IMAGE') {
        const base64Image = await validateAndConvertImage(mainFile.buffer, mainFile.mimetype);
        if (!base64Image) {
          return res.status(400).json({
            success: false,
            message: 'Le fichier fourni n\'est pas une image valide'
          });
        }
        // Extraire uniquement la partie base64 sans le préfixe
        req.body.imageb64 = base64Image.split(',')[1];
      } else if (req.body.type === 'FILE') {
        // Pour les fichiers normaux, convertir en base64 sans validation supplémentaire
        req.body.fileb64 = mainFile.buffer.toString('base64');
      }
    }

    // Traiter les ressources additionnelles
    if (files.resources) {
      const processedResources = await Promise.all(
        files.resources.map(async (file) => {
          if (file.mimetype.startsWith('image/')) {
            const base64Data = await validateAndConvertImage(file.buffer, file.mimetype);
            return {
              type: 'FILE',
              value: file.originalname,
              base64: base64Data ? base64Data.split(',')[1] : null
            };
          } else {
            return {
              type: 'FILE',
              value: file.originalname,
              base64: file.buffer.toString('base64')
            };
          }
        })
      );
      req.body.resources = processedResources;
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erreur lors du traitement des fichiers'
    });
  }
}; 