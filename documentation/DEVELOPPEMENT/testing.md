# Guide des Tests - Brumisater

## Vue d'ensemble

Document de référence pour la stratégie de tests du projet Brumisater selon l'architecture MVC-CS (Models, Views, Controllers, Components, Services).

### Objectifs qualité
- **Couverture minimum 80%** selon métriques TODO.md
- **Tests par couche MVC-CS** : Validation complète de chaque composant
- **Tests d'intégration** : API, PDF, Database avec scénarios réels
- **Fiabilité** : Tests reproductibles et isolation complète
- **Performance** : Suite de tests < 30 secondes

## Architecture des tests

### Structure des tests
```
tests/
├── unit/                     # Tests unitaires par couche MVC-CS
│   ├── models/              # Tests modèles : validation, relations, hooks
│   │   ├── BaseModel.test.js
│   │   ├── Utilisateur.test.js
│   │   ├── Document.test.js
│   │   └── ...
│   ├── services/            # Tests services : logique métier
│   │   ├── PdfService.test.js
│   │   ├── DocumentFactory.test.js
│   │   ├── VoteService.test.js
│   │   └── ...
│   ├── controllers/         # Tests contrôleurs : requêtes/réponses
│   │   ├── BaseController.test.js
│   │   ├── PdfController.test.js
│   │   ├── PersonnageController.test.js
│   │   └── ...
│   └── utils/               # Tests utilitaires
│       ├── logManager.test.js
│       ├── validation.test.js
│       └── ...
├── integration/             # Tests d'intégration
│   ├── api/                 # Tests API avec Supertest
│   │   ├── auth.test.js
│   │   ├── personnages.test.js
│   │   ├── pdf.test.js
│   │   └── ...
│   ├── pdf/                 # Tests génération PDF
│   │   ├── character.test.js
│   │   ├── town.test.js
│   │   ├── themes.test.js
│   │   └── ...
│   ├── database/            # Tests base de données
│   │   ├── migrations.test.js
│   │   ├── relations.test.js
│   │   └── constraints.test.js
│   └── workflows/           # Tests workflows complets
│       ├── creation-personnage.test.js
│       ├── vote-document.test.js
│       └── moderation.test.js
├── fixtures/                # Données de test par système JDR
│   ├── monsterhearts/
│   ├── engrenages/
│   ├── metro2033/
│   ├── mist-engine/
│   └── zombiology/
├── helpers/                 # Utilitaires de test
│   ├── database.js          # Setup/teardown DB
│   ├── factories.js         # Création objets de test
│   ├── mocks.js             # Mocks services externes
│   └── matchers.js          # Matchers Jest personnalisés
└── setup.js                 # Configuration globale
```

## Configuration Jest

### jest.config.js optimisé
```javascript
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Patterns de tests
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/integration/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/',
    '/tests/fixtures/'
  ],
  
  // Couverture de code
  collectCoverageFrom: [
    'src/**/*.js',
    'public/js/**/*.js',
    '!src/app.js',                    // Point d'entrée
    '!src/database/migrations/**',    // Scripts SQL
    '!src/database/seed.js',          // Données test
    '!**/node_modules/**'
  ],
  
  // Seuils de couverture strictes selon TODO.md
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Exigences par composant critique
    'src/models/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'src/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Alias et résolution modules
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Configuration reporters
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Brumisater Test Results',
      outputPath: 'coverage/test-report.html'
    }]
  ],
  
  // Timeouts Windows-friendly
  testTimeout: 10000,
  maxWorkers: '50%'  // Performance Windows
};
```

## Tests unitaires par couche

### 1. Tests Models

Validation systématique des 16 modèles selon architecture-models.md :

#### Pattern test modèle
```javascript
const ModelName = require('../../src/models/ModelName');
const db = require('../../src/database/db');

// Mock database
jest.mock('../../src/database/db');
jest.mock('../../src/utils/logManager');

describe('ModelName', () => {
  let model;
  
  beforeEach(() => {
    jest.clearAllMocks();
    model = new ModelName();
  });
  
  describe('Configuration', () => {
    test('devrait avoir les propriétés de base correctes', () => {
      expect(model.tableName).toBe('expected_table');
      expect(model.primaryKey).toBe('id');
      expect(model.fillable).toContain('expected_field');
    });
  });
  
  describe('Validation Joi', () => {
    test('devrait valider données correctes', async () => {
      const validData = { /* données valides */ };
      await expect(model.validate(validData, 'create')).resolves.toBe(true);
    });
    
    test('devrait rejeter données invalides', async () => {
      const invalidData = { /* données invalides */ };
      await expect(model.validate(invalidData, 'create')).rejects.toThrow();
    });
  });
  
  describe('Hooks lifecycle', () => {
    test('beforeCreate devrait transformer les données', async () => {
      const spy = jest.spyOn(model, 'beforeCreate');
      spy.mockResolvedValue({ transformed: true });
      
      // Test du hook...
    });
  });
  
  describe('Relations', () => {
    test('getRelatedModel devrait retourner entités liées', async () => {
      db.all.mockResolvedValue([{ id: 1, relation_id: 1 }]);
      
      const related = await model.getRelatedModel(1);
      expect(related).toBeDefined();
      expect(Array.isArray(related)).toBe(true);
    });
  });
  
  describe('Méthodes métier', () => {
    test('méthode spécifique devrait implémenter logique métier', async () => {
      // Test des méthodes spécifiques au modèle
    });
  });
});
```

#### Models prioritaires à tester
1. **BaseModel** ✅ (Déjà testé - 100% couverture)
2. **Utilisateur** - Authentification, rôles, Premium
3. **Document** - Types, workflows, visibilité
4. **Personnage** - Systèmes JDR, données
5. **Pdf** - États, génération, relations
6. **DocumentVote** ✅ (Déjà testé)
7. **SystemeJeu** ✅ (Déjà testé)
8. **DocumentModerationHistorique** - Workflow modération
9. **RgpdConsentement** - Conformité, types
10. **DemandeChangementEmail** - Sécurité, tokens

### 2. Tests Services

Validation logique métier et orchestration :

#### Pattern test service
```javascript
const ServiceName = require('../../src/services/ServiceName');
const ModelDep = require('../../src/models/ModelDep');

// Mock des dépendances
jest.mock('../../src/models/ModelDep');
jest.mock('../../src/utils/logManager');

describe('ServiceName', () => {
  let service, mockModel;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockModel = new ModelDep();
    service = new ServiceName();
  });
  
  describe('Logique métier principale', () => {
    test('processBusinessLogic devrait orchestrer correctement', async () => {
      // Setup mocks
      mockModel.findById.mockResolvedValue({ id: 1, status: 'ACTIVE' });
      
      const result = await service.processBusinessLogic(1, { action: 'update' });
      
      expect(result).toBeDefined();
      expect(mockModel.findById).toHaveBeenCalledWith(1);
    });
    
    test('devrait gérer les erreurs métier appropriées', async () => {
      mockModel.findById.mockResolvedValue(null);
      
      await expect(service.processBusinessLogic(999, {}))
        .rejects.toThrow('Entity not found');
    });
  });
  
  describe('Validation business rules', () => {
    test('devrait valider les règles métier complexes', async () => {
      // Tests règles métier spécifiques
    });
  });
  
  describe('Performance et cache', () => {
    test('devrait utiliser le cache approprié', async () => {
      // Tests performance et mise en cache
    });
  });
});
```

#### Services prioritaires à tester
1. **PdfService** - Orchestration génération PDF
2. **DocumentFactory** - Pattern Factory 6 types
3. **VoteService** - Calculs statistiques, validation
4. **RgpdService** - Export données, conformité
5. **DocumentModerationService** - Workflow validation
6. **SystemMaintenanceService** - Gestion maintenance
7. **EmailService** - Intégration Resend
8. **SystemThemeService** - Cache thèmes

### 3. Tests Controllers

Validation requêtes/réponses HTTP :

#### Pattern test contrôleur
```javascript
const request = require('supertest');
const app = require('../../src/app');
const ControllerName = require('../../src/controllers/ControllerName');

// Mock des services
jest.mock('../../src/services/ServiceName');

describe('ControllerName', () => {
  describe('GET /endpoint', () => {
    test('devrait retourner 200 avec données valides', async () => {
      const response = await request(app)
        .get('/api/endpoint')
        .expect(200);
        
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeDefined();
    });
    
    test('devrait retourner 400 pour paramètres invalides', async () => {
      const response = await request(app)
        .get('/api/endpoint?invalid=param')
        .expect(400);
        
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('POST /endpoint', () => {
    test('devrait créer avec données valides', async () => {
      const validPayload = { /* données valides */ };
      
      const response = await request(app)
        .post('/api/endpoint')
        .send(validPayload)
        .expect(201);
        
      expect(response.body.data.id).toBeDefined();
    });
  });
  
  describe('Authentification et autorisation', () => {
    test('devrait refuser sans authentification', async () => {
      await request(app)
        .post('/api/protected-endpoint')
        .expect(401);
    });
  });
});
```

### 4. Tests Utils

Validation fonctions utilitaires :

```javascript
const { utilFunction } = require('../../src/utils/utilModule');

describe('utilModule', () => {
  describe('utilFunction', () => {
    test('devrait traiter cas nominal', () => {
      const result = utilFunction('valid input');
      expect(result).toBe('expected output');
    });
    
    test('devrait gérer cas limites', () => {
      expect(() => utilFunction(null)).toThrow();
      expect(utilFunction('')).toBe('');
    });
  });
});
```

## Tests d'intégration

### 1. Tests API avec Supertest

Validation endpoints selon api.md :

#### Setup test API
```javascript
const request = require('supertest');
const app = require('../../../src/app');
const db = require('../../../src/database/db');
const { createTestUser, createTestCharacter } = require('../../helpers/factories');

describe('API Integration - Personnages', () => {
  let testUser, authCookie;
  
  beforeAll(async () => {
    // Setup base de test
    await db.run('DELETE FROM personnages WHERE nom LIKE "%test%"');
    testUser = await createTestUser();
    
    // Authentification
    const authResponse = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, code: '123456' });
    authCookie = authResponse.headers['set-cookie'];
  });
  
  describe('POST /api/personnages', () => {
    test('devrait créer personnage Monsterhearts', async () => {
      const personnageData = {
        nom: 'Test Personnage API',
        systeme_jeu: 'monsterhearts',
        donnees_personnage: {
          archetype: 'vampire',
          stats: { hot: 1, cold: 0, volatile: -1, dark: 2 }
        }
      };
      
      const response = await request(app)
        .post('/api/personnages')
        .set('Cookie', authCookie)
        .send(personnageData)
        .expect(201);
        
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.systeme_jeu).toBe('monsterhearts');
    });
  });
  
  afterAll(async () => {
    // Nettoyage
    await db.run('DELETE FROM personnages WHERE utilisateur_id = ?', [testUser.id]);
    await db.run('DELETE FROM utilisateurs WHERE id = ?', [testUser.id]);
  });
});
```

### 2. Tests Génération PDF

Validation génération par type/système :

```javascript
const PdfService = require('../../../src/services/PdfService');
const DocumentFactory = require('../../../src/services/DocumentFactory');
const fs = require('fs-extra');
const path = require('path');

describe('PDF Generation Integration', () => {
  let pdfService, documentFactory;
  
  beforeAll(() => {
    pdfService = new PdfService();
    documentFactory = new DocumentFactory();
  });
  
  describe('Documents CHARACTER', () => {
    test('devrait générer feuille Monsterhearts complète', async () => {
      const personnageData = {
        nom: 'Test PDF Character',
        systeme_jeu: 'monsterhearts',
        archetype: 'vampire',
        stats: { hot: 1, cold: 0, volatile: -1, dark: 2 },
        moves: ['Hypnotic', 'Cold as Ice']
      };
      
      const pdfPath = await pdfService.genererFichePersonnage(personnageData);
      
      expect(fs.existsSync(pdfPath)).toBe(true);
      
      const stats = fs.statSync(pdfPath);
      expect(stats.size).toBeGreaterThan(10000); // PDF non vide
      
      // Nettoyage
      fs.removeSync(pdfPath);
    });
  });
  
  describe('Thèmes visuels', () => {
    test('devrait appliquer thème Zombiology', async () => {
      const documentData = {
        type: 'GENERIQUE',
        systeme_jeu: 'zombiology',
        contenu: 'Test thème survival horror'
      };
      
      const pdfPath = await pdfService.genererDocument(documentData);
      
      expect(fs.existsSync(pdfPath)).toBe(true);
      // Vérification thème dans le PDF généré
      
      fs.removeSync(pdfPath);
    });
  });
});
```

### 3. Tests Database

Validation migrations et contraintes :

```javascript
const db = require('../../../src/database/db');
const migrate = require('../../../src/database/migrate');

describe('Database Integration', () => {
  describe('Migrations', () => {
    test('devrait appliquer toutes les migrations', async () => {
      const migrations = await migrate.getPendingMigrations();
      
      for (const migration of migrations) {
        await migrate.applyMigration(migration);
        
        const isApplied = await migrate.isMigrationApplied(migration);
        expect(isApplied).toBe(true);
      }
    });
  });
  
  describe('Contraintes FK', () => {
    test('devrait respecter contraintes utilisateur -> documents', async () => {
      await expect(
        db.run(`
          INSERT INTO documents (titre, type, systeme_jeu, utilisateur_id) 
          VALUES ('Test', 'CHARACTER', 'monsterhearts', 99999)
        `)
      ).rejects.toThrow(/foreign key constraint/i);
    });
  });
  
  describe('Performance requêtes', () => {
    test('requêtes complexes < 1 seconde', async () => {
      const start = Date.now();
      
      const result = await db.all(`
        SELECT d.*, u.nom as auteur, COUNT(dv.id) as votes
        FROM documents d
        LEFT JOIN utilisateurs u ON d.utilisateur_id = u.id
        LEFT JOIN document_votes dv ON d.id = dv.document_id
        WHERE d.statut = 'ACTIF'
        GROUP BY d.id
        ORDER BY d.created_at DESC
        LIMIT 100
      `);
      
      const duration = Date.now() - start;
      
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(1000);
    });
  });
});
```

## Helpers et utilities

### Database Helper
```javascript
// tests/helpers/database.js
const db = require('../../src/database/db');

class TestDatabaseHelper {
  /**
   * Setup propre pour chaque test
   */
  static async setupTestDatabase() {
    await db.run('BEGIN TRANSACTION');
  }
  
  /**
   * Nettoyage après test
   */
  static async teardownTestDatabase() {
    await db.run('ROLLBACK');
  }
  
  /**
   * Nettoyage complet base de test
   */
  static async cleanTestData() {
    const tables = [
      'document_votes', 'document_moderation_historique',
      'pdfs', 'documents', 'personnages', 'utilisateurs'
    ];
    
    for (const table of tables) {
      await db.run(`DELETE FROM ${table} WHERE created_at > NOW() - INTERVAL '1 hour'`);
    }
  }
}

module.exports = TestDatabaseHelper;
```

### Factory Helper
```javascript
// tests/helpers/factories.js
const Utilisateur = require('../../src/models/Utilisateur');
const Personnage = require('../../src/models/Personnage');
const Document = require('../../src/models/Document');

class TestDataFactory {
  /**
   * Créer utilisateur de test
   */
  static async createTestUser(overrides = {}) {
    const userData = {
      nom: 'Test User',
      email: `test-${Date.now()}@example.com`,
      mot_de_passe: 'password123',
      role: 'UTILISATEUR',
      statut: 'ACTIF',
      ...overrides
    };
    
    const utilisateur = new Utilisateur();
    return await utilisateur.create(userData);
  }
  
  /**
   * Créer personnage par système JDR
   */
  static async createTestCharacter(systemeJeu, utilisateurId, overrides = {}) {
    const fixtures = require(`../fixtures/${systemeJeu}/characters.json`);
    const template = fixtures.templates[0];
    
    const personnageData = {
      nom: `Test ${template.archetype}`,
      systeme_jeu: systemeJeu,
      utilisateur_id: utilisateurId,
      donnees_personnage: template.data,
      statut: 'ACTIF',
      ...overrides
    };
    
    const personnage = new Personnage();
    return await personnage.create(personnageData);
  }
  
  /**
   * Créer document par type
   */
  static async createTestDocument(type, systemeJeu, utilisateurId, overrides = {}) {
    const documentData = {
      type,
      titre: `Test Document ${type}`,
      systeme_jeu: systemeJeu,
      utilisateur_id: utilisateurId,
      donnees: { test: true },
      statut: 'ACTIF',
      ...overrides
    };
    
    const document = new Document();
    return await document.create(documentData);
  }
}

module.exports = TestDataFactory;
```

## Fixtures par système JDR

### Structure fixtures
```
tests/fixtures/
├── monsterhearts/
│   ├── characters.json      # Templates personnages
│   ├── moves.json          # Moves par archétype
│   └── documents.json      # Documents type
├── engrenages/
│   ├── characters.json
│   ├── competences.json
│   └── equipements.json
└── ...
```

### Exemple fixture Monsterhearts
```json
// tests/fixtures/monsterhearts/characters.json
{
  "templates": [
    {
      "archetype": "vampire",
      "data": {
        "stats": { "hot": 1, "cold": 0, "volatile": -1, "dark": 2 },
        "moves": ["Hypnotic", "Cold as Ice"],
        "harm": { "physical": 0, "emotional": 0 },
        "conditions": [],
        "strings": { "held": 0, "given": 0 }
      }
    },
    {
      "archetype": "werewolf",
      "data": {
        "stats": { "hot": -1, "cold": 1, "volatile": 2, "dark": 0 },
        "moves": ["Primal Dominance", "Scent of Blood"],
        "harm": { "physical": 0, "emotional": 0 },
        "pack_moves": ["Alpha", "Protector"]
      }
    }
  ]
}
```

## Scripts de test

### Scripts package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit --coverage",
    "test:integration": "jest tests/integration",
    "test:models": "jest tests/unit/models",
    "test:services": "jest tests/unit/services",
    "test:controllers": "jest tests/unit/controllers",
    "test:api": "jest tests/integration/api",
    "test:pdf": "jest tests/integration/pdf",
    "test:database": "jest tests/integration/database",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --coverageReporters=text-lcov | coveralls",
    "test:ci": "jest --ci --coverage --watchAll=false --passWithNoTests"
  }
}
```

### Script de validation pre-commit
```javascript
// scripts/pre-commit-tests.js
const { execSync } = require('child_process');

console.log('🧪 Running pre-commit tests...');

try {
  // Tests unitaires rapides
  execSync('npm run test:unit', { stdio: 'inherit' });
  
  // Linting
  execSync('npm run lint', { stdio: 'inherit' });
  
  // Vérification couverture
  const coverage = execSync('npm run test:coverage -- --silent --json', { encoding: 'utf8' });
  const coverageData = JSON.parse(coverage);
  
  if (coverageData.total.lines.pct < 80) {
    console.error('❌ Couverture insuffisante:', coverageData.total.lines.pct + '%');
    process.exit(1);
  }
  
  console.log('✅ Pre-commit tests passed!');
} catch (error) {
  console.error('❌ Tests failed:', error.message);
  process.exit(1);
}
```

## Métriques et reporting

### Objectifs de performance
- **Suite complète** : < 30 secondes
- **Tests unitaires** : < 10 secondes  
- **Tests d'intégration** : < 20 secondes
- **Couverture globale** : ≥ 80%
- **Couverture models/services** : ≥ 85%

### Monitoring continu
- **GitHub Actions CI** : Tests automatiques sur push/PR
- **Coverage reporting** : Codecov ou Coveralls
- **Performance tracking** : Jest performance output
- **Flaky tests detection** : Surveillance échecs intermittents

---

Cette documentation fournit le framework complet pour atteindre 80% de couverture selon la stratégie Phase 5 du TODO.md, en respectant l'architecture MVC-CS et les spécificités Windows du projet.