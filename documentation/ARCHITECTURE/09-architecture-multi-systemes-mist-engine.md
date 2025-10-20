# Architecture Multi-Hacks Mist Engine

## Vue d'ensemble

Cette documentation détaille l'architecture permettant de supporter **plusieurs hacks du Mist Engine** (City of Mist, Legends in the Mist, Otherscape) dans Brumisater, avec un design extensible pour de futurs hacks.

**Scope MVP v1.0** : Legends in the Mist (LITM) uniquement, mais architecture préparée pour extension

**Post-MVP** : City of Mist (v1.2+), Otherscape (v1.3+), hacks customs (v2.0+)

**Note importante** : LITM, Otherscape et City of Mist sont des **hacks** du Mist Engine, pas des systèmes séparés. Voir [00-GLOSSAIRE.md](./00-GLOSSAIRE.md) pour la terminologie officielle.

## Analyse du Système Taragnor (city-of-mist)

### 1. Architecture Modulaire Orientée Objet

Le repository `taragnor/city-of-mist` (Foundry VTT) utilise une architecture élégante basée sur l'héritage :

```
BaseSystemModule (classe abstraite)
├── CoMTypeSystem (intermédiaire)
│   └── CoMSystem (City of Mist)
└── MistEngineSystem (classe abstraite - systèmes modernes)
    ├── OtherscapeSystem
    └── LitMSystem (Legend in the Mist)
```

**Fichiers clés analysés** :
- `src/city-of-mist/module/config/system-module.ts` - Gestionnaire central
- `src/city-of-mist/module/systemModule/baseSystemModule.ts` - Classe de base abstraite
- `src/city-of-mist/module/systemModule/com-system.ts` - City of Mist
- `src/city-of-mist/module/systemModule/otherscape.ts` - Otherscape
- `src/city-of-mist/module/systemModule/litm-system.ts` - Legend in the Mist

### 2. Enregistrement et Gestion Centralisée

**Pattern Factory + Registry** (`config/system-module.ts:11-59`) :

```typescript
export abstract class SystemModule {
    static systems = new Map<keyof SYSTEM_NAMES, SystemModuleI>();

    // Getter du système actif
    static get active(): SystemModuleI {
        const system = CitySettings.getBaseSystem();
        const sys = this.systems.get(system);
        if (sys) return sys;
        return new CoMSystem(); // fallback
    }

    // Enregistrement d'un système
    static registerRulesSystem<T extends SystemModuleI>(system: T) {
        this.systems.set(system.name, system);
        console.log(`Rules System Registered: ${system.name}`);
    }

    // Activation d'un système
    static async setActive(systemName: keyof SYSTEM_NAMES): Promise<boolean> {
        await CitySettings.set("baseSystem", systemName);
        await this.active.onChangeTo();
        await this.active.activate();
        return true;
    }
}
```

### 3. Interface Système (SystemModuleI)

Chaque système implémente cette interface (`baseSystemModule.ts:205-217`) :

```typescript
export interface SystemModuleI {
    name: keyof SYSTEM_NAMES;                    // "city-of-mist" | "otherscape" | "legend"
    localizationString: string;                  // Nom traduit
    localizationStarterName: string;             // "CityOfMist" | "Otherscape" | "Legend"

    // Méthodes de configuration
    themeTypes(): Partial<Record<keyof ThemeTypes, ThemeTypeInfo>>;
    gameTerms(): Record<keyof GameTerms, localizationString>;

    // Méthodes de lifecycle
    onChangeTo(): Promise<void>;                 // Appelé lors du switch
    activate(): Promise<void>;                   // Charge templates, sheets, hooks

    // Méthodes de templating
    sheetHeader(actor: CityActor): Promise<string>;
    themeCardTemplateLocation(theme: Theme): string;
    downtimeTemplate(actor: CityActor): Promise<string>;

    // Méthodes de règles
    canCreateTags(move: Move): boolean;
    directoryName(actor: CityActor): string;

    // Méthodes de localisation
    localizedName(doc: CityActor | CityItem): string;
    localizedDescription(doc: CityActor | CityItem): string;
}
```

### 4. Types de Thèmes par Système

**City of Mist** (`com-system.ts:46-87`) :
```typescript
themeTypes() {
    return {
        "Logos": {
            localization: "CityOfMist.terms.logos",
            sortOrder: 3,
            increaseLocalization: "CityOfMist.terms.attention",
            decreaseLocalization: "CityOfMist.terms.crack",
            identityName: "CityOfMist.terms.identity",
        },
        "Mythos": {
            localization: "CityOfMist.terms.mythos",
            sortOrder: 1,
            increaseLocalization: "CityOfMist.terms.attention",
            decreaseLocalization: "CityOfMist.terms.fade",
            identityName: "CityOfMist.terms.mystery",
        },
        "Mist": { /* ... */ },
        "Crew": { /* ... */ },
        "Loadout-CoM": { specials: ["loadout"] },
        "Extra": { specials: ["extra"] }
    };
}
```

**Otherscape** (`otherscape.ts:37-83`) :
```typescript
themeTypes() {
    return {
        "Noise": {
            localization: "Otherscape.terms.noise",
            sortOrder: 2,
            increaseLocalization: "Otherscape.terms.upgrade",
            decreaseLocalization: "Otherscape.terms.decay",
            identityName: "Otherscape.terms.itch",
        },
        "Self": { /* ... */ },
        "Mythos-OS": { /* ... */ },
        "Crew-OS": { specials: ["crew"] },
        "Loadout": { specials: ["loadout"] }
    };
}
```

**Legend in the Mist** (`litm-system.ts:18-61`) :
```typescript
themeTypes() {
    return {
        "Origin": {
            localization: "Legend.terms.origin",
            sortOrder: 1,
            decreaseLocalization: "Legend.terms.abandon",
            increaseLocalization: "Legend.terms.improve",
            milestoneLocalization: "Legend.terms.milestone",
            identityName: "Legend.terms.quest",
        },
        "Adventure": { /* ... */ },
        "Greatness": { /* ... */ },
        "Fellowship": { specials: ["crew"] },
        "Backpack": { specials: ["loadout"] }
    };
}
```

### 5. Terminologie par Système

**GameTerms** varient selon le système (`gameTerms()` method) :

| Terme | City of Mist | Otherscape | Legends in the Mist |
|-------|--------------|------------|---------------------|
| **Collective** | Collective | Scale | Collective |
| **Build-up Points** | Build-Up | Evolution Points | Promise |
| **Evolution** | Moments of Evolution | Evolution | Fulfillment |
| **Theme Increase** | Attention | Upgrade | Improve |
| **Theme Decrease** | Fade/Crack/Strike | Decay | Abandon |

### 6. Configuration lors du Switch

Exemple **Otherscape** (`otherscape.ts:85-91`) :
```typescript
override async onChangeTo(): Promise<void> {
    await super.onChangeTo();
    const settings = CitySettings;
    await settings.set("baseSystem", "otherscape");
    await settings.set("system", "otherscape");
    await settings.set("movesInclude", "otherscape");
    // Configure tous les settings liés (status addition, tag burn, etc.)
}
```

### 7. Styles CSS Spécifiques

Dans `system.json:18-23` :
```json
"styles": [
    "styles/city.css",
    "styles/com.css",
    "styles/otherscape.css",
    "styles/legend.css",
    "styles/mist-engine.css"
]
```

Et gestion dynamique dans `system-module.ts:127-134` :
```typescript
static setActiveStyle(system: SystemModuleI) {
    const body = $(document).find("body");
    for (const {name} of this.systems.values()) {
        body.removeClass(`style-${name}`);
    }
    body.addClass(`style-${system.name}`);
}
```

---

## Architecture Proposée pour Brumisater

### Objectifs

1. **Extensibilité** : Faciliter l'ajout de nouveaux systèmes Mist Engine
2. **Type Safety** : TypeScript strict end-to-end
3. **Performance** : Configuration cachée (IndexedDB), pas de re-fetch
4. **Maintenabilité** : Configuration déclarative (JSON), pas de logique complexe
5. **Compatibilité** : Intégration seamless avec Prisma, Pinia, et PDF generation

### Principes de Design

1. **Configuration over Code** : Les spécificités système sont des données, pas du code
2. **Single Source of Truth** : DB Prisma comme source, cache IndexedDB pour perf
3. **Composable-First** : Logique métier dans composables réutilisables
4. **PDF-Driven Design** : Configuration optimisée pour génération PDF

---

## Implémentation Technique

### 1. Schéma Prisma Étendu

**Ajout de tables System et configuration** :

```prisma
// prisma/schema.prisma

// Table des systèmes Mist Engine disponibles
model System {
  id          String   @id @default(cuid())
  slug        String   @unique  // "litm", "com", "otherscape"
  name        String              // "Legends in the Mist"
  shortName   String              // "LITM"
  version     String              // "1.0"
  active      Boolean  @default(true)
  sortOrder   Int      @default(0)

  // Configuration JSON pour le système
  config      Json     // SystemConfig (voir types ci-dessous)

  // Relations
  themebooks  Themebook[]
  playspaces  Playspace[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([active])
}

// Extension de Playspace pour référencer le système
model Playspace {
  id          String   @id @default(cuid())
  name        String
  system      System   @relation(fields: [systemId], references: [id])
  systemId    String
  // ... autres champs existants

  @@index([systemId])
}

// Extension de Themebook pour référencer le système
model Themebook {
  id          String   @id @default(cuid())
  name        String
  system      System   @relation(fields: [systemId], references: [id])
  systemId    String
  themeType   String   // "Origin", "Mythos", "Self", etc.
  // ... autres champs existants

  @@index([systemId, themeType])
}

// Extension de ThemeCard pour stocker le type de thème
model ThemeCard {
  id          String   @id @default(cuid())
  themeType   String   // "Origin", "Adventure", "Greatness", etc.
  // ... autres champs existants
}
```

### 2. Types TypeScript

**Fichier** : `shared/types/system.ts`

```typescript
// shared/types/system.ts

/**
 * Configuration complète d'un système Mist Engine
 */
export interface SystemConfig {
  // Identification
  slug: SystemSlug;
  name: string;
  shortName: string;
  version: string;

  // Types de thèmes disponibles
  themeTypes: ThemeTypeConfig[];

  // Terminologie du système
  terminology: SystemTerminology;

  // Règles spécifiques
  rules: SystemRules;

  // Configuration PDF
  pdf: SystemPDFConfig;

  // Assets (couleurs, icônes, fonts)
  assets: SystemAssets;
}

/**
 * Slug unique du système
 */
export type SystemSlug = 'litm' | 'com' | 'otherscape' | 'custom';

/**
 * Configuration d'un type de thème
 */
export interface ThemeTypeConfig {
  id: string;                    // "origin", "mythos", "noise"
  name: string;                  // "Origin", "Mythos", "Noise"
  sortOrder: number;             // Pour tri dans l'interface
  increaseLabel: string;         // "Improve", "Attention", "Upgrade"
  decreaseLabel: string;         // "Abandon", "Fade", "Decay"
  milestoneLabel?: string;       // "Milestone" (LITM uniquement)
  identityLabel: string;         // "Quest", "Mystery", "Itch"
  powerTags: number;             // Nombre de Power Tags
  weaknessTags: number;          // Nombre de Weakness Tags
  trackingType: 'attention' | 'milestone' | 'dual';  // Type de progression
  specials?: ThemeSpecial[];     // ["crew", "loadout", "extra"]
}

/**
 * Spéciaux pour types de thèmes
 */
export type ThemeSpecial = 'crew' | 'loadout' | 'extra';

/**
 * Terminologie spécifique au système
 */
export interface SystemTerminology {
  // Termes de progression
  buildUpPoints: string;         // "Promise", "Build-Up", "Evolution Points"
  evolution: string;             // "Fulfillment", "MoEs", "Evolution"
  collective: string;            // "Collective", "Scale"

  // Termes de mécaniques
  status: string;                // "Status" (commun à tous)
  tag: string;                   // "Tag" (commun à tous)
  move: string;                  // "Move" (commun à tous)

  // Termes de personnage
  character: string;             // "Hero", "Rift", "Legend"
  crew: string;                  // "Crew", "Fellowship", "Crew"
}

/**
 * Règles spécifiques du système
 */
export interface SystemRules {
  // Progression des thèmes
  attentionMax: number;          // 3 pour LITM, 5 pour CoM/OS
  attentionPerImprove: number;   // 3 pour tous

  // Système de milestones (LITM uniquement)
  usesMilestones: boolean;
  milestoneMax?: number;         // 3 pour LITM

  // Mécaniques de statuts
  statusAdditionSystem: 'classic' | 'mist-engine';
  statusSubtractionSystem: 'classic' | 'mist-engine';

  // Mécaniques de tags
  tagBurnSystem: 'classic' | 'mist-engine';
  tagCreationCost: number;       // 2 pour tous
  statusCreationCost: number;    // 1 pour tous

  // Limites
  maxWeaknessTags?: number;      // Optionnel
  maxRollModifier?: number;      // Optionnel (cap à +5 par exemple)

  // Auto-mécaniques
  autoFailAutoSuccess: boolean;  // false pour CoM, true pour OS/LITM
  autoWeakness: boolean;         // true pour tous
}

/**
 * Configuration PDF du système
 */
export interface SystemPDFConfig {
  // Templates de layout
  characterSheetLayout: 'litm' | 'com' | 'otherscape';

  // Couleurs principales (hex)
  primaryColor: string;          // "#8B4513" pour LITM
  secondaryColor: string;
  accentColor: string;

  // Typographie
  fontFamily: string;            // "Cinzel" pour LITM
  fontSizes: {
    title: number;
    heading: number;
    body: number;
    small: number;
  };

  // Sections à inclure
  sections: {
    themeCards: boolean;
    heroCard: boolean;
    trackers: boolean;
    moves?: boolean;             // Futur
    equipment?: boolean;          // Futur
  };

  // Options d'affichage
  showEmptyTags: boolean;
  showMilestones: boolean;
  compactMode: boolean;
}

/**
 * Assets visuels du système
 */
export interface SystemAssets {
  // Icônes des types de thèmes
  themeTypeIcons: Record<string, string>;  // { "origin": "🗡️", ... }

  // Logo du système
  logoUrl?: string;

  // Couleurs de l'interface
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}

/**
 * Type pour Prisma Json
 */
export type SystemConfigJson = SystemConfig;
```

### 3. Configuration par Défaut des Systèmes

**Fichier** : `shared/config/systems/litm.config.ts`

```typescript
// shared/config/systems/litm.config.ts

import type { SystemConfig } from '~/shared/types/system';

export const LITMConfig: SystemConfig = {
  slug: 'litm',
  name: 'Legends in the Mist',
  shortName: 'LITM',
  version: '1.0',

  themeTypes: [
    {
      id: 'origin',
      name: 'Origin',
      sortOrder: 1,
      increaseLabel: 'Improve',
      decreaseLabel: 'Abandon',
      milestoneLabel: 'Milestone',
      identityLabel: 'Quest',
      powerTags: 3,
      weaknessTags: 2,
      trackingType: 'milestone',
    },
    {
      id: 'adventure',
      name: 'Adventure',
      sortOrder: 2,
      increaseLabel: 'Improve',
      decreaseLabel: 'Abandon',
      milestoneLabel: 'Milestone',
      identityLabel: 'Quest',
      powerTags: 3,
      weaknessTags: 2,
      trackingType: 'milestone',
    },
    {
      id: 'greatness',
      name: 'Greatness',
      sortOrder: 3,
      increaseLabel: 'Improve',
      decreaseLabel: 'Abandon',
      milestoneLabel: 'Milestone',
      identityLabel: 'Quest',
      powerTags: 3,
      weaknessTags: 2,
      trackingType: 'milestone',
    },
    {
      id: 'fellowship',
      name: 'Fellowship',
      sortOrder: 10,
      increaseLabel: 'Improve',
      decreaseLabel: 'Abandon',
      milestoneLabel: 'Milestone',
      identityLabel: 'Quest',
      powerTags: 3,
      weaknessTags: 2,
      trackingType: 'milestone',
      specials: ['crew'],
    },
    {
      id: 'backpack',
      name: 'Backpack',
      sortOrder: 100,
      increaseLabel: '',
      decreaseLabel: '',
      identityLabel: '',
      powerTags: 6,
      weaknessTags: 0,
      trackingType: 'dual',
      specials: ['loadout'],
    },
  ],

  terminology: {
    buildUpPoints: 'Promise',
    evolution: 'Fulfillment',
    collective: 'Collective',
    status: 'Status',
    tag: 'Tag',
    move: 'Move',
    character: 'Legend',
    crew: 'Fellowship',
  },

  rules: {
    attentionMax: 3,
    attentionPerImprove: 3,
    usesMilestones: true,
    milestoneMax: 3,
    statusAdditionSystem: 'mist-engine',
    statusSubtractionSystem: 'mist-engine',
    tagBurnSystem: 'mist-engine',
    tagCreationCost: 2,
    statusCreationCost: 1,
    autoFailAutoSuccess: true,
    autoWeakness: true,
  },

  pdf: {
    characterSheetLayout: 'litm',
    primaryColor: '#8B4513',      // Marron médiéval
    secondaryColor: '#D4AF37',    // Or
    accentColor: '#654321',       // Marron foncé
    fontFamily: 'Cinzel',
    fontSizes: {
      title: 24,
      heading: 18,
      body: 12,
      small: 10,
    },
    sections: {
      themeCards: true,
      heroCard: true,
      trackers: true,
    },
    showEmptyTags: false,
    showMilestones: true,
    compactMode: false,
  },

  assets: {
    themeTypeIcons: {
      origin: '🗡️',
      adventure: '🌍',
      greatness: '👑',
      fellowship: '🤝',
      backpack: '🎒',
    },
    colors: {
      primary: '#8B4513',
      secondary: '#D4AF37',
      accent: '#654321',
      background: '#F5E6D3',
      surface: '#FFFFFF',
      text: '#2C1810',
    },
  },
};
```

**Fichier** : `shared/config/systems/com.config.ts`

```typescript
// shared/config/systems/com.config.ts

import type { SystemConfig } from '~/shared/types/system';

export const CityOfMistConfig: SystemConfig = {
  slug: 'com',
  name: 'City of Mist',
  shortName: 'CoM',
  version: '1.0',

  themeTypes: [
    {
      id: 'mythos',
      name: 'Mythos',
      sortOrder: 1,
      increaseLabel: 'Attention',
      decreaseLabel: 'Fade',
      identityLabel: 'Mystery',
      powerTags: 3,
      weaknessTags: 2,
      trackingType: 'attention',
    },
    {
      id: 'mist',
      name: 'Mist',
      sortOrder: 2,
      increaseLabel: 'Attention',
      decreaseLabel: 'Strike',
      identityLabel: 'Directive',
      powerTags: 3,
      weaknessTags: 2,
      trackingType: 'attention',
    },
    {
      id: 'logos',
      name: 'Logos',
      sortOrder: 3,
      increaseLabel: 'Attention',
      decreaseLabel: 'Crack',
      identityLabel: 'Identity',
      powerTags: 3,
      weaknessTags: 2,
      trackingType: 'attention',
    },
    {
      id: 'crew',
      name: 'Crew',
      sortOrder: 5,
      increaseLabel: 'Attention',
      decreaseLabel: 'Fade',
      identityLabel: 'Identity',
      powerTags: 3,
      weaknessTags: 2,
      trackingType: 'attention',
      specials: ['crew'],
    },
    {
      id: 'loadout-com',
      name: 'Loadout',
      sortOrder: 100,
      increaseLabel: '',
      decreaseLabel: '',
      identityLabel: '',
      powerTags: 6,
      weaknessTags: 0,
      trackingType: 'dual',
      specials: ['loadout'],
    },
    {
      id: 'extra',
      name: 'Extra',
      sortOrder: 5,
      increaseLabel: 'Attention',
      decreaseLabel: 'Fade',
      identityLabel: 'Identity',
      powerTags: 3,
      weaknessTags: 2,
      trackingType: 'attention',
      specials: ['extra'],
    },
  ],

  terminology: {
    buildUpPoints: 'Build-Up',
    evolution: 'Moments of Evolution',
    collective: 'Collective',
    status: 'Status',
    tag: 'Tag',
    move: 'Move',
    character: 'Rift',
    crew: 'Crew',
  },

  rules: {
    attentionMax: 5,
    attentionPerImprove: 3,
    usesMilestones: false,
    statusAdditionSystem: 'classic',
    statusSubtractionSystem: 'classic',
    tagBurnSystem: 'classic',
    tagCreationCost: 2,
    statusCreationCost: 1,
    autoFailAutoSuccess: false,
    autoWeakness: true,
  },

  pdf: {
    characterSheetLayout: 'com',
    primaryColor: '#1E3A8A',      // Bleu sombre urbain
    secondaryColor: '#3B82F6',    // Bleu clair
    accentColor: '#FBBF24',       // Or/Jaune
    fontFamily: 'Montserrat',
    fontSizes: {
      title: 24,
      heading: 18,
      body: 12,
      small: 10,
    },
    sections: {
      themeCards: true,
      heroCard: false,             // Pas de Hero Card dans CoM
      trackers: true,
    },
    showEmptyTags: false,
    showMilestones: false,
    compactMode: false,
  },

  assets: {
    themeTypeIcons: {
      mythos: '🔮',
      mist: '🌫️',
      logos: '📖',
      crew: '👥',
      'loadout-com': '🎒',
      extra: '✨',
    },
    colors: {
      primary: '#1E3A8A',
      secondary: '#3B82F6',
      accent: '#FBBF24',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: '#111827',
    },
  },
};
```

**Fichier** : `shared/config/systems/otherscape.config.ts`

```typescript
// shared/config/systems/otherscape.config.ts

import type { SystemConfig } from '~/shared/types/system';

export const OtherscapeConfig: SystemConfig = {
  slug: 'otherscape',
  name: 'Otherscape',
  shortName: 'OS',
  version: '1.0',

  themeTypes: [
    {
      id: 'mythos-os',
      name: 'Mythos',
      sortOrder: 1,
      increaseLabel: 'Upgrade',
      decreaseLabel: 'Decay',
      identityLabel: 'Ritual',
      powerTags: 3,
      weaknessTags: 2,
      trackingType: 'attention',
    },
    {
      id: 'noise',
      name: 'Noise',
      sortOrder: 2,
      increaseLabel: 'Upgrade',
      decreaseLabel: 'Decay',
      identityLabel: 'Itch',
      powerTags: 3,
      weaknessTags: 2,
      trackingType: 'attention',
    },
    {
      id: 'self',
      name: 'Self',
      sortOrder: 3,
      increaseLabel: 'Upgrade',
      decreaseLabel: 'Decay',
      identityLabel: 'Identity',
      powerTags: 3,
      weaknessTags: 2,
      trackingType: 'attention',
    },
    {
      id: 'crew-os',
      name: 'Crew',
      sortOrder: 5,
      increaseLabel: 'Upgrade',
      decreaseLabel: 'Decay',
      identityLabel: 'Crew Identity',
      powerTags: 3,
      weaknessTags: 2,
      trackingType: 'attention',
      specials: ['crew'],
    },
    {
      id: 'loadout-os',
      name: 'Loadout',
      sortOrder: 100,
      increaseLabel: '',
      decreaseLabel: '',
      identityLabel: '',
      powerTags: 6,
      weaknessTags: 0,
      trackingType: 'dual',
      specials: ['loadout'],
    },
  ],

  terminology: {
    buildUpPoints: 'Evolution Points',
    evolution: 'Evolution',
    collective: 'Scale',
    status: 'Status',
    tag: 'Tag',
    move: 'Move',
    character: 'Character',
    crew: 'Crew',
  },

  rules: {
    attentionMax: 5,
    attentionPerImprove: 3,
    usesMilestones: false,
    statusAdditionSystem: 'mist-engine',
    statusSubtractionSystem: 'mist-engine',
    tagBurnSystem: 'mist-engine',
    tagCreationCost: 2,
    statusCreationCost: 1,
    autoFailAutoSuccess: true,
    autoWeakness: true,
  },

  pdf: {
    characterSheetLayout: 'otherscape',
    primaryColor: '#7C3AED',      // Violet cyberpunk
    secondaryColor: '#A78BFA',    // Violet clair
    accentColor: '#10B981',       // Vert néon
    fontFamily: 'Orbitron',
    fontSizes: {
      title: 24,
      heading: 18,
      body: 12,
      small: 10,
    },
    sections: {
      themeCards: true,
      heroCard: false,
      trackers: true,
    },
    showEmptyTags: false,
    showMilestones: false,
    compactMode: false,
  },

  assets: {
    themeTypeIcons: {
      'mythos-os': '🔮',
      noise: '📡',
      self: '🧠',
      'crew-os': '👥',
      'loadout-os': '🎒',
    },
    colors: {
      primary: '#7C3AED',
      secondary: '#A78BFA',
      accent: '#10B981',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
    },
  },
};
```

**Fichier** : `shared/config/systems/index.ts`

```typescript
// shared/config/systems/index.ts

import { LITMConfig } from './litm.config';
import { CityOfMistConfig } from './com.config';
import { OtherscapeConfig } from './otherscape.config';
import type { SystemConfig, SystemSlug } from '~/shared/types/system';

/**
 * Registry de tous les systèmes disponibles
 */
export const SYSTEM_REGISTRY: Record<SystemSlug, SystemConfig> = {
  litm: LITMConfig,
  com: CityOfMistConfig,
  otherscape: OtherscapeConfig,
  custom: LITMConfig, // Fallback
};

/**
 * Retourne la config d'un système par son slug
 */
export function getSystemConfig(slug: SystemSlug): SystemConfig {
  return SYSTEM_REGISTRY[slug] || SYSTEM_REGISTRY.litm;
}

/**
 * Liste de tous les slugs de systèmes disponibles
 */
export const AVAILABLE_SYSTEMS: SystemSlug[] = ['litm', 'com', 'otherscape'];
```

### 4. Composable `useSystemConfig()`

**Fichier** : `app/composables/useSystemConfig.ts`

```typescript
// app/composables/useSystemConfig.ts

import { computed } from 'vue';
import type { SystemConfig, SystemSlug, ThemeTypeConfig } from '~/shared/types/system';
import { getSystemConfig } from '~/shared/config/systems';

/**
 * Composable pour accéder à la configuration du système actif
 *
 * Usage:
 * ```ts
 * const { config, themeTypes, terminology, rules } = useSystemConfig('litm');
 * ```
 */
export function useSystemConfig(systemSlug: SystemSlug | Ref<SystemSlug>) {
  const slug = isRef(systemSlug) ? systemSlug : ref(systemSlug);

  /**
   * Configuration complète du système
   */
  const config = computed<SystemConfig>(() => {
    return getSystemConfig(slug.value);
  });

  /**
   * Types de thèmes du système
   */
  const themeTypes = computed<ThemeTypeConfig[]>(() => {
    return config.value.themeTypes;
  });

  /**
   * Terminologie du système
   */
  const terminology = computed(() => {
    return config.value.terminology;
  });

  /**
   * Règles du système
   */
  const rules = computed(() => {
    return config.value.rules;
  });

  /**
   * Configuration PDF du système
   */
  const pdfConfig = computed(() => {
    return config.value.pdf;
  });

  /**
   * Assets du système
   */
  const assets = computed(() => {
    return config.value.assets;
  });

  /**
   * Retourne un type de thème par son ID
   */
  const getThemeType = (themeTypeId: string): ThemeTypeConfig | undefined => {
    return themeTypes.value.find(tt => tt.id === themeTypeId);
  };

  /**
   * Retourne le label d'augmentation pour un type de thème
   */
  const getIncreaseLabel = (themeTypeId: string): string => {
    const themeType = getThemeType(themeTypeId);
    return themeType?.increaseLabel || 'Increase';
  };

  /**
   * Retourne le label de diminution pour un type de thème
   */
  const getDecreaseLabel = (themeTypeId: string): string => {
    const themeType = getThemeType(themeTypeId);
    return themeType?.decreaseLabel || 'Decrease';
  };

  /**
   * Retourne le label d'identité pour un type de thème
   */
  const getIdentityLabel = (themeTypeId: string): string => {
    const themeType = getThemeType(themeTypeId);
    return themeType?.identityLabel || 'Identity';
  };

  /**
   * Vérifie si le système utilise des milestones
   */
  const usesMilestones = computed<boolean>(() => {
    return rules.value.usesMilestones;
  });

  /**
   * Retourne l'icône d'un type de thème
   */
  const getThemeTypeIcon = (themeTypeId: string): string => {
    return assets.value.themeTypeIcons[themeTypeId] || '📝';
  };

  return {
    // Config complète
    config,

    // Parties spécifiques
    themeTypes,
    terminology,
    rules,
    pdfConfig,
    assets,

    // Helpers
    getThemeType,
    getIncreaseLabel,
    getDecreaseLabel,
    getIdentityLabel,
    getThemeTypeIcon,
    usesMilestones,
  };
}
```

### 5. Store Pinia `systemStore`

**Fichier** : `shared/stores/systemStore.ts`

```typescript
// shared/stores/systemStore.ts

import { defineStore } from 'pinia';
import type { SystemSlug, SystemConfig } from '~/shared/types/system';
import { getSystemConfig, AVAILABLE_SYSTEMS } from '~/shared/config/systems';

export const useSystemStore = defineStore('system', () => {
  // State
  const currentSystemSlug = ref<SystemSlug>('litm');
  const availableSystems = ref<SystemSlug[]>(AVAILABLE_SYSTEMS);

  // Getters
  const currentConfig = computed<SystemConfig>(() => {
    return getSystemConfig(currentSystemSlug.value);
  });

  const systemName = computed<string>(() => {
    return currentConfig.value.name;
  });

  const systemShortName = computed<string>(() => {
    return currentConfig.value.shortName;
  });

  // Actions
  async function setSystem(slug: SystemSlug) {
    if (!availableSystems.value.includes(slug)) {
      console.error(`System ${slug} not available`);
      return;
    }

    currentSystemSlug.value = slug;

    // Persiste dans localStorage
    if (import.meta.client) {
      localStorage.setItem('brumisater:system', slug);
    }
  }

  function loadPersistedSystem() {
    if (import.meta.client) {
      const persisted = localStorage.getItem('brumisater:system') as SystemSlug;
      if (persisted && availableSystems.value.includes(persisted)) {
        currentSystemSlug.value = persisted;
      }
    }
  }

  // Initialisation
  loadPersistedSystem();

  return {
    // State
    currentSystemSlug: readonly(currentSystemSlug),
    availableSystems: readonly(availableSystems),

    // Getters
    currentConfig,
    systemName,
    systemShortName,

    // Actions
    setSystem,
  };
});
```

### 6. API Route - Récupération Système

**Fichier** : `server/api/systems/[slug].get.ts`

```typescript
// server/api/systems/[slug].get.ts

import { prisma } from '~/server/utils/prisma';
import type { SystemSlug } from '~/shared/types/system';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') as SystemSlug;

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'System slug is required',
    });
  }

  // Récupère depuis DB
  const system = await prisma.system.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      shortName: true,
      version: true,
      config: true,
      active: true,
    },
  });

  if (!system) {
    throw createError({
      statusCode: 404,
      message: `System ${slug} not found`,
    });
  }

  if (!system.active) {
    throw createError({
      statusCode: 403,
      message: `System ${slug} is inactive`,
    });
  }

  return system;
});
```

**Fichier** : `server/api/systems/index.get.ts`

```typescript
// server/api/systems/index.get.ts

import { prisma } from '~/server/utils/prisma';

/**
 * Liste tous les systèmes actifs
 */
export default defineCachedEventHandler(async (event) => {
  const systems = await prisma.system.findMany({
    where: { active: true },
    select: {
      id: true,
      slug: true,
      name: true,
      shortName: true,
      version: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: 'asc' },
  });

  return systems;
}, {
  maxAge: 60 * 60, // Cache 1h (données statiques)
  name: 'systems-list',
  getKey: () => 'systems:all',
});
```

### 7. Migration Prisma - Seed Systems

**Fichier** : `prisma/seed-systems.ts`

```typescript
// prisma/seed-systems.ts

import { PrismaClient } from '@prisma/client';
import { LITMConfig, CityOfMistConfig, OtherscapeConfig } from '../shared/config/systems';

const prisma = new PrismaClient();

async function seedSystems() {
  console.log('Seeding systems...');

  // LITM
  await prisma.system.upsert({
    where: { slug: 'litm' },
    update: { config: LITMConfig as any },
    create: {
      slug: 'litm',
      name: 'Legends in the Mist',
      shortName: 'LITM',
      version: '1.0',
      active: true,
      sortOrder: 1,
      config: LITMConfig as any,
    },
  });

  // City of Mist (inactif pour MVP)
  await prisma.system.upsert({
    where: { slug: 'com' },
    update: { config: CityOfMistConfig as any },
    create: {
      slug: 'com',
      name: 'City of Mist',
      shortName: 'CoM',
      version: '1.0',
      active: false, // Inactif en MVP
      sortOrder: 2,
      config: CityOfMistConfig as any,
    },
  });

  // Otherscape (inactif pour MVP)
  await prisma.system.upsert({
    where: { slug: 'otherscape' },
    update: { config: OtherscapeConfig as any },
    create: {
      slug: 'otherscape',
      name: 'Otherscape',
      shortName: 'OS',
      version: '1.0',
      active: false, // Inactif en MVP
      sortOrder: 3,
      config: OtherscapeConfig as any,
    },
  });

  console.log('Systems seeded successfully');
}

seedSystems()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 8. Utilisation dans les Composants

**Exemple** : `app/components/ThemeCard.vue`

```vue
<!-- app/components/ThemeCard.vue -->
<script setup lang="ts">
import type { ThemeCard } from '@prisma/client';

const props = defineProps<{
  themeCard: ThemeCard;
  systemSlug: SystemSlug;
}>();

const { getThemeType, getIncreaseLabel, getDecreaseLabel, getIdentityLabel, usesMilestones } =
  useSystemConfig(props.systemSlug);

const themeType = computed(() => getThemeType(props.themeCard.themeType));
const increaseLabel = computed(() => getIncreaseLabel(props.themeCard.themeType));
const decreaseLabel = computed(() => getDecreaseLabel(props.themeCard.themeType));
const identityLabel = computed(() => getIdentityLabel(props.themeCard.themeType));

// Affichage conditionnel des milestones selon le système
const showMilestones = computed(() => usesMilestones.value);
</script>

<template>
  <div class="theme-card">
    <h3>{{ themeType?.name || themeCard.name }}</h3>

    <!-- Identity/Quest -->
    <div class="identity">
      <label>{{ identityLabel }}</label>
      <p>{{ themeCard.identity }}</p>
    </div>

    <!-- Attention / Milestones (selon système) -->
    <div v-if="showMilestones" class="milestones">
      <label>Milestones</label>
      <div class="milestone-track">
        <!-- ... -->
      </div>
    </div>
    <div v-else class="attention">
      <label>Attention</label>
      <div class="attention-track">
        <!-- ... -->
      </div>
    </div>

    <!-- Power Tags -->
    <div class="power-tags">
      <h4>Power Tags</h4>
      <!-- ... -->
    </div>

    <!-- Weakness Tags -->
    <div class="weakness-tags">
      <h4>Weakness Tags</h4>
      <!-- ... -->
    </div>

    <!-- Actions (avec labels dynamiques) -->
    <div class="actions">
      <button @click="improveTheme">{{ increaseLabel }}</button>
      <button @click="abandonTheme">{{ decreaseLabel }}</button>
    </div>
  </div>
</template>
```

### 9. Intégration PDF Multi-Systèmes

**Fichier** : `server/utils/pdf/generators/character-sheet.ts` (extrait)

```typescript
// server/utils/pdf/generators/character-sheet.ts

import PDFDocument from 'pdfkit';
import type { Character } from '@prisma/client';
import type { SystemConfig } from '~/shared/types/system';

export async function generateCharacterSheet(
  character: Character,
  systemConfig: SystemConfig
): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Applique couleurs et fonts du système
  const { primaryColor, fontFamily, fontSizes } = systemConfig.pdf;

  // Header avec couleur système
  doc.fillColor(primaryColor)
     .font(fontFamily)
     .fontSize(fontSizes.title)
     .text(character.name, { align: 'center' });

  // Terminologie dynamique
  const { terminology } = systemConfig;
  doc.fontSize(fontSizes.heading)
     .text(`${terminology.buildUpPoints}: ${character.buildUpPoints}`);

  // Layout spécifique au système
  switch (systemConfig.pdf.characterSheetLayout) {
    case 'litm':
      await renderLITMLayout(doc, character, systemConfig);
      break;
    case 'com':
      await renderCoMLayout(doc, character, systemConfig);
      break;
    case 'otherscape':
      await renderOtherscapeLayout(doc, character, systemConfig);
      break;
  }

  doc.end();

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}
```

---

## Roadmap d'Implémentation

### Phase 1 - Fondations (Semaine 1-2)

- [ ] Migration Prisma : Ajouter tables `System`
- [ ] Créer types TypeScript (`shared/types/system.ts`)
- [ ] Créer configurations systèmes (LITM, CoM, OS dans `shared/config/systems/`)
- [ ] Seed DB avec les 3 systèmes (LITM actif uniquement)

### Phase 2 - Composable & Store (Semaine 3)

- [ ] Créer composable `useSystemConfig()`
- [ ] Créer store Pinia `systemStore`
- [ ] Tests unitaires pour composable et store

### Phase 3 - API Routes (Semaine 4)

- [ ] Route `/api/systems/[slug].get.ts` - Récupération config système
- [ ] Route `/api/systems/index.get.ts` - Liste systèmes actifs
- [ ] Caching avec `defineCachedEventHandler`

### Phase 4 - Intégration Composants (Semaine 5-6)

- [ ] Adapter `ThemeCard.vue` pour multi-systèmes
- [ ] Adapter `CharacterSheet.vue` pour terminologie dynamique
- [ ] Adapter `HeroCard.vue` pour affichage conditionnel
- [ ] Tests E2E Playwright

### Phase 5 - Intégration PDF (Semaine 7)

- [ ] Adapter générateur PDF pour `SystemConfig`
- [ ] Layouts spécifiques (LITM, CoM, OS)
- [ ] Tests de génération PDF multi-systèmes

### Phase 6 - Cache IndexedDB (Semaine 8)

- [ ] Intégrer config systèmes dans `useStaticData()`
- [ ] Cache IndexedDB pour config systèmes
- [ ] SWR (Stale-While-Revalidate)

### Phase 7 - UI Switcher (Post-MVP v1.2+)

- [ ] Composant `SystemSwitcher.vue` (dropdown sélection)
- [ ] Gestion switch système dans Playspace
- [ ] Validation switch (prévenir perte données)

---

## Avantages de cette Architecture

### 1. **Extensibilité**
- Ajout d'un nouveau système = 1 fichier de config TypeScript
- Pas de modification du code métier existant
- Support des systèmes customs (v2.0+)

### 2. **Type Safety**
- Types TypeScript stricts pour toute config système
- Autocomplétion IDE complète
- Détection erreurs à la compilation

### 3. **Performance**
- Configuration en DB Prisma (source unique)
- Cache IndexedDB côté client (offline-first)
- Pas de re-fetch à chaque playspace switch

### 4. **Maintenabilité**
- Configuration déclarative (JSON)
- Séparation concerns (config vs logique)
- Tests unitaires faciles (composable, store)

### 5. **Cohérence**
- Terminologie cohérente dans toute l'app
- Styles PDF cohérents avec système
- UX adaptée aux règles du système

### 6. **Compatibilité PDF**
- Couleurs, fonts, layouts spécifiques par système
- Sections conditionnelles (milestones, hero card, etc.)
- Assets (icônes) embarqués dans config

---

## Points d'Attention

### 1. **Migration Playspaces Existants**

Lors de l'ajout du champ `systemId` à `Playspace`, migrer les playspaces existants :

```typescript
// Migration manuelle ou script
await prisma.playspace.updateMany({
  where: { systemId: null },
  data: { systemId: litm.id }, // ID du système LITM
});
```

### 2. **Validation Config Système**

Utiliser Zod pour valider les configs avant seed :

```typescript
// shared/types/system.ts (ajout)
import { z } from 'zod';

export const SystemConfigSchema = z.object({
  slug: z.enum(['litm', 'com', 'otherscape', 'custom']),
  name: z.string(),
  // ... compléter
});

export type SystemConfig = z.infer<typeof SystemConfigSchema>;
```

### 3. **Gestion Erreurs Switch Système**

Prévenir le switch si personnages existent dans playspace :

```typescript
async function switchSystem(playspaceId: string, newSystemSlug: SystemSlug) {
  const charactersCount = await prisma.character.count({
    where: { playspaceId },
  });

  if (charactersCount > 0) {
    throw new Error('Cannot switch system with existing characters');
  }

  await prisma.playspace.update({
    where: { id: playspaceId },
    data: { systemId: newSystem.id },
  });
}
```

### 4. **Performance IndexedDB**

Cache la config système dans IndexedDB avec TTL long (7 jours) :

```typescript
const systemConfigCache = await useStaticData('systems', systemSlug, {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
});
```

### 5. **Tests Multi-Systèmes**

Créer fixtures de test pour chaque système :

```typescript
// tests/fixtures/systems.ts
export const testSystems = {
  litm: { /* ... */ },
  com: { /* ... */ },
  otherscape: { /* ... */ },
};
```

---

## Comparaison avec Taragnor

| Aspect | Taragnor (FoundryVTT) | Brumisater (Nuxt 4) |
|--------|----------------------|---------------------|
| **Architecture** | Classes OOP + Héritage | Config JSON + Composables |
| **Storage** | NeDB (embedded) | PostgreSQL + Prisma |
| **State** | Global singleton | Pinia stores |
| **Activation** | Hooks + registerSheets | API routes + Composables |
| **Templates** | Handlebars (.hbs) | Vue SFC (.vue) |
| **Styles** | CSS classes dynamiques | UnoCSS + Config |
| **Localisation** | i18n système | Config JSON + i18n |
| **PDF** | N/A | PDFKit + SystemConfig |

---

## Références

### Repositories Analysés
- [taragnor/city-of-mist](https://github.com/taragnor/city-of-mist) - Foundry VTT system

### Fichiers Clés Analysés
- `src/city-of-mist/module/config/system-module.ts` - Registry central
- `src/city-of-mist/module/config/settings-object.ts` - Settings Foundry
- `src/city-of-mist/module/systemModule/baseSystemModule.ts` - Interface commune
- `src/city-of-mist/module/systemModule/litm-system.ts` - Implémentation LITM
- `src/city-of-mist/module/systemModule/otherscape.ts` - Implémentation Otherscape
- `src/city-of-mist/module/systemModule/com-system.ts` - Implémentation City of Mist

### Documentation Liée
- [02-modele-donnees-prisma.md](./02-modele-donnees-prisma.md) - Schéma DB
- [07-adaptation-brumisa3-mvp.md](./07-adaptation-brumisa3-mvp.md) - Scope MVP
- [08-caching-indexeddb-donnees-statiques.md](./08-caching-indexeddb-donnees-statiques.md) - Caching

---

## Maintenance

Cette documentation doit être mise à jour lors de :
- Ajout d'un nouveau système Mist Engine
- Modification de l'interface `SystemConfig`
- Ajout de nouvelles règles système
- Changements dans l'architecture PDF

**Dernière mise à jour** : 2025-01-19 (Analyse Taragnor + Architecture multi-systèmes)