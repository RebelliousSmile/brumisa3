# Guide des Tests - brumisater

## Vue d'ensemble

Stratégie de tests pour l'architecture MVC-CS avec Jest (unitaires) et Supertest (intégration API).

## Organisation des tests

### Structure recommandée
```
tests/
├── unit/                    # Tests unitaires par couche
│   ├── models/             # Tests des modèles
│   │   ├── BaseModel.test.js
│   │   ├── Personnage.test.js
│   │   └── Document.test.js
│   ├── services/           # Tests des services métier
│   │   ├── PdfService.test.js
│   │   ├── PersonnageService.test.js
│   │   └── EmailService.test.js
│   ├── controllers/        # Tests des contrôleurs
│   │   └── PersonnageController.test.js
│   └── utils/              # Tests des utilitaires
│       └── validation.test.js
├── integration/            # Tests d'intégration
│   ├── api/               # Tests API endpoints
│   │   ├── auth.test.js
│   │   ├── personnages.test.js
│   │   └── pdfs.test.js
│   ├── database/          # Tests base de données
│   │   └── migrations.test.js
│   └── pdf/              # Tests génération PDF
│       └── documents.test.js
├── fixtures/              # Données de test
│   ├── personnages.json
│   └── documents.json
└── helpers/              # Utilitaires de test
    ├── database.js       # Setup/teardown DB
    └── auth.js          # Helpers authentification
```

## Configuration Jest

### jest.config.js
```javascript
module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: [
        '<rootDir>/tests/unit/**/*.test.js',
        '<rootDir>/tests/integration/**/*.test.js'
    ],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/database/migrations/**',
        '!src/scripts/**',
        '!src/views/**'
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

### tests/setup.js
```javascript
// Configuration globale des tests
process.env.NODE_ENV = 'test';
process.env.POSTGRES_DB = 'brumisater_test';
process.env.LOG_LEVEL = 'error';

const { setupTestDatabase } = require('./helpers/database');

beforeAll(async () => {
    await setupTestDatabase();
});
```

## Tests unitaires par couche

### Models (Active Record)
```javascript
// tests/unit/models/Personnage.test.js
const Personnage = require('../../src/models/Personnage');

describe('Personnage Model', () => {
    describe('validation', () => {
        it('devrait valider un personnage valide', () => {
            const donnees = {
                nom: 'Luna la Vampire',
                systeme_jeu: 'monsterhearts',
                donnees: { skin: 'vampire', hot: 2 }
            };
            
            expect(() => {
                Personnage.validate(donnees);
            }).not.toThrow();
        });

        it('devrait rejeter un nom manquant', () => {
            const donnees = {
                systeme_jeu: 'monsterhearts',
                donnees: { skin: 'vampire' }
            };
            
            expect(() => {
                Personnage.validate(donnees);
            }).toThrow('Nom requis');
        });
    });

    describe('méthodes métier', () => {
        it('devrait générer un slug unique', () => {
            const personnage = new Personnage({
                nom: 'Luna la Vampire'
            });
            
            expect(personnage.generateSlug()).toBe('luna-la-vampire');
        });
    });
});
```

### Services (Logique métier)
```javascript
// tests/unit/services/PersonnageService.test.js
const PersonnageService = require('../../src/services/PersonnageService');
const Personnage = require('../../src/models/Personnage');

jest.mock('../../src/models/Personnage');

describe('PersonnageService', () => {
    let service;
    
    beforeEach(() => {
        service = new PersonnageService();
        jest.clearAllMocks();
    });

    describe('creer', () => {
        it('devrait créer un personnage avec données valides', async () => {
            const donnees = {
                nom: 'Gandalf',
                systeme_jeu: 'monsterhearts',
                donnees: { skin: 'chosen' }
            };

            Personnage.create.mockResolvedValue({ id: 1, ...donnees });

            const result = await service.creer(donnees, { id: 1 });

            expect(Personnage.create).toHaveBeenCalledWith({
                ...donnees,
                utilisateur_id: 1
            });
            expect(result.id).toBe(1);
        });

        it('devrait lever une erreur si données invalides', async () => {
            const donneesInvalides = { nom: '' };

            await expect(
                service.creer(donneesInvalides, { id: 1 })
            ).rejects.toThrow('Données invalides');
        });
    });
});
```

### Controllers (Endpoints)
```javascript
// tests/unit/controllers/PersonnageController.test.js
const PersonnageController = require('../../src/controllers/PersonnageController');
const PersonnageService = require('../../src/services/PersonnageService');

jest.mock('../../src/services/PersonnageService');

describe('PersonnageController', () => {
    let controller;
    let mockReq, mockRes;

    beforeEach(() => {
        controller = new PersonnageController();
        mockReq = {
            body: {},
            user: { id: 1 },
            params: {}
        };
        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
    });

    describe('POST /api/personnages', () => {
        it('devrait créer un personnage avec succès', async () => {
            const personnageData = { nom: 'Test', systeme_jeu: 'monsterhearts' };
            mockReq.body = personnageData;

            PersonnageService.prototype.creer.mockResolvedValue({
                id: 1,
                ...personnageData
            });

            await controller.creer(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                succes: true,
                donnees: expect.objectContaining({ id: 1 })
            });
        });
    });
});
```

## Tests d'intégration

### API Endpoints avec Supertest
```javascript
// tests/integration/api/personnages.test.js
const request = require('supertest');
const app = require('../../src/app');
const { cleanDatabase, createUser } = require('../helpers/database');

describe('API /api/personnages', () => {
    let authCookie;
    let testUser;

    beforeEach(async () => {
        await cleanDatabase();
        testUser = await createUser({
            email: 'test@example.com',
            mot_de_passe: 'password123'
        });

        // Authentification pour les tests
        const loginResponse = await request(app)
            .post('/api/auth/connexion')
            .send({
                email: 'test@example.com',
                motDePasse: 'password123'
            });

        authCookie = loginResponse.headers['set-cookie'];
    });

    describe('POST /api/personnages', () => {
        it('devrait créer un personnage avec utilisateur authentifié', async () => {
            const personnageData = {
                nom: 'Luna la Vampire',
                systeme_jeu: 'monsterhearts',
                donnees: {
                    skin: 'vampire',
                    hot: 2,
                    cold: -1
                }
            };

            const response = await request(app)
                .post('/api/personnages')
                .set('Cookie', authCookie)
                .send(personnageData)
                .expect(201);

            expect(response.body).toMatchObject({
                succes: true,
                donnees: {
                    nom: 'Luna la Vampire',
                    systeme_jeu: 'monsterhearts',
                    utilisateur_id: testUser.id
                }
            });
        });

        it('devrait rejeter sans authentification', async () => {
            const response = await request(app)
                .post('/api/personnages')
                .send({ nom: 'Test' })
                .expect(401);

            expect(response.body.message).toBe('Authentification requise');
        });
    });
});
```

### Tests PDF Generation
```javascript
// tests/integration/pdf/documents.test.js
const PdfService = require('../../src/services/PdfService');
const fs = require('fs').promises;
const path = require('path');

describe('Génération PDF', () => {
    let pdfService;

    beforeEach(() => {
        pdfService = new PdfService();
    });

    describe('CHARACTER documents', () => {
        it('devrait générer un PDF Monsterhearts valide', async () => {
            const donnees = {
                nom: 'Luna la Vampire',
                skin: 'vampire',
                hot: 2,
                cold: -1,
                volatile: 1,
                dark: 0
            };

            const pdfPath = await pdfService.genererDocument(
                'CHARACTER',
                'monsterhearts',
                donnees
            );

            // Vérifier que le fichier existe
            const stats = await fs.stat(pdfPath);
            expect(stats.size).toBeGreaterThan(1000); // Minimum 1KB

            // Vérifier le contenu PDF (basique)
            const content = await fs.readFile(pdfPath);
            expect(content.toString().includes('%PDF')).toBe(true);
        });

        it('devrait gérer les erreurs de données invalides', async () => {
            const donneesInvalides = {
                nom: '', // Nom vide invalide
                skin: 'inexistant'
            };

            await expect(
                pdfService.genererDocument('CHARACTER', 'monsterhearts', donneesInvalides)
            ).rejects.toThrow('Données invalides');
        });
    });
});
```

## Helpers et fixtures

### Base de données de test
```javascript
// tests/helpers/database.js
const { Pool } = require('pg');

class TestDatabase {
    constructor() {
        this.pool = new Pool({
            host: process.env.POSTGRES_HOST || 'localhost',
            database: process.env.POSTGRES_DB || 'brumisater_test',
            user: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'password'
        });
    }

    async setupTestDatabase() {
        // Créer les tables si nécessaires
        await this.runMigrations();
    }

    async cleanDatabase() {
        // Nettoyer les données entre les tests
        await this.pool.query('TRUNCATE TABLE personnages RESTART IDENTITY CASCADE');
        await this.pool.query('TRUNCATE TABLE utilisateurs RESTART IDENTITY CASCADE');
        await this.pool.query('TRUNCATE TABLE documents RESTART IDENTITY CASCADE');
    }

    async createUser(userData = {}) {
        const defaultUser = {
            nom: 'Test User',
            email: 'test@example.com',
            mot_de_passe: 'hashed_password',
            role: 'UTILISATEUR'
        };

        const user = { ...defaultUser, ...userData };
        const result = await this.pool.query(
            'INSERT INTO utilisateurs (nom, email, mot_de_passe, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [user.nom, user.email, user.mot_de_passe, user.role]
        );

        return result.rows[0];
    }
}

module.exports = new TestDatabase();
```

### Fixtures de données
```javascript
// tests/fixtures/personnages.json
{
  "monsterhearts": {
    "vampire": {
      "nom": "Luna la Vampire",
      "skin": "vampire",
      "hot": 2,
      "cold": -1,
      "volatile": 1,
      "dark": 0,
      "conditions": [],
      "moves": ["hypnotic", "cold_as_ice"]
    }
  },
  "engrenages": {
    "guerrier": {
      "nom": "Marcus le Forgeron",
      "profession": "guerrier",
      "attributs": {
        "force": 4,
        "agilite": 2,
        "intellect": 2,
        "perception": 3
      }
    }
  }
}
```

## Scripts de test

### package.json scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:coverage": "jest --coverage",
    "test:pdf": "jest tests/integration/pdf"
  }
}
```

### Commandes pratiques
```bash
# Tests complets avec couverture
pnpm test:coverage

# Tests en mode watch pendant développement
pnpm test:watch

# Tests spécifiques
pnpm test -- --grep "PersonnageService"
pnpm test:unit
pnpm test:integration

# Tests PDF uniquement (plus lents)
pnpm test:pdf
```

## Mocking et isolation

### Services externes
```javascript
// Mock des services externes
jest.mock('../../src/services/EmailService', () => ({
    envoyerEmail: jest.fn().mockResolvedValue({ success: true })
}));

// Mock des appels base de données
jest.mock('../../src/database/db', () => ({
    query: jest.fn()
}));
```

### Variables d'environnement
```javascript
// Isolation des variables d'env pour les tests
const originalEnv = process.env;

beforeEach(() => {
    process.env = {
        ...originalEnv,
        NODE_ENV: 'test',
        POSTGRES_DB: 'brumisater_test'
    };
});

afterEach(() => {
    process.env = originalEnv;
});
```

## Standards de test

### Conventions de nommage
- **describe** : Nom de la classe/module testé
- **it/test** : Comportement attendu en français
- **Fichiers** : Même nom que le module testé + `.test.js`

### Patterns recommandés
- **AAA** : Arrange, Act, Assert
- **Given/When/Then** : Contexte, action, vérification
- **Un test = un aspect** : Tests focalisés et indépendants
- **Mocks minimaux** : Préférer les vraies implémentations quand possible

Cette stratégie de tests garantit la qualité du code selon l'architecture MVC-CS définie.