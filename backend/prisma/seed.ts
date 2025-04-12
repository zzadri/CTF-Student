import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const languages = [
    { id: 'fr', name: 'Français' },
    { id: 'en', name: 'English' },
    { id: 'es', name: 'Español' },
    { id: 'ru', name: 'Русский' },
    { id: 'kl', name: 'Klingon' },
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

  console.log('Seeding users...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const users = [
    {
      username: 'user2',
      email: 'user2@ctf.com',
      password: hashedPassword,
      role: 'USER',
      score: 0,
      languageId: 'en',
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log('Users seeded successfully!');

  console.log('Seeding categories...');

  const categories = [
    {
      name: 'Web',
      description: 'Challenges liés à la sécurité web',
      color: '#FF4444',
    },
    {
      name: 'Cryptography',
      description: 'Challenges de cryptographie',
      color: '#44FF44',
    },
    {
      name: 'Forensics',
      description: 'Challenges d\'investigation numérique',
      color: '#4444FF',
    },
    {
      name: 'Reverse Engineering',
      description: 'Challenges de rétro-ingénierie',
      color: '#FFFF44',
    },
    {
      name: 'PWN',
      description: 'Challenges d\'exploitation binaire',
      color: '#FF44FF',
    }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 