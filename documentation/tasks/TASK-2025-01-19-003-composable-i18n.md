# Task - Tests E2E du Système de Traductions Multi-Niveaux

## Métadonnées

- **ID**: TASK-2025-01-19-003
- **Date de création**: 2025-01-20
- **Priorité**: P0 (MVP)
- **Statut**: À faire
- **Temps estimé**: 2h
- **Version cible**: MVP v1.0

## Description

### Objectif

Créer les tests E2E avec Playwright pour valider le système de traductions multi-niveaux et la résolution en cascade.

### Contexte

Suite à l'implémentation du système de traductions (TASK-001) et l'import des données (TASK-002), nous devons valider que :
- La résolution en cascade fonctionne correctement
- Le changement de playspace met à jour les traductions
- Les performances sont respectées (<50ms avec cache)

### Périmètre

**Inclus dans cette tâche**:
- Tests E2E Playwright pour la résolution en cascade
- Tests de changement de playspace
- Tests de performance
- Tests de fallback

**Exclu de cette tâche**:
- Implémentation du système (TASK-001)
- Import des données (TASK-002)

## Architecture

### Structure des Tests

```
tests/
├── e2e/
│   └── translations/
│       ├── cascade-resolution.spec.ts    # Tests de cascade
│       ├── playspace-switch.spec.ts      # Changement de playspace
│       ├── performance.spec.ts           # Tests de performance
│       └── fallback.spec.ts              # Tests de fallback
└── fixtures/
    └── translation-data.ts                # Données de test
```

## Plan d'Implémentation

### Étape 1: Setup des Fixtures

```typescript
// tests/fixtures/translation-data.ts
export const setupTranslationFixtures = async () => {
  // Créer système Mist Engine
  const mistEngine = await prisma.system.create({
    data: {
      slug: 'mist-engine',
      name: 'Mist Engine',
      translations: {
        create: [
          { key: 'common.save', value: 'Save', locale: 'en', level: 'SYSTEM', priority: 1 },
          { key: 'common.save', value: 'Sauvegarder', locale: 'fr', level: 'SYSTEM', priority: 1 },
          { key: 'character.name', value: 'Character', locale: 'en', level: 'SYSTEM', priority: 1 }
        ]
      }
    }
  });

  // Créer hack LITM
  const litm = await prisma.hack.create({
    data: {
      slug: 'litm',
      name: 'Legends in the Mist',
      systemId: mistEngine.id,
      translations: {
        create: [
          { key: 'character.name', value: 'Hero', locale: 'en', level: 'HACK', priority: 2 },
          { key: 'character.name', value: 'Héros', locale: 'fr', level: 'HACK', priority: 2 },
          { key: 'theme.power_tags', value: 'Gift Tags', locale: 'en', level: 'HACK', priority: 2 }
        ]
      }
    }
  });

  // Créer univers Zamanora
  const zamanora = await prisma.universe.create({
    data: {
      slug: 'zamanora',
      name: 'Zamanora',
      hackId: litm.id,
      translations: {
        create: [
          { key: 'character.name', value: 'Champion', locale: 'en', level: 'UNIVERSE', priority: 3 },
          { key: 'lore.city', value: 'Streets of Zamanora', locale: 'en', level: 'UNIVERSE', priority: 3 }
        ]
      }
    }
  });

  return { mistEngine, litm, zamanora };
};
```

### Étape 2: Test de Résolution en Cascade

```typescript
// tests/e2e/translations/cascade-resolution.spec.ts
import { test, expect } from '@playwright/test';
import { setupTranslationFixtures } from '../../fixtures/translation-data';

test.describe('Translation Cascade Resolution', () => {
  test.beforeEach(async ({ page }) => {
    await setupTranslationFixtures();
    await page.goto('/');
  });

  test('should resolve translations with cascade', async ({ page }) => {
    // Créer un playspace Zamanora
    await page.click('[data-test="create-playspace"]');
    await page.selectOption('[data-test="hack-select"]', 'litm');
    await page.selectOption('[data-test="universe-select"]', 'zamanora');
    await page.fill('[data-test="playspace-name"]', 'Test Zamanora');
    await page.click('[data-test="create-button"]');

    // Vérifier les traductions en cascade
    // System level
    await expect(page.locator('[data-test="save-button"]'))
      .toContainText('Save'); // ou 'Sauvegarder' en FR

    // Hack level (override System)
    await expect(page.locator('[data-test="character-title"]'))
      .toContainText('Hero'); // LITM override "Character"

    // Universe level (override Hack)
    await expect(page.locator('[data-test="character-subtitle"]'))
      .toContainText('Champion'); // Zamanora override "Hero"

    // Universe specific
    await expect(page.locator('[data-test="lore-description"]'))
      .toContainText('Streets of Zamanora');
  });

  test('should use correct priority order', async ({ page }) => {
    // Test que Universe > Hack > System
    const response = await page.evaluate(async () => {
      const { t } = useTranslations();
      await loadTranslations();
      return {
        characterName: t('character.name'),
        commonSave: t('common.save')
      };
    });

    expect(response.characterName).toBe('Champion'); // Universe level
    expect(response.commonSave).toBe('Save'); // System level (no override)
  });
});
```

### Étape 3: Test de Changement de Playspace

```typescript
// tests/e2e/translations/playspace-switch.spec.ts
test.describe('Playspace Switch', () => {
  test('should update translations when switching playspace', async ({ page }) => {
    // Créer 2 playspaces avec différents univers
    const playspace1 = await createPlayspace('zamanora');
    const playspace2 = await createPlayspace('hor');

    await page.goto('/');

    // Sélectionner playspace 1 (Zamanora)
    await page.click(`[data-test="playspace-${playspace1.id}"]`);
    await expect(page.locator('[data-test="current-universe"]'))
      .toContainText('Zamanora');
    await expect(page.locator('[data-test="character-title"]'))
      .toContainText('Champion');

    // Basculer vers playspace 2 (HOR)
    await page.click(`[data-test="playspace-${playspace2.id}"]`);
    await expect(page.locator('[data-test="current-universe"]'))
      .toContainText('Hearts of Ravensdale');
    await expect(page.locator('[data-test="character-title"]'))
      .toContainText('Hero'); // HOR n'a pas d'override, utilise LITM

    // Mesurer le temps de bascule
    const startTime = Date.now();
    await page.click(`[data-test="playspace-${playspace1.id}"]`);
    await page.waitForSelector('[data-test="current-universe"]:has-text("Zamanora")');
    const switchTime = Date.now() - startTime;

    expect(switchTime).toBeLessThan(2000); // < 2s comme requis
  });
});
```

### Étape 4: Test de Performance

```typescript
// tests/e2e/translations/performance.spec.ts
test.describe('Translation Performance', () => {
  test('should load translations with cache in <50ms', async ({ page }) => {
    await page.goto('/');

    // Premier chargement (sans cache)
    const firstLoad = await page.evaluate(async () => {
      const start = performance.now();
      await loadTranslations();
      return performance.now() - start;
    });

    // Deuxième chargement (avec cache)
    const cachedLoad = await page.evaluate(async () => {
      const start = performance.now();
      await loadTranslations();
      return performance.now() - start;
    });

    expect(firstLoad).toBeLessThan(150); // <150ms sans cache
    expect(cachedLoad).toBeLessThan(50);  // <50ms avec cache
  });

  test('should handle 1000+ translations efficiently', async ({ page }) => {
    // Créer beaucoup de traductions
    await createManyTranslations(1000);

    await page.goto('/');

    const loadTime = await page.evaluate(async () => {
      const start = performance.now();
      await loadTranslations();
      return performance.now() - start;
    });

    expect(loadTime).toBeLessThan(500); // Même avec 1000+ traductions
  });
});
```

### Étape 5: Test de Fallback

```typescript
// tests/e2e/translations/fallback.spec.ts
test.describe('Translation Fallback', () => {
  test('should fallback to key when translation missing', async ({ page }) => {
    await page.goto('/');

    const missingKey = await page.evaluate(() => {
      const { t } = useTranslations();
      return t('non.existent.key');
    });

    expect(missingKey).toBe('non.existent.key');
  });

  test('should use custom fallback when provided', async ({ page }) => {
    await page.goto('/');

    const withFallback = await page.evaluate(() => {
      const { t } = useTranslations();
      return t('missing.key', 'Default Text');
    });

    expect(withFallback).toBe('Default Text');
  });

  test('should fallback to English when locale missing', async ({ page }) => {
    // Créer traduction EN mais pas FR
    await createTranslation('test.key', 'English Value', 'en');

    await page.goto('/?locale=fr');

    const fallbackToEn = await page.evaluate(() => {
      const { t } = useTranslations();
      return t('test.key');
    });

    expect(fallbackToEn).toBe('English Value');
  });
});
```

### Étape 6: Test d'Intégration Complète

```typescript
test('complete user journey with translations', async ({ page }) => {
  // 1. Créer playspace
  await page.goto('/');
  await page.click('[data-test="create-playspace"]');
  await page.selectOption('[data-test="hack-select"]', 'litm');
  await page.selectOption('[data-test="universe-select"]', 'zamanora');
  await page.fill('[data-test="playspace-name"]', 'Ma Partie');
  await page.click('[data-test="create-button"]');

  // 2. Créer personnage avec traductions correctes
  await page.click('[data-test="create-character"]');

  // Vérifier que les labels sont traduits
  await expect(page.locator('label[for="character-name"]'))
    .toContainText('Nom du Champion'); // Universe level

  await expect(page.locator('[data-test="theme-section-title"]'))
    .toContainText('Thèmes de Pouvoir'); // Hack level

  // 3. Changer de langue
  await page.selectOption('[data-test="locale-switcher"]', 'en');

  await expect(page.locator('label[for="character-name"]'))
    .toContainText('Champion Name');

  // 4. Performance lors de la création
  const createStart = Date.now();
  await page.fill('[data-test="character-name"]', 'Test Hero');
  await page.click('[data-test="save-character"]');
  await page.waitForSelector('[data-test="character-saved"]');
  const createTime = Date.now() - createStart;

  expect(createTime).toBeLessThan(60000); // <60s pour création complète
});
```

## Critères d'Acceptation

- [ ] Tests de cascade passent (System → Hack → Universe)
- [ ] Tests de changement de playspace passent
- [ ] Performance respectée (<50ms cache, <150ms sans cache)
- [ ] Fallback fonctionne correctement
- [ ] Changement de langue fonctionne
- [ ] Temps de bascule playspace <2s
- [ ] Tests E2E couvrent tous les scénarios critiques

## Dépendances

- **Bloqué par**: TASK-001 (Système de traductions)
- **Bloqué par**: TASK-002 (Import des traductions)

## Notes

Cette approche de test garantit que :
- Le système de traductions fonctionne en conditions réelles
- Les performances sont mesurées et validées
- Les cas limites sont couverts
- L'expérience utilisateur est fluide

## Références

- [Playwright Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Architecture Tests E2E](../ARCHITECTURE/06-strategie-tests-e2e-playwright.md)