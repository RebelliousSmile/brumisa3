# Déploiement et Production

## Environnements

### 🧪 Développement (Local)
- **Base** : SQLite en fichier local
- **Port** : 3076 (configurable)
- **Logs** : Niveau debug, console
- **Hot reload** : Nodemon + Tailwind watch
- **Variables** : `.env.development`

### 🧪 Staging/Test
- **Base** : PostgreSQL partagée
- **Domaine** : `staging.generateur-pdf-jdr.fr`
- **SSL** : Let's Encrypt automatique
- **CI/CD** : Déploiement auto depuis `develop`
- **Variables** : `.env.staging`

### 🚀 Production
- **Base** : PostgreSQL avec réplication
- **Domaine** : `generateur-pdf-jdr.fr`
- **CDN** : Assets statiques optimisés
- **Monitoring** : Logs + métriques avancées
- **Variables** : `.env.production`

## Configuration des variables

### Variables essentielles
```bash
# Base de données
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DB_SSL=true

# Session et sécurité
SESSION_SECRET=random-32-chars-string
CSRF_SECRET=another-random-string

# Codes d'accès (changez-les !)
PREMIUM_CODE=123456
ADMIN_CODE=789012

# Email (si newsletter activée)
SMTP_HOST=smtp.mailgun.org
SMTP_USER=postmaster@mg.domain.com
SMTP_PASS=your-smtp-password

# Monitoring
LOG_LEVEL=info
NODE_ENV=production
```

### Sécurité des secrets
- **Jamais en dur** dans le code
- **Variables d'environnement** uniquement
- **Rotation régulière** des secrets
- **Accès restreint** aux credentials

## Migration de base de données

### SQLite vers PostgreSQL
```bash
# Export SQLite
sqlite3 database.db .dump > export.sql

# Nettoyage pour PostgreSQL
sed -i 's/autoincrement/serial/g' export.sql
sed -i 's/datetime/timestamp/g' export.sql

# Import PostgreSQL
psql $DATABASE_URL < export.sql
```

### Migrations automatiques
```javascript
// Dans src/database/migrations/
// 001_initial_schema.sql
// 002_add_pdf_public_field.sql
// 003_add_newsletter_tables.sql
```

## Déploiement

### Via Docker (recommandé)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:css
EXPOSE 3076
CMD ["npm", "start"]
```

### Via PM2 (serveur dédié)
```bash
# Installation PM2
npm install -g pm2

# Configuration ecosystem
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'generateur-pdf-jdr',
    script: './src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3076
    }
  }]
};

# Déploiement
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Via services cloud

#### Heroku
```bash
# Buildpacks
heroku buildpacks:set heroku/nodejs
heroku addons:create heroku-postgresql:hobby-dev

# Variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=xxx
```

#### DigitalOcean App Platform
```yaml
# .do/app.yaml
name: generateur-pdf-jdr
services:
- name: web
  source_dir: /
  github:
    repo: user/generateur-pdf-jdr
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
databases:
- engine: PG
  name: main-db
  size: db-s-dev-database
```

## Reverse Proxy (Nginx)

### Configuration SSL
```nginx
server {
    listen 443 ssl http2;
    server_name generateur-pdf-jdr.fr;
    
    ssl_certificate /etc/letsencrypt/live/domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domain/privkey.pem;
    
    # Sécurité SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Headers sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Proxy vers Node.js
    location / {
        proxy_pass http://localhost:3076;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Cache assets statiques
    location /css/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @proxy;
    }
    
    location /js/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @proxy;
    }
    
    location @proxy {
        proxy_pass http://localhost:3076;
    }
}

# Redirection HTTP -> HTTPS
server {
    listen 80;
    server_name generateur-pdf-jdr.fr;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring et logs

### Winston en production
```javascript
// Log rotation et niveaux
const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d'
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  ]
});
```

### Métriques applicatives
- **Temps de génération PDF** : Moyenne, P95, P99
- **Taux d'erreur** : Par endpoint et global
- **Utilisateurs actifs** : Daily/Monthly
- **Stockage** : Taille des PDFs, nettoyage

### Alertes
- **Erreurs critiques** : Email immédiat
- **Performance dégradée** : Slack/Discord
- **Espace disque** : Alerte à 80%
- **Santé base de données** : Connexions, latence

## Sauvegarde

### Base de données
```bash
# Sauvegarde automatique quotidienne
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > backups/db_$DATE.sql.gz

# Rotation (garder 30 jours)
find backups/ -name "db_*.sql.gz" -mtime +30 -delete
```

### Fichiers PDF
```bash
# Synchronisation vers stockage distant
rsync -av --delete output/ backup-server:/backups/pdfs/

# Nettoyage local après sauvegarde
find output/ -name "*.pdf" -mtime +7 -delete
```

## Mise à jour production

### Processus sans interruption
```bash
#!/bin/bash
# deploy.sh

# 1. Tests pré-déploiement
npm run test
npm run lint

# 2. Build assets
npm run build:css

# 3. Migration base si nécessaire
npm run db:migrate

# 4. Déploiement avec PM2
pm2 reload all --update-env

# 5. Vérification santé
curl -f http://localhost:3076/health || exit 1

# 6. Nettoyage
npm run cleanup:old-pdfs
```

### Rollback rapide
```bash
# Retour version précédente
pm2 delete all
git checkout previous-tag
npm ci
pm2 start ecosystem.config.js --env production
```

## Performance production

### Optimisations Node.js
```javascript
// Cluster mode pour utiliser tous les cores
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  require('./app.js');
}
```

### Cache Redis (optionnel)
```javascript
// Sessions partagées entre instances
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({ url: process.env.REDIS_URL }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

## Sécurité production

### Durcissement serveur
- **Firewall** : Ports 22, 80, 443 uniquement
- **Fail2ban** : Protection brute force
- **Unattended upgrades** : Mises à jour sécurité auto
- **User non-root** : Application avec utilisateur dédié

### Monitoring sécurité
- **Audit npm** : Vulnérabilités dépendances
- **HTTPS only** : Redirection forcée
- **Headers sécurité** : CSP, HSTS, etc.
- **Rate limiting** : Protection DDoS basique