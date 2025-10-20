# Le Playspace comme Contexte Unique

## Vue d'ensemble

Dans Brumisater, le **playspace** est le **contexte unique** qui définit l'environnement de jeu complet. Tous les composants de l'application (personnages, traductions, validation, UI) héritent de ce contexte.

**Principe fondamental** : L'utilisateur travaille toujours dans **un seul playspace à la fois** (sauf tâches admin rares).

---

## Responsabilités du Playspace

### 1. Source de Vérité pour le Système

Le playspace définit :
- **Système de jeu** : Mist, City of Mist, etc.
- **Hack optionnel** : LITM, Cyberpunk, etc.
- **Univers** : Le playspace lui-même (New York 2099, Victorian London)

```typescript
// Prisma schema
model Playspace {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text

  // Source unique de vérité
  systemId    String   // "mist", "city-of-mist"
  hackId      String?  // "litm" ou null

  // Relations
  system      System   @relation(...)
  hack        Hack?    @relation(...)

  characters  Character[]
  translations TranslationEntry[]

  dateCreation DateTime @default(now())
  dateModification DateTime @updatedAt
}
```

### 2. Contexte pour les Personnages

Les personnages **héritent** le système de leur playspace :

```typescript
model Character {
  id           String    @id
  playspaceId  String    // Référence au playspace parent

  name         String
  description  String?
  data         Json?     // Hero Card, etc.

  playspace    Playspace @relation(...)

  // PAS de systemId/hackId ici
  // (ou dénormalisés pour performance, mais playspace reste la source de vérité)
}
```

### 3. Contexte pour les Traductions

Les overrides de traduction sont **liés au playspace** :

```typescript
model TranslationEntry {
  id          String   @id
  key         String
  value       String

  level       TranslationLevel // SYSTEM, HACK, UNIVERSE

  systemId    String?
  hackId      String?
  universeId  String?  // = playspaceId

  playspace   Playspace? @relation(...)
}
```

---

## Workflow Utilisateur

### Sélection du Playspace Actif

```typescript
// Store Pinia : playspaceStore
export const usePlayspaceStore = defineStore('playspace', () => {
  const current = ref<Playspace | null>(null)

  async function setActive(playspaceId: string) {
    const playspace = await $fetch(`/api/playspaces/${playspaceId}`)

    // Change le contexte global
    current.value = playspace

    // Tous les composants réagissent automatiquement
  }

  return {
    current,
    setActive
  }
})
```

### Utilisation dans les Composants

Les composables utilisent automatiquement le playspace actif :

```vue
<script setup lang="ts">
// ✅ Contexte automatique
const { t } = useTranslations()
const systemConfig = useSystemConfig()
const characters = useCharacters()

// Tout vient du playspace actif
</script>
```

### Switch de Playspace

```vue
<script setup lang="ts">
const playspaceStore = usePlayspaceStore()

async function switchPlayspace(newPlayspaceId: string) {
  await playspaceStore.setActive(newPlayspaceId)

  // → Cache i18n invalidé pour le nouveau contexte
  // → Personnages du nouveau playspace chargés
  // → System config changé selon le nouveau système
  // → UI mise à jour automatiquement
}
</script>
```

---

## Intégration avec les Autres Architectures

### 1. System Configs (TypeScript)

Les configs systèmes sont **sélectionnées via le playspace** :

```typescript
// composables/useSystemConfig.ts

export function useSystemConfig(playspaceId?: string) {
  const playspaceStore = usePlayspaceStore()

  // Utiliser playspace actif par défaut
  const contextPlayspaceId = playspaceId || playspaceStore.current?.id

  const { data: playspace } = useFetch(`/api/playspaces/${contextPlayspaceId}`)

  // Récupérer la config depuis le playspace
  const systemConfig = computed(() => {
    const baseConfig = getSystemConfig(playspace.value.systemId)

    if (playspace.value.hackId) {
      const hackConfig = getHackConfig(playspace.value.hackId)
      return mergeConfigs(baseConfig, hackConfig)
    }

    return baseConfig
  })

  return systemConfig
}
```

### 2. Traductions i18n

Les traductions sont **résolues via le playspace** :

```typescript
// composables/useTranslations.ts

export function useTranslations(playspaceId?: string) {
  const playspaceStore = usePlayspaceStore()

  const contextPlayspaceId = playspaceId || playspaceStore.current?.id

  const { data: playspace } = useFetch(`/api/playspaces/${contextPlayspaceId}`)

  // Résolution automatique du contexte complet
  const context = computed(() => ({
    systemId: playspace.value.systemId,
    hackId: playspace.value.hackId,
    playspaceId: contextPlayspaceId
  }))

  // Fonction de traduction
  const t = async (key: string, category: string) => {
    // Résolution en cascade : SYSTEM → HACK → UNIVERSE
    return await resolveTranslation(key, category, context.value)
  }

  return { t }
}
```

### 3. Validation des Données

La validation utilise le système **du playspace** :

```typescript
// API: POST /api/characters

export default defineEventHandler(async (event) => {
  const data = await validateBody(event, 'Character', 'create')

  // 1. Récupérer le playspace (source de vérité)
  const playspace = await prisma.playspace.findUnique({
    where: { id: data.playspaceId }
  })

  // 2. Récupérer la config système depuis le playspace
  const systemConfig = playspace.hackId
    ? getHackConfig(playspace.hackId)
    : getSystemConfig(playspace.systemId)

  // 3. Valider selon les règles du système
  // ...
})
```

---

## Avantages de cette Architecture

### 1. Cohérence Garantie

**Impossible** de créer un personnage incompatible avec son playspace :

```typescript
// ❌ Impossible
const playspace = { systemId: 'mist' }
const character = { systemId: 'city-of-mist' } // ERROR!

// ✅ Toujours cohérent
const character = await createCharacter({
  playspaceId: 'mist-playspace-id'
  // → systemId hérité du playspace
})
```

### 2. Simplicité d'Utilisation

Un seul paramètre à gérer : `playspaceId` (ou playspace actif par défaut)

```typescript
// ❌ Avant (complexe)
const { t } = useTranslations({
  systemId: 'mist',
  hackId: 'litm',
  playspaceId: 'abc123'
})

// ✅ Après (simple)
const { t } = useTranslations()
// Utilise le playspace actif automatiquement
```

### 3. Performance Optimisée

Cache par playspace (pas par combinaison système+hack+univers) :

```typescript
// Clé de cache simple
const cacheKey = `playspace_${playspaceId}_${category}`

// Au lieu de
const cacheKey = `${systemId}_${hackId}_${playspaceId}_${category}`
```

### 4. UX Intuitive

L'utilisateur comprend naturellement :

```
"Je travaille sur mon univers New York 2099"
→ Playspace actif = New York 2099
→ Système = LITM (automatique)
→ Traductions = FR avec overrides (automatique)
→ Personnages = ceux de cet univers (automatique)
```

---

## Cas Particuliers

### Personnages sans Playspace

**MVP v1.0** : Tous les personnages appartiennent à un playspace (obligatoire).

**v1.2+** : Si besoin de personnages "orphelins", stocker `systemId` en dénormalisation :

```typescript
model Character {
  playspaceId  String?  // Optionnel

  // Dénormalisation pour personnages orphelins
  systemId     String?
  hackId       String?

  // Validation : si playspaceId existe, systemId/hackId = playspace.systemId/hackId
}
```

### Tâches Admin Multi-Playspaces

Utiliser `playspaceId` explicite :

```vue
<script setup lang="ts">
// Comparer deux playspaces
const { t: t1 } = useTranslations('playspace-1-id')
const { t: t2 } = useTranslations('playspace-2-id')

const label1 = await t1('character.name', 'CHARACTER')
const label2 = await t2('character.name', 'CHARACTER')
</script>
```

---

## Schéma d'Architecture

```
┌─────────────────────────────────────────────────┐
│ UTILISATEUR                                      │
│ Sélectionne "New York 2099"                     │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ PLAYSPACE STORE (Pinia)                         │
│ current = { id, systemId: 'mist', hackId: 'litm' }│
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ i18n     │  │ System   │  │ Characters│
│          │  │ Config   │  │          │
│ t()      │  │          │  │ list()   │
│ auto     │  │ auto     │  │ auto     │
└──────────┘  └──────────┘  └──────────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
                   ▼
          ┌────────────────┐
          │ CONTEXTE UNIFIÉ│
          │ systemId: mist │
          │ hackId: litm   │
          │ playspaceId: * │
          └────────────────┘
```

---

## Workflow de Développement

### 1. Création de Playspace

```typescript
// POST /api/playspaces

export default defineEventHandler(async (event) => {
  const data = await validateBody(event, 'Playspace', 'create')

  // Valider que le système existe
  const systemConfig = getSystemConfig(data.systemId)
  if (!systemConfig) {
    throw createError({ statusCode: 400, message: 'Invalid system' })
  }

  // Valider le hack si fourni
  if (data.hackId) {
    const hackConfig = getHackConfig(data.hackId)
    if (!hackConfig || hackConfig.baseSystemId !== data.systemId) {
      throw createError({ statusCode: 400, message: 'Invalid hack for this system' })
    }
  }

  const playspace = await prisma.playspace.create({ data })

  return { success: true, data: playspace }
})
```

### 2. Création de Personnage

```typescript
// POST /api/characters

export default defineEventHandler(async (event) => {
  const data = await validateBody(event, 'Character', 'create')

  // 1. Récupérer le playspace
  const playspace = await prisma.playspace.findUnique({
    where: { id: data.playspaceId }
  })

  // 2. Valider selon le système du playspace
  const systemConfig = playspace.hackId
    ? getHackConfig(playspace.hackId)
    : getSystemConfig(playspace.systemId)

  // 3. Créer avec cohérence garantie
  const character = await prisma.character.create({
    data: {
      ...data,
      playspaceId: playspace.id
    }
  })

  return { success: true, data: character }
})
```

### 3. Récupération de Personnages

```typescript
// GET /api/playspaces/:id/characters

export default defineEventHandler(async (event) => {
  const playspaceId = getRouterParam(event, 'id')

  const characters = await prisma.character.findMany({
    where: { playspaceId },
    include: { playspace: true } // Inclure pour avoir systemId/hackId
  })

  return { success: true, data: characters }
})
```

---

## Tests E2E

### Scénario : Cohérence Système-Personnage

```typescript
test('cannot create character with mismatched system', async ({ page }) => {
  // Créer un playspace Mist
  const mistPlayspace = await page.request.post('/api/playspaces', {
    data: {
      name: 'Mist Playspace',
      systemId: 'mist'
    }
  })

  const playspaceId = (await mistPlayspace.json()).id

  // Tenter de créer un personnage (systemId hérité du playspace)
  const character = await page.request.post('/api/characters', {
    data: {
      playspaceId,
      name: 'Test Character'
    }
  })

  const charData = await character.json()

  // Vérifier que le personnage a le même système que le playspace
  const fetchedChar = await page.request.get(`/api/characters/${charData.id}`)
  const fullChar = await fetchedChar.json()

  expect(fullChar.playspace.systemId).toBe('mist')
})
```

### Scénario : Switch de Playspace

```typescript
test('should update context when switching playspace', async ({ page }) => {
  await page.goto('/playspaces')

  // Sélectionner playspace Mist
  await page.click('[data-playspace-id="mist-ps"]')

  // Vérifier que l'UI affiche les traductions Mist
  await expect(page.locator('[data-system-name]')).toHaveText('Mist')

  // Changer pour playspace City of Mist
  await page.click('[data-playspace-id="com-ps"]')

  // Vérifier que l'UI a changé
  await expect(page.locator('[data-system-name]')).toHaveText('City of Mist')

  // Les personnages affichés sont ceux du nouveau playspace
  const characters = await page.locator('[data-character-item]').count()
  expect(characters).toBeGreaterThan(0)
})
```

---

## Récapitulatif

### Principe Fondamental

> **Le playspace est le contexte unique qui définit l'environnement de jeu complet.**

### Règles d'Or

1. ✅ **Toujours** récupérer `systemId`/`hackId` depuis le playspace
2. ✅ **Jamais** stocker `systemId` directement sur Character (ou en dénormalisation seulement)
3. ✅ **Utiliser** le playspace actif par défaut dans les composables
4. ✅ **Valider** la cohérence playspace ↔ système à la création
5. ✅ **Exposer** `playspaceId` optionnel pour tâches admin

### Avantages Clés

- **Cohérence** : Impossible de créer des données incohérentes
- **Simplicité** : Un seul contexte à gérer
- **Performance** : Cache optimisé par playspace
- **UX** : Modèle mental clair pour l'utilisateur

---

## Ressources

### Documentation Liée

- [11-systeme-traductions-multi-niveaux.md](./11-systeme-traductions-multi-niveaux.md) - i18n avec playspace
- [12-configuration-systemes-jeu.md](./12-configuration-systemes-jeu.md) - Configs système/hack
- [13-modeles-typescript-validation.md](./13-modeles-typescript-validation.md) - Modèles de données
- [14-integration-modeles-systemes.md](./14-integration-modeles-systemes.md) - Intégration complète

### Code Source

- `stores/playspace.ts` - Store Pinia du playspace actif
- `composables/useSystemConfig.ts` - Config système via playspace
- `composables/useTranslations.ts` - i18n via playspace
- `server/api/playspaces/` - API routes playspaces

---

**Dernière mise à jour** : 2025-01-20 (Architecture Playspace Contexte Unique)
