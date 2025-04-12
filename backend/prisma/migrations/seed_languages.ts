import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const languages = [
    { id: 'fr', name: 'Français' },
    { id: 'en', name: 'English' },
    { id: 'es', name: 'Español' },
    { id: 'ru', name: 'Русский' },
    { id: 'kl', name: 'Klingon' }, // Un peu d'humour avec une langue fictive
  ];

  console.log('Seeding languages...');

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { id: lang.id },
      update: {},
      create: lang,
    });
  }

  console.log('Languages seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 