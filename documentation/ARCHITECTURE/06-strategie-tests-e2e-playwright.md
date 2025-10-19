# Stratégie de Tests E2E avec Playwright - Brumisa3

## Philosophie : 100% Tests End-to-End

**Principe** : Brumisa3 adopte une stratégie de tests **100% E2E (End-to-End)** avec Playwright, sans tests unitaires ni tests d'intégration isolés.

**Raison** : Les tests E2E valident l'expérience utilisateur complète, de l'interface jusqu'à la base de données, garantissant que toutes les fonctionnalités critiques fonctionnent en conditions réelles.

## Pourquoi Playwright pour Nuxt 4 ?

### Avantages pour Nuxt 4
1. **Support natif TypeScript** : Aligné avec Nuxt 4 + TypeScript
2. **Multi-navigateurs** : Chrome, Firefox, Safari (WebKit)
3. **Tests parallèles** : Exécution rapide des suites de tests
4. **Auto-wait** : Playwright attend automatiquement que les éléments soient prêts
5. **Network mocking** : Interception et simulation d'API calls
6. **Screenshots/Videos** : Debugging visuel automatique
7. **CI/CD ready** : Intégration facile avec GitHub Actions

### Comparaison avec alternatives

| Feature | Playwright | Cypress | Puppeteer |
|---------|-----------|---------|-----------|
| Multi-navigateurs | ✅ Chrome, Firefox, Safari | ⚠️ Chrome, Firefox | ⚠️ Chrome uniquement |
| Tests parallèles | ✅ Natif | ❌ Payant (Cypress Cloud) | ⚠️ Complexe |
| TypeScript | ✅ Excellent | ✅ Bon | ✅ Bon |
| Auto-wait | ✅ Intelligent | ✅ Bon | ❌ Manuel |
| Performance | ✅ Rapide | ⚠️ Moyen | ✅ Rapide |
| API moderne | ✅ Promesses | ⚠️ Commandes chaînées | ✅ Promesses |

**Verdict** : Playwright est le meilleur choix pour Nuxt 4 en 2025.

## Installation et Configuration

### 1. Installation

```bash
# Installation Playwright + navigateurs
pnpm add -D @playwright/test
pnpm exec playwright install chromium firefox webkit

# Installation @nuxt/test-utils pour helpers Nuxt
pnpm add -D @nuxt/test-utils
```

### 2. Configuration Playwright

**playwright.config.ts** :
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',

  // Timeout par test
  timeout: 30 * 1000,

  // Expect timeout (assertions)
  expect: {
    timeout: 5000,
  },

  // Options de test
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: process.env.CI
    ? [['html'], ['github']]
    : [['html'], ['list']],

  // Base URL pour tous les tests
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Projets (navigateurs)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Server Nuxt
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### 3. Structure des Tests

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── register.spec.ts
│   │   └── logout.spec.ts
│   │
│   ├── playspaces/
│   │   ├── create-playspace.spec.ts
│   │   ├── switch-playspace.spec.ts
│   │   ├── update-playspace.spec.ts
│   │   └── delete-playspace.spec.ts
│   │
│   ├── characters/
│   │   ├── create-character.spec.ts
│   │   ├── list-characters.spec.ts
│   │   ├── update-character.spec.ts
│   │   ├── delete-character.spec.ts
│   │   └── duplicate-character.spec.ts
│   │
│   ├── theme-cards/
│   │   ├── create-theme.spec.ts
│   │   ├── add-power-tag.spec.ts
│   │   ├── add-weakness-tag.spec.ts
│   │   └── improve-theme.spec.ts
│   │
│   ├── hero-card/
│   │   ├── create-hero-card.spec.ts
│   │   └── manage-relationships.spec.ts
│   │
│   └── trackers/
│       ├── status-tracker.spec.ts
│       ├── story-tag-tracker.spec.ts
│       └── story-theme-tracker.spec.ts
│
├── fixtures/
│   ├── users.ts              # Fixtures utilisateurs de test
│   ├── playspaces.ts         # Fixtures playspaces de test
│   └── characters.ts         # Fixtures personnages de test
│
└── helpers/
    ├── auth.ts               # Helper login/logout
    ├── database.ts           # Helper reset DB test
    └── navigation.ts         # Helper navigation
```

## Patterns de Tests E2E

### 1. Test Complet : Créer un Personnage

**tests/e2e/characters/create-character.spec.ts** :
```typescript
import { test, expect } from '@playwright/test';
import { loginAsUser, resetDatabase } from '../helpers';

test.describe('Création de personnage LITM', () => {
  test.beforeEach(async ({ page }) => {
    // Reset DB pour tests isolés
    await resetDatabase();

    // Login utilisateur de test
    await loginAsUser(page, 'lea@test.com', 'password123');

    // Naviguer vers le playspace actif
    await page.goto('/playspaces/test-workspace');
  });

  test('US-120 : Créer un nouveau personnage avec succès', async ({ page }) => {
    // Étape 1 : Cliquer sur "Nouveau personnage"
    await page.click('button:has-text("Nouveau personnage")');

    // Étape 2 : Vérifier que le formulaire s'affiche
    await expect(page.locator('h1')).toContainText('Créer un personnage');

    // Étape 3 : Remplir le formulaire
    await page.fill('input[name="name"]', 'Aria the Mist Weaver');
    await page.fill('textarea[name="description"]', 'Une tisseuse de brume qui...');

    // Étape 4 : Soumettre le formulaire
    await page.click('button:has-text("Créer")');

    // Étape 5 : Vérifier la redirection et le message de succès
    await expect(page).toHaveURL(/\/characters\/[a-f0-9-]+\/edit/);
    await expect(page.locator('.toast-success')).toContainText('Aria the Mist Weaver créé');

    // Étape 6 : Vérifier que 2 Theme Cards vides sont créées
    const themeCards = page.locator('[data-testid="theme-card"]');
    await expect(themeCards).toHaveCount(2);

    // Étape 7 : Vérifier en base de données
    // (via API call pour validation)
    const response = await page.request.get('/api/characters?playspaceId=test-workspace');
    const data = await response.json();
    expect(data.characters).toHaveLength(1);
    expect(data.characters[0].name).toBe('Aria the Mist Weaver');
  });

  test('US-120 : Validation - nom trop court', async ({ page }) => {
    await page.click('button:has-text("Nouveau personnage")');

    // Nom de 1 caractère (invalide)
    await page.fill('input[name="name"]', 'A');
    await page.click('button:has-text("Créer")');

    // Vérifier message d'erreur
    await expect(page.locator('.error-message')).toContainText('Minimum 2 caractères');

    // Vérifier que l'on reste sur la page de création
    await expect(page).toHaveURL(/\/characters\/new/);
  });

  test('US-120 : Création rapide < 60 secondes', async ({ page }) => {
    const startTime = Date.now();

    // Workflow complet de création
    await page.click('button:has-text("Nouveau personnage")');
    await page.fill('input[name="name"]', 'Quick Test Character');
    await page.click('button:has-text("Créer")');
    await expect(page).toHaveURL(/\/characters\/[a-f0-9-]+\/edit/);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Vérifier que la création prend < 60 secondes
    expect(duration).toBeLessThan(60000);
  });
});
```

### 2. Test Workflow : Basculement entre Playspaces

**tests/e2e/playspaces/switch-playspace.spec.ts** :
```typescript
import { test, expect } from '@playwright/test';

test.describe('Basculement entre playspaces', () => {
  test('US-GP-003 : Basculer de Chicago vers Londres < 2s', async ({ page }) => {
    await loginAsUser(page, 'marc@test.com', 'password123');

    // Marc a 2 playspaces : Chicago (actif) et Londres
    await page.goto('/playspaces/chicago');

    // Vérifier que Chicago est actif
    await expect(page.locator('[data-testid="active-playspace"]')).toContainText('Chicago');

    // Cliquer sur Londres dans la sidebar
    const startTime = Date.now();
    await page.click('[data-testid="playspace-londres"]');

    // Attendre le basculement
    await expect(page).toHaveURL('/playspaces/londres');
    await expect(page.locator('[data-testid="active-playspace"]')).toContainText('Londres');
    await expect(page.locator('.toast-success')).toContainText('Playspace LITM - Londres activé');

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Vérifier performance < 2s
    expect(duration).toBeLessThan(2000);

    // Vérifier que les personnages de Londres sont chargés
    const characters = page.locator('[data-testid="character-card"]');
    await expect(characters).not.toHaveCount(0);
  });
});
```

### 3. Test de Parcours Utilisateur Complet

**tests/e2e/user-journeys/lea-first-visit.spec.ts** :
```typescript
import { test, expect } from '@playwright/test';

test.describe('Parcours Léa : Première visite', () => {
  test('Léa crée son premier playspace et personnage', async ({ page }) => {
    // 1. Arrivée sur Brumisa3
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Brumisater');

    // 2. Onboarding : Créer premier playspace
    await page.click('button:has-text("Créer votre premier playspace")');

    // 3. Étape 1/4 : Choisir système
    await page.click('input[value="mist-engine"]');
    await page.click('button:has-text("Suivant")');

    // 4. Étape 2/4 : Choisir hack
    await page.click('input[value="litm"]');
    await page.click('button:has-text("Suivant")');

    // 5. Étape 3/4 : Choisir univers
    await page.click('input[value="chicago-noir"]');
    await page.click('button:has-text("Suivant")');

    // 6. Étape 4/4 : Nommer playspace
    await expect(page.locator('input[name="playspaceName"]')).toHaveValue('LITM - Chicago Noir');
    await page.click('button:has-text("Créer playspace")');

    // 7. Vérifier redirection vers création de personnage
    await expect(page).toHaveURL(/\/characters\/new/);
    await expect(page.locator('.toast-success')).toContainText('Playspace LITM - Chicago Noir créé');

    // 8. Créer premier personnage
    await page.fill('input[name="name"]', 'Aria the Mist Weaver');
    await page.fill('textarea[name="description"]', 'Une tisseuse de brume');
    await page.click('button:has-text("Créer")');

    // 9. Vérifier succès complet
    await expect(page).toHaveURL(/\/characters\/[a-f0-9-]+\/edit/);
    await expect(page.locator('[data-testid="character-name"]')).toContainText('Aria the Mist Weaver');

    // 10. Vérifier temps total < 120s (2 minutes)
    // (mesuré par Playwright)
  });
});
```

## Helpers et Fixtures

### 1. Helper Authentification

**tests/helpers/auth.ts** :
```typescript
import { Page } from '@playwright/test';

export async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/playspaces');
}

export async function logoutUser(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('button:has-text("Déconnexion")');
  await page.waitForURL('/');
}
```

### 2. Helper Reset Database

**tests/helpers/database.ts** :
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function resetDatabase() {
  // Supprimer toutes les données de test
  await prisma.character.deleteMany();
  await prisma.playspace.deleteMany();
  await prisma.user.deleteMany();

  // Créer utilisateurs de test
  await prisma.user.create({
    data: {
      email: 'lea@test.com',
      password: 'hashedpassword', // À hasher en réalité
      name: 'Léa',
    },
  });

  await prisma.user.create({
    data: {
      email: 'marc@test.com',
      password: 'hashedpassword',
      name: 'Marc',
    },
  });
}

export async function seedTestData() {
  // Seed playspaces de test
  // Seed personnages de test
  // etc.
}
```

## Bonnes Pratiques

### 1. Tests Isolés
- **Reset DB avant chaque test** : Garantir l'isolation
- **Fixtures indépendantes** : Pas de dépendances entre tests
- **Tests parallèles** : Exécuter sur plusieurs workers

### 2. Sélecteurs Stables
```typescript
// ✅ BON : data-testid
await page.click('[data-testid="create-character-button"]');

// ✅ BON : role + name
await page.click('button[name="submit"]');

// ❌ MAUVAIS : classes CSS (fragiles)
await page.click('.btn-primary.btn-lg');

// ❌ MAUVAIS : position dans le DOM
await page.click('div > div > button:nth-child(3)');
```

### 3. Attentes Explicites
```typescript
// ✅ BON : Attendre élément visible
await expect(page.locator('.toast-success')).toBeVisible();

// ✅ BON : Attendre navigation
await expect(page).toHaveURL('/characters/123');

// ✅ BON : Attendre état
await expect(page.locator('[data-testid="loading"]')).toBeHidden();

// ❌ MAUVAIS : Timeouts arbitraires
await page.waitForTimeout(2000); // Fragile, éviter
```

### 4. Tests Lisibles
```typescript
test('Léa crée un personnage en 3 étapes simples', async ({ page }) => {
  // Arrange : Préparer l'état initial
  await loginAsUser(page, 'lea@test.com');
  await page.goto('/characters');

  // Act : Effectuer l'action
  await page.click('button:has-text("Nouveau personnage")');
  await page.fill('input[name="name"]', 'Aria');
  await page.click('button:has-text("Créer")');

  // Assert : Vérifier le résultat
  await expect(page.locator('.toast-success')).toBeVisible();
  await expect(page.locator('[data-testid="character-name"]')).toContainText('Aria');
});
```

## Commandes npm

**package.json** :
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report"
  }
}
```

## Couverture et KPI

### Objectifs de Couverture
- **User Stories MVP** : 100% des US critiques (P0)
- **Parcours utilisateur** : 5 parcours complets (Léa, Marc, Sophie, Thomas, Camille)
- **Navigateurs** : Chrome, Firefox, Safari (WebKit)
- **Performance** : Tous les tests < 30s timeout

### KPI Tests
- **Temps d'exécution total** : < 10 minutes (suite complète)
- **Taux de réussite CI/CD** : > 95%
- **Flakiness** : < 2% (tests instables)
- **Couverture fonctionnelle** : 100% MVP

## Exemples de Tests par Fonctionnalité

### MVP v1.0 : Liste des Tests E2E

#### 1. Playspaces (6 tests)
- ✅ `create-playspace.spec.ts` : Créer un playspace (US-GP-001)
- ✅ `list-playspaces.spec.ts` : Lister playspaces (US-GP-002)
- ✅ `switch-playspace.spec.ts` : Basculer playspaces (US-GP-003)
- ✅ `update-playspace.spec.ts` : Modifier playspace (US-GP-004)
- ✅ `delete-playspace.spec.ts` : Supprimer playspace (US-GP-005)
- ✅ `duplicate-playspace.spec.ts` : Dupliquer playspace (US-GP-006)

#### 2. Characters (5 tests)
- ✅ `create-character.spec.ts` : Créer personnage (US-120)
- ✅ `list-characters.spec.ts` : Lister personnages (US-121)
- ✅ `update-character.spec.ts` : Modifier personnage (US-122)
- ✅ `delete-character.spec.ts` : Supprimer personnage (US-123)
- ✅ `duplicate-character.spec.ts` : Dupliquer personnage (US-124)

#### 3. Theme Cards (4 tests)
- ✅ `create-theme.spec.ts` : Créer Theme Card
- ✅ `add-tags.spec.ts` : Ajouter Power/Weakness tags
- ✅ `improve-theme.spec.ts` : Améliorer theme (Attention)
- ✅ `delete-theme.spec.ts` : Supprimer theme

#### 4. Hero Card (2 tests)
- ✅ `create-hero-card.spec.ts` : Créer Hero Card
- ✅ `manage-relationships.spec.ts` : Gérer relations et quintessences

#### 5. Trackers (3 tests)
- ✅ `status-tracker.spec.ts` : Status tracker
- ✅ `story-tag-tracker.spec.ts` : Story tag tracker
- ✅ `story-theme-tracker.spec.ts` : Story theme tracker

#### 6. Auth (3 tests)
- ✅ `register.spec.ts` : Inscription
- ✅ `login.spec.ts` : Connexion
- ✅ `logout.spec.ts` : Déconnexion

#### 7. Export (1 test)
- ✅ `export-json.spec.ts` : Export personnage JSON

**Total** : 24 tests E2E pour couvrir 100% du MVP v1.0

---

**Date** : 2025-01-19
**Version** : 1.0
**Statut** : Validé
**Stack** : Playwright + Nuxt 4 + Prisma + PostgreSQL
