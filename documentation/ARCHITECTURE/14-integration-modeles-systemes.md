# Intégration Modèles TypeScript et Systèmes de Jeu

## Vue d'ensemble

Comment les **modèles TypeScript génériques** (Character, ThemeCard, Tracker) s'intègrent avec les **configurations de systèmes** (Mist, City of Mist, LITM) pour une validation contextuelle.

**Principe clé** : Les modèles sont génériques, la validation s'adapte au système via la configuration.

---

## Architecture

### Modèles Génériques

```
Character
  ├── systemId: "mist" | "city-of-mist"
  ├── hackId?: "litm" | ...
  └── ThemeCards[]
      ├── type: string (validé selon systemId)
      ├── powerTags: string[]
      └── weaknessTags: string[]
```

### Configuration Système

```typescript
// server/config/systems/mist.ts
export const MIST_SYSTEM = {
  themeTypes: [
    { code: 'origin', minTags: 3, maxTags: 5, allowWeaknessTags: true },
    { code: 'adventure', minTags: 3, maxTags: 5, allowWeaknessTags: true },
    // ...
  ]
}

// server/config/systems/city-of-mist.ts
export const CITY_OF_MIST_SYSTEM = {
  themeTypes: [
    { code: 'mythos', minTags: 3, maxTags: 5, allowWeaknessTags: true },
    { code: 'logos', minTags: 3, maxTags: 5, allowWeaknessTags: true },
    // ...
  ]
}
```

---

## Workflow de Validation

### Étape 1 : Validation de Base (Modèle)

```typescript
// Validation avec le modèle CHARACTER_MODEL
const validatedData = await validateBody(event, 'Character', 'create')

// Vérifie :
// - Types de champs corrects (string, uuid, etc.)
// - Champs requis présents
// - Longueurs max respectées
// - Formats valides (email, url, etc.)
```

### Étape 2 : Validation Contextuelle (Système)

```typescript
// Récupérer la config du système
const systemConfig = getSystemConfig(validatedData.systemId)

// Valider selon les règles du système
if (!systemConfig) {
  throw createError({ statusCode: 400, message: 'Invalid system' })
}
```

### Étape 3 : Validation Métier

```typescript
// Exemple pour ThemeCard
const themeTypeConfig = systemConfig.themeTypes.find(
  t => t.code === themeData.type
)

if (!themeTypeConfig) {
  throw createError({
    statusCode: 400,
    message: `Invalid theme type "${themeData.type}" for system ${systemId}`
  })
}

// Vérifier nombre de tags
const totalTags = themeData.powerTags.length + themeData.weaknessTags.length

if (totalTags < themeTypeConfig.minTags) {
  throw createError({
    statusCode: 400,
    message: `Minimum ${themeTypeConfig.minTags} tags required`
  })
}
```

---

## Exemples Concrets

### Création de Personnage

```typescript
// POST /api/characters

export default defineEventHandler(async (event) => {
  // 1. Validation modèle
  const data = await validateBody(event, 'Character', 'create')

  // 2. Validation système
  const systemConfig = getSystemConfig(data.systemId)
  if (!systemConfig) {
    throw createError({ statusCode: 400, message: 'Invalid system' })
  }

  // 3. Validation hack (si applicable)
  if (data.hackId === 'litm' && data.systemId !== 'mist') {
    throw createError({ statusCode: 400, message: 'LITM requires Mist system' })
  }

  // 4. Créer en DB
  const character = await prisma.characters.create({ data })

  return { success: true, data: character }
})
```

### Création de Thème

```typescript
// POST /api/characters/:id/themes

export default defineEventHandler(async (event) => {
  const characterId = getRouterParam(event, 'id')

  // 1. Récupérer personnage pour connaître le système
  const character = await prisma.characters.findUnique({
    where: { id: characterId }
  })

  // 2. Validation modèle
  const data = await validateBody(event, 'ThemeCard', 'create')

  // 3. Récupérer config système
  const systemConfig = getSystemConfig(character.systemId)

  // 4. Valider type de thème selon système
  const themeTypeConfig = systemConfig.themeTypes.find(
    t => t.code === data.type
  )

  if (!themeTypeConfig) {
    const validTypes = systemConfig.themeTypes.map(t => t.code).join(', ')
    throw createError({
      statusCode: 400,
      message: `Invalid theme type. Valid types for ${character.systemId}: ${validTypes}`
    })
  }

  // 5. Valider nombre de tags
  const totalTags = data.powerTags.length + data.weaknessTags.length

  if (totalTags < themeTypeConfig.minTags ||
      totalTags > themeTypeConfig.maxTags) {
    throw createError({
      statusCode: 400,
      message: `Theme requires ${themeTypeConfig.minTags}-${themeTypeConfig.maxTags} tags`
    })
  }

  // 6. Valider weakness tags
  if (!themeTypeConfig.allowWeaknessTags && data.weaknessTags.length > 0) {
    throw createError({
      statusCode: 400,
      message: 'Weakness tags not allowed for this theme type'
    })
  }

  // 7. Créer en DB
  const theme = await prisma.themeCards.create({
    data: { ...data, characterId }
  })

  return { success: true, data: theme }
})
```

---

## Validation Complète de Personnage

Exemple de validation complète lors de la sauvegarde/publication :

```typescript
// POST /api/characters/:id/validate

export default defineEventHandler(async (event) => {
  const characterId = getRouterParam(event, 'id')

  // Récupérer personnage avec tous ses thèmes
  const character = await prisma.characters.findUnique({
    where: { id: characterId },
    include: {
      themeCards: true,
      trackers: true
    }
  })

  if (!character) {
    throw createError({ statusCode: 404, message: 'Character not found' })
  }

  // Récupérer config système (ou hack si applicable)
  const config = character.hackId
    ? await getHackConfig(character.hackId)
    : getSystemConfig(character.systemId)

  const errors: string[] = []

  // Valider nombre de thèmes
  const themeCount = character.themeCards.length

  if (themeCount < config.validation.minThemes) {
    errors.push(`Minimum ${config.validation.minThemes} themes required (you have ${themeCount})`)
  }

  if (themeCount > config.validation.maxThemes) {
    errors.push(`Maximum ${config.validation.maxThemes} themes allowed (you have ${themeCount})`)
  }

  // Valider Hero Card (si requis)
  if (config.validation.requiresHeroCard) {
    if (!character.data?.heroCard) {
      errors.push('Hero Card is required for this system')
    }
  }

  // Valider chaque thème
  for (const theme of character.themeCards) {
    const themeTypeConfig = config.themeTypes.find(t => t.code === theme.type)

    if (!themeTypeConfig) {
      errors.push(`Invalid theme type: ${theme.type}`)
      continue
    }

    const totalTags = theme.powerTags.length + theme.weaknessTags.length

    if (totalTags < themeTypeConfig.minTags) {
      errors.push(`Theme "${theme.title}" needs at least ${themeTypeConfig.minTags} tags`)
    }

    if (totalTags > themeTypeConfig.maxTags) {
      errors.push(`Theme "${theme.title}" can have maximum ${themeTypeConfig.maxTags} tags`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
})
```

---

## Helpers Réutilisables

### Validateur de Personnage

```typescript
// server/utils/character-validator.ts

import { getSystemConfig } from '~/server/config/systems'
import { getHackConfig } from '~/server/config/hacks'

export async function validateCharacter(character: any) {
  const config = character.hackId
    ? await getHackConfig(character.hackId)
    : getSystemConfig(character.systemId)

  if (!config) {
    throw new Error(`Invalid system/hack: ${character.systemId}/${character.hackId}`)
  }

  const errors: string[] = []

  // Validation nombre de thèmes
  if (character.themeCards.length < config.validation.minThemes) {
    errors.push(`Minimum ${config.validation.minThemes} themes required`)
  }

  // Validation Hero Card
  if (config.validation.requiresHeroCard && !character.data?.heroCard) {
    errors.push('Hero Card is required')
  }

  // Validation thèmes
  for (const theme of character.themeCards) {
    const themeErrors = validateTheme(theme, config)
    errors.push(...themeErrors)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateTheme(theme: any, config: any) {
  const errors: string[] = []

  const themeTypeConfig = config.themeTypes.find((t: any) => t.code === theme.type)

  if (!themeTypeConfig) {
    errors.push(`Invalid theme type: ${theme.type}`)
    return errors
  }

  const totalTags = theme.powerTags.length + theme.weaknessTags.length

  if (totalTags < themeTypeConfig.minTags) {
    errors.push(`Theme "${theme.title}" requires at least ${themeTypeConfig.minTags} tags`)
  }

  if (totalTags > themeTypeConfig.maxTags) {
    errors.push(`Theme "${theme.title}" allows maximum ${themeTypeConfig.maxTags} tags`)
  }

  if (!themeTypeConfig.allowWeaknessTags && theme.weaknessTags.length > 0) {
    errors.push(`Theme "${theme.title}" does not allow weakness tags`)
  }

  return errors
}
```

---

## Avantages de cette Architecture

### 1. Séparation des Responsabilités

- **Modèles** : Validation de structure (types, formats, longueurs)
- **Systèmes** : Validation métier (règles de jeu)

### 2. Réutilisabilité

- Un seul modèle `Character` pour tous les systèmes
- Pas de duplication de code
- Facile à étendre avec de nouveaux systèmes

### 3. Type Safety

```typescript
// TypeScript sait que character.systemId est valide
const config = getSystemConfig(character.systemId)

// TypeScript sait que themeTypeConfig a minTags, maxTags, etc.
if (totalTags < themeTypeConfig.minTags) {
  // ...
}
```

### 4. Maintenabilité

- Modification des règles → un seul endroit (config système)
- Ajout d'un système → juste une nouvelle config
- Tests isolés (modèles vs règles métier)

---

## Tests

### Test de Validation Modèle

```typescript
// tests/models/character.validation.test.ts

import { createValidator } from '~/server/config/models/validator'
import { CHARACTER_MODEL } from '~/server/config/models'

describe('Character Model Validation', () => {
  const validator = createValidator(CHARACTER_MODEL)

  it('should validate correct character data', () => {
    const data = {
      userId: 1,
      systemId: 'mist',
      name: 'Test Hero'
    }

    const result = validator.validateCreate(data)
    expect(result.success).toBe(true)
  })

  it('should reject missing required fields', () => {
    const data = {
      userId: 1
      // Missing systemId and name
    }

    const result = validator.validateCreate(data)
    expect(result.success).toBe(false)
  })
})
```

### Test de Validation Système

```typescript
// tests/validation/character-system.test.ts

import { validateCharacter } from '~/server/utils/character-validator'

describe('Character System Validation', () => {
  it('should validate Mist character with correct themes', async () => {
    const character = {
      systemId: 'mist',
      themeCards: [
        { type: 'origin', powerTags: ['tag1', 'tag2', 'tag3'], weaknessTags: [] },
        { type: 'adventure', powerTags: ['tag1', 'tag2', 'tag3'], weaknessTags: [] },
        { type: 'greatness', powerTags: ['tag1', 'tag2', 'tag3'], weaknessTags: [] },
        { type: 'fellowship', powerTags: ['tag1', 'tag2', 'tag3'], weaknessTags: [] }
      ],
      data: { heroCard: { name: 'Test' } }
    }

    const result = await validateCharacter(character)
    expect(result.valid).toBe(true)
  })

  it('should reject invalid theme type for system', async () => {
    const character = {
      systemId: 'mist',
      themeCards: [
        { type: 'mythos', powerTags: ['tag1'], weaknessTags: [] }  // mythos = CoM
      ]
    }

    const result = await validateCharacter(character)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid theme type: mythos')
  })
})
```

---

## Récapitulatif

```
┌─────────────────────────────────────────────────┐
│ 1. Validation Modèle (TypeScript + Zod)        │
│    - Types de champs                            │
│    - Champs requis                              │
│    - Formats (email, uuid, etc.)                │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 2. Validation Système (Config)                  │
│    - Types de thèmes valides                    │
│    - Nombre min/max de thèmes                   │
│    - Règles spécifiques (Hero Card, etc.)       │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 3. Validation Métier (Helpers)                  │
│    - Cohérence globale                          │
│    - Règles complexes                           │
│    - Logique applicative                        │
└─────────────────────────────────────────────────┘
```

---

## Ressources

### Documentation Liée
- [12-configuration-systemes-jeu.md](./12-configuration-systemes-jeu.md)
- [13-modeles-typescript-validation.md](./13-modeles-typescript-validation.md)

### Code Source
- `server/config/models/` - Modèles TypeScript
- `server/config/systems/` - Configs systèmes
- `server/utils/character-validator.ts` - Helpers validation

---

**Dernière mise à jour** : 2025-01-20 (Intégration modèles et systèmes)
