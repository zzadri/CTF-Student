# CTF Student Platform

Une plateforme de CTF (Capture The Flag) moderne et sécurisée pour les étudiants, inspirée de root-me.org.

## Fonctionnalités

- Interface utilisateur moderne avec Mantine UI
- Authentification sécurisée
- Système de challenges containerisés
- Panel administrateur en temps réel
- Base de données PostgreSQL
- API REST sécurisée

## Prérequis

- Node.js 18+
- Docker et Docker Compose
- Git

## Installation

1. Cloner le dépôt :
```bash
git clone <votre-repo>
cd CTF-Student
```

2. Installer les dépendances :
```bash
npm install
```

3. Créer un fichier `.env` à la racine du projet :
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ctf_db
JWT_SECRET=votre_secret_jwt
```

4. Lancer l'application avec Docker :
```bash
docker-compose up -d
```

L'application sera disponible sur :
- Frontend : http://localhost:5173
- Backend : http://localhost:3000
- Base de données : localhost:5432

## Développement

Pour lancer l'application en mode développement :

```bash
npm run dev
```

## Structure du projet

```
CTF-Student/
├── src/
│   ├── components/     # Composants React réutilisables
│   ├── pages/         # Pages de l'application
│   ├── layouts/       # Layouts réutilisables
│   ├── context/       # Contextes React (auth, etc.)
│   ├── services/      # Services (API, auth, etc.)
│   ├── hooks/         # Hooks personnalisés
│   ├── utils/         # Utilitaires
│   └── types/         # Types TypeScript
├── docker/
│   ├── app/          # Configuration Docker frontend
│   ├── api/          # Configuration Docker backend
│   ├── db/           # Configuration Docker base de données
│   └── challenges/   # Challenges containerisés
└── prisma/           # Schémas et migrations Prisma
```

## Sécurité

- Authentification JWT
- Validation des entrées
- Protection CSRF
- Rate limiting
- Containers isolés pour les challenges
- Sanitization des données

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commit les changements (`git commit -am 'Ajout de ma feature'`)
4. Push la branche (`git push origin feature/ma-feature`)
5. Créer une Pull Request
