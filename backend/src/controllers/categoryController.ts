import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.Category.findMany({
      include: {
        _count: {
          select: {
            challenges: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories'
    });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            challenges: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    return res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la catégorie'
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, color, icon } = req.body;

    // Vérification des champs requis
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la catégorie est requis'
      });
    }

    // Vérifier si une catégorie avec le même nom existe déjà
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Une catégorie avec ce nom existe déjà'
      });
    }

    // Créer la catégorie
    const category = await prisma.category.create({
      data: {
        name,
        color,
        icon
      }
    });

    return res.status(201).json({
      success: true,
      data: category,
      message: 'Catégorie créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la catégorie'
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    // Vérification des champs requis
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la catégorie est requis'
      });
    }

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    // Vérifier si le nouveau nom est déjà utilisé par une autre catégorie
    if (name !== existingCategory.name) {
      const nameExists = await prisma.category.findFirst({
        where: {
          name,
          NOT: { id }
        }
      });

      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Une catégorie avec ce nom existe déjà'
        });
      }
    }

    // Mettre à jour la catégorie
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        color,
        icon
      }
    });

    return res.json({
      success: true,
      data: updatedCategory,
      message: 'Catégorie modifiée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la catégorie:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la catégorie'
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        challenges: true
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    // Vérifier si la catégorie contient des challenges
    if (category.challenges.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une catégorie contenant des challenges'
      });
    }

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la catégorie'
    });
  }
}; 