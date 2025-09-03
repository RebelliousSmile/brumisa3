# Guide de déploiement - Brumisater Nuxt 4

## Prérequis Windows

### Logiciels nécessaires
- **Node.js** 18+ (LTS recommandé)
- **pnpm** (package manager)
- **PostgreSQL** 12+ 
- **PM2** (gestionnaire de processus)

```cmd
# Installation des outils globaux
npm install -g pnpm pm2
```

### Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_URL=postgresql://username:password@localhost:5432/brumisater

# Sécurité
SESSION_SECRET=your-super-secret-session-key
JWT_SECRET=your-jwt-secret-key

# Application
NUXT_PUBLIC_APP_URL=http://localhost:3000
NUXT_HOST=localhost
NUXT_PORT=3000

# Environnement
NODE_ENV=production
```

## Déploiement automatique

### Option 1: Script Batch (Windows)
```cmd
.\scripts\deploy.bat
```

### Option 2: Script PowerShell (Recommandé)
```powershell
# Déploiement complet
.\scripts\deploy.ps1

# Déploiement sans tests
.\scripts\deploy.ps1 -SkipTests

# Déploiement sans migration
.\scripts\deploy.ps1 -SkipMigration

# Déploiement avec analyse du bundle
.\scripts\deploy.ps1 -Environment staging
```

## Déploiement manuel

### 1. Préparation
```cmd
# Nettoyer les caches
pnpm run clean

# Installer les dépendances
pnpm install --frozen-lockfile

# Générer le client Prisma
pnpm run db:generate
```

### 2. Base de données
```cmd
# Appliquer les migrations
pnpm run db:migrate

# (Optionnel) Peupler la base avec des données de test
pnpm run db:seed
```

### 3. Tests et vérifications
```cmd
# Vérifier les types TypeScript
pnpm run typecheck

# Exécuter les tests
pnpm run test:run

# Tests avec interface
pnpm run test:ui
```

### 4. Construction
```cmd
# Build de production
pnpm run build

# Build avec analyse (optionnel)
pnpm run build:analyze
```

### 5. Démarrage
```cmd
# Avec PM2 (recommandé pour production)
pnpm run pm2:start

# Ou démarrage direct
pnpm run start
```

## Gestion PM2

### Commandes utiles
```cmd
# Statut des processus
pm2 status

# Logs en temps réel
pnpm run pm2:logs

# Redémarrer l'application
pnpm run pm2:restart

# Arrêter l'application
pnpm run pm2:stop

# Surveiller les ressources
pm2 monit
```

### Configuration avancée

Le fichier `ecosystem.config.js` contient la configuration PM2 :

- **Mode cluster** : utilise tous les cœurs CPU
- **Auto-restart** : redémarre automatiquement en cas de crash
- **Limite mémoire** : redémarre si > 1GB
- **Logs** : stockés dans le dossier `logs/`

## Surveillance et maintenance

### Monitoring
```cmd
# Vérifier les logs d'erreur
type logs\error.log

# Vérifier les logs généraux
type logs\combined.log

# Surveiller en temps réel
pm2 logs --lines 50
```

### Maintenance
```cmd
# Mise à jour des dépendances
pnpm update

# Nettoyage complet
pnpm run clean:deps

# Vérification de sécurité
pnpm audit
```

## Dépannage

### Problèmes courants

**Port déjà utilisé**
```cmd
# Trouver le processus utilisant le port 3000
netstat -ano | findstr :3000

# Tuer le processus (remplacer PID par l'ID trouvé)
taskkill /PID <PID> /F
```

**Erreur de base de données**
```cmd
# Vérifier la connexion PostgreSQL
psql -h localhost -U username -d brumisater -c "SELECT version();"

# Réinitialiser la base (ATTENTION: supprime toutes les données)
pnpm run db:reset
```

**Erreur de build**
```cmd
# Nettoyer complètement et reconstruire
pnpm run clean
rmdir /s /q node_modules
pnpm install
pnpm run build
```

### Logs de debug

Pour activer les logs détaillés :

```cmd
# Mode debug pour Nuxt
set DEBUG=nuxt:*
pnpm run dev

# Mode debug pour Prisma
set DEBUG=prisma:*
pnpm run start
```

## Performance

### Optimisations recommandées

1. **Cache statique** : Configurer un serveur web (nginx/IIS) devant Nuxt
2. **CDN** : Utiliser un CDN pour les assets statiques
3. **Compression** : Activer gzip/brotli
4. **SSL** : Configurer HTTPS en production

### Monitoring des performances

```cmd
# Analyse du bundle
pnpm run build:analyze

# Tests de performance
pm2 monit

# Profiling mémoire
node --inspect .output/server/index.mjs
```

## Mise en production

### Checklist finale

- [ ] Variables d'environnement configurées
- [ ] Base de données PostgreSQL opérationnelle
- [ ] SSL/HTTPS configuré
- [ ] Reverse proxy configuré (nginx/IIS)
- [ ] Monitoring mis en place
- [ ] Sauvegardes automatiques configurées
- [ ] Notifications d'erreur configurées

### Support et maintenance

Pour toute question ou problème :
1. Vérifier les logs dans `logs/error.log`
2. Consulter la documentation Nuxt 4
3. Vérifier les issues GitHub du projet