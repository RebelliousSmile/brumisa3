# Configuration des Systèmes de Jeu

## Vue d'ensemble

Architecture simple et pragmatique pour définir le fonctionnement programmatique des systèmes de jeu (Mist et City of Mist) dans Brumisa3.

**Principe** : Fichiers de configuration TypeScript pour les systèmes de base, avec possibilité d'extension via hacks.

**Systèmes supportés** :
- **Mist** (système de base)
- **City of Mist**

**Note** : LITM (Legends in the Mist) est un hack du système Mist, non un système séparé.

---

## Structure des Fichiers

```
server/config/
  ├── systems/
  │   ├── index.ts              # Registry central systèmes
  │   ├── mist.ts               # Configuration Mist
  │   └── city-of-mist.ts       # Configuration City of Mist
  └── hacks/
      ├── index.ts              # Registry central hacks
      └── litm.ts               # Configuration LITM (hack de Mist)
```

---

## Configuration d'un Système

### Structure TypeScript

Chaque système définit :

1. **Identité** : id, code, nom, version
2. **Types de thèmes** : liste des types disponibles avec leurs contraintes
3. **Mécaniques de progression** : Milestone (Mist) ou Attention (City of Mist)
4. **Règles de validation** : min/max thèmes, tags, Hero Card
5. **Configuration PDF** : ordre des thèmes, sections incluses

### Exemple : Mist

```typescript
// server/config/systems/mist.ts

export const MIST_SYSTEM = {
  id: 'mist',
  code: 'mist',
  name: 'Mist',
  version: '1.0.0',

  // Types de thèmes disponibles
  themeTypes: [
    {
      code: 'origin',
      name: 'Origin',
      minTags: 3,
      maxTags: 5,
      allowWeaknessTags: true,
      color: '#1E40AF',
      order: 1
    },
    {
      code: 'adventure',
      name: 'Adventure',
      minTags: 3,
      maxTags: 5,
      allowWeaknessTags: true,
      color: '#DC2626',
      order: 2
    },
    // ... autres types
  ],

  // Mécanique de progression
  progression: {
    type: 'milestone',
    maxLevel: 20,
    milestonesPerLevel: 10
  },

  // Règles de validation
  validation: {
    minThemes: 4,
    maxThemes: 6,
    requiresHeroCard: true,
    maxTagsPerTheme: 5,
    maxPowerTags: 4,
    maxWeaknessTags: 1
  },

  // Configuration PDF
  pdf: {
    includeHeroCard: true,
    themeOrder: ['origin', 'adventure', 'greatness', 'fellowship', 'backpack']
  }
}
```

### Exemple : City of Mist

```typescript
// server/config/systems/city-of-mist.ts

export const CITY_OF_MIST_SYSTEM = {
  id: 'city-of-mist',
  code: 'com',
  name: 'City of Mist',
  version: '1.0.0',

  themeTypes: [
    {
      code: 'mythos',
      name: 'Mythos',
      minTags: 3,
      maxTags: 5,
      allowWeaknessTags: true,
      color: '#8B0000',
      order: 1
    },
    {
      code: 'logos',
      name: 'Logos',
      minTags: 3,
      maxTags: 5,
      allowWeaknessTags: true,
      color: '#1E3A8A',
      order: 2
    },
    // ... autres types
  ],

  progression: {
    type: 'attention',
    cracksToAttention: 3,
    attentionToFade: 3
  },

  validation: {
    minThemes: 4,
    maxThemes: 8,
    requiresHeroCard: false,  // Pas de Hero Card en City of Mist
    maxTagsPerTheme: 5,
    maxPowerTags: 4,
    maxWeaknessTags: 1
  },

  pdf: {
    includeHeroCard: false,
    themeOrder: ['mythos', 'logos', 'crew', 'mist', 'loadout']
  }
}
```

---

## Registry Central

```typescript
// server/config/systems/index.ts

import { MIST_SYSTEM } from './mist'
import { CITY_OF_MIST_SYSTEM } from './city-of-mist'

export type SystemConfig = typeof MIST_SYSTEM | typeof CITY_OF_MIST_SYSTEM

export const SYSTEMS = {
  mist: MIST_SYSTEM,
  'city-of-mist': CITY_OF_MIST_SYSTEM
} as const

export type SystemId = keyof typeof SYSTEMS

// Helper pour récupérer une config
export function getSystemConfig(systemId: string): SystemConfig | undefined {
  return SYSTEMS[systemId as SystemId]
}

// Helper pour vérifier si un système existe
export function isValidSystemId(systemId: string): systemId is SystemId {
  return systemId in SYSTEMS
}

// Liste de tous les systèmes
export function getAllSystems(): SystemConfig[] {
  return Object.values(SYSTEMS)
}
```

---

## Utilisation dans le Code

### Dans les Composables

```typescript
// composables/useSystemes.ts

import type { SystemConfig } from '~/server/config/systems'

interface SystemeJeu {
  id: string
  nomComplet: string
  // ... autres champs
  config?: SystemConfig  // Configuration programmatique
}

export const useSystemes = () => {
  // ...

  /**
   * Récupère la configuration programmatique d'un système
   */
  const getSystemConfig = (systemeId: string): SystemConfig | undefined => {
    const systeme = systemes.value.find(s => s.id === systemeId)
    return systeme?.config
  }

  /**
   * Récupère les types de thèmes pour un système
   */
  const getThemeTypes = (systemeId: string) => {
    const config = getSystemConfig(systemeId)
    return config?.themeTypes || []
  }

  /**
   * Récupère les règles de validation pour un système
   */
  const getValidationRules = (systemeId: string) => {
    const config = getSystemConfig(systemeId)
    return config?.validation
  }

  return {
    // ...
    getSystemConfig,
    getThemeTypes,
    getValidationRules
  }
}
```

### Dans les Composants Vue

```vue
<script setup lang="ts">
const { getSystemConfig, getThemeTypes } = useSystemes()

// Récupérer les types de thèmes pour Mist
const themeTypes = getThemeTypes('mist')
// => [{ code: 'origin', name: 'Origin', ... }, ...]

// Récupérer toute la config
const config = getSystemConfig('mist')

// Validation dynamique
const validation = config?.validation
if (form.themes.length < validation?.minThemes) {
  errors.push(`Minimum ${validation.minThemes} themes required`)
}
</script>

<template>
  <select v-model="selectedThemeType">
    <option
      v-for="type in themeTypes"
      :key="type.code"
      :value="type.code"
    >
      {{ type.name }}
    </option>
  </select>
</template>
```

### Validation de Personnage

```typescript
function validateCharacter(systemId: string, character: any) {
  const config = getSystemConfig(systemId)
  if (!config) return { valid: false, errors: ['System not found'] }

  const errors: string[] = []
  const rules = config.validation

  // Validation nombre de thèmes
  if (character.themes.length < rules.minThemes) {
    errors.push(`Minimum ${rules.minThemes} themes required`)
  }
  if (rules.maxThemes && character.themes.length > rules.maxThemes) {
    errors.push(`Maximum ${rules.maxThemes} themes allowed`)
  }

  // Validation Hero Card
  if (rules.requiresHeroCard && !character.heroCard) {
    errors.push('Hero Card is required')
  }

  // Validation tags par thème
  for (const theme of character.themes) {
    const themeTypeConfig = config.themeTypes.find(t => t.code === theme.type)
    if (!themeTypeConfig) continue

    if (theme.tags.length < themeTypeConfig.minTags) {
      errors.push(`Theme "${theme.name}" requires minimum ${themeTypeConfig.minTags} tags`)
    }
  }

  return { valid: errors.length === 0, errors }
}
```

---

## Gestion des Hacks

### Configuration LITM (Hack de Mist)

LITM (Legends in the Mist) est un hack du système Mist. Il hérite de toute la configuration Mist avec quelques overrides.

```typescript
// server/config/hacks/litm.ts

import { MIST_SYSTEM } from '../systems/mist'

export const LITM_HACK = {
  ...MIST_SYSTEM,  // Hérite de tout Mist

  id: 'litm',
  code: 'litm',
  name: 'Legends in the Mist',
  version: '1.5.0',
  baseSystemId: 'mist',

  // Override : LITM a une Hero Card obligatoire
  validation: {
    ...MIST_SYSTEM.validation,
    requiresHeroCard: true
  }

  // Tous les autres paramètres (themeTypes, progression, pdf)
  // sont hérités du système Mist de base
}
```

### Registry des Hacks

```typescript
// server/config/hacks/index.ts

import { LITM_HACK } from './litm'

export type HackConfig = typeof LITM_HACK

export const HACKS = {
  litm: LITM_HACK
} as const

export type HackId = keyof typeof HACKS

export function getHackConfig(hackId: string): HackConfig | undefined {
  return HACKS[hackId as HackId]
}

export function isValidHackId(hackId: string): hackId is HackId {
  return hackId in HACKS
}

export function getAllHacks(): HackConfig[] {
  return Object.values(HACKS)
}
```

### API Routes pour Hacks

```typescript
// server/api/hacks/[id].get.ts

import { getHackConfig, isValidHackId } from '~/server/config/hacks'

export default defineEventHandler((event) => {
  const hackId = getRouterParam(event, 'id')

  if (!hackId || !isValidHackId(hackId)) {
    throw createError({
      statusCode: 404,
      message: `Hack not found: ${hackId}`
    })
  }

  const config = getHackConfig(hackId)

  return {
    id: config.id,
    name: config.name,
    version: config.version,
    baseSystemId: config.baseSystemId,
    config
  }
})
```

### Utilisation des Hacks

```typescript
// Dans un composant Vue
const { getHackConfig } = useSystemes()

// Récupérer la config LITM
const litmConfig = await getHackConfig('litm')
console.log(litmConfig.validation.requiresHeroCard) // true
console.log(litmConfig.themeTypes) // hérités de Mist
```

### Future Extension : Base de Données (pour hacks créés par utilisateurs)

```prisma
model Hack {
  id          String   @id @default(cuid())
  systemId    String
  code        String   @unique
  name        String
  isActive    Boolean  @default(true)

  // Configuration partielle (overrides)
  configJson  Json?

  system      System   @relation(fields: [systemId], references: [id])
}
```

**Résolution au runtime** :

```typescript
async function resolveHackConfig(systemId: string, hackId: string) {
  // 1. Charger config système de base
  const baseConfig = SYSTEMS[systemId]

  // 2. Charger config hack depuis DB
  const hack = await prisma.hack.findUnique({ where: { id: hackId } })

  // 3. Deep merge
  return deepMerge(baseConfig, hack.configJson)
}
```

---

## Avantages de cette Architecture

### 1. Simplicité
- 2 fichiers TypeScript pour 2 systèmes
- Pas de complexité inutile
- Facile à comprendre et maintenir

### 2. Type Safety
- TypeScript strict à la compilation
- Autocomplétion dans l'IDE
- Détection d'erreurs avant runtime

### 3. Performance
- Config chargée en mémoire (pas de requête DB)
- Import direct TypeScript
- Pas de parsing JSON

### 4. Maintenabilité
- Configuration déclarative
- Single Source of Truth
- Facile à tester

### 5. Extensibilité
- Ajout d'un nouveau système = 1 fichier
- Support hacks via héritage
- Personnalisation univers via DB (futur)

---

## Différences Clés : Mist vs City of Mist

| Aspect | Mist | City of Mist |
|--------|------|--------------|
| **Types de thèmes** | Origin, Adventure, Greatness, Fellowship, Backpack | Mythos, Logos, Mist, Crew, Loadout |
| **Progression** | Milestone (10 par niveau) | Attention (3 cracks = 1 attention) |
| **Hero Card** | Obligatoire | Absente |
| **Min thèmes** | 4 | 4 |
| **Max thèmes** | 6 | 8 |
| **Themebooks** | Non (création libre) | Oui (import GitHub possible) |

---

## Roadmap d'Implémentation

### Phase 1 : MVP (DONE)
- [x] Créer fichiers config Mist et City of Mist
- [x] Créer registry central systèmes
- [x] Créer hack LITM avec héritage Mist
- [x] Créer registry central hacks
- [x] API routes pour hacks
- [x] Étendre composable useSystemes
- [x] Export types TypeScript

### Phase 2 : Intégration Frontend (TODO)
- [ ] Utiliser config dans composants de création de thème
- [ ] Validation dynamique selon système
- [ ] Affichage conditionnel Hero Card
- [ ] Sélecteur de système avec preview config

### Phase 3 : Génération PDF (TODO)
- [ ] Utiliser pdf.themeOrder pour ordre des thèmes
- [ ] Utiliser pdf.includeHeroCard pour affichage
- [ ] Couleurs thèmes depuis config

### Phase 4 : Hacks (POST-MVP)
- [ ] Décider approche (TypeScript vs DB)
- [ ] Implémenter LITM comme hack de Mist
- [ ] Fonction de merge config

---

## API Routes (Future)

Pour exposer les configs via API :

```typescript
// server/api/systems/index.get.ts

import { getAllSystems } from '~/server/config/systems'

export default defineEventHandler(() => {
  const systems = getAllSystems()

  return systems.map(sys => ({
    id: sys.id,
    name: sys.name,
    version: sys.version,
    config: sys
  }))
})
```

```typescript
// server/api/systems/[id].get.ts

import { getSystemConfig, isValidSystemId } from '~/server/config/systems'

export default defineEventHandler((event) => {
  const systemId = getRouterParam(event, 'id')

  if (!systemId || !isValidSystemId(systemId)) {
    throw createError({
      statusCode: 404,
      message: 'System not found'
    })
  }

  const config = getSystemConfig(systemId)

  return {
    id: config.id,
    name: config.name,
    version: config.version,
    config
  }
})
```

---

## Tests

### Test d'Existence des Configs

```typescript
// tests/systems/config.test.ts

import { describe, it, expect } from 'vitest'
import { SYSTEMS, getSystemConfig, isValidSystemId } from '~/server/config/systems'

describe('System Configs', () => {
  it('should have mist and city-of-mist configs', () => {
    expect(SYSTEMS.mist).toBeDefined()
    expect(SYSTEMS['city-of-mist']).toBeDefined()
  })

  it('should validate system IDs', () => {
    expect(isValidSystemId('mist')).toBe(true)
    expect(isValidSystemId('city-of-mist')).toBe(true)
    expect(isValidSystemId('invalid')).toBe(false)
  })

  it('should retrieve configs by ID', () => {
    const mistConfig = getSystemConfig('mist')
    expect(mistConfig?.id).toBe('mist')
    expect(mistConfig?.themeTypes).toHaveLength(5)
  })
})
```

### Test E2E Playwright

```typescript
// tests/e2e/system-validation.spec.ts

test('should validate character according to Mist rules', async ({ page }) => {
  await page.goto('/playspaces/test-mist/characters/new')

  // Sélectionner système Mist
  await page.selectOption('[data-testid="system-select"]', 'mist')

  // Tenter de créer avec 2 thèmes (min = 4)
  await page.fill('[data-testid="character-name"]', 'Test Hero')
  // ... ajouter 2 thèmes seulement

  await page.click('[data-testid="save-character"]')

  // Vérifier erreur de validation
  await expect(page.locator('[data-testid="validation-error"]'))
    .toContainText('Minimum 4 themes required')
})
```

---

## Ressources

### Documentation Liée
- [09-architecture-multi-systemes-mist-engine.md](./09-architecture-multi-systemes-mist-engine.md) - Analyse architecture complète
- [11-systeme-traductions-multi-niveaux.md](./11-systeme-traductions-multi-niveaux.md) - Traductions i18n

### Code Source
- `server/config/systems/` - Configurations systèmes
- `composables/useSystemes.ts` - Composable Vue
- `stores/systemes.ts` - Store Pinia

---

## Maintenance

Cette documentation doit être mise à jour lors de :
- Ajout d'un nouveau système
- Modification de la structure de configuration
- Ajout de nouvelles règles de validation
- Changements dans les mécaniques de progression

**Dernière mise à jour** : 2025-01-20 (Création document configuration systèmes)
