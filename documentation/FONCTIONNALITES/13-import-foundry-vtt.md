# Import de Personnages depuis Foundry VTT

## Vue d'ensemble

Cette fonctionnalité permet d'importer des personnages depuis Foundry VTT (système City of Mist / Legends in the Mist / Otherscape) vers Brumisater via une interface d'administration.

**Version** : v1.2+ (Post-MVP)

**Priorité** : Moyenne (après MVP v1.0)

**Effort estimé** : 1-2 semaines

---

## Cas d'Usage

### 1. Migration depuis Foundry VTT
Un utilisateur a des personnages créés dans Foundry VTT et souhaite les migrer vers Brumisater sans tout ressaisir manuellement.

### 2. Import de personnages exemples
L'administrateur souhaite importer des personnages pré-créés (exemples, prétirés) pour faciliter l'onboarding.

### 3. Backup et restauration
Un utilisateur exporte ses personnages depuis Brumisater (JSON), les modifie avec un éditeur externe, puis les réimporte.

---

## Format de Données Foundry VTT

### Structure Actor (Character)

Foundry VTT exporte les Actors au format JSON :

```json
{
  "_id": "abc123",
  "name": "Aria Shadowmane",
  "type": "character",
  "img": "path/to/token.webp",
  "system": {
    "biography": "A mysterious rogue...",
    "description": "Short description",
    "help": 0,
    "hurt": 0,
    "buildUp": 0
  },
  "items": [
    {
      "_id": "theme1",
      "name": "The Mournful Knight",
      "type": "theme",
      "system": {
        "themebook_id": "origin_themebook_id",
        "mystery": "What happened to my village?",
        "attention": [1, 1, 0],
        "crack": [0, 0, 0],
        "unspent_upgrades": 1
      }
    },
    {
      "_id": "tag1",
      "name": "Sword of Sorrow",
      "type": "tag",
      "system": {
        "theme_id": "theme1",
        "subtype": "power",
        "burned": false,
        "burn_state": 0,
        "inverted": false,
        "temporary": false,
        "permanent": false,
        "crispy": false,
        "parentId": null
      }
    },
    {
      "_id": "status1",
      "name": "Injured",
      "type": "status",
      "system": {
        "tier": 3,
        "temporary": true,
        "permanent": false,
        "pips": true
      }
    },
    {
      "_id": "improvement1",
      "name": "Master Swordsman",
      "type": "improvement",
      "system": {
        "theme_id": "theme1",
        "effect_class": "passive",
        "uses": {
          "max": 3,
          "current": 2
        },
        "description": "Re-roll one failed attack per scene"
      }
    }
  ],
  "flags": {
    "mist-hud": {
      "active-bonuses": {
        "help": {},
        "hurt": {}
      }
    }
  }
}
```

### Types d'Items supportés

| Type Foundry | Type Brumisater | Mapping |
|--------------|-----------------|---------|
| `theme` | `Theme` | Thème avec mystery/attention/crack |
| `tag` (power) | `Tag` (POWER) | Tag de pouvoir |
| `tag` (weakness) | `Tag` (WEAKNESS) | Tag de faiblesse |
| `tag` (story) | `Tag` (STORY) | Story tag |
| `tag` (loadout) | `Tag` (LOADOUT) | Loadout/Backpack |
| `status` | `Status` | Statut avec tier |
| `improvement` | `Improvement` | Amélioration de thème |
| `clue` | *(Ignoré MVP)* | À implémenter v2.0+ |
| `juice` | *(Ignoré MVP)* | À implémenter v2.0+ |
| `move` | *(Ignoré MVP)* | À implémenter v1.3+ |

---

## Architecture Technique

### 1. API Route d'Import

**Fichier** : `server/api/admin/import/foundry-character.post.ts`

```typescript
import { z } from 'zod';
import { prisma } from '~/server/utils/prisma';
import { requireAdmin } from '~/server/utils/auth';

// Schema de validation pour l'Actor Foundry
const FoundryActorSchema = z.object({
  _id: z.string(),
  name: z.string(),
  type: z.enum(['character', 'danger', 'crew']),
  img: z.string().optional(),
  system: z.object({
    biography: z.string().optional(),
    description: z.string().optional(),
    help: z.number().optional(),
    hurt: z.number().optional(),
    buildUp: z.number().optional(),
  }),
  items: z.array(z.any()), // Validé plus finement dans le parser
  flags: z.any().optional(),
});

const ImportRequestSchema = z.object({
  actorData: FoundryActorSchema,
  playspaceId: z.string(),
  systemSlug: z.enum(['litm', 'city-of-mist', 'otherscape']),
  options: z.object({
    overwriteExisting: z.boolean().default(false),
    importFlags: z.boolean().default(false),
  }).optional(),
});

export default defineEventHandler(async (event) => {
  // Vérifier que l'utilisateur est admin
  await requireAdmin(event);

  const body = await readBody(event);
  const { actorData, playspaceId, systemSlug, options } =
    ImportRequestSchema.parse(body);

  // Vérifier que le playspace existe et appartient à l'utilisateur
  const playspace = await prisma.playspace.findUnique({
    where: { id: playspaceId },
  });

  if (!playspace) {
    throw createError({
      statusCode: 404,
      message: 'Playspace not found',
    });
  }

  // Parser et importer
  const result = await importFoundryCharacter(
    actorData,
    playspaceId,
    systemSlug,
    options
  );

  return {
    success: true,
    characterId: result.characterId,
    stats: result.stats,
    warnings: result.warnings,
  };
});
```

### 2. Parser Foundry → Prisma

**Fichier** : `server/utils/foundry-import.ts`

```typescript
import type { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';

export interface FoundryActor {
  _id: string;
  name: string;
  type: string;
  img?: string;
  system: {
    biography?: string;
    description?: string;
    help?: number;
    hurt?: number;
    buildUp?: number;
  };
  items: FoundryItem[];
  flags?: any;
}

export interface FoundryItem {
  _id: string;
  name: string;
  type: string;
  system: any;
}

export interface ImportResult {
  characterId: string;
  stats: {
    themes: number;
    tags: number;
    statuses: number;
    improvements: number;
  };
  warnings: string[];
}

export interface ImportOptions {
  overwriteExisting?: boolean;
  importFlags?: boolean;
}

export async function importFoundryCharacter(
  actorData: FoundryActor,
  playspaceId: string,
  systemSlug: string,
  options: ImportOptions = {}
): Promise<ImportResult> {
  const warnings: string[] = [];
  const stats = {
    themes: 0,
    tags: 0,
    statuses: 0,
    improvements: 0,
  };

  // Vérifier si le personnage existe déjà (par nom)
  const existingCharacter = await prisma.character.findFirst({
    where: {
      name: actorData.name,
      playspaceId,
    },
  });

  if (existingCharacter && !options.overwriteExisting) {
    throw new Error(
      `Character "${actorData.name}" already exists in this playspace. Use overwriteExisting option to replace.`
    );
  }

  // Supprimer l'ancien personnage si overwrite
  if (existingCharacter && options.overwriteExisting) {
    await prisma.character.delete({
      where: { id: existingCharacter.id },
    });
    warnings.push(`Replaced existing character "${actorData.name}"`);
  }

  // Créer le personnage
  const character = await prisma.character.create({
    data: {
      name: actorData.name,
      playspaceId,
      biography: actorData.system.biography || '',
      description: actorData.system.description || '',
      tokenImage: actorData.img,
      // Flags optionnels
      flags: options.importFlags ? actorData.flags || {} : {},
    },
  });

  // Trier les items par type
  const themeItems = actorData.items.filter(i => i.type === 'theme');
  const tagItems = actorData.items.filter(i => i.type === 'tag');
  const statusItems = actorData.items.filter(i => i.type === 'status');
  const improvementItems = actorData.items.filter(i => i.type === 'improvement');

  // Map Foundry ID → Prisma ID pour les relations
  const themeIdMap = new Map<string, string>();
  const tagIdMap = new Map<string, string>();

  // Importer les thèmes
  for (const foundryTheme of themeItems) {
    try {
      const theme = await importTheme(character.id, foundryTheme, systemSlug);
      themeIdMap.set(foundryTheme._id, theme.id);
      stats.themes++;
    } catch (error) {
      warnings.push(`Failed to import theme "${foundryTheme.name}": ${error.message}`);
    }
  }

  // Importer les tags (avec relations aux thèmes)
  for (const foundryTag of tagItems) {
    try {
      const tag = await importTag(character.id, foundryTag, themeIdMap);
      tagIdMap.set(foundryTag._id, tag.id);
      stats.tags++;
    } catch (error) {
      warnings.push(`Failed to import tag "${foundryTag.name}": ${error.message}`);
    }
  }

  // Importer les statuts
  for (const foundryStatus of statusItems) {
    try {
      await importStatus(character.id, foundryStatus);
      stats.statuses++;
    } catch (error) {
      warnings.push(`Failed to import status "${foundryStatus.name}": ${error.message}`);
    }
  }

  // Importer les améliorations (avec relations aux thèmes)
  for (const foundryImprovement of improvementItems) {
    try {
      await importImprovement(character.id, foundryImprovement, themeIdMap);
      stats.improvements++;
    } catch (error) {
      warnings.push(`Failed to import improvement "${foundryImprovement.name}": ${error.message}`);
    }
  }

  return {
    characterId: character.id,
    stats,
    warnings,
  };
}

async function importTheme(
  characterId: string,
  foundryTheme: FoundryItem,
  systemSlug: string
) {
  // Déterminer le type de thème selon le système
  const themeType = await resolveThemeType(
    foundryTheme.system.themebook_id,
    systemSlug
  );

  return await prisma.theme.create({
    data: {
      characterId,
      name: foundryTheme.name,
      themeType: themeType || 'Origin', // Fallback
      themebookId: foundryTheme.system.themebook_id || null,
      mystery: foundryTheme.system.mystery || '',
      attention: foundryTheme.system.attention || [],
      crack: foundryTheme.system.crack || [],
      unspentUpgrades: foundryTheme.system.unspent_upgrades || 0,
    },
  });
}

async function importTag(
  characterId: string,
  foundryTag: FoundryItem,
  themeIdMap: Map<string, string>
) {
  const themeId = foundryTag.system.theme_id
    ? themeIdMap.get(foundryTag.system.theme_id)
    : null;

  // Mapper le subtype Foundry → Prisma
  const subtypeMap: Record<string, 'POWER' | 'WEAKNESS' | 'STORY' | 'LOADOUT'> = {
    power: 'POWER',
    weakness: 'WEAKNESS',
    story: 'STORY',
    loadout: 'LOADOUT',
  };

  const subtype = subtypeMap[foundryTag.system.subtype] || 'STORY';

  return await prisma.tag.create({
    data: {
      characterId,
      themeId,
      name: foundryTag.name,
      subtype,
      burned: foundryTag.system.burned || false,
      burnState: foundryTag.system.burn_state || 0,
      inverted: foundryTag.system.inverted || false,
      temporary: foundryTag.system.temporary || false,
      permanent: foundryTag.system.permanent || false,
      crispy: foundryTag.system.crispy || false,
      parentId: foundryTag.system.parentId
        ? null // Gérer les subtags dans un second pass si nécessaire
        : null,
    },
  });
}

async function importStatus(
  characterId: string,
  foundryStatus: FoundryItem
) {
  return await prisma.status.create({
    data: {
      characterId,
      name: foundryStatus.name,
      tier: foundryStatus.system.tier || 1,
      temporary: foundryStatus.system.temporary || false,
      permanent: foundryStatus.system.permanent || false,
    },
  });
}

async function importImprovement(
  characterId: string,
  foundryImprovement: FoundryItem,
  themeIdMap: Map<string, string>
) {
  const themeId = foundryImprovement.system.theme_id
    ? themeIdMap.get(foundryImprovement.system.theme_id)
    : null;

  if (!themeId) {
    throw new Error(`Improvement "${foundryImprovement.name}" has no valid theme reference`);
  }

  return await prisma.improvement.create({
    data: {
      characterId,
      themeId,
      name: foundryImprovement.name,
      description: foundryImprovement.system.description || '',
      effectClass: foundryImprovement.system.effect_class || null,
      usesMax: foundryImprovement.system.uses?.max || 0,
      usesCurrent: foundryImprovement.system.uses?.current || 0,
    },
  });
}

async function resolveThemeType(
  themebookId: string | null,
  systemSlug: string
): Promise<string | null> {
  if (!themebookId) return null;

  // Chercher le themebook dans la DB
  const themebook = await prisma.themebook.findUnique({
    where: { id: themebookId },
  });

  if (themebook) {
    return themebook.themeType;
  }

  // Fallback: deviner selon le système
  const defaultTypes: Record<string, string[]> = {
    litm: ['Origin', 'Adventure', 'Greatness', 'Fellowship'],
    'city-of-mist': ['Mythos', 'Logos', 'Mist', 'Crew'],
    otherscape: ['Mythos', 'Self', 'Noise', 'Crew'],
  };

  return defaultTypes[systemSlug]?.[0] || null;
}
```

### 3. Interface Admin

**Fichier** : `app/pages/admin/import.vue`

```vue
<script setup lang="ts">
const playspaces = ref([]);
const selectedPlayspace = ref('');
const systemSlug = ref<'litm' | 'city-of-mist' | 'otherscape'>('litm');
const jsonInput = ref('');
const overwriteExisting = ref(false);
const importFlags = ref(false);

const importing = ref(false);
const result = ref<any>(null);
const error = ref('');

// Charger les playspaces de l'utilisateur
onMounted(async () => {
  try {
    const data = await $fetch('/api/playspaces');
    playspaces.value = data;
  } catch (err) {
    error.value = 'Failed to load playspaces';
  }
});

async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    jsonInput.value = text;
    error.value = '';
  } catch (err) {
    error.value = 'Failed to read file';
  }
}

async function importCharacter() {
  if (!selectedPlayspace.value) {
    error.value = 'Please select a playspace';
    return;
  }

  if (!jsonInput.value) {
    error.value = 'Please provide JSON data';
    return;
  }

  importing.value = true;
  error.value = '';
  result.value = null;

  try {
    const actorData = JSON.parse(jsonInput.value);

    const response = await $fetch('/api/admin/import/foundry-character', {
      method: 'POST',
      body: {
        actorData,
        playspaceId: selectedPlayspace.value,
        systemSlug: systemSlug.value,
        options: {
          overwriteExisting: overwriteExisting.value,
          importFlags: importFlags.value,
        },
      },
    });

    result.value = response;
    jsonInput.value = ''; // Clear input après succès
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Import failed';
  } finally {
    importing.value = false;
  }
}
</script>

<template>
  <div class="import-page">
    <h1>Import Character from Foundry VTT</h1>

    <div class="form-section">
      <label>Playspace</label>
      <select v-model="selectedPlayspace">
        <option value="">-- Select Playspace --</option>
        <option v-for="ps in playspaces" :key="ps.id" :value="ps.id">
          {{ ps.name }}
        </option>
      </select>
    </div>

    <div class="form-section">
      <label>System</label>
      <select v-model="systemSlug">
        <option value="litm">Legends in the Mist</option>
        <option value="city-of-mist">City of Mist</option>
        <option value="otherscape">Otherscape</option>
      </select>
    </div>

    <div class="form-section">
      <label>Upload JSON File</label>
      <input type="file" accept=".json" @change="handleFileUpload" />
    </div>

    <div class="form-section">
      <label>Or Paste JSON</label>
      <textarea
        v-model="jsonInput"
        placeholder='Paste Foundry Actor JSON here...'
        rows="10"
      />
    </div>

    <div class="form-section options">
      <label>
        <input v-model="overwriteExisting" type="checkbox" />
        Overwrite existing character with same name
      </label>
      <label>
        <input v-model="importFlags" type="checkbox" />
        Import flags (advanced)
      </label>
    </div>

    <button
      class="import-button"
      :disabled="importing || !selectedPlayspace || !jsonInput"
      @click="importCharacter"
    >
      {{ importing ? 'Importing...' : 'Import Character' }}
    </button>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="result" class="success-message">
      <h3>Import Successful!</h3>
      <p>Character ID: {{ result.characterId }}</p>
      <ul>
        <li>Themes imported: {{ result.stats.themes }}</li>
        <li>Tags imported: {{ result.stats.tags }}</li>
        <li>Statuses imported: {{ result.stats.statuses }}</li>
        <li>Improvements imported: {{ result.stats.improvements }}</li>
      </ul>
      <div v-if="result.warnings.length > 0" class="warnings">
        <h4>Warnings:</h4>
        <ul>
          <li v-for="(warning, i) in result.warnings" :key="i">
            {{ warning }}
          </li>
        </ul>
      </div>
      <a :href="`/playspaces/${selectedPlayspace}/characters/${result.characterId}`">
        View Character
      </a>
    </div>
  </div>
</template>

<style scoped>
.import-page {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

select,
textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
}

.import-button {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.import-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee;
  border: 1px solid #f88;
  border-radius: 4px;
  color: #c00;
}

.success-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #efe;
  border: 1px solid #8f8;
  border-radius: 4px;
}

.warnings {
  margin-top: 1rem;
  padding: 0.5rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
}
</style>
```

---

## Gestion des Cas Limites

### 1. Themebooks manquants

Si le `themebook_id` référencé n'existe pas dans Brumisater :
- **Option 1** : Créer le themebook automatiquement (requiert données themebook)
- **Option 2** : Assigner au themebook "Generic" du système
- **Option 3** : Ajouter un warning et demander mapping manuel

**Recommandation** : Option 2 avec warning pour MVP v1.2

### 2. Subtags (tags imbriqués)

Foundry supporte les subtags via `parentId`. Pour le MVP :
- **Phase 1** : Ignorer la relation parent/enfant, importer tous les tags à plat
- **Phase 2 (v1.4+)** : Gérer les subtags avec un second pass après import

### 3. Items non supportés

Certains items Foundry ne sont pas dans le scope MVP :
- `clue` → Reporter à v2.0 (Investigation Board)
- `juice` → Reporter à v2.0 (City of Mist mechanics)
- `move` → Reporter à v1.3 (Dice rolls)

**Action** : Ajouter des warnings lors de l'import

### 4. Validation des données

Utiliser Zod pour valider :
- Structures JSON conformes
- Types de données (tier 1-6, burn_state 0-1, etc.)
- Relations valides (theme_id existe)

Si validation échoue :
- **Hard fail** : Rejeter tout l'import et retourner erreur
- **Soft fail** : Importer ce qui est valide, logger warnings

**Recommandation** : Soft fail avec rapport détaillé

---

## Tests E2E

**Fichier** : `tests/e2e/foundry-import.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const mockFoundryActor = {
  _id: 'test-actor-1',
  name: 'Test Hero',
  type: 'character',
  system: {
    biography: 'A brave hero',
    description: 'Test description',
  },
  items: [
    {
      _id: 'theme-1',
      name: 'The Wanderer',
      type: 'theme',
      system: {
        mystery: 'Where do I come from?',
        attention: [1, 0, 0],
        crack: [0, 0, 0],
      },
    },
    {
      _id: 'tag-1',
      name: 'Swift Blade',
      type: 'tag',
      system: {
        theme_id: 'theme-1',
        subtype: 'power',
        burned: false,
      },
    },
  ],
};

test.describe('Foundry VTT Import', () => {
  test('should import character from JSON', async ({ page }) => {
    await page.goto('/admin/import');

    // Sélectionner playspace
    await page.selectOption('select', { label: 'Test Playspace' });

    // Sélectionner système
    await page.selectOption('select[name="system"]', 'litm');

    // Coller JSON
    await page.fill('textarea', JSON.stringify(mockFoundryActor, null, 2));

    // Cliquer Import
    await page.click('button:has-text("Import Character")');

    // Vérifier succès
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('Test Hero');
    await expect(page.locator('.success-message')).toContainText('Themes imported: 1');
    await expect(page.locator('.success-message')).toContainText('Tags imported: 1');
  });

  test('should show error for invalid JSON', async ({ page }) => {
    await page.goto('/admin/import');
    await page.selectOption('select', { label: 'Test Playspace' });
    await page.fill('textarea', '{ invalid json }');
    await page.click('button:has-text("Import Character")');

    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should warn when overwriting existing character', async ({ page }) => {
    // Créer un personnage existant
    await page.goto('/playspaces/test-playspace/characters/new');
    await page.fill('input[name="name"]', 'Test Hero');
    await page.click('button:has-text("Create")');

    // Importer avec même nom
    await page.goto('/admin/import');
    await page.selectOption('select', { label: 'Test Playspace' });
    await page.check('input[type="checkbox"]:has-text("Overwrite")');
    await page.fill('textarea', JSON.stringify(mockFoundryActor, null, 2));
    await page.click('button:has-text("Import Character")');

    await expect(page.locator('.warnings')).toContainText('Replaced existing character');
  });
});
```

---

## Roadmap d'Implémentation

### v1.2 - Import Basique (1-2 semaines)

**Semaine 1**
- [ ] Schémas Zod pour validation Actor/Items Foundry
- [ ] Parser `importFoundryCharacter()` avec mapping Theme/Tag/Status
- [ ] API route `/api/admin/import/foundry-character.post.ts`
- [ ] Gestion erreurs et warnings

**Semaine 2**
- [ ] Interface admin `/admin/import.vue`
- [ ] Upload fichier + validation JSON client-side
- [ ] Affichage résultats et warnings
- [ ] Tests E2E (3 scénarios : succès, erreur, overwrite)

### v1.4 - Import Avancé (optionnel)

- [ ] Support subtags (relation parent/enfant)
- [ ] Import batch (plusieurs personnages)
- [ ] Mapping themebooks manuel (UI)
- [ ] Preview avant import

### v2.0+ - Export/Import complet

- [ ] Export personnages Brumisater → JSON Foundry
- [ ] Import/Export Clues, Juice, Moves
- [ ] Synchronisation bidirectionnelle (avancé)

---

## Alternatives et Extensions

### 1. Import depuis autres sources

- **D&D Beyond** : Parser JSON exporté
- **Roll20** : Parser character sheets
- **Fichiers CSV** : Import bulk avec mapping colonnes

### 2. API externe

Exposer endpoint public `/api/public/import/foundry` pour permettre à des outils tiers de pousser des données.

### 3. Plugin Foundry VTT

Créer un plugin Foundry qui exporte directement vers Brumisater (POST API).

---

## Références

### Documentation Foundry VTT
- [Actor Data Structure](https://foundryvtt.com/api/Actor.html)
- [Item Data Structure](https://foundryvtt.com/api/Item.html)
- [Flags System](https://foundryvtt.com/api/documents/BaseActor.html#flags)

### Documentation Liée
- [02-modele-donnees-prisma.md](../ARCHITECTURE/02-modele-donnees-prisma.md) - Schéma Prisma
- [10-analyse-mist-hud-interface-donnees.md](../ARCHITECTURE/10-analyse-mist-hud-interface-donnees.md) - Analyse données Mist HUD
- [12-gestion-personnages.md](./12-gestion-personnages.md) - Gestion personnages LITM

---

## Maintenance

Mettre à jour cette documentation lors de :
- Nouvelles versions de Foundry VTT modifiant les structures
- Ajout de nouveaux types d'items supportés
- Changements dans le schéma Prisma de Brumisater

**Dernière mise à jour** : 2025-01-19 (Spécification fonctionnalité d'import)
