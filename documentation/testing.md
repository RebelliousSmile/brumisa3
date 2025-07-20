# Guide de Tests - brumisa3.fr

## Vue d'ensemble

Ce document détaille les différents éléments à tester dans l'application brumisa3.fr, les méthodes de test et les outils recommandés.

## Types de Tests

### 1. Tests Unitaires

#### Frontend (JavaScript/Alpine.js)

**Services à tester :**
- `PersonnageService.js` - Toutes les méthodes CRUD
- `PdfService.js` - Génération, téléchargement, statuts
- Stores Alpine (`app`, `navigation`, `creation`, `partage`)

**Composants à tester :**
- `PageAccueilComponent.js` - Chargement données, newsletter, témoignages
- `PersonnageComponent.js` - CRUD personnages
- `AuthComponent.js` - Connexion, déconnexion, élévation rôle
- `TableauBordComponent.js` - Navigation, stats

**Exemple de test (Jest) :**
```javascript
// tests/frontend/PersonnageService.test.js
describe('PersonnageService', () => {
  beforeEach(() => {
    // Mock Alpine store
    global.Alpine = {
      store: jest.fn(() => ({
        requeteApi: jest.fn(),
        ajouterMessage: jest.fn()
      }))
    };
  });

  test('devrait lister les personnages', async () => {
    const service = new PersonnageService();
    const mockData = { donnees: [{ id: 1, nom: 'Test' }] };
    
    service.initStore().requeteApi.mockResolvedValue(mockData);
    
    const result = await service.lister();
    expect(result).toEqual(mockData.donnees);
  });
});
```

#### Backend (Node.js/Express)

**Services à tester :**
- `UtilisateurService.js` - Authentification, rôles
- `PersonnageService.js` - CRUD, validation
- `PdfService.js` - Génération Puppeteer
- `NewsletterService.js` - Inscription, désinscription
- `TemoignageService.js` - Modération, affichage

**Modèles à tester :**
- `Utilisateur.js` - Validation, hachage mots de passe
- `Personnage.js` - Validation données par système
- `Pdf.js` - États, transitions

**Exemple de test (Jest) :**
```javascript
// tests/backend/PersonnageService.test.js
const PersonnageService = require('../../src/services/PersonnageService');

describe('PersonnageService', () => {
  test('devrait créer un personnage valide', async () => {
    const service = new PersonnageService();
    const donnees = {
      nom: 'Test Héros',
      systeme_jeu: 'monsterhearts',
      // ... autres données
    };
    
    const result = await service.creer(donnees);
    expect(result).toHaveProperty('id');
    expect(result.nom).toBe('Test Héros');
  });
});
```

### 2. Tests d'Intégration

#### API Routes

**Endpoints à tester :**
```javascript
// tests/integration/api.test.js
describe('API Endpoints', () => {
  test('POST /api/personnages', async () => {
    const response = await request(app)
      .post('/api/personnages')
      .send({
        nom: 'Test',
        systeme_jeu: 'monsterhearts'
      })
      .expect(201);
    
    expect(response.body.succes).toBe(true);
  });
  
  test('GET /api/home/donnees', async () => {
    const response = await request(app)
      .get('/api/home/donnees')
      .expect(200);
    
    expect(response.body.donnees).toHaveProperty('pdfs_recents');
  });
});
```

#### Base de Données

**Intégration PostgreSQL :**
```javascript
// tests/integration/database.test.js
describe('Database Integration', () => {
  beforeEach(async () => {
    // Setup test database
    await db.query('BEGIN');
  });
  
  afterEach(async () => {
    // Rollback changes
    await db.query('ROLLBACK');
  });
  
  test('devrait sauvegarder un personnage', async () => {
    const personnage = new Personnage({
      nom: 'Test',
      systeme_jeu: 'monsterhearts'
    });
    
    await personnage.save();
    expect(personnage.id).toBeDefined();
  });
});
```

### 3. Tests End-to-End (E2E)

#### Playwright/Cypress

**Scénarios à tester :**

1. **Parcours utilisateur complet**
```javascript
// tests/e2e/user-journey.spec.js
test('Création personnage et génération PDF', async ({ page }) => {
  // 1. Aller sur la page d'accueil
  await page.goto('/');
  
  // 2. Se connecter
  await page.click('[data-testid="login-button"]');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password');
  await page.click('[data-testid="submit-login"]');
  
  // 3. Créer un personnage
  await page.click('[data-testid="create-character"]');
  await page.selectOption('#systeme', 'monsterhearts');
  await page.fill('#nom', 'Mon Héros');
  await page.click('[data-testid="save-character"]');
  
  // 4. Générer PDF
  await page.click('[data-testid="generate-pdf"]');
  await page.waitForSelector('[data-testid="pdf-ready"]');
  
  // 5. Télécharger
  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-testid="download-pdf"]');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('personnage-');
});
```

2. **Navigation et responsive**
```javascript
test('Navigation mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  // Test menu burger
  await page.click('[data-testid="mobile-menu-toggle"]');
  await page.waitForSelector('[data-testid="mobile-menu"]');
  
  // Test navigation
  await page.click('[data-testid="nav-characters"]');
  await expect(page).toHaveURL('/personnages');
});
```

### 4. Tests de Performance

#### Lighthouse

**Métriques à surveiller :**
- Performance : > 90
- Accessibilité : > 95
- Bonnes pratiques : > 90
- SEO : > 90

```bash
# Script de test Lighthouse
lighthouse http://localhost:3076 --output json --output-path ./tests/performance/lighthouse-report.json
```

#### Tests de charge

```javascript
// tests/performance/load.test.js
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 50, // 50 utilisateurs virtuels
  duration: '1m',
};

export default function () {
  const response = http.get('http://localhost:3076/api/home/donnees');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

### 5. Tests Visuels

#### Regression Testing

```javascript
// tests/visual/visual-regression.spec.js
test('Page d\'accueil - Screenshots', async ({ page }) => {
  await page.goto('/');
  
  // Desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page).toHaveScreenshot('homepage-desktop.png');
  
  // Mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page).toHaveScreenshot('homepage-mobile.png');
  
  // Dark mode
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page).toHaveScreenshot('homepage-dark.png');
});
```

## Configuration des Tests

### package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:visual": "playwright test --grep visual",
    "test:performance": "lighthouse-ci autorun",
    "test:all": "npm run test && npm run test:integration && npm run test:e2e"
  }
}
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    'public/js/**/*.js',
    '!src/app.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Playwright Configuration

```javascript
// playwright.config.js
module.exports = {
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3076',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3076,
    reuseExistingServer: !process.env.CI,
  },
};
```

## Données de Test

### Fixtures

```javascript
// tests/fixtures/personnages.js
export const personnagesTest = {
  monsterhearts: {
    nom: 'Luna Darkwood',
    concept: 'Vampire rebelle',
    stats: {
      hot: 2,
      cold: 1,
      volatile: -1,
      dark: 3
    }
  },
  engrenages: {
    nom: 'Marcus Steel',
    profession: 'Mécanicien',
    competences: {
      technique: 4,
      combat: 2,
      social: 1
    }
  }
};
```

### Database Seeders

```javascript
// tests/seeders/test-data.js
async function seedTestData() {
  // Utilisateurs de test
  await db.query(`
    INSERT INTO utilisateurs (nom, email, mot_de_passe, role)
    VALUES 
      ('Test User', 'test@example.com', '$2b$10$hashedpassword', 'UTILISATEUR'),
      ('Admin User', 'admin@example.com', '$2b$10$hashedpassword', 'ADMIN')
  `);
  
  // Personnages de test
  await db.query(`
    INSERT INTO personnages (nom, systeme_jeu, donnees, utilisateur_id)
    VALUES ($1, $2, $3, $4)
  `, ['Test Hero', 'monsterhearts', JSON.stringify({}), 1]);
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:coverage
      - run: npm run test:e2e
      - uses: codecov/codecov-action@v3
```

## Tests de Sécurité

### OWASP Testing

```javascript
// tests/security/security.test.js
describe('Security Tests', () => {
  test('devrait rejeter les injections SQL', async () => {
    const response = await request(app)
      .get('/api/personnages?nom=\'; DROP TABLE utilisateurs; --')
      .expect(400);
  });
  
  test('devrait valider les entrées XSS', async () => {
    const response = await request(app)
      .post('/api/personnages')
      .send({
        nom: '<script>alert("xss")</script>'
      })
      .expect(400);
  });
  
  test('devrait respecter les limites de rate limiting', async () => {
    // 100 requêtes rapides
    const promises = Array(100).fill().map(() => 
      request(app).get('/api/home/donnees')
    );
    
    const responses = await Promise.all(promises);
    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

## Métriques et Monitoring

### Coverage Reports

```bash
# Générer le rapport de couverture
npm run test:coverage

# Voir le rapport HTML
open coverage/lcov-report/index.html
```

### Performance Monitoring

```javascript
// tests/performance/monitoring.js
const { performance } = require('perf_hooks');

function measureApiResponse(endpoint) {
  const start = performance.now();
  
  return fetch(endpoint)
    .then(response => {
      const end = performance.now();
      console.log(`${endpoint}: ${end - start}ms`);
      return response;
    });
}
```

## Bonnes Pratiques

### 1. Structure des Tests
- Organisez les tests par fonctionnalité
- Utilisez des noms descriptifs
- Isolez chaque test (pas d'état partagé)

### 2. Mock et Stubs
- Mockez les services externes (APIs, base de données)
- Utilisez des données déterministes
- Évitez les appels réseau en test unitaire

### 3. Tests Data-Driven
```javascript
describe.each([
  ['monsterhearts', { hot: 2, cold: 1 }],
  ['engrenages', { technique: 4, social: 2 }],
  ['metro2033', { force: 3, agilite: 2 }]
])('Validation système %s', (systeme, stats) => {
  test(`devrait valider les stats pour ${systeme}`, () => {
    const result = validateSystemStats(systeme, stats);
    expect(result.valid).toBe(true);
  });
});
```

### 4. Debugging Tests
```javascript
// Ajoutez des timeouts pour les tests async
test('génération PDF', async () => {
  const result = await generatePdf(personnageId);
  expect(result).toBeDefined();
}, 30000); // 30 secondes

// Logs détaillés en cas d'échec
afterEach(() => {
  if (global.currentTest.errors.length > 0) {
    console.log('Test failed. Current state:', JSON.stringify(state, null, 2));
  }
});
```

## Commandes Rapides

```bash
# Tests rapides (unitaires seulement)
npm test

# Tests complets
npm run test:all

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests E2E uniquement
npm run test:e2e

# Tests visuels
npm run test:visual

# Tests de performance
npm run test:performance
```

## Scripts Utilitaires

### Organisation des Scripts

Tous les scripts créés durant le développement et les tests doivent être placés dans le répertoire `scripts/` à la racine du projet. Ces scripts sont considérés comme des outils de développement réutilisables et peuvent être améliorés au même titre que les tests.

**Structure recommandée :**
```
scripts/
├── generate/
│   ├── pdf-examples.js          # Génération d'exemples PDF
│   ├── sample-data.js           # Création de données de test
│   └── documentation.js         # Génération auto de docs
├── database/
│   ├── migrate.js               # Scripts de migration
│   ├── seed.js                  # Peuplement base de données
│   └── backup.js                # Sauvegardes automatisées
├── testing/
│   ├── setup-test-env.js        # Configuration environnement test
│   ├── performance-test.js      # Tests de performance
│   └── visual-regression.js     # Tests de régression visuelle
└── maintenance/
    ├── cleanup.js               # Nettoyage fichiers temporaires
    ├── health-check.js          # Vérifications système
    └── update-dependencies.js   # Mise à jour dépendances
```

**Conventions pour les scripts :**
- Noms explicites en kebab-case
- Documentation en en-tête avec usage et paramètres
- Gestion d'erreurs robuste
- Logs informatifs
- Configuration via variables d'environnement quand possible

**Exemple de script bien structuré :**
```javascript
// scripts/generate/pdf-examples.js
/**
 * Génère des PDFs d'exemple pour tous les systèmes de jeu
 * Usage: node scripts/generate/pdf-examples.js [--system=nom] [--output=dossier]
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function generateExamples(options = {}) {
  const { system = 'all', output = 'public/exemples' } = options;
  
  console.log(`🎲 Génération des exemples PDF pour: ${system}`);
  
  try {
    // Logique de génération...
    console.log('✅ Génération terminée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--system=')) options.system = arg.split('=')[1];
    if (arg.startsWith('--output=')) options.output = arg.split('=')[1];
  });
  
  generateExamples(options);
}

module.exports = { generateExamples };
```

Ces scripts peuvent être :
- Réutilisés par l'équipe de développement
- Intégrés dans les workflows CI/CD
- Améliorés et optimisés au fil du temps
- Documentés et versionnés comme le reste du code

## Ressources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Testing](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)