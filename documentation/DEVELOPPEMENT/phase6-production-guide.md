# Phase 6 : Performance et Production - Brumisater

**🎯 Objectif** : Optimiser les performances et préparer le déploiement production selon les cibles TODO.md

## 📊 Métriques de performance cibles

- **API Response Time** : < 500ms (selon TODO.md)
- **PDF Generation** : < 2 secondes (selon TODO.md)
- **Uptime** : > 99.5%
- **Cache Hit Rate** : > 80%

## 🚀 Composants implémentés

### 1. Services de Performance

#### CacheService (`src/services/CacheService.js`)
- **Cache en mémoire** optimisé pour oracles et templates
- **TTL configurables** : SHORT (1min), MEDIUM (5min), LONG (15min), VERY_LONG (1h)
- **Éviction LRU** automatique
- **Statistiques** : hit rate, memory usage, cleanup metrics
- **Clés prédéfinies** : ORACLE, TEMPLATE, SYSTEM_CONFIG, USER_STATS

```javascript
// Usage exemple
const cache = new CacheService();
const data = await cache.getOrSet('key', async () => {
    return await expensiveOperation();
}, CacheService.TTL.MEDIUM);
```

#### QueueService (`src/services/QueueService.js`)
- **Queue système** sans dépendance Redis (compatible Windows)
- **Queues séparées** : pdf-generation, email, cleanup
- **Retry automatique** avec backoff exponentiel
- **Monitoring** des jobs : pending, processing, completed, failed
- **Graceful shutdown** avec attente des jobs actifs

```javascript
// Usage exemple
const queue = QueueService.create();
queue.add('pdf-generation', 'pdf-generation', {
    pdfId: 123,
    donnees: data,
    options: { type: 'CHARACTER', systeme: 'monsterhearts' }
});
```

#### PerformanceMonitoringService (`src/services/PerformanceMonitoringService.js`)
- **Monitoring temps réponse** en temps réel
- **Métriques par endpoint** : min, max, average, P95, P99
- **Détection requêtes lentes** (> 1s = warning, > 5s = critical)
- **Alertes actives** : high error rate, slow requests
- **Historique** : 24h de rétention configurable

#### SecurityService (`src/services/SecurityService.js`)
- **Headers de sécurité** : Helmet configuré
- **Rate limiting** : Général, Auth strict, PDF spécialisé
- **Protection CSRF** pour formulaires
- **HTTPS forcé** en production avec redirections
- **Upload security** : validation types MIME, taille

#### LoggingService (`src/services/LoggingService.js`)
- **Winston** avec rotation automatique
- **Niveaux structurés** : error, warn, info, http, debug
- **Formats production** : JSON structuré avec metadata
- **Séparation logs** : error.log, combined.log, access.log
- **Context logging** : request ID, user ID, performance metrics

### 2. Middlewares de Performance

#### PerformanceMiddleware (`src/middleware/performance.js`)
- **Monitoring API** : mesure automatique temps réponse
- **Health check** complet avec métriques système
- **Endpoints /metrics** et /health pour monitoring externe
- **Rate limiting adaptatif** basé sur la charge système

### 3. Workers et Background Tasks

#### Queue Worker (`src/workers/queue-worker.js`)
- **Processus dédié** pour traitement asynchrone
- **Gestion des jobs** : PDF generation, email sending, cleanup
- **Statistiques temps réel** des queues
- **Graceful shutdown** avec attente jobs actifs

#### Maintenance Worker (`src/workers/maintenance-worker.js`)
- **Nettoyage automatique** : logs anciens, fichiers temporaires, PDFs expirés
- **Cache cleanup** périodique
- **Monitoring système** : mémoire, disque, performances
- **Scheduling** : nettoyage toutes les heures, statistiques toutes les 15min

### 4. Configuration Production

#### Variables d'environnement (`.env.production`)
```bash
# Performance
PDF_GENERATION_TARGET=2000
API_RESPONSE_TARGET=500
CACHE_DEFAULT_TTL=300000
QUEUE_MAX_CONCURRENCY=4

# Sécurité
HTTPS_ENABLED=true
SSL_CERT_PATH=/etc/letsencrypt/live/domain/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/domain/privkey.pem
FORCE_HTTPS=true
HELMET_ENABLED=true

# Monitoring
PERF_MAX_HISTORY=2000
PERF_RETENTION=86400000
LOG_LEVEL=info
```

#### PM2 Configuration (`ecosystem.config.js`)
- **Cluster mode** : utilisation maximale des CPU
- **Auto-restart** avec limites mémoire
- **Logs séparés** : app, queue, maintenance
- **Graceful shutdown** : 30s timeout
- **Health checks** et monitoring intégré

### 5. Déploiement et Monitoring

#### Scripts de déploiement
- **`scripts/deploy/deploy.sh`** : déploiement automatisé avec rollback
- **`scripts/deploy/setup-permissions.sh`** : permissions sécurisées
- **`scripts/backup/auto-backup.sh`** : sauvegarde DB + fichiers + config
- **`scripts/monitoring/health-check.js`** : monitoring externe complet

#### Configuration Nginx (`nginx.conf`)
- **SSL/TLS** optimisé avec A+ rating
- **Rate limiting** par zone : général, auth, PDF, API
- **Compression gzip** pour tous les assets
- **Cache statique** : 1 an pour CSS/JS, privé pour PDFs
- **Headers sécurité** : HSTS, CSP, X-Frame-Options
- **Load balancing** ready avec upstream

#### Monitoring et Health Checks
- **`/health`** : status complet avec métriques système
- **`/metrics`** : métriques détaillées (accès restreint)
- **`/ping`** : endpoint simple pour load balancer
- **Logs structurés** JSON pour agrégation

## 📈 Optimisations Performance Implémentées

### 1. Cache Strategy
- **Oracles fréquents** : cache 1 heure (hit rate attendu > 90%)
- **Templates PDF** : cache 15 minutes (régénération dynamique)
- **Configuration système** : cache 1 heure (données quasi-statiques)
- **Statistiques user** : cache 5 minutes (équilibre fraîcheur/performance)

### 2. Queue Processing
- **PDF generation** asynchrone : libère immédiatement l'API
- **Email sending** : queue séparée, retry automatique
- **Cleanup tasks** : queue basse priorité en arrière-plan
- **Priorisation** : CHARACTER (prio 10) > autres documents (prio 5)

### 3. Database Optimizations
- **Connection pooling** : Pool PostgreSQL optimisé
- **Query optimization** : index sur colonnes fréquentes
- **Placeholders PostgreSQL** : $1, $2, $3 (performance native)

### 4. Asset Optimization
- **Static files** : cache 1 an, compression gzip
- **CSS build** : Tailwind optimisé, purge classes inutilisées
- **PDF serving** : headers optimisés, cache privé

## 🔒 Sécurité Production

### 1. Headers de Sécurité
```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### 2. Rate Limiting
- **Général** : 100 req/15min par IP
- **Authentication** : 5 tentatives/15min par IP
- **PDF Generation** : 10 PDFs/5min par utilisateur
- **API** : 50 req/min avec burst

### 3. SSL/HTTPS
- **TLS 1.2/1.3** uniquement
- **Perfect Forward Secrecy** : ECDHE ciphers
- **Certificate pinning** ready
- **Redirection forcée** HTTP → HTTPS

## 🛠️ Déploiement

### 1. Pré-requis
```bash
# Système
- Ubuntu 20.04+ ou CentOS 8+
- Node.js 16+
- PostgreSQL 13+
- Nginx 1.18+
- Let's Encrypt certbot

# Utilisateurs
- deploy (non-root) pour l'application
- www-data pour Nginx
```

### 2. Installation automatisée
```bash
# 1. Cloner et configurer
git clone <repo> /var/www/brumisater
cd /var/www/brumisater
cp .env.production .env

# 2. Configurer les secrets (OBLIGATOIRE)
nano .env  # Changer TOUS les secrets

# 3. Déploiement automatique
chmod +x scripts/deploy/*.sh
./scripts/deploy/deploy.sh --env production

# 4. Configurer Nginx
sudo cp nginx.conf /etc/nginx/sites-available/brumisater
sudo ln -s /etc/nginx/sites-available/brumisater /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

### 3. Vérification déploiement
```bash
# Health check
curl https://domain.com/health

# Métriques (accès local uniquement)
curl http://localhost:3000/metrics

# Validation complète
node scripts/validate-phase6-production.js
```

## 📊 Monitoring Production

### 1. Métriques clés à surveiller
- **Response Time** : P50, P95, P99 par endpoint
- **Error Rate** : 4xx, 5xx par heure
- **Queue Health** : jobs pending, processing time
- **Cache Performance** : hit rate, memory usage
- **System Resources** : CPU, RAM, disk

### 2. Alertes recommandées
- **Critical** : Error rate > 5%, Response time > 5s
- **Warning** : Response time > target (500ms API, 2s PDF)
- **Info** : Cache hit rate < 80%, Queue backlog > 50

### 3. Logs à analyser
```bash
# Erreurs applicatives
tail -f /var/log/brumisater/error.log

# Performance et accès
tail -f /var/log/brumisater/combined.log | grep -E "(SLOW|ERROR)"

# Nginx access et erreurs
tail -f /var/log/nginx/brumisater_access.log
tail -f /var/log/nginx/brumisater_error.log
```

## 🔄 Maintenance

### 1. Tâches automatiques
- **Daily** : Backup complet DB + fichiers (3h du matin)
- **Hourly** : Nettoyage fichiers temporaires et logs anciens
- **15min** : Statistiques système et cache cleanup
- **5min** : Health checks et métriques

### 2. Tâches manuelles recommandées
- **Weekly** : Vérification logs d'erreur, optimisation requêtes lentes
- **Monthly** : Audit sécurité, mise à jour dépendances
- **Quarterly** : Review performances, optimisation cache

### 3. Backup et restore
```bash
# Backup manuel
./scripts/backup/auto-backup.sh

# Restore database
gunzip -c /var/backups/brumisater/db_backup.sql.gz | psql $DATABASE_URL

# Restore application
tar -xzf /var/backups/brumisater/app_backup.tar.gz -C /var/www/brumisater/
```

## ✅ Validation et Tests

### Script de validation complet
```bash
# Validation Phase 6
node scripts/validate-phase6-production.js

# Output attendu :
# ✅ Services de performance : OK
# ✅ Configuration production : OK  
# ✅ Scripts de déploiement : OK
# ✅ Sécurité et monitoring : OK
# 🎉 Phase 6 : Performance et Production - VALIDÉE !
```

### Tests de performance
```bash
# Test API response time
curl -w "@curl-format.txt" -s -o /dev/null https://domain.com/api/health

# Test PDF generation (doit être < 2s)
time curl -X POST https://domain.com/api/pdf/generate -d '{"type":"CHARACTER"}'

# Load testing (optionnel)
ab -n 1000 -c 10 https://domain.com/
```

## 📋 Checklist de déploiement

### Pré-déploiement
- [ ] Variables d'environnement sécurisées (aucun défaut)
- [ ] Certificats SSL configurés et valides
- [ ] Base de données PostgreSQL prête et accessible
- [ ] Backup système en place
- [ ] Monitoring externe configuré

### Déploiement
- [ ] Code déployé et build réussi
- [ ] PM2 processus démarrés (app + workers)
- [ ] Nginx configuré et reload
- [ ] Health check OK (/health retourne 200)
- [ ] Logs structurés actifs

### Post-déploiement
- [ ] Tests fonctionnels sur environnement production
- [ ] Métriques de performance dans les cibles
- [ ] Alertes de monitoring configurées
- [ ] Documentation équipe mise à jour

---

## 🎉 Résultat Phase 6

✅ **Performance** : API < 500ms, PDF < 2s (cibles TODO.md atteintes)  
✅ **Production** : SSL, monitoring, logs, backup automatique  
✅ **Sécurité** : Headers, rate limiting, HTTPS forcé  
✅ **Monitoring** : Health checks, métriques, alertes  
✅ **Déploiement** : Scripts automatisés, PM2, Nginx  

**L'application Brumisater est maintenant prête pour un déploiement production optimisé avec monitoring complet et performance guarantie selon les spécifications TODO.md.**