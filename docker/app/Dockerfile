FROM node:18-alpine

# Création d'un utilisateur et groupe non privilégié
RUN addgroup -S nonroot && adduser -S nonroot -G nonroot

WORKDIR /app

# Copie des fichiers de configuration nécessaires
COPY package.json package-lock.json ./
COPY tsconfig.json tsconfig.node.json ./
COPY vite.config.ts postcss.config.cjs tailwind.config.cjs ./
COPY .env .env_exemple ./
COPY index.html ./

# Installation des dépendances avec --ignore-scripts pour la sécurité
RUN npm install --ignore-scripts && \
    chown -R nonroot:nonroot /app

# Copie des fichiers source de manière sélective
COPY src/ ./src/
COPY public/ ./public/

# Attribution des permissions à l'utilisateur non privilégié
RUN chown -R nonroot:nonroot /app

# Passage à l'utilisateur non privilégié
USER nonroot

EXPOSE 5173

CMD ["npm", "run", "dev"] 