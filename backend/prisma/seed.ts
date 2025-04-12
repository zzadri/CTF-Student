import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: 'Stéganographie',
      description: 'Découvrez l\'art de cacher des informations dans des images, du son ou d\'autres médias.',
      icon: 'fa-eye',
      color: 'bg-blue-500'
    },
    {
      name: 'Cryptographie',
      description: 'Plongez dans l\'univers du chiffrement et du déchiffrement des messages secrets.',
      icon: 'fa-lock',
      color: 'bg-green-500'
    },
    {
      name: 'Web Exploit',
      description: 'Explorez les vulnérabilités web et apprenez à sécuriser les applications.',
      icon: 'fa-bug',
      color: 'bg-purple-500'
    },
    {
      name: 'Forensic',
      description: 'Analysez les traces numériques et résolvez des enquêtes informatiques.',
      icon: 'fa-search',
      color: 'bg-yellow-500'
    },
    {
      name: 'Reverse Engineering',
      description: 'Décompilez et analysez le code pour comprendre son fonctionnement.',
      icon: 'fa-microchip',
      color: 'bg-red-500'
    },
    {
      name: 'PWN',
      description: 'Exploitez les vulnérabilités des binaires et prenez le contrôle.',
      icon: 'fa-terminal',
      color: 'bg-indigo-500'
    }
  ];

  console.log('Début de la création des catégories...');

  for (const category of categories) {
    console.log(`Création/Mise à jour de la catégorie: ${category.name}`);
    try {
      const result = await prisma.category.upsert({
        where: { name: category.name },
        update: category,
        create: category
      });
      console.log(`✅ Catégorie créée/mise à jour avec succès: ${result.name} (ID: ${result.id})`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création/mise à jour de la catégorie ${category.name}:`, error);
    }
  }

  // Vérification des catégories créées
  const createdCategories = await prisma.category.findMany();
  console.log('\nCatégories dans la base de données:');
  console.table(createdCategories);

  console.log(`\nTotal des catégories: ${createdCategories.length}`);
}

main()
  .catch((e) => {
    console.error('Erreur lors de la création des catégories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 