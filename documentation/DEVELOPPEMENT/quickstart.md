# Guide de démarrage rapide - brumisater

Guide d'installation et de configuration pour développeurs.

## Prérequis système

### Versions requises
- **Node.js** : >= 16.0.0
- **pnpm** : >= 8.0.0 (gestionnaire de paquets préféré)
- **PostgreSQL** : >= 12.0
- **Git** : >= 2.30

### Vérification des prérequis
```cmd
node --version
pnpm --version
psql --version
git --version
```

## Installation

### 1. Clonage et dépendances
```cmd
git clone [URL_DU_REPO] brumisater
cd brumisater
pnpm install
```

### 2. Configuration de l'environnement
```cmd
copy .env.example .env
```

Editez `.env` avec vos valeurs :
```env
# Base de données
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=brumisa3
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Application
PORT=3000
SESSION_SECRET=your-32-char-secret-minimum
BASE_URL=http://localhost:3000
```

### 3. Base de données PostgreSQL

#### Création de la base
```cmd
createdb brumisa3
```

#### Initialisation et migrations
```cmd
pnpm run db:init
pnpm run db:migrate
```

## Commandes de développement

### Démarrage
```cmd
# Développement avec rechargement automatique
pnpm run dev

# Production
pnpm start

# Développement complet (serveur + CSS)
pnpm run dev:full
```

### CSS (Tailwind)
```cmd
# Génération CSS
pnpm run build:css

# Surveillance des changements
pnpm run watch:css
```

### Tests
```cmd
# Tous les tests
pnpm test

# Tests unitaires uniquement
pnpm run test:unit

# Tests d'intégration uniquement
pnpm run test:integration

# Couverture de code
pnpm run test:coverage

# Tests en surveillance
pnpm run test:watch
```

### Base de données
```cmd
# Réinitialisation complète
pnpm run db:init

# Migrations uniquement
pnpm run db:migrate

# Test de connexion
node scripts/test-db-connection.js
```

## Structure des URLs

### Interface web
- `http://localhost:3000/` - Accueil
- `http://localhost:3000/connexion` - Authentification
- `http://localhost:3000/monsterhearts` - Système Monsterhearts
- `http://localhost:3000/mes-documents` - Documents utilisateur

### API REST
- `http://localhost:3000/api/auth/connexion` - Connexion
- `http://localhost:3000/api/personnages` - Gestion personnages
- `http://localhost:3000/api/pdfs/generer` - Génération PDF
- `http://localhost:3000/api/oracles` - Oracles de jeu

## Premier test fonctionnel

### 1. Créer un compte
```cmd
# Via interface web
http://localhost:3000/inscription

# Ou via script
node scripts/create-test-user.js
```

### 2. Tester la génération PDF
1. Connectez-vous via l'interface web
2. Allez sur `/monsterhearts/creer-document-generique`
3. Remplissez le formulaire et générez un PDF

### 3. Vérifier les oracles
```cmd
node scripts/check-oracles-db.js
```

## Développement avancé

### Structure des composants
```
src/
├── controllers/     # Contrôleurs MVC
├── models/         # Modèles de données
├── services/       # Services métier
├── routes/         # Définition des routes
└── views/          # Templates EJS
```

### Services principaux
- **PdfService** : Génération de documents PDF
- **PersonnageService** : Gestion des personnages
- **EmailService** : Envoi d'emails (Resend)
- **OracleService** : Gestion des oracles de jeu

### Systèmes de jeu supportés
- Monsterhearts
- Engrenages
- Metro 2033
- Zombiology
- Générique

## Troubleshooting

### Erreur de connexion base de données
```cmd
# Vérifier le service PostgreSQL
net start postgresql-x64-12

# Tester la connexion
node scripts/test-db-connection.js
```

### Erreur de port occupé
```cmd
# Vérifier les processus sur le port
netstat -ano | findstr :3000

# Changer le port dans .env
PORT=3001
```

### Problèmes de CSS non compilé
```cmd
# Recompiler Tailwind
pnpm run build:css
```

### Tests qui échouent
```cmd
# Nettoyer et réinstaller
rmdir /s node_modules
pnpm install

# Base de données de test
SET NODE_ENV=test
pnpm run db:init
```

### Variables d'environnement manquantes
Vérifiez que toutes les variables requises sont définies dans `.env` :
- `SESSION_SECRET` (minimum 32 caractères)
- `POSTGRES_*` (connexion base de données)
- `RESEND_*` (envoi d'emails, optionnel en développement)

## Support

### Logs de l'application
```cmd
# Logs en temps réel
tail -f logs/app.log

# Erreurs uniquement
tail -f logs/error.log
```

### Scripts utiles
```cmd
# Debug base de données
node scripts/debug-db.js

# Test des emails
node scripts/debug-email-sending.js

# Vérifier les utilisateurs
node scripts/check-users.js
```

Pour plus d'informations, consultez :
- `documentation/ARCHITECTURE/` - Architecture détaillée
- `documentation/FONCTIONNALITES/` - Spécifications métier
- `documentation/api.md` - Documentation API complète