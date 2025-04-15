import { Request, Response } from 'express';
import { PrismaClient, ChallengeType, ResourceType, Difficulty } from '@prisma/client';

interface ResourceInput {
  type: ResourceType;
  value: string;
  file?: Express.Multer.File;
}

interface ChallengeInput {
  title: string;
  description: string;
  difficulty: Difficulty;
  points: number;
  flag: string;
  categoryId: string;
  type: ChallengeType;
  url?: string;
  resources: ResourceInput[];
}

const prisma = new PrismaClient();

// Récupérer tous les challenges
export const getAllChallenges = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    
    // Construire le filtre en fonction de la présence du categoryId
    const filter = categoryId ? { categoryId: categoryId as string } : {};

    const challenges = await prisma.challenge.findMany({
      where: filter,
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        points: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            name: true,
            color: true
          }
        },
        _count: {
          select: {
            solves: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: challenges
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des challenges:', error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération des challenges",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Créer un nouveau challenge
export const createChallenge = async (req: Request, res: Response) => {
  try {
    const input = req.body as ChallengeInput;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Convertir les valeurs numériques
    if (typeof input.points === 'string') {
      input.points = parseInt(input.points, 10);
    }
    
    // Initialisation des ressources si nécessaire
    input.resources = input.resources || [];
    
    // Traitement des ressources au format JSON
    if (req.body.resourcesData) {
      try {
        const resourcesData = JSON.parse(req.body.resourcesData);
        if (Array.isArray(resourcesData)) {
          // Ajouter les ressources de type LINK
          resourcesData.forEach(resource => {
            if (resource.type === 'LINK' && resource.value) {
              input.resources.push({
                type: ResourceType.LINK,
                value: resource.value
              });
            }
          });
        }
      } catch (e) {
        console.error('Erreur lors du parsing des resourcesData:', e);
      }
    }
    
    // Validation de base
    if (!input.title || !input.description || !input.difficulty || !input.points || !input.flag || !input.categoryId || !input.type) {
      return res.status(400).json({ 
        success: false,
        message: "Tous les champs requis doivent être remplis" 
      });
    }

    // Vérification de la validité de la difficulté
    if (!Object.values(Difficulty).includes(input.difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Difficulté invalide. Valeurs autorisées: ${Object.values(Difficulty).join(', ')}`
      });
    }

    // Validation du type et des données associées
    if (input.type === ChallengeType.URL && !input.url) {
      return res.status(400).json({
        success: false,
        message: "L'URL est requise pour un challenge de type URL"
      });
    }

    if ((input.type === ChallengeType.IMAGE || input.type === ChallengeType.FILE) && 
        (!files || !files.file || files.file.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Un fichier est requis pour un challenge de type IMAGE ou FILE"
      });
    }

    // Création du challenge avec les ressources dans une transaction
    const challenge = await prisma.$transaction(async (tx) => {
      // Créer le challenge avec les données base64 si applicable
      const newChallenge = await tx.challenge.create({
        data: {
          title: input.title,
          subtitle: req.body.subtitle || null,
          description: input.description,
          difficulty: input.difficulty as Difficulty,
          points: input.points,
          flag: input.flag,
          categoryId: input.categoryId,
          type: input.type,
          url: input.type === ChallengeType.URL ? req.body.url || input.url : null,
          imageb64: input.type === ChallengeType.IMAGE ? req.body.imageb64 : null,
          fileb64: input.type === ChallengeType.FILE ? req.body.fileb64 : null
        }
      });

      // Ajouter la ressource principale
      if (input.type === ChallengeType.URL && input.url) {
        await tx.resource.create({
          data: {
            type: ResourceType.LINK,
            value: input.url,
            challengeId: newChallenge.id
          }
        });
      } else if ((input.type === ChallengeType.IMAGE || input.type === ChallengeType.FILE) && 
                files && files.file && files.file.length > 0) {
        const file = files.file[0];
        await tx.resource.create({
          data: {
            type: ResourceType.FILE,
            value: file.originalname,
            name: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            fileData: file.buffer,
            challengeId: newChallenge.id
          }
        });
      }

      // Ajouter les ressources additionnelles
      if (input.resources && Array.isArray(input.resources)) {
        for (const resource of input.resources) {
          if (resource.type === ResourceType.LINK && resource.value) {
            await tx.resource.create({
              data: {
                type: ResourceType.LINK,
                value: resource.value,
                challengeId: newChallenge.id
              }
            });
          }
        }
      }

      // Traiter les fichiers de ressources supplémentaires
      if (files && files.resources && files.resources.length > 0) {
        for (const file of files.resources) {
          await tx.resource.create({
            data: {
              type: ResourceType.FILE,
              value: file.originalname,
              name: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              fileData: file.buffer,
              challengeId: newChallenge.id
            }
          });
        }
      }

      // Récupérer le challenge avec ses relations
      return await tx.challenge.findUnique({
        where: { id: newChallenge.id },
        include: {
          resources: true,
          category: true,
          _count: {
            select: {
              solves: true
            }
          }
        }
      });
    });

    if (!challenge) {
      throw new Error('Failed to create challenge');
    }

    res.status(201).json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la création du challenge" 
    });
  }
};

// Récupérer un challenge par son ID
export const getChallengeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        difficulty: true,
        points: true,
        type: true,
        categoryId: true,
        url: true,
        imageb64: true,
        fileb64: true,
        resources: {
          select: {
            id: true,
            type: true,
            value: true,
            name: true,
            mimeType: true,
            size: true
          }
        }
      }
    });

    if (!challenge) {
      return res.status(404).json({ 
        success: false,
        message: "Challenge non trouvé" 
      });
    }

    // Filtrer les champs en fonction du type
    const { url, imageb64, fileb64, ...baseChallenge } = challenge;
    const typeSpecificData = {
      ...(challenge.type === 'URL' && { url }),
      ...(challenge.type === 'IMAGE' && { imageb64 }),
      ...(challenge.type === 'FILE' && { fileb64 })
    };

    res.json({
      success: true,
      data: {
        ...baseChallenge,
        ...typeSpecificData
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération du challenge" 
    });
  }
};

// Récupérer une ressource
export const getResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resource = await prisma.resource.findUnique({
      where: { id }
    });

    if (!resource) {
      return res.status(404).json({ 
        success: false,
        message: "Ressource non trouvée" 
      });
    }

    if (resource.type === ResourceType.LINK) {
      return res.json({
        success: true,
        data: resource
      });
    }

    // Pour les fichiers et images, on renvoie le contenu binaire
    res.setHeader('Content-Type', resource.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${resource.name}"`);
    res.send(resource.fileData);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération de la ressource" 
    });
  }
};

// Mettre à jour un challenge
export const updateChallenge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      description,
      difficulty,
      points,
      flag,
      categoryId,
      type: rawType,
      url,
      resources,
      // Récupérer les données base64
      imageb64,
      fileb64
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Convertir les points en nombre
    const numericPoints = points ? parseInt(points, 10) : undefined;

    // Mise à jour du challenge et des ressources dans une transaction
    const challenge = await prisma.$transaction(async (tx) => {
      // Mettre à jour le challenge
      const updatedChallenge = await tx.challenge.update({
        where: { id },
        data: {
          title,
          subtitle,
          description,
          difficulty,
          points: numericPoints,
          flag,
          categoryId,
          type: rawType as ChallengeType,
          url: rawType === ChallengeType.URL ? url : null,
          imageb64: rawType === ChallengeType.IMAGE ? imageb64 : null,
          fileb64: rawType === ChallengeType.FILE ? fileb64 : null
        }
      });

      // Supprimer toutes les ressources existantes
      await tx.resource.deleteMany({
        where: { challengeId: id }
      });

      // Ajouter la nouvelle ressource principale selon le type
      if (rawType === ChallengeType.URL && url) {
        await tx.resource.create({
          data: {
            type: ResourceType.LINK,
            value: url,
            challengeId: id
          }
        });
      } else if (rawType === ChallengeType.IMAGE || rawType === ChallengeType.FILE) {
        if (!files || !files.file || files.file.length === 0) {
          throw new Error('Fichier requis pour ce type de challenge');
        }
        const file = files.file[0];
        await tx.resource.create({
          data: {
            type: ResourceType.FILE,
            value: file.originalname,
            name: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            fileData: file.buffer,
            challengeId: id
          }
        });
      }

      // Ajouter les nouvelles ressources additionnelles
      if (resources && Array.isArray(resources)) {
        for (const resource of resources) {
          const resourceData = {
            challengeId: id,
            type: resource.type,
            value: resource.type === ResourceType.LINK ? resource.value : resource.file?.originalname || '',
            name: resource.type === ResourceType.FILE ? resource.file?.originalname : undefined,
            mimeType: resource.type === ResourceType.FILE ? resource.file?.mimetype : undefined,
            size: resource.type === ResourceType.FILE ? resource.file?.size : undefined,
            fileData: resource.type === ResourceType.FILE ? resource.file?.buffer : undefined
          };

          await tx.resource.create({ data: resourceData });
        }
      }

      return await tx.challenge.findUnique({
        where: { id },
        include: {
          resources: true,
          category: true,
          _count: {
            select: {
              solves: true
            }
          }
        }
      });
    });

    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la mise à jour du challenge" 
    });
  }
};

// Supprimer un challenge
export const deleteChallenge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Supprimer le challenge (la ressource sera supprimée en cascade)
    await prisma.challenge.delete({
      where: { id }
    });

    res.json({ 
      success: true,
      message: "Challenge supprimé avec succès" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la suppression du challenge" 
    });
  }
};

// Vérifier le flag d'un challenge
export const verifyFlag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { flag } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Vous devez être connecté pour soumettre un flag"
      });
    }

    if (!flag) {
      return res.status(400).json({
        success: false,
        message: "Le flag est requis"
      });
    }

    // Récupérer le challenge avec ses informations
    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: {
        id: true,
        flag: true,
        points: true,
        solves: {
          where: {
            userId: userId
          }
        }
      }
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge non trouvé"
      });
    }

    // Vérifier si l'utilisateur a déjà résolu ce challenge
    if (challenge.solves.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Vous avez déjà résolu ce challenge"
      });
    }

    // Vérifier le flag
    if (challenge.flag !== flag) {
      return res.status(400).json({
        success: false,
        message: "Flag incorrect"
      });
    }

    // Ajouter les points et enregistrer la résolution dans une transaction
    await prisma.$transaction(async (tx) => {
      // Créer l'entrée de résolution
      await tx.solve.create({
        data: {
          userId: userId,
          challengeId: challenge.id
        }
      });

      // Mettre à jour le score de l'utilisateur
      await tx.user.update({
        where: { id: userId },
        data: {
          score: {
            increment: challenge.points
          }
        }
      });
    });

    res.json({
      success: true,
      message: "Félicitations ! Flag correct",
      points: challenge.points
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du flag:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification du flag"
    });
  }
}; 