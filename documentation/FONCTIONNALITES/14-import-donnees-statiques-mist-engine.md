# Import des Données Statiques Mist Engine

## Vue d'ensemble

Cette fonctionnalité permet d'importer les **données statiques du Mist Engine** (themebooks, oracles, moves, traductions) depuis les repositories open-source pour profiter de leur travail communautaire et de leurs mises à jour continues.

**Version** : v1.0 MVP (essentiel pour le lancement)

**Priorité** : Haute (nécessaire dès le départ)

**Effort estimé** : 1 semaine

---

## Objectifs

### 1. Bénéficier du travail communautaire
- Importer les **themebooks officiels** de City of Mist, Otherscape, Legends in the Mist
- Utiliser les **traductions communautaires** (7 langues disponibles)
- Profiter des **mises à jour** et corrections de la communauté

### 2. Éviter la duplication de travail
- Ne pas ressaisir manuellement les 100+ themebooks
- Ne pas recréer les traductions existantes
- Ne pas réinventer les oracles et moves

### 3. Synchronisation avec les sources
- Script d'import exécutable depuis l'interface admin
- Possibilité de re-synchroniser lors de mises à jour upstream
- Détection automatique des nouveautés

---

## Sources de Données

### Repository Principal : taragnor/city-of-mist

**URL** : https://github.com/taragnor/city-of-mist

**Licence** : MIT (à vérifier)

**Contenu disponible** :

| Type de données | Chemin | Quantité | Format |
|-----------------|--------|----------|--------|
| **Themebooks** | `src/city-of-mist/packs/themebooks/_source/` | ~100+ | JSON |
| **Traductions** | `src/city-of-mist/lang/*.json` | 7 langues | JSON i18n |
| **Sample Dangers** | `src/city-of-mist/packs/sampledangers/_source/` | ~20+ | JSON |
| **Macros** | `src/city-of-mist/packs/macro/_source/` | ~10+ | JSON |

**Langues disponibles** :
- Anglais (en.json) - 79 KB (référence complète)
- Français (fr.json) - 53 KB
- Allemand (de.json) - 52 KB
- Espagnol (es.json) - 53 KB
- Italien (it.json) - 44 KB
- Polonais (pl.json) - 38 KB
- Portugais brésilien (pt-br.json) - 36 KB

---

### Repository Secondaire : mordachai/mist-hud

**URL** : https://github.com/mordachai/mist-hud

**Licence** : MIT

**Contenu disponible** :

| Type de données | Chemin | Quantité | Format |
|-----------------|--------|----------|--------|
| **Collections de Statuts** | `data/status-collection-default.csv` | ~100+ statuts | CSV |
| **Collections de Statuts (PT-BR)** | `data/status-collection-PT-br.csv` | ~100+ statuts | CSV |
| **Traductions HUD** | `lang/*.json` | 2 langues | JSON i18n |
| **Macros HUD** | `packs/mist-hud-macros/` | ~5+ | JSON |

**Langues disponibles** :
- Anglais (en.json) - 4 KB (traductions UI HUD)
- Portugais brésilien (pt-br.json) - 4 KB

**Collections de Statuts** (catégories) :
- Cyber & Tech (6 types)
- Elemental (11 types)
- Hazards (6 types)
- Combat (19 types)

Chaque type de statut contient 6 tiers avec noms descriptifs (ex: "bruised-1", "cracked-bone-3", "shattered-bones-5")

---

## Structure des Données

### 1. Themebook (Foundry VTT format)

**Fichier exemple** : `Adaptation_oN7A78HsYWdnK69D.json`

```json
{
  "_id": "oN7A78HsYWdnK69D",
  "name": "Adaptation",
  "type": "themebook",
  "img": "icons/svg/mystery-man.svg",
  "system": {
    "description": "",
    "locked": false,
    "version": "2.4.5",
    "free_content": true,
    "locale_name": "#CityOfMist.themebook.adaption.name",
    "type": "Mythos",
    "subtype": "Mythos",
    "system_compatiblity": "city-of-mist",
    "systemName": "Adaptation",
    "power_questions": {
      "A": {
        "question": "#CityOfMist.themebook.adaption.powerA",
        "subtag": false
      },
      "B": {
        "question": "#CityOfMist.themebook.adaption.powerB",
        "subtag": false
      },
      "C": { "question": "#CityOfMist.themebook.adaption.powerC", "subtag": false },
      "D": { "question": "#CityOfMist.themebook.adaption.powerD", "subtag": false }
    },
    "weakness_questions": {
      "A": { "question": "#CityOfMist.themebook.adaption.weaknessA", "subtag": false },
      "B": { "question": "#CityOfMist.themebook.adaption.weaknessB", "subtag": false }
    },
    "improvements": {
      "0": {
        "name": "#CityOfMist.themebook.adaption.imp.0.name",
        "description": "#CityOfMist.themebook.adaption.imp.0.desc",
        "uses": null,
        "effect_class": "THEME_DYN_CHANGE"
      },
      "1": {
        "name": "#CityOfMist.themebook.adaption.imp.1.name",
        "description": "#CityOfMist.themebook.adaption.imp.1.desc",
        "uses": 1,
        "effect_class": ""
      }
    }
  }
}
```

**Champs importants** :
- `_id` : ID unique Foundry (ne pas réutiliser)
- `name` : Nom du themebook
- `system.locale_name` : Clé de traduction i18n
- `system.subtype` : Type de thème (Mythos, Logos, Origin, Adventure, etc.)
- `system.system_compatiblity` : Système compatible (city-of-mist, legend, otherscape)
- `system.power_questions` : Questions pour générer les power tags
- `system.weakness_questions` : Questions pour générer les weakness tags
- `system.improvements` : Améliorations disponibles pour ce themebook

### 2. Traductions (i18n JSON)

**Fichier exemple** : `en.json` (extrait)

```json
{
  "CityOfMist.terms.name": "Name",
  "CityOfMist.terms.mythos": "Mythos",
  "CityOfMist.terms.logos": "Logos",
  "CityOfMist.terms.attention": "Attention",
  "CityOfMist.terms.crack": "Crack",
  "CityOfMist.terms.powerTags": "Power Tags",
  "CityOfMist.terms.weaknessTags": "Weakness Tags",

  "CityOfMist.themebook.adaption.name": "Adaptation",
  "CityOfMist.themebook.adaption.powerA": "What form does your adaptation take?",
  "CityOfMist.themebook.adaption.powerB": "How do you use your adaptation to help you in the City?",
  "CityOfMist.themebook.adaption.weaknessA": "What environment or situation is your weakness?",
  "CityOfMist.themebook.adaption.imp.0.name": "Master of Adaptation",
  "CityOfMist.themebook.adaption.imp.0.desc": "Once per session, you may adapt to any environment instantly.",

  "Legend.terms.quest": "Quest",
  "Legend.terms.origin": "Origin",
  "Legend.terms.adventure": "Adventure",
  "Legend.terms.greatness": "Greatness",
  "Legend.terms.fellowship": "Fellowship",
  "Legend.terms.backpack": "Backpack",
  "Legend.terms.milestone": "Milestone",

  "Otherscape.terms.self": "Self",
  "Otherscape.terms.noise": "Noise",
  "Otherscape.terms.ritual": "Ritual",
  "Otherscape.terms.upgrade": "Upgrade",
  "Otherscape.terms.decay": "Decay"
}
```

**Structure hiérarchique** :
- `CityOfMist.*` : Termes City of Mist
- `Legend.*` : Termes Legends in the Mist
- `Otherscape.*` : Termes Otherscape
- `Generic.*` : Termes génériques
- `TYPES.*` : Types d'entités Foundry

### 3. Collections de Statuts (CSV - mist-hud)

**Fichier** : `data/status-collection-default.csv`

**Format CSV** :
```csv
category,status_type,tier_1,tier_2,tier_3,tier_4,tier_5,tier_6
Combat,Injury,ouch-1,stinging-pain-2,broken-3,multiple-fractures-4,dying-5,dead-6
Combat,Head Injury,bumped-head-1,concussed-2,head-trauma-3,fractured-skull-4,knocked-out-5,brain-dead-6
Elemental,Fire,singed-1,blisters-2,charred-3,severe-burns-4,roasted-5,burned-to-ashes-6
Elemental,Electric,shocked-1,jolted-2,spasming-3,scorched-4,lights-out-5,fried-6
Cyber & Tech,Hacking,probing-1,breached-2,inside-3,deep-access-4,root-control-5,system-owned-6
Hazards,Poison,rash-1,spreading-venom-2,paralyzed-3,spasms-4,system-shock-5,dead-6
```

**Colonnes** :
- `category` : Catégorie de statut (Combat, Elemental, Cyber & Tech, Hazards)
- `status_type` : Type de statut dans la catégorie (Injury, Fire, Hacking, etc.)
- `tier_1` à `tier_6` : Noms des statuts par tier (format: `nom-tier`)

**Catégories complètes** :

| Catégorie | Types | Exemples |
|-----------|-------|----------|
| **Combat** | 19 types | Injury, Head Injury, Arm Injury, Torso Injury, Leg Injury, Clubs, Claws, Knives, Swords, Gunfire, Explosion, Exhaustion, Subdual, Cover (+/-), Positioning (+/-), Combat (+/-) |
| **Elemental** | 11 types | Fire, Ice, Electric, Water, Earth, Acid, Chemical, Laser, Compression, Fumes, Suffocation |
| **Cyber & Tech** | 6 types | Cybernetic Damage, Countermeasures, Digital Disguise, Drone & Robotics, Hacking, Network Infiltration |
| **Hazards** | 6 types | Contamination, Disease, Food Poisoning, Mental (inc. intoxication), Poison, Radiation |

**Utilité** :
- Suggestions de statuts pré-définis pour le MJ
- Noms cohérents et graduels par tier
- Couvre la plupart des situations de jeu
- Facilite la création rapide de statuts

### 4. Danger/Threat (Sample)

**Fichier exemple** : Sample Dangers

```json
{
  "_id": "dangerXYZ",
  "name": "Gang Leader",
  "type": "threat",
  "system": {
    "description": "A ruthless gang leader controlling the streets.",
    "spectrums": [
      { "name": "Martial", "maxTier": 4 },
      { "name": "Divination", "maxTier": 2 }
    ],
    "moves": [
      {
        "name": "Intimidate",
        "category": "Specials",
        "description": "Roll to see if they back down"
      }
    ]
  }
}
```

---

## Architecture d'Import

### 1. Script d'Import CLI

**Fichier** : `scripts/import-mist-engine-data.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { Octokit } from '@octokit/rest';

const prisma = new PrismaClient();
const octokit = new Octokit();

interface ImportOptions {
  systems: ('city-of-mist' | 'legend' | 'otherscape')[];
  languages: string[];
  overwrite: boolean;
  dryRun: boolean;
}

export async function importMistEngineData(options: ImportOptions) {
  console.log('Starting Mist Engine data import...');

  const stats = {
    themebooks: 0,
    translations: 0,
    dangers: 0,
    statuses: 0,
    errors: [] as string[],
  };

  try {
    // 1. Importer les themebooks
    if (options.systems.length > 0) {
      console.log('Importing themebooks...');
      stats.themebooks = await importThemebooks(options);
    }

    // 2. Importer les traductions
    if (options.languages.length > 0) {
      console.log('Importing translations...');
      stats.translations = await importTranslations(options);
    }

    // 3. Importer les collections de statuts
    console.log('Importing status collections...');
    stats.statuses = await importStatusCollections(options);

    // 4. Importer les sample dangers (optionnel)
    console.log('Importing sample dangers...');
    stats.dangers = await importSampleDangers(options);

    console.log('\nImport completed!');
    console.log(`- Themebooks: ${stats.themebooks}`);
    console.log(`- Translations: ${stats.translations} keys`);
    console.log(`- Status types: ${stats.statuses}`);
    console.log(`- Sample Dangers: ${stats.dangers}`);

    if (stats.errors.length > 0) {
      console.log(`\nErrors (${stats.errors.length}):`);
      stats.errors.forEach(err => console.log(`  - ${err}`));
    }

  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

  return stats;
}

async function importThemebooks(options: ImportOptions) {
  // Récupérer la liste des fichiers depuis GitHub
  const { data: files } = await octokit.repos.getContent({
    owner: 'taragnor',
    repo: 'city-of-mist',
    path: 'src/city-of-mist/packs/themebooks/_source',
  });

  if (!Array.isArray(files)) {
    throw new Error('Expected array of files');
  }

  let count = 0;

  for (const file of files) {
    if (!file.name.endsWith('.json')) continue;
    if (file.name.startsWith('000')) continue; // Skip system files

    try {
      // Télécharger le fichier
      const response = await fetch(file.download_url);
      const themebookData = await response.json();

      // Filtrer par système
      const systemCompat = themebookData.system.system_compatiblity;
      if (!options.systems.includes(systemCompat)) {
        console.log(`Skipping ${themebookData.name} (${systemCompat})`);
        continue;
      }

      // Parser et créer en DB
      await parseAndCreateThemebook(themebookData, options.overwrite, options.dryRun);
      count++;

    } catch (error) {
      console.error(`Failed to import ${file.name}:`, error.message);
    }
  }

  return count;
}

async function parseAndCreateThemebook(
  foundryData: any,
  overwrite: boolean,
  dryRun: boolean
) {
  const themebookSlug = foundryData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Vérifier si existe déjà
  const existing = await prisma.themebook.findUnique({
    where: { slug: themebookSlug },
  });

  if (existing && !overwrite) {
    console.log(`Themebook "${foundryData.name}" already exists, skipping.`);
    return;
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would import: ${foundryData.name}`);
    return;
  }

  // Créer ou mettre à jour
  const data = {
    slug: themebookSlug,
    name: foundryData.system.systemName || foundryData.name,
    localeKey: foundryData.system.locale_name || null,
    themeType: mapThemeType(foundryData.system.subtype),
    systemSlug: mapSystemSlug(foundryData.system.system_compatiblity),
    description: foundryData.system.description || '',
    freeContent: foundryData.system.free_content ?? true,
    version: foundryData.system.version || '1.0.0',

    // Questions pour tags
    powerQuestions: parsePowerQuestions(foundryData.system.power_questions),
    weaknessQuestions: parseWeaknessQuestions(foundryData.system.weakness_questions),

    // Améliorations
    improvements: parseImprovements(foundryData.system.improvements),
  };

  if (existing) {
    await prisma.themebook.update({
      where: { id: existing.id },
      data,
    });
    console.log(`Updated: ${data.name}`);
  } else {
    await prisma.themebook.create({ data });
    console.log(`Created: ${data.name}`);
  }
}

function mapThemeType(foundryType: string): string {
  const mapping: Record<string, string> = {
    'Mythos': 'Mythos',
    'Logos': 'Logos',
    'Mist': 'Mist',
    'Origin': 'Origin',
    'Adventure': 'Adventure',
    'Greatness': 'Greatness',
    'Fellowship': 'Fellowship',
    'Self': 'Self',
    'Noise': 'Noise',
    'Crew': 'Crew',
  };
  return mapping[foundryType] || 'Other';
}

function mapSystemSlug(foundrySystem: string): string {
  const mapping: Record<string, string> = {
    'city-of-mist': 'city-of-mist',
    'legend': 'litm',
    'otherscape': 'otherscape',
  };
  return mapping[foundrySystem] || 'city-of-mist';
}

function parsePowerQuestions(questions: any): any[] {
  if (!questions) return [];
  return Object.entries(questions).map(([key, value]: [string, any]) => ({
    id: key,
    question: value.question,
    subtag: value.subtag || false,
  }));
}

function parseWeaknessQuestions(questions: any): any[] {
  if (!questions) return [];
  return Object.entries(questions).map(([key, value]: [string, any]) => ({
    id: key,
    question: value.question,
    subtag: value.subtag || false,
  }));
}

function parseImprovements(improvements: any): any[] {
  if (!improvements) return [];
  return Object.entries(improvements).map(([key, value]: [string, any]) => ({
    id: key,
    name: value.name,
    description: value.description,
    uses: value.uses,
    effectClass: value.effect_class || null,
  }));
}

async function importTranslations(options: ImportOptions) {
  let totalKeys = 0;

  for (const lang of options.languages) {
    try {
      // Télécharger le fichier de langue
      const url = `https://raw.githubusercontent.com/taragnor/city-of-mist/main/src/city-of-mist/lang/${lang}.json`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Language file ${lang}.json not found, skipping.`);
        continue;
      }

      const translations = await response.json();
      const keys = Object.keys(translations);

      console.log(`Importing ${keys.length} translations for ${lang}...`);

      if (options.dryRun) {
        console.log(`[DRY RUN] Would import ${keys.length} keys for ${lang}`);
        totalKeys += keys.length;
        continue;
      }

      // Créer ou mettre à jour la langue
      const language = await prisma.language.upsert({
        where: { code: lang },
        create: {
          code: lang,
          name: getLanguageName(lang),
          translations: translations,
        },
        update: {
          translations: translations,
        },
      });

      totalKeys += keys.length;
      console.log(`✓ Imported ${keys.length} keys for ${lang}`);

    } catch (error) {
      console.error(`Failed to import ${lang}:`, error.message);
    }
  }

  return totalKeys;
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    'en': 'English',
    'fr': 'Français',
    'de': 'Deutsch',
    'es': 'Español',
    'it': 'Italiano',
    'pl': 'Polski',
    'pt-br': 'Português (Brasil)',
  };
  return names[code] || code;
}

async function importSampleDangers(options: ImportOptions) {
  // TODO: Implémenter l'import des sample dangers
  // Similaire à importThemebooks mais pour les dangers
  return 0;
}

async function importStatusCollections(options: ImportOptions) {
  console.log('Importing status collections from mist-hud...');

  const languages = ['default', 'PT-br'];
  let totalStatuses = 0;

  for (const lang of languages) {
    try {
      const filename = lang === 'default'
        ? 'status-collection-default.csv'
        : `status-collection-${lang}.csv`;

      const url = `https://raw.githubusercontent.com/mordachai/mist-hud/main/data/${filename}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Status collection ${filename} not found, skipping.`);
        continue;
      }

      const csvText = await response.text();
      const statuses = parseStatusCollectionCSV(csvText, lang);

      console.log(`Parsed ${statuses.length} status types for ${lang}`);

      if (options.dryRun) {
        console.log(`[DRY RUN] Would import ${statuses.length} status types for ${lang}`);
        totalStatuses += statuses.length;
        continue;
      }

      // Créer ou mettre à jour dans la DB
      for (const statusType of statuses) {
        await prisma.statusCollection.upsert({
          where: {
            category_type_lang: {
              category: statusType.category,
              type: statusType.type,
              language: lang === 'default' ? 'en' : lang,
            },
          },
          create: statusType,
          update: statusType,
        });
      }

      totalStatuses += statuses.length;
      console.log(`✓ Imported ${statuses.length} status types for ${lang}`);

    } catch (error) {
      console.error(`Failed to import status collection ${lang}:`, error.message);
    }
  }

  return totalStatuses;
}

function parseStatusCollectionCSV(csvText: string, language: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const header = lines[0].split(',');

  const statuses: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');

    if (cols.length < 3) continue; // Ligne invalide

    const category = cols[0].trim();
    const type = cols[1].trim();

    const tiers: Record<number, string> = {};
    for (let tier = 1; tier <= 6; tier++) {
      const tierName = cols[tier + 1]?.trim();
      if (tierName) {
        tiers[tier] = tierName;
      }
    }

    statuses.push({
      category,
      type,
      language: language === 'default' ? 'en' : language,
      tiers: JSON.stringify(tiers), // { 1: "ouch-1", 2: "stinging-pain-2", ... }
    });
  }

  return statuses;
}

// Exécution du script
if (require.main === module) {
  const args = process.argv.slice(2);

  const options: ImportOptions = {
    systems: ['city-of-mist', 'legend', 'otherscape'],
    languages: ['en', 'fr'],
    overwrite: args.includes('--overwrite'),
    dryRun: args.includes('--dry-run'),
  };

  importMistEngineData(options)
    .then(stats => {
      console.log('\nImport statistics:', stats);
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
```

### 2. Schéma Prisma Étendu

**Fichier** : `prisma/schema.prisma` (ajouts)

```prisma
model Themebook {
  id          String   @id @default(cuid())
  slug        String   @unique

  // Informations de base
  name        String
  localeKey   String?  // Clé i18n (ex: #CityOfMist.themebook.adaption.name)
  description String   @default("")

  // Classification
  themeType   String   // Origin, Adventure, Mythos, Logos, etc.
  systemSlug  String   // litm, city-of-mist, otherscape

  // Métadonnées
  freeContent Boolean  @default(true)
  version     String   @default("1.0.0")

  // Questions pour tags (JSON)
  powerQuestions    Json     @default("[]")  // Array<{ id, question, subtag }>
  weaknessQuestions Json     @default("[]")  // Array<{ id, question, subtag }>

  // Améliorations (JSON)
  improvements Json     @default("[]")  // Array<{ id, name, description, uses, effectClass }>

  // Relations
  system      System   @relation(fields: [systemSlug], references: [slug])
  themes      Theme[]  // Themes créés avec ce themebook

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([systemSlug])
  @@index([themeType])
}

model Language {
  id           String   @id @default(cuid())
  code         String   @unique  // en, fr, de, etc.
  name         String   // English, Français, etc.

  // Traductions (JSON)
  translations Json     @default("{}")  // Record<string, string>

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model System {
  id          String   @id @default(cuid())
  slug        String   @unique  // litm, city-of-mist, otherscape
  name        String

  // Configuration (JSON)
  config      Json     // SystemConfig (voir 09-architecture-multi-systemes.md)

  // Relations
  themebooks  Themebook[]
  playspaces  Playspace[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model StatusCollection {
  id          String   @id @default(cuid())

  // Classification
  category    String   // Combat, Elemental, Cyber & Tech, Hazards
  type        String   // Injury, Fire, Hacking, etc.
  language    String   // en, pt-br, etc.

  // Tiers (JSON)
  tiers       Json     // { "1": "ouch-1", "2": "stinging-pain-2", ... }

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([category, type, language], name: "category_type_lang")
  @@index([category])
  @@index([language])
}
```

### 3. API Route Admin

**Fichier** : `server/api/admin/import/mist-engine.post.ts`

```typescript
import { importMistEngineData } from '~/scripts/import-mist-engine-data';
import { requireAdmin } from '~/server/utils/auth';
import { z } from 'zod';

const ImportRequestSchema = z.object({
  systems: z.array(z.enum(['city-of-mist', 'legend', 'otherscape'])),
  languages: z.array(z.string()),
  overwrite: z.boolean().default(false),
  dryRun: z.boolean().default(false),
});

export default defineEventHandler(async (event) => {
  // Vérifier que l'utilisateur est admin
  await requireAdmin(event);

  const body = await readBody(event);
  const options = ImportRequestSchema.parse(body);

  try {
    const stats = await importMistEngineData(options);

    return {
      success: true,
      stats,
      message: `Import completed: ${stats.themebooks} themebooks, ${stats.translations} translation keys`,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Import failed',
    });
  }
});
```

### 4. Interface Admin

**Fichier** : `app/pages/admin/import-data.vue`

```vue
<script setup lang="ts">
const systems = ref(['city-of-mist', 'legend', 'otherscape']);
const languages = ref(['en', 'fr']);
const overwrite = ref(false);
const dryRun = ref(true);

const importing = ref(false);
const result = ref<any>(null);
const error = ref('');

async function startImport() {
  importing.value = true;
  error.value = '';
  result.value = null;

  try {
    const response = await $fetch('/api/admin/import/mist-engine', {
      method: 'POST',
      body: {
        systems: systems.value,
        languages: languages.value,
        overwrite: overwrite.value,
        dryRun: dryRun.value,
      },
    });

    result.value = response;
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Import failed';
  } finally {
    importing.value = false;
  }
}
</script>

<template>
  <div class="import-page">
    <h1>Import Mist Engine Data</h1>
    <p>Import themebooks, translations and sample data from taragnor/city-of-mist repository.</p>

    <div class="form-section">
      <h3>Systems</h3>
      <label>
        <input v-model="systems" type="checkbox" value="city-of-mist" />
        City of Mist
      </label>
      <label>
        <input v-model="systems" type="checkbox" value="legend" />
        Legends in the Mist
      </label>
      <label>
        <input v-model="systems" type="checkbox" value="otherscape" />
        Otherscape
      </label>
    </div>

    <div class="form-section">
      <h3>Languages</h3>
      <label><input v-model="languages" type="checkbox" value="en" /> English</label>
      <label><input v-model="languages" type="checkbox" value="fr" /> Français</label>
      <label><input v-model="languages" type="checkbox" value="de" /> Deutsch</label>
      <label><input v-model="languages" type="checkbox" value="es" /> Español</label>
      <label><input v-model="languages" type="checkbox" value="it" /> Italiano</label>
      <label><input v-model="languages" type="checkbox" value="pl" /> Polski</label>
      <label><input v-model="languages" type="checkbox" value="pt-br" /> Português (BR)</label>
    </div>

    <div class="form-section options">
      <label>
        <input v-model="overwrite" type="checkbox" />
        Overwrite existing data
      </label>
      <label>
        <input v-model="dryRun" type="checkbox" />
        Dry run (preview only, don't write to DB)
      </label>
    </div>

    <button
      class="import-button"
      :disabled="importing || systems.length === 0"
      @click="startImport"
    >
      {{ importing ? 'Importing...' : 'Start Import' }}
    </button>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="result" class="success-message">
      <h3>Import {{ dryRun ? 'Preview' : 'Completed' }}!</h3>
      <ul>
        <li>Themebooks: {{ result.stats.themebooks }}</li>
        <li>Translation keys: {{ result.stats.translations }}</li>
        <li>Sample Dangers: {{ result.stats.dangers }}</li>
      </ul>
      <div v-if="result.stats.errors.length > 0" class="warnings">
        <h4>Errors ({{ result.stats.errors.length }}):</h4>
        <ul>
          <li v-for="(err, i) in result.stats.errors" :key="i">{{ err }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles similaires à 13-import-foundry-vtt.md */
</style>
```

---

## Commandes npm

**Fichier** : `package.json`

```json
{
  "scripts": {
    "import:mist-engine": "pnpm tsx scripts/import-mist-engine-data.ts",
    "import:mist-engine:dry-run": "pnpm tsx scripts/import-mist-engine-data.ts --dry-run",
    "import:mist-engine:overwrite": "pnpm tsx scripts/import-mist-engine-data.ts --overwrite"
  }
}
```

**Usage** :
```bash
# Preview import (dry run)
pnpm run import:mist-engine:dry-run

# Import with default options
pnpm run import:mist-engine

# Force overwrite existing data
pnpm run import:mist-engine:overwrite
```

---

## Utilisation des Données Importées

### 1. Afficher les themebooks par système

```typescript
// app/composables/useThemebooks.ts

export function useThemebooks(systemSlug: string) {
  const themebooks = ref<Themebook[]>([]);
  const loading = ref(true);

  async function loadThemebooks() {
    loading.value = true;
    try {
      themebooks.value = await $fetch(`/api/systems/${systemSlug}/themebooks`);
    } finally {
      loading.value = false;
    }
  }

  onMounted(loadThemebooks);

  return { themebooks, loading, refresh: loadThemebooks };
}
```

### 2. Traduire une clé i18n

```typescript
// app/composables/useI18n.ts

export function useI18n(locale: string = 'en') {
  const translations = ref<Record<string, string>>({});

  async function loadTranslations() {
    const language = await $fetch(`/api/languages/${locale}`);
    translations.value = language.translations;
  }

  function t(key: string, fallback?: string): string {
    return translations.value[key] || fallback || key;
  }

  onMounted(loadTranslations);

  return { t, translations };
}
```

**Usage dans composant** :
```vue
<script setup lang="ts">
const { t } = useI18n('fr');
</script>

<template>
  <h1>{{ t('CityOfMist.terms.mythos') }}</h1>
  <p>{{ t('CityOfMist.themebook.adaption.name') }}</p>
</template>
```

### 3. Créer un thème depuis un themebook

```vue
<script setup lang="ts">
const props = defineProps<{
  themebook: Themebook;
}>();

const { t } = useI18n();

const powerQuestions = computed(() => {
  return props.themebook.powerQuestions.map((q: any) => ({
    id: q.id,
    question: t(q.question), // Traduit la clé i18n
  }));
});
</script>

<template>
  <div class="themebook">
    <h2>{{ t(themebook.localeKey) || themebook.name }}</h2>

    <div class="power-questions">
      <h3>{{ t('CityOfMist.terms.powerTags') }}</h3>
      <ul>
        <li v-for="q in powerQuestions" :key="q.id">
          {{ q.question }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

### 4. Suggérer des statuts depuis les collections

```typescript
// app/composables/useStatusSuggestions.ts

export function useStatusSuggestions(locale: string = 'en') {
  const suggestions = ref<StatusCollection[]>([]);
  const loading = ref(true);

  async function loadSuggestions(category?: string) {
    loading.value = true;
    try {
      const url = category
        ? `/api/status-collections?category=${category}&lang=${locale}`
        : `/api/status-collections?lang=${locale}`;

      suggestions.value = await $fetch(url);
    } finally {
      loading.value = false;
    }
  }

  function getSuggestedName(category: string, type: string, tier: number): string | null {
    const collection = suggestions.value.find(
      s => s.category === category && s.type === type
    );

    if (!collection) return null;

    const tiers = JSON.parse(collection.tiers);
    return tiers[tier] || null;
  }

  onMounted(() => loadSuggestions());

  return { suggestions, loading, loadSuggestions, getSuggestedName };
}
```

**Usage dans composant** :
```vue
<script setup lang="ts">
const { suggestions, getSuggestedName } = useStatusSuggestions('en');

const selectedCategory = ref('Combat');
const selectedType = ref('Injury');
const selectedTier = ref(3);

const suggestedName = computed(() => {
  return getSuggestedName(
    selectedCategory.value,
    selectedType.value,
    selectedTier.value
  );
});

async function applyStatus() {
  await $fetch('/api/characters/123/statuses', {
    method: 'POST',
    body: {
      name: suggestedName.value || 'Custom Status',
      tier: selectedTier.value,
    },
  });
}
</script>

<template>
  <div class="status-creator">
    <h3>Create Status</h3>

    <select v-model="selectedCategory">
      <option value="Combat">Combat</option>
      <option value="Elemental">Elemental</option>
      <option value="Cyber & Tech">Cyber & Tech</option>
      <option value="Hazards">Hazards</option>
    </select>

    <select v-model="selectedType">
      <option v-for="s in suggestions.filter(s => s.category === selectedCategory)"
              :key="s.type" :value="s.type">
        {{ s.type }}
      </option>
    </select>

    <input v-model.number="selectedTier" type="range" min="1" max="6" />
    <span>Tier {{ selectedTier }}</span>

    <p>Suggested name: <strong>{{ suggestedName }}</strong></p>

    <button @click="applyStatus">Apply Status</button>
  </div>
</template>
```

---

## Roadmap d'Implémentation

### Phase 1 - Import Basique (3 jours)

**Jour 1**
- [ ] Créer schéma Prisma (Themebook, Language, System)
- [ ] Migration DB
- [ ] Script de base `import-mist-engine-data.ts`

**Jour 2**
- [ ] Parser themebooks Foundry → Prisma
- [ ] Parser traductions JSON → Prisma
- [ ] Tests unitaires parsers

**Jour 3**
- [ ] API route `/api/admin/import/mist-engine.post.ts`
- [ ] Interface admin basique
- [ ] Test complet avec 1 système

### Phase 2 - Interface Admin (2 jours)

**Jour 4**
- [ ] Interface admin complète avec options
- [ ] Dry run mode
- [ ] Progress tracking

**Jour 5**
- [ ] Gestion erreurs et warnings
- [ ] Logging détaillé
- [ ] Documentation utilisateur

### Phase 3 - Utilisation (2 jours)

**Jour 6**
- [ ] Composable `useThemebooks()`
- [ ] Composable `useI18n()`
- [ ] API routes pour récupération données

**Jour 7**
- [ ] Intégration dans création de personnage
- [ ] Sélection themebook avec preview
- [ ] Tests E2E complets

**Total** : 1 semaine (7 jours)

---

## Maintenance et Mises à Jour

### Stratégie de synchronisation

**Option 1 : Manuelle via Admin**
- Bouton "Check for Updates" dans l'interface admin
- Compare versions locales vs GitHub
- Propose import sélectif des nouveautés

**Option 2 : GitHub Webhook (v2.0+)**
- Webhook notifie Brumisa3 des nouveaux commits
- Import automatique des modifications
- Notification admin

**Option 3 : Cron Job Hebdomadaire**
- Script exécuté chaque semaine
- Vérifie les nouveaux fichiers/modifications
- Email récapitulatif à l'admin

**Recommandation MVP** : Option 1 (manuelle simple)

### Versionning des données

```typescript
// Table pour tracker les imports
model DataImport {
  id          String   @id @default(cuid())
  source      String   // "taragnor/city-of-mist"
  commitSha   String   // SHA du commit GitHub
  importedAt  DateTime @default(now())
  stats       Json     // Statistiques d'import
  userId      String   // Admin qui a lancé l'import
}
```

---

## Considérations Légales

### Licence des données

- **Vérifier la licence** de taragnor/city-of-mist (semble MIT)
- **Créditer la source** dans l'application
- **Respecter les droits d'auteur** du contenu officiel Son of Oak

### Attribution

Ajouter dans l'application :

```
Themebooks and translations imported from:
- taragnor/city-of-mist (GitHub)
- Community translations by [contributors]

City of Mist, Otherscape, and Legends in the Mist are trademarks of Son of Oak Game Studio.
```

---

## Références

### Repositories Analysés
- [taragnor/city-of-mist](https://github.com/taragnor/city-of-mist) - Source principale

### Documentation Liée
- [02-modele-donnees-prisma.md](../ARCHITECTURE/02-modele-donnees-prisma.md) - Schéma Prisma
- [09-architecture-multi-systemes-mist-engine.md](../ARCHITECTURE/09-architecture-multi-systemes-mist-engine.md) - Architecture systèmes
- [13-import-foundry-vtt.md](./13-import-foundry-vtt.md) - Import personnages

### APIs Utilisées
- [GitHub REST API](https://docs.github.com/en/rest) - Récupération fichiers
- [Octokit.js](https://github.com/octokit/octokit.js) - Client GitHub

---

## Maintenance

Mettre à jour cette documentation lors de :
- Changements de structure dans taragnor/city-of-mist
- Ajout de nouvelles sources de données
- Modifications du format Foundry VTT
- Nouveaux systèmes Mist Engine

**Dernière mise à jour** : 2025-01-19 (Spécification import données statiques)
