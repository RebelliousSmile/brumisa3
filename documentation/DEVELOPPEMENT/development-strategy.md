# Stratégie de développement - brumisater

## Vue d'ensemble

Document de référence pour définir la stratégie de développement du projet brumisater selon l'architecture MVC-CS (Models, Views, Controllers, Components, Services) définie.

### Objectifs stratégiques
- **Architecture MVC-CS** : Respecter l'architecture définie dans ARCHITECTURE/
- **Principes SOLID/DRY** : Code maintenable et extensible selon CLAUDE.md
- **Standards Windows** : Développement optimisé pour environnement Windows
- **Générations PDF performantes** : Système PDFKit optimisé pour 6 types de documents et 5 systèmes JDR

## Plan de développement par phases

### Phase 1 : Fondations (2-3 semaines)
#### 1.1 Infrastructure de base
- **Base de données** : PostgreSQL avec migrations complètes
- **Architecture MVC** : Structure Controllers/Models/Services établie
- **Sessions et auth** : Système d'authentification avec codes d'accès
- **Configuration** : Variables d'environnement pour tous les paramètres

#### 1.2 Services fondamentaux
- **EmailService** : Intégration Resend pour notifications
- **PdfService** : Base PDFKit avec SystemTheme
- **UtilisateurService** : Gestion comptes et droits Premium
- **LogManager** : Winston avec rotation quotidienne

### Phase 2 : Génération PDF avancée (3-4 semaines)
#### 2.1 Architecture documents
- **DocumentFactory** : Pattern Factory pour 6 types de documents
- **BasePdfKitService** : Utilitaires communs (grilles, tracks, checkboxes)
- **SystemTheme** : Thèmes visuels pour chaque système JDR
- **Templates programmatiques** : Remplacement complet des templates HTML

#### 2.2 Types de documents
- **CHARACTER** : Feuilles de personnage avec formulaires dynamiques
- **TOWN/GROUP** : Documents Monsterhearts spécialisés
- **ORGANIZATION** : Listes PNJs structurées
- **DANGER** : Fronts Mist Engine
- **GENERIQUE** : Documents Markdown libres

### Phase 3 : Interface utilisateur (2-3 semaines)
#### 3.1 Alpine.js Components
- **PersonnageComponent** : Création/édition personnages
- **DocumentGenerique** : Formulaires dynamiques par système
- **NavigationMobile** : Interface responsive
- **TableauBordComponent** : Dashboard utilisateur

#### 3.2 Templates EJS
- **Layouts système** : Templates par JDR avec thèmes cohérents
- **Composants UI** : Button, Modal, Form selon design system
- **Pages création** : Formulaires adaptatifs par type de document

### Phase 4 : Oracles et communauté (2 semaines)
#### 4.1 Système d'oracles
- **OracleService** : Import/export JSON avec validation
- **Interface admin** : Gestion oracles officiels
- **API publique** : Endpoints pour consultation oracles

#### 4.2 Partage communauté
- **Documents publics** : Système de visibilité et modération
- **Témoignages** : Validation et affichage
- **Administration** : Interface Félix pour modération

### Phase 5 : Optimisation et déploiement (1-2 semaines)
#### 5.1 Performance
- **Cache système** : Optimisation requêtes fréquentes
- **Génération asynchrone** : Queue pour gros documents
- **Monitoring** : Métriques temps génération PDF

#### 5.2 Production
- **Docker** : Containerisation pour déploiement
- **CI/CD** : Pipeline automatisé avec tests
- **Monitoring** : Logs et alertes prodution

## Organisation du code source

### Structure recommandée
```
src/
├── app.js                    # Point d'entrée Express
├── config/                   # Configuration centralisée
│   ├── database.js          # Config PostgreSQL
│   ├── systemesJeu.js       # Définitions systèmes JDR
│   └── environments/        # Configs par environnement
├── controllers/             # Contrôleurs MVC
│   ├── BaseController.js    # Contrôleur de base
│   ├── PdfController.js     # Génération PDF
│   ├── PersonnageController.js
│   └── AdminController.js
├── models/                  # Modèles de données
│   ├── BaseModel.js         # Modèle de base avec PostgreSQL
│   ├── Personnage.js        # Entité principale
│   ├── Pdf.js               # Documents générés
│   └── Utilisateur.js       # Comptes utilisateurs
├── services/                # Services métier
│   ├── BaseService.js       # Service de base
│   ├── PdfService.js        # Orchestration PDF
│   ├── EmailService.js      # Envoi emails Resend
│   ├── documents/           # Types de documents PDF
│   │   ├── CharacterDocument.js
│   │   ├── GenericDocument.js
│   │   └── TownDocument.js
│   └── themes/              # Thèmes visuels par système
│       ├── MonsterheartsTheme.js
│       ├── SystemTheme.js   # Base commune
│       └── EngrenagesTheme.js
├── database/                # Base de données
│   ├── db.js                # Connexion PostgreSQL
│   ├── init.js              # Initialisation
│   ├── migrate.js           # Système de migrations
│   └── migrations/          # Scripts SQL versionnés
├── routes/                  # Routes Express
│   ├── web.js               # Routes pages web
│   └── api.js               # Routes API REST
├── views/                   # Templates EJS
│   ├── layouts/             # Layouts par système
│   ├── systemes/            # Pages par JDR
│   └── components/          # Composants UI réutilisables
├── utils/                   # Utilitaires
│   ├── logManager.js        # Configuration Winston
│   └── validation.js        # Validations communes
└── middleware/              # Middlewares Express
    ├── auth.js              # Authentification
    ├── errors.js            # Gestion d'erreurs
    └── validation.js        # Validation requêtes
```

### Principes d'organisation
1. **Séparation claire** entre logique métier (services) et présentation (controllers)
2. **Un service par responsabilité** : PdfService, EmailService, PersonnageService
3. **Models actifs** : Logique de base intégrée dans les modèles
4. **Configuration centralisée** : Toutes les variables dans config/
5. **Tests intégrés** : Structure miroir dans tests/

## Workflow de développement

### Stratégie de branches Git
```
main                 # Production stable
├── develop         # Intégration continue
├── feature/pdf-v2  # Nouvelles fonctionnalités
├── fix/email-bug   # Corrections de bugs
└── hotfix/security # Corrections urgentes production
```

### Processus de développement
1. **Feature branch** : Créer depuis develop pour chaque fonctionnalité
2. **Tests locaux** : pnpm test avant push
3. **Pull request** : Review + tests automatiques
4. **Merge develop** : Intégration continue
5. **Deploy staging** : Tests fonctionnels complets
6. **Merge main** : Déploiement production

### Conventions de commits
```bash
feat(pdf): ajout génération documents TOWN
fix(auth): correction validation email
refactor(services): extraction logique commune
docs(readme): mise à jour installation
test(pdf): ajout tests unitaires PdfService
chore(deps): mise à jour dépendances sécurité
```

## Standards de code et conventions

### JavaScript/Node.js
```javascript
// Conventions de nommage
class PdfService extends BaseService { }     // PascalCase pour classes
const pdfService = new PdfService();        // camelCase pour variables
const PDF_TYPES = ['CHARACTER', 'TOWN'];    // SCREAMING_SNAKE_CASE pour constantes

// Documentation JSDoc obligatoire
/**
 * Génère un document PDF selon le type spécifié
 * @param {string} type - Type de document (CHARACTER, TOWN, etc.)
 * @param {Object} data - Données du document
 * @param {Object} user - Utilisateur demandeur
 * @returns {Promise<string>} ID du document généré
 */
async genererDocument(type, data, user) {
    // Implementation...
}

// Gestion d'erreurs avec try/catch
try {
    const result = await pdfService.generer(data);
    logger.info('PDF généré avec succès', { documentId: result.id });
    return result;
} catch (error) {
    logger.error('Erreur génération PDF', { error: error.message, data });
    throw new ServiceError('Génération impossible', 500);
}
```

### Configuration ESLint
```json
{
  "extends": ["eslint:recommended", "node"],
  "env": {
    "node": true,
    "es2022": true
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "semicolon": ["error", "always"]
  }
}
```

### Configuration Prettier
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 4,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## Gestion des migrations base de données

### Structure des migrations
```sql
-- migrations/001_initial_schema.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migrations/002_add_premium_features.sql
ALTER TABLE users ADD COLUMN premium_expires_at TIMESTAMP;
CREATE INDEX idx_users_premium ON users(premium_expires_at);
```

### Script de migration
```javascript
// database/migrate.js
const migrations = [
    '001_initial_schema.sql',
    '002_add_premium_features.sql',
    '003_pdf_documents.sql'
];

for (const migration of migrations) {
    if (!await isApplied(migration)) {
        await applyMigration(migration);
        await markAsApplied(migration);
        logger.info(`Migration appliquée: ${migration}`);
    }
}
```

### Bonnes pratiques
1. **Migrations idempotentes** : Réexécution sans effet
2. **Pas de rollback automatique** : Migrations forward-only
3. **Versioning strict** : Numérotation séquentielle
4. **Tests de migration** : Validation sur base de test

## Environnements et configuration

### Configuration par environnement
```bash
# .env.development
NODE_ENV=development
PORT=3000
POSTGRES_HOST=localhost
POSTGRES_DB=brumisater_dev
LOG_LEVEL=debug

# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@prod-host:5432/brumisater
LOG_LEVEL=info
FORCE_HTTPS=true
```

### Service de configuration
```javascript
// config/environments.js
class ConfigService {
    constructor() {
        this.env = process.env.NODE_ENV || 'development';
        this.config = this.loadConfig();
    }
    
    loadConfig() {
        const baseConfig = {
            app: {
                name: 'brumisater',
                version: process.env.npm_package_version
            },
            database: {
                host: process.env.POSTGRES_HOST,
                database: process.env.POSTGRES_DB,
                ssl: this.env === 'production'
            }
        };
        
        return this.mergeEnvironmentConfig(baseConfig);
    }
}
```

## Pipeline de développement

### Tests automatisés
```bash
# Tests unitaires par couche
pnpm run test:unit:services   # Services métier
pnpm run test:unit:models     # Modèles de données  
pnpm run test:unit:utils      # Utilitaires

# Tests d'intégration
pnpm run test:integration:api     # API endpoints
pnpm run test:integration:pdf     # Génération PDF
pnpm run test:integration:email   # Envoi emails

# Tests end-to-end
pnpm run test:e2e:auth       # Parcours authentification
pnpm run test:e2e:pdf        # Génération complète PDF
```

### Configuration Jest
```javascript
// jest.config.js
module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testMatch: [
        '<rootDir>/tests/unit/**/*.test.js',
        '<rootDir>/tests/integration/**/*.test.js'
    ],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/database/migrations/**',
        '!src/scripts/**'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};
```

### CI/CD avec GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: brumisater_test
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm run db:migrate
      - run: pnpm run test:all
      - run: pnpm run lint
      
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          # Script de déploiement staging
```

## Checklist avant commit/deploy

### Pre-commit (obligatoire)
- [ ] **Tests passent** : `pnpm test` sans erreur
- [ ] **Linting OK** : `pnpm run lint` sans warning
- [ ] **Types validés** : JSDoc à jour sur fonctions publiques
- [ ] **Variables d'env** : Pas de valeurs hardcodées (localhost, ports)
- [ ] **Logs appropriés** : Niveau info/error, pas de console.log
- [ ] **Documentation** : README.md à jour si changements API

### Pre-deploy staging
- [ ] **Base de données** : Migrations testées
- [ ] **Configuration** : Variables d'environnement complètes
- [ ] **Assets** : CSS Tailwind compilé (`pnpm run build:css`)
- [ ] **Dépendances** : `pnpm audit` sans vulnérabilités critiques
- [ ] **Performance** : Tests de charge si modifications PDF
- [ ] **Monitoring** : Logs configurés pour debug

### Pre-deploy production
- [ ] **Staging validé** : Tests fonctionnels complets OK
- [ ] **Backup BDD** : Sauvegarde avant migration
- [ ] **Secrets rotés** : SESSION_SECRET et API keys renouvelés
- [ ] **SSL configuré** : Certificats valides et auto-renewal
- [ ] **Monitoring** : Alertes configurées (erreurs, performance)
- [ ] **Rollback plan** : Procédure de retour arrière documentée

## Standards spécifiques Windows

### Commandes et scripts
```powershell
# Préférer PowerShell pour scripts Windows
# scripts/setup-dev.ps1
Write-Host "Configuration environnement développement..."
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "Fichier .env créé, veuillez le configurer"
}

# Tests de connexion base
node scripts\test-db-connection.js
```

### Chemins et séparateurs
```javascript
// Utiliser path.join() pour compatibilité
const path = require('path');
const templatePath = path.join(__dirname, '..', 'templates', 'pdf', 'monsterhearts.html');

// Éviter les chemins hardcodés Unix
// ❌ const logPath = './logs/app.log';
// ✅ const logPath = path.join(process.cwd(), 'logs', 'app.log');
```

### Variables d'environnement Windows
```bash
# .env pour Windows
TEMP_DIR=C:\temp\brumisater
LOG_DIR=C:\ProgramData\brumisater\logs
ASSETS_PATH=.\public\assets

# Pas de chemins Unix hardcodés
# ❌ UPLOAD_PATH=/var/uploads
# ✅ UPLOAD_PATH=.\uploads
```

## Métriques et monitoring

### KPI de développement
- **Couverture tests** : Minimum 80% lignes de code
- **Temps génération PDF** : < 2 secondes pour documents standards
- **Temps réponse API** : < 500ms pour requêtes simples
- **Uptime** : > 99.5% en production
- **Build time** : < 5 minutes pour CI complète

### Outils de monitoring
- **Winston** : Logs structurés avec rotation
- **Jest coverage** : Suivi couverture tests
- **ESLint** : Qualité code automatisée
- **PostgreSQL logs** : Performance requêtes
- **Process monitoring** : PM2 ou équivalent

### Alertes critiques
- **Erreurs 500** : > 5/minute → Alerte immédiate
- **Génération PDF échouée** : > 10% → Alerte développeur
- **Espace disque** : < 20% libre → Alerte admin
- **Base données** : Connexions > 90% pool → Alerte technique

---

Cette stratégie de développement fournit le cadre complet pour coder brumisater selon l'architecture MVC-CS définie, en respectant les contraintes Windows et les principes SOLID/DRY du projet.