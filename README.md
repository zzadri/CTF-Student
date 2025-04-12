# CTF Student Platform

Une plateforme de CTF (Capture The Flag) moderne et sécurisée pour les étudiants, avec une interface utilisateur élégante et des fonctionnalités avancées.

## Fonctionnalités

### Authentification et Profil
- Inscription avec email, nom d'utilisateur et mot de passe
- Connexion sécurisée avec JWT
- Persistance de session
- Page de profil personnalisable :
  - Modification du nom d'utilisateur
  - Upload d'avatar avec validation sécurisée
  - Affichage du score et des réalisations

### Interface Utilisateur
- Design moderne avec Tailwind CSS
- Navigation fluide et responsive
- Thème sombre élégant
- Barre de navigation avec :
  - Menu des catégories de challenges
  - Profil utilisateur
  - Tableau des scores
  - Gestion de session

### Système de Challenges
- Catégorisation des défis
- Système de points
- Suivi des challenges complétés
- Tableau des scores en temps réel

## Structure du projet

```
CTF-Student/
├── frontend/                # Application React/Vite
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   │   ├── Navbar.tsx  # Navigation principale
│   │   │   └── ...
│   │   ├── pages/         # Pages de l'application
│   │   │   ├── AuthPage.tsx    # Page d'authentification
│   │   │   ├── ProfilePage.tsx # Page de profil
│   │   │   └── ...
│   │   ├── context/       # Contextes React
│   │   │   └── AuthContext.tsx # Gestion de l'authentification
│   │   └── ...
│   └── public/            # Fichiers statiques
│
└── backend/               # Serveur Node.js/Express
    ├── src/
    │   ├── controllers/   # Contrôleurs
    │   ├── routes/        # Routes API
    │   ├── middleware/    # Middlewares
    │   └── utils/         # Utilitaires
    └── prisma/           # Base de données
        ├── schema.prisma # Schéma de la base de données
        └── migrations/   # Migrations
```

## Prérequis

- Node.js 18+
- PostgreSQL
- npm ou yarn

## Installation

1. Cloner le projet :
```bash
git clone https://github.com/votre-username/CTF-Student.git
cd CTF-Student
```

2. Installer les dépendances :
```bash
# Installation des dépendances du frontend
cd frontend
npm install

# Installation des dépendances du backend
cd ../backend
npm install
```

3. Configuration :
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000

# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/ctf_db"
JWT_SECRET="votre_secret_jwt"
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

4. Base de données :
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

## Démarrage

1. Backend :
```bash
cd backend
npm run dev
```

2. Frontend :
```bash
cd frontend
npm run dev
```

## Sécurité

- Validation des entrées utilisateur
- Protection contre les injections SQL avec Prisma
- Validation des types de fichiers pour les avatars
- Vérification des signatures de fichiers
- Tokens JWT pour l'authentification
- Protection CORS configurée
- Hashage des mots de passe avec bcrypt
- Validation des données côté serveur

## Routes API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Récupération du profil

### Utilisateurs
- `GET /api/users/profile` - Profil utilisateur
- `PUT /api/users/profile` - Mise à jour du profil
- `GET /api/users/leaderboard` - Tableau des scores

### Challenges
- `GET /api/categories` - Liste des catégories
- `GET /api/challenges` - Liste des challenges
- `POST /api/challenges/:id/solve` - Soumettre un flag

## Technologies

### Frontend
- React avec TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Context API

### Backend
- Node.js avec TypeScript
- Express
- Prisma ORM
- JWT
- Multer
- bcrypt

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. Push la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## License

MIT License
