/* eslint-disable no-console */
import { PrismaClient, Difficulty, ChallengeType, ResourceType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as mime from 'mime-types'; 

const prisma = new PrismaClient();

/* ----------  TYPES LOCAUX  ---------- */

interface ChallengeFile {
  name: string;       // Nom «humain»
  filename: string;   // Nom du fichier sur disque
}

interface RawChallenge {
  title: string;
  subtitle: string;
  description: string;
  flag: string;
  category: string;
  difficulty: string;
  points: number;
  type: ChallengeType;
  files?: ChallengeFile[];
  source?: ChallengeFile[];
  /* ––– champs ajoutés à la lecture ––– */
  _dir?: string;      // répertoire sur disque (ajouté à la volée)
  _fileb64?: string;  // base64 du premier fichier (si pertinent)
}

/* ----------  HELPERS  ---------- */

// Harmonise les catégories (Reseau → Network, Cryptographie → Cryptography, …)
function mapCategory(category: string): string {
  const map: Record<string, string> = {
    'Reseau': 'Network',
    'Réseau': 'Network',
    'Cryptographie': 'Cryptography',
    'Web': 'Web'
  };
  return map[category] ?? category;
}


// Harmonise la difficulté (EZ, Easy, HARD, …)
function normalizeDifficulty(diff: string): Difficulty {
  const map: Record<string, Difficulty> = {
    EZ: Difficulty.EZ,
    EASY: Difficulty.EASY,
    Easy: Difficulty.EASY,
    NORMAL: Difficulty.NORMAL,
    Normal: Difficulty.NORMAL,
    HARD: Difficulty.HARD,
    Hard: Difficulty.HARD,
    EXPERT: Difficulty.EXPERT,
    Expert: Difficulty.EXPERT,
  };
  return map[diff] ?? Difficulty.NORMAL;
}

/* ----------  LECTURE DES CHALLENGES  ---------- */

function readAllChallenges(): RawChallenge[] {
  const challengesRoot = path.join(__dirname, '..', '..', 'challenges');
  const folders = fs.readdirSync(challengesRoot, { withFileTypes: true })
                    .filter(d => d.isDirectory())
                    .map(d => d.name);             // ex. ['Network', 'Cryptanalyst']

  const result: RawChallenge[] = [];

  for (const folder of folders) {
    const folderPath = path.join(challengesRoot, folder);
    const subdirs = fs.readdirSync(folderPath, { withFileTypes: true })
                      .filter(d => d.isDirectory())
                      .map(d => d.name);           // ex. ['Chall01', 'Chall02', …]

    for (const sub of subdirs) {
      const chalDir = path.join(folderPath, sub);
      const jsonFiles = fs.readdirSync(chalDir)
                          .filter(f => f.endsWith('.json'));

      for (const jf of jsonFiles) {
        const raw = JSON.parse(
          fs.readFileSync(path.join(chalDir, jf), 'utf8'),
        ) as RawChallenge;

        raw._dir = chalDir;

        /* Encodage base64 du premier fichier, uniquement si type === FILE */
        if (raw.type === ChallengeType.FILE &&
            raw.files?.length) {
          const fp = path.join(chalDir, raw.files[0].filename);
          if (fs.existsSync(fp)) {
            raw._fileb64 = fs.readFileSync(fp).toString('base64');
          } else {
            console.warn(`⚠️  Fichier manquant: ${fp}`);
          }
        }

        result.push(raw);
      }
    }
  }
  return result;
}

/* ----------  SEED  ---------- */

async function main() {
  /* ==== 1. LANGUAGES ==== */
  console.log('🟢 Seeding languages…');
  const languages = [
    { id: 'fr', name: 'Français' },
    { id: 'en', name: 'English'  },
    { id: 'es', name: 'Español'  },
    { id: 'ru', name: 'Русский'  },
    { id: 'kl', name: 'Klingon'  },
  ];
  for (const l of languages) {
    await prisma.language.upsert({ where: { id: l.id }, update: {}, create: l });
  }

  /* ==== 2. CATEGORIES ==== */
  console.log('🟢 Seeding categories…');
  const categories = [
    { name: 'Web',          description: 'Challenges liés à la sécurité web', color: '#FF4444' },
    { name: 'Cryptography', description: 'Challenges de cryptographie',        color: '#44FF44' },
    { name: 'Network',      description: 'Challenges de réseau',              color: '#4444FF' },
    { name: 'Steganography',description: 'Challenges de stéganographie',       color: '#FFFF44' },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { name: c.name }, update: {}, create: c });
  }

  /* ==== 3. CHALLENGES ==== */
  console.log('🟢 Lecture des fichiers de challenge…');
  const allChalls = readAllChallenges();

  console.log(`🟢 Insertion de ${allChalls.length} challenges…`);
  for (const ch of allChalls) {
    /* --- cat --- */
    const categoryName = mapCategory(ch.category);
    let category = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!category) {
      // catégorie inconnue → on la crée à la volée
      category = await prisma.category.create({
        data: { name: categoryName, description: 'Auto‑seed', color: '#888888' },
      });
    }

    /* --- challenge --- */
    const challengeId = uuidv4();
    await prisma.challenge.create({
      data: {
        id:          challengeId,
        title:       ch.title,
        subtitle:    ch.subtitle,
        description: ch.description,
        flag:        ch.flag,
        difficulty:  normalizeDifficulty(ch.difficulty),
        points:      ch.points,
        type:        ch.type,
        categoryId:  category.id,
        fileb64:     ch._fileb64 ?? null,
        filename:    ch.files?.[0]?.filename ?? null,
        url:         (ch as any).url ?? null
      },
    });

    /* --- sources → Resource --- */
    if (Array.isArray(ch.source)) {
      for (const src of ch.source) {
        const srcPath = path.join(ch._dir!, src.filename);
        if (!fs.existsSync(srcPath)) {
          console.warn(`⚠️  Source manquante : ${srcPath}`);
          continue;
        }
        const buffer   = fs.readFileSync(srcPath);

        await prisma.resource.create({
          data: {
            id:          uuidv4(),
            type:        ResourceType.FILE,     // ✅ enum, plus de string «TEXT»
            value:       src.filename,
            name:        src.name,
            mimeType:    mime.lookup(srcPath) || 'application/octet-stream',
            size:        buffer.length,
            fileData:    buffer,                // ✅ buffer binaire, pas de base64
            challengeId: challengeId,
          },
        });
      }
    }

    console.log(`   • ${ch.title} ✅`);
  }

  console.log('🟢 Seeding terminé !');
}

/* ----------  EXEC  ---------- */
main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
