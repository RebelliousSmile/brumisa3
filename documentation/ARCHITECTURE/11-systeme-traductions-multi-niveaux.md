# Systeme de Traductions Multi-Niveaux avec Heritage en Cascade

## Vue d'ensemble

Architecture de traductions internationalisees (i18n) avec heritage en cascade pour supporter les personnalisations a trois niveaux hierarchiques :

```
SYSTEME (Mist Engine - base commune)
  |
  +-- HACK (LITM, Otherscape, City of Mist - variantes mecaniques)
      |
      +-- UNIVERS / PLAYSPACE (settings narratifs specifiques)
          - LITM : Zamanora, HOR (Hearts of Ravensdale)
          - Otherscape : Tokyo:Otherscape, Cairo:2001
          - City of Mist : The City (defaut)
```

Chaque niveau peut surcharger les traductions du niveau parent, permettant des adaptations de terminologie specifiques sans dupliquer les donnees.

## Problematique

### Besoin Fonctionnel

Le Mist Engine est le systeme de base qui supporte plusieurs hacks (City of Mist, LITM, Otherscape) qui peuvent etre personnalises avec des univers specifiques :

- **Systeme (Mist Engine)** : Terminologie de base commune (ex: "Tags", "Themes", "Status")
- **Hack** : Adaptation mecanique et thematique (ex: "Power Tags" vs "Gift Tags" pour LITM)
  - LITM : Fantasy heroique avec milestones
  - Otherscape : Cyberpunk avec essence
  - City of Mist : Noir urbain avec Mythos/Logos
- **Univers** : Settings narratifs specifiques (ex: Zamanora pour LITM, Tokyo pour Otherscape)

### Contraintes Techniques

- **Performance** : Resolution < 100ms au chargement, < 20ms avec cache
- **Pas de duplication** : Eviter de stocker les memes traductions plusieurs fois
- **Tracabilite** : Savoir d'ou vient chaque traduction (quel niveau)
- **Rollback** : Pouvoir supprimer un override et revenir au niveau parent
- **Scalabilite** : Supporter des centaines de playspaces avec des milliers de traductions

## Architecture Recommandee

### Schema Prisma - Modele Unifie

Au lieu de 3 tables separees (SystemTranslation, HackTranslation, UniverseTranslation), on utilise **1 table unifiee avec polymorphisme** pour eliminer la duplication et optimiser les performances.

```prisma
// Modele unifie pour les 3 niveaux
model TranslationEntry {
  id          String              @id @default(cuid())
  key         String              // Ex: "character.name", "theme.power_tags"
  value       String              @db.Text
  category    TranslationCategory // CHARACTER, PLAYSPACE, GAME_MECHANICS, UI, THEMES, MOVES, STATUSES
  description String?             @db.Text // Aide a la traduction

  // Metadonnees de resolution
  level       TranslationLevel    // SYSTEM, HACK, UNIVERSE
  priority    Int                 // 1 (System), 2 (Hack), 3 (Universe)

  // Relations polymorphiques (une seule active par entree)
  systemId    String?
  hackId      String?
  universeId  String?             // = playspaceId

  system      System?      @relation(fields: [systemId], references: [id], onDelete: Cascade)
  hack        Hack?        @relation(fields: [hackId], references: [id], onDelete: Cascade)
  playspace   Playspace?   @relation(fields: [universeId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Contrainte d'unicite
  @@unique([key, category, systemId, hackId, universeId])

  // Index composites pour performance
  @@index([systemId, category, key])
  @@index([hackId, category, key])
  @@index([universeId, category, key])
  @@index([level, priority])
}

enum TranslationLevel {
  SYSTEM    // Niveau de base (City of Mist, LITM, Otherscape)
  HACK      // Adaptation thematique (Cyberpunk City, Night's Black Agents)
  UNIVERSE  // Customisation playspace specifique
}

enum TranslationCategory {
  CHARACTER       // Labels personnage (name, mythos, logos, etc.)
  PLAYSPACE       // Labels playspace (name, description, etc.)
  GAME_MECHANICS  // Regles et mecaniques (moves, outcomes, etc.)
  UI              // Interface utilisateur (buttons, messages, etc.)
  THEMES          // Theme cards (types, power tags, weakness tags)
  MOVES           // Moves specifiques au systeme
  STATUSES        // Statuses (tiers, types)
}

// Tables de metadonnees
model System {
  id          String  @id @default(cuid())
  code        String  @unique // "city-of-mist", "litm", "otherscape"
  name        String
  version     String

  translations TranslationEntry[]
  hacks        Hack[]
  playspaces   Playspace[]
}

model Hack {
  id          String  @id @default(cuid())
  systemId    String
  code        String  @unique // "nights-black-agents", "cyberpunk-city"
  name        String
  version     String
  description String  @db.Text

  system       System   @relation(fields: [systemId], references: [id], onDelete: Cascade)
  translations TranslationEntry[]
  playspaces   Playspace[]
}

// Extension de Playspace existant
model Playspace {
  // ... champs existants

  systemId    String
  hackId      String?

  system      System   @relation(fields: [systemId], references: [id])
  hack        Hack?    @relation(fields: [hackId], references: [id])

  translations TranslationEntry[] // Overrides specifiques a cet univers
}
```

### Avantages du Modele Unifie

1. **Performance** : 1 seule requete PostgreSQL au lieu de 3 sequentielles
2. **DRY** : Pas de duplication de structure de tables
3. **Simplicite** : Code de resolution plus simple
4. **Maintenabilite** : Un seul endroit pour les migrations
5. **Flexibilite** : Facile d'ajouter un 4e niveau si necessaire

## Service de Resolution en Cascade

### Algorithme de Resolution

```typescript
// server/services/translations.service.ts

import { PrismaClient, TranslationCategory, TranslationLevel } from '@prisma/client'

const prisma = new PrismaClient()

interface TranslationContext {
  systemId: string
  hackId?: string
  playspaceId?: string
  category: TranslationCategory
}

interface ResolvedTranslations {
  [key: string]: {
    value: string
    level: TranslationLevel
    description?: string
  }
}

/**
 * Resout les traductions en cascade : System → Hack → Universe
 *
 * Utilise 1 seule requete PostgreSQL avec OR + tri par priorite,
 * puis resolution en memoire (tres rapide).
 *
 * Performance attendue :
 * - ~50ms sans cache (PostgreSQL)
 * - ~3ms avec cache Redis
 * - <1ms avec cache client Vue
 */
export async function resolveTranslations(
  context: TranslationContext
): Promise<ResolvedTranslations> {
  const startTime = Date.now()

  // Construction dynamique du WHERE avec conditions OR
  const whereConditions = [
    { systemId: context.systemId, hackId: null, universeId: null },
  ]

  if (context.hackId) {
    whereConditions.push({ hackId: context.hackId, universeId: null })
  }

  if (context.playspaceId) {
    whereConditions.push({ universeId: context.playspaceId })
  }

  // UNE SEULE requete avec OR + tri par priorite
  const entries = await prisma.translationEntry.findMany({
    where: {
      category: context.category,
      OR: whereConditions,
    },
    orderBy: [
      { priority: 'desc' }, // Universe (3) > Hack (2) > System (1)
      { updatedAt: 'desc' }, // Plus recent en cas d'egalite
    ],
    select: {
      key: true,
      value: true,
      level: true,
      description: true,
      priority: true,
    },
  })

  // Resolution en memoire (tres rapide, O(n))
  const resolved: ResolvedTranslations = {}

  // Parcours inverse : les plus prioritaires ecrasent les moins prioritaires
  entries.reverse().forEach((entry) => {
    resolved[entry.key] = {
      value: entry.value,
      level: entry.level,
      description: entry.description,
    }
  })

  const duration = Date.now() - startTime

  // Logging performance
  console.info(`[TranslationService] Resolved ${Object.keys(resolved).length} keys in ${duration}ms`, {
    category: context.category,
    systemId: context.systemId,
    hackId: context.hackId,
    playspaceId: context.playspaceId,
  })

  // Warning si lent
  if (duration > 100) {
    console.warn('[TranslationService] Slow query detected:', {
      duration,
      context,
      threshold: 100,
    })
  }

  return resolved
}

/**
 * Recupere l'arbre d'heritage pour visualisation dans l'UI
 */
export async function getTranslationHierarchy(
  key: string,
  context: TranslationContext
) {
  const whereConditions = [
    { systemId: context.systemId, hackId: null, universeId: null },
  ]

  if (context.hackId) {
    whereConditions.push({ hackId: context.hackId, universeId: null })
  }

  if (context.playspaceId) {
    whereConditions.push({ universeId: context.playspaceId })
  }

  const entries = await prisma.translationEntry.findMany({
    where: {
      key,
      OR: whereConditions,
    },
    orderBy: { priority: 'asc' }, // Ordre hierarchique
    select: {
      value: true,
      level: true,
      description: true,
      systemId: true,
      hackId: true,
      universeId: true,
      updatedAt: true,
    },
  })

  return entries.map((entry) => ({
    level: entry.level,
    value: entry.value,
    description: entry.description,
    isOverride: entry.level !== 'SYSTEM',
    lastModified: entry.updatedAt,
  }))
}

/**
 * Cree ou met a jour un override a un niveau specifique
 *
 * Validation : verifie que la cle existe au niveau parent
 */
export async function createOverride(
  key: string,
  value: string,
  context: TranslationContext & { level: 'HACK' | 'UNIVERSE' },
  description?: string
) {
  // Validation : verifier que la cle existe au niveau parent
  const parentExists = await prisma.translationEntry.findFirst({
    where: {
      key,
      category: context.category,
      systemId: context.systemId,
    },
  })

  if (!parentExists) {
    throw new Error(`Translation key "${key}" does not exist in system "${context.systemId}"`)
  }

  const priority = context.level === 'HACK' ? 2 : 3

  const data: any = {
    key,
    value,
    category: context.category,
    description,
    level: context.level,
    priority,
    systemId: context.systemId,
  }

  if (context.level === 'HACK' && context.hackId) {
    data.hackId = context.hackId
  } else if (context.level === 'UNIVERSE' && context.playspaceId) {
    data.universeId = context.playspaceId
  }

  return await prisma.translationEntry.upsert({
    where: {
      key_category_systemId_hackId_universeId: {
        key,
        category: context.category,
        systemId: context.systemId,
        hackId: context.hackId || null,
        universeId: context.playspaceId || null,
      },
    },
    create: data,
    update: { value, description, updatedAt: new Date() },
  })
}

/**
 * Supprime un override (retour au niveau parent)
 */
export async function removeOverride(
  key: string,
  context: TranslationContext & { level: 'HACK' | 'UNIVERSE' }
) {
  const whereClause: any = {
    key,
    category: context.category,
    level: context.level,
  }

  if (context.level === 'HACK') {
    whereClause.hackId = context.hackId
  } else {
    whereClause.universeId = context.playspaceId
  }

  return await prisma.translationEntry.deleteMany({
    where: whereClause,
  })
}
```

### Performance Attendue

| Scenario | Temps | Details |
|----------|-------|---------|
| Premier chargement (cold) | ~50ms | 1 requete PostgreSQL + resolution memoire |
| Avec cache Redis | ~3ms | Recuperation depuis Redis |
| Avec cache client Vue | <1ms | Recuperation depuis Map en memoire |
| Switch playspace | 3-50ms | Cache client reutilise System+Hack, charge Universe |

## API Routes Nitro

### Route de Resolution

```typescript
// server/api/translations/resolve.get.ts

import { resolveTranslations } from '~/server/services/translations.service'
import type { TranslationCategory } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const context = {
    systemId: query.systemId as string,
    hackId: query.hackId as string | undefined,
    playspaceId: query.playspaceId as string | undefined,
    category: query.category as TranslationCategory,
  }

  if (!context.systemId || !context.category) {
    throw createError({
      statusCode: 400,
      message: 'systemId and category are required',
    })
  }

  return await resolveTranslations(context)
})
```

### Route de Hierarchie

```typescript
// server/api/translations/hierarchy.get.ts

import { getTranslationHierarchy } from '~/server/services/translations.service'
import type { TranslationCategory } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const context = {
    systemId: query.systemId as string,
    hackId: query.hackId as string | undefined,
    playspaceId: query.playspaceId as string | undefined,
    category: query.category as TranslationCategory,
  }

  const key = query.key as string

  if (!key || !context.systemId || !context.category) {
    throw createError({
      statusCode: 400,
      message: 'key, systemId, and category are required',
    })
  }

  return await getTranslationHierarchy(key, context)
})
```

### Route de Creation/Mise a jour d'Override

```typescript
// server/api/translations/override.post.ts

import { createOverride } from '~/server/services/translations.service'
import type { TranslationCategory } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const context = {
    systemId: body.systemId as string,
    hackId: body.hackId as string | undefined,
    playspaceId: body.playspaceId as string | undefined,
    category: body.category as TranslationCategory,
    level: body.level as 'HACK' | 'UNIVERSE',
  }

  if (!body.key || !body.value || !context.systemId || !context.category || !context.level) {
    throw createError({
      statusCode: 400,
      message: 'key, value, systemId, category, and level are required',
    })
  }

  return await createOverride(
    body.key,
    body.value,
    context,
    body.description
  )
})
```

### Route de Suppression d'Override

```typescript
// server/api/translations/override.delete.ts

import { removeOverride } from '~/server/services/translations.service'
import type { TranslationCategory } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const context = {
    systemId: body.systemId as string,
    hackId: body.hackId as string | undefined,
    playspaceId: body.playspaceId as string | undefined,
    category: body.category as TranslationCategory,
    level: body.level as 'HACK' | 'UNIVERSE',
  }

  if (!body.key || !context.systemId || !context.category || !context.level) {
    throw createError({
      statusCode: 400,
      message: 'key, systemId, category, and level are required',
    })
  }

  return await removeOverride(body.key, context)
})
```

## Composable Vue avec Cache Client

### Principe : Le Playspace comme Contexte Unique

Dans l'application, **le playspace actif définit le contexte complet** :
- Système (Mist, City of Mist)
- Hack optionnel (LITM, etc.)
- Univers (le playspace lui-même)

L'utilisateur ne travaille **jamais sur plusieurs playspaces simultanément** (sauf tâches admin rares). Le composable utilise donc le playspace actif par défaut.

### Composable useTranslations

```typescript
// composables/useTranslations.ts

import { ref } from 'vue'
import type { TranslationCategory, TranslationLevel } from '@prisma/client'

interface TranslationValue {
  value: string
  level: TranslationLevel
  description?: string
}

interface TranslationCache {
  [category: string]: {
    [key: string]: TranslationValue
  }
}

interface TranslationContext {
  systemId: string
  hackId?: string
  playspaceId: string
}

// Cache global partage entre composants
const translationCache = ref<TranslationCache>({})
const loadingCategories = ref<Set<string>>(new Set())

/**
 * Hook de traductions avec contexte automatique depuis le playspace actif
 *
 * @param playspaceId - ID du playspace (optionnel, utilise le playspace actif par défaut)
 */
export function useTranslations(playspaceId?: string) {
  const playspaceStore = usePlayspaceStore()

  // Utiliser le playspace actif si non spécifié
  const contextPlayspaceId = playspaceId || playspaceStore.current?.id

  if (!contextPlayspaceId) {
    throw new Error('[useTranslations] No active playspace. Please select a playspace first.')
  }

  // Récupérer le playspace pour obtenir systemId et hackId
  const { data: playspace } = useFetch(`/api/playspaces/${contextPlayspaceId}`)

  // Construction du contexte depuis le playspace
  const context = computed<TranslationContext>(() => ({
    systemId: playspace.value?.systemId || '',
    hackId: playspace.value?.hackId,
    playspaceId: contextPlayspaceId
  }))

  /**
   * Fonction de traduction avec auto-loading
   */
  const t = async (key: string, category: TranslationCategory): Promise<string> => {
    const ctx = context.value
    const cacheKey = `${ctx.systemId}_${ctx.hackId}_${ctx.playspaceId}_${category}`

    // Cache hit
    if (translationCache.value[cacheKey]?.[key]) {
      return translationCache.value[cacheKey][key].value
    }

    // Auto-load category si pas encore chargee
    if (!translationCache.value[cacheKey] && !loadingCategories.value.has(cacheKey)) {
      await loadCategory(category)
    }

    // Retourner la traduction ou la cle entre crochets si manquante
    return translationCache.value[cacheKey]?.[key]?.value || `[${key}]`
  }

  /**
   * Chargement d'une categorie complete
   */
  const loadCategory = async (category: TranslationCategory) => {
    const ctx = context.value
    const cacheKey = `${ctx.systemId}_${ctx.hackId}_${ctx.playspaceId}_${category}`

    if (loadingCategories.value.has(cacheKey)) {
      // Deja en cours de chargement
      return
    }

    loadingCategories.value.add(cacheKey)

    try {
      const response = await $fetch('/api/translations/resolve', {
        params: {
          systemId: ctx.systemId,
          hackId: ctx.hackId,
          playspaceId: ctx.playspaceId,
          category,
        },
      })

      translationCache.value[cacheKey] = response
    } catch (error) {
      console.error(`[useTranslations] Failed to load category ${category}:`, error)
      translationCache.value[cacheKey] = {}
    } finally {
      loadingCategories.value.delete(cacheKey)
    }
  }

  /**
   * Prechargement de plusieurs categories (optimisation)
   */
  const preloadCategories = async (categories: TranslationCategory[]) => {
    await Promise.all(categories.map((cat) => loadCategory(cat)))
  }

  /**
   * Creation d'override
   */
  const createOverride = async (
    key: string,
    value: string,
    category: TranslationCategory,
    level: 'HACK' | 'UNIVERSE',
    description?: string
  ) => {
    const ctx = context.value

    await $fetch('/api/translations/override', {
      method: 'POST',
      body: {
        key,
        value,
        category,
        level,
        description,
        systemId: ctx.systemId,
        hackId: ctx.hackId,
        playspaceId: ctx.playspaceId,
      },
    })

    // Invalider le cache pour cette categorie
    const cacheKey = `${ctx.systemId}_${ctx.hackId}_${ctx.playspaceId}_${category}`
    delete translationCache.value[cacheKey]

    await loadCategory(category)
  }

  /**
   * Suppression d'override
   */
  const removeOverride = async (
    key: string,
    category: TranslationCategory,
    level: 'HACK' | 'UNIVERSE'
  ) => {
    const ctx = context.value

    await $fetch('/api/translations/override', {
      method: 'DELETE',
      body: {
        key,
        category,
        level,
        systemId: ctx.systemId,
        hackId: ctx.hackId,
        playspaceId: ctx.playspaceId,
      },
    })

    // Invalider le cache
    const cacheKey = `${ctx.systemId}_${ctx.hackId}_${ctx.playspaceId}_${category}`
    delete translationCache.value[cacheKey]

    await loadCategory(category)
  }

  /**
   * Recuperation de la hierarchie pour l'UI
   */
  const getHierarchy = async (key: string, category: TranslationCategory) => {
    const ctx = context.value

    return await $fetch('/api/translations/hierarchy', {
      params: {
        key,
        category,
        systemId: ctx.systemId,
        hackId: ctx.hackId,
        playspaceId: ctx.playspaceId,
      },
    })
  }

  /**
   * Invalidation manuelle du cache (utile pour refresh)
   */
  const invalidateCache = (category?: TranslationCategory) => {
    const ctx = context.value

    if (category) {
      const cacheKey = `${ctx.systemId}_${ctx.hackId}_${ctx.playspaceId}_${category}`
      delete translationCache.value[cacheKey]
    } else {
      translationCache.value = {}
    }
  }

  return {
    t,
    loadCategory,
    preloadCategories,
    createOverride,
    removeOverride,
    getHierarchy,
    invalidateCache,
    context, // Exposer le contexte pour debug/admin
  }
}
```

### Exemple d'Utilisation dans un Composant

#### Utilisation Simplifiée (Cas Courant)

Le composant utilise automatiquement le playspace actif :

```vue
<!-- components/Character/CharacterForm.vue -->

<script setup lang="ts">
import { useTranslations } from '~/composables/useTranslations'

// ✅ Simple : contexte automatique depuis le playspace actif
const { t, preloadCategories } = useTranslations()

// Precharger les categories necessaires
await preloadCategories(['CHARACTER', 'THEMES'])

// Utilisation dans le template
const nameLabel = await t('character.name', 'CHARACTER')
const mythosLabel = await t('character.mythos', 'CHARACTER')
</script>

<template>
  <div class="character-form">
    <label>{{ nameLabel }}</label>
    <input type="text" />

    <h2>{{ mythosLabel }}</h2>
    <!-- ... -->
  </div>
</template>
```

#### Utilisation avec Playspace Explicite (Tâches Admin)

Pour les rares cas où on doit travailler sur un playspace différent de l'actif :

```vue
<!-- components/Admin/PlayspaceComparison.vue -->

<script setup lang="ts">
const props = defineProps<{
  playspaceId1: string
  playspaceId2: string
}>()

// Comparer deux playspaces différents
const { t: t1 } = useTranslations(props.playspaceId1)
const { t: t2 } = useTranslations(props.playspaceId2)

const label1 = await t1('character.name', 'CHARACTER')
const label2 = await t2('character.name', 'CHARACTER')
</script>

<template>
  <div class="comparison">
    <div>Playspace 1: {{ label1 }}</div>
    <div>Playspace 2: {{ label2 }}</div>
  </div>
</template>
```

## Composant d'Edition des Traductions

### Composant TranslationEditor

```vue
<!-- components/Admin/TranslationEditor.vue -->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTranslations } from '~/composables/useTranslations'

const props = defineProps<{
  translationKey: string
  category: string
  playspaceId?: string // Optionnel, utilise le playspace actif par défaut
}>()

// Utilise le playspace actif ou celui fourni
const { getHierarchy, createOverride, removeOverride, context } = useTranslations(props.playspaceId)

const hierarchy = ref([])
const isLoading = ref(false)
const editMode = ref<'HACK' | 'UNIVERSE' | null>(null)
const newValue = ref('')

async function loadHierarchy() {
  isLoading.value = true
  try {
    hierarchy.value = await getHierarchy(props.translationKey, props.category as any)
  } finally {
    isLoading.value = false
  }
}

async function saveOverride() {
  if (!editMode.value) return

  await createOverride(
    props.translationKey,
    newValue.value,
    props.category as any,
    editMode.value
  )

  await loadHierarchy()
  editMode.value = null
  newValue.value = ''
}

async function deleteOverride(level: 'HACK' | 'UNIVERSE') {
  await removeOverride(props.translationKey, props.category as any, level)
  await loadHierarchy()
}

onMounted(() => {
  loadHierarchy()
})
</script>

<template>
  <div class="translation-editor">
    <h3>{{ translationKey }}</h3>

    <div v-if="isLoading">Loading...</div>

    <div v-else class="hierarchy">
      <div
        v-for="entry in hierarchy"
        :key="entry.level"
        class="hierarchy-level"
        :class="`level-${entry.level.toLowerCase()}`"
      >
        <div class="level-header">
          <span class="badge">{{ entry.level }}</span>
          <span v-if="entry.isOverride" class="override-badge">Override</span>
        </div>

        <div class="value">{{ entry.value }}</div>

        <div v-if="entry.description" class="description">
          {{ entry.description }}
        </div>

        <button
          v-if="entry.isOverride"
          @click="deleteOverride(entry.level)"
          class="btn-danger"
        >
          Remove Override
        </button>
      </div>
    </div>

    <div v-if="!editMode" class="actions">
      <button
        v-if="context.value.hackId"
        @click="editMode = 'HACK'"
        class="btn-primary"
      >
        Override at Hack Level
      </button>

      <button
        @click="editMode = 'UNIVERSE'"
        class="btn-primary"
      >
        Override at Universe Level
      </button>
    </div>

    <div v-else class="edit-form">
      <h4>Create {{ editMode }} Override</h4>

      <textarea
        v-model="newValue"
        placeholder="New translation value"
        rows="3"
      />

      <div class="form-actions">
        <button @click="saveOverride" class="btn-success">Save</button>
        <button @click="editMode = null" class="btn-secondary">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hierarchy-level {
  border-left: 4px solid;
  padding: 1rem;
  margin-bottom: 1rem;
}

.level-system { border-color: #3b82f6; }
.level-hack { border-color: #10b981; }
.level-universe { border-color: #f59e0b; }

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.override-badge {
  margin-left: 0.5rem;
  color: #f59e0b;
  font-weight: 600;
}
</style>
```

## Strategie de Cache Multi-Niveaux (Optionnel)

### Architecture de Cache

```
+-------------------------------------------------------------+
| Niveau 1 : Cache Client (Vue Composable)                   |
| - Duree : Session utilisateur                               |
| - Taille : ~50KB par categorie                              |
| - Invalidation : Manuel ou changement playspace             |
+-------------------------------------------------------------+
                            | Miss
+-------------------------------------------------------------+
| Niveau 2 : Cache Redis (Serveur)                           |
| - TTL : 1 heure                                             |
| - Invalidation : Creation/suppression override              |
| - Cle : translations:{systemId}:{hackId}:{universeId}:{cat} |
+-------------------------------------------------------------+
                            | Miss
+-------------------------------------------------------------+
| Niveau 3 : PostgreSQL avec Index Optimises                 |
| - Requete unique avec OR + ORDER BY priority                |
| - Index composites sur (systemId, category, key)           |
| - Temps : ~50ms cold, ~20ms warm                            |
+-------------------------------------------------------------+
```

### Cache Redis (Optionnel pour > 1000 users)

```typescript
// server/utils/redis.ts

import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      lazyConnect: true,
    })

    redis.on('error', (err) => {
      console.error('[Redis] Connection error:', err)
    })
  }

  return redis
}

export async function getCachedTranslations(cacheKey: string) {
  try {
    const redis = getRedisClient()
    const cached = await redis.get(cacheKey)

    if (cached) {
      return JSON.parse(cached)
    }
  } catch (error) {
    console.error('[Redis] Failed to get cached translations:', error)
  }

  return null
}

export async function setCachedTranslations(
  cacheKey: string,
  data: any,
  ttl: number = 3600 // 1 heure par defaut
) {
  try {
    const redis = getRedisClient()
    await redis.setex(cacheKey, ttl, JSON.stringify(data))
  } catch (error) {
    console.error('[Redis] Failed to cache translations:', error)
  }
}

export async function invalidateCachedTranslations(pattern: string) {
  try {
    const redis = getRedisClient()
    const keys = await redis.keys(pattern)

    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('[Redis] Failed to invalidate cache:', error)
  }
}
```

## Tests E2E avec Playwright

### Scenario de Test Critique

```typescript
// tests/e2e/translations-hierarchy.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Translation System - Inheritance Cascade', () => {
  test.beforeEach(async ({ page }) => {
    // Reset DB et seed traductions de test
    await page.request.post('/api/test/reset-db')
    await page.request.post('/api/test/seed-translations')
  })

  test('should resolve translations with 3-level cascade', async ({ page }) => {
    // Creer un playspace avec system LITM + hack Cyberpunk
    const playspace = await page.request.post('/api/playspaces', {
      data: {
        name: 'Test Playspace',
        systemId: 'litm',
        hackId: 'cyberpunk',
      },
    })

    const playspaceId = (await playspace.json()).id

    // Verifier resolution au niveau SYSTEM (pas d'override)
    const systemLevel = await page.request.get(
      `/api/translations/resolve?systemId=litm&category=CHARACTER`
    )
    const systemData = await systemLevel.json()

    expect(systemData['character.name'].value).toBe('Name')
    expect(systemData['character.name'].level).toBe('SYSTEM')

    // Creer un override au niveau HACK
    await page.request.post('/api/translations/override', {
      data: {
        key: 'character.name',
        value: 'Runner Name',
        category: 'CHARACTER',
        level: 'HACK',
        systemId: 'litm',
        hackId: 'cyberpunk',
      },
    })

    // Verifier resolution au niveau HACK
    const hackLevel = await page.request.get(
      `/api/translations/resolve?systemId=litm&hackId=cyberpunk&category=CHARACTER`
    )
    const hackData = await hackLevel.json()

    expect(hackData['character.name'].value).toBe('Runner Name')
    expect(hackData['character.name'].level).toBe('HACK')

    // Creer un override au niveau UNIVERSE
    await page.request.post('/api/translations/override', {
      data: {
        key: 'character.name',
        value: 'Operative Codename',
        category: 'CHARACTER',
        level: 'UNIVERSE',
        systemId: 'litm',
        hackId: 'cyberpunk',
        playspaceId,
      },
    })

    // Verifier resolution au niveau UNIVERSE (final)
    const universeLevel = await page.request.get(
      `/api/translations/resolve?systemId=litm&hackId=cyberpunk&playspaceId=${playspaceId}&category=CHARACTER`
    )
    const universeData = await universeLevel.json()

    expect(universeData['character.name'].value).toBe('Operative Codename')
    expect(universeData['character.name'].level).toBe('UNIVERSE')
  })

  test('should load translations in < 100ms (cold cache)', async ({ page }) => {
    const startTime = Date.now()

    const response = await page.request.get(
      `/api/translations/resolve?systemId=litm&category=CHARACTER`
    )

    const duration = Date.now() - startTime

    expect(response.ok()).toBeTruthy()
    expect(duration).toBeLessThan(100)
  })

  test('should invalidate cache when creating override', async ({ page }) => {
    // Premier chargement (mise en cache)
    const firstLoad = await page.request.get(
      `/api/translations/resolve?systemId=litm&category=CHARACTER`
    )
    const firstData = await firstLoad.json()

    expect(firstData['character.name'].value).toBe('Name')

    // Creer un override
    await page.request.post('/api/translations/override', {
      data: {
        key: 'character.name',
        value: 'Updated Name',
        category: 'CHARACTER',
        level: 'HACK',
        systemId: 'litm',
        hackId: 'cyberpunk',
      },
    })

    // Deuxieme chargement (cache invalide)
    const secondLoad = await page.request.get(
      `/api/translations/resolve?systemId=litm&hackId=cyberpunk&category=CHARACTER`
    )
    const secondData = await secondLoad.json()

    expect(secondData['character.name'].value).toBe('Updated Name')
  })
})
```

## Roadmap d'Implementation

### Phase 1 : Fondations (Semaine 1)

**Objectifs :**
- Creer le schema Prisma unifie
- Implementer le service de resolution de base
- Creer les API routes Nitro

**Taches :**

```bash
# 1. Creer la migration Prisma
pnpm prisma migrate dev --name add_translation_system

# 2. Creer les seeds de donnees de test
# server\database\seeds\translations.seed.ts
```

```typescript
// server/database/seeds/translations.seed.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedTranslations() {
  // Creer le systeme LITM
  const litm = await prisma.system.upsert({
    where: { code: 'litm' },
    create: {
      code: 'litm',
      name: 'Life in the Mist',
      version: '1.0.0',
    },
    update: {},
  })

  // Traductions system level
  const systemTranslations = [
    { key: 'character.name', value: 'Name', category: 'CHARACTER', description: 'Character name label' },
    { key: 'character.mythos', value: 'Mythos', category: 'CHARACTER', description: 'Mythos section title' },
    { key: 'character.logos', value: 'Logos', category: 'CHARACTER', description: 'Logos section title' },
    { key: 'theme.title', value: 'Theme Card', category: 'THEMES', description: 'Theme card title' },
    { key: 'theme.power_tags', value: 'Power Tags', category: 'THEMES', description: 'Power tags label' },
  ]

  for (const trans of systemTranslations) {
    await prisma.translationEntry.upsert({
      where: {
        key_category_systemId_hackId_universeId: {
          key: trans.key,
          category: trans.category as any,
          systemId: litm.id,
          hackId: null,
          universeId: null,
        },
      },
      create: {
        ...trans,
        systemId: litm.id,
        level: 'SYSTEM',
        priority: 1,
      },
      update: {},
    })
  }

  console.log('Translations seeded successfully')
}

seedTranslations()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Tests manuels :**

```bash
# Seeding
pnpm tsx server\database\seeds\translations.seed.ts

# Demarrage dev
pnpm dev

# Test API
curl "http://localhost:3000/api/translations/resolve?systemId=LITM_SYSTEM_ID&category=CHARACTER"
```

### Phase 2 : Composable Vue et Cache Client (Semaine 2)

**Objectifs :**
- Implementer `useTranslations()`
- Tester l'auto-loading
- Integrer dans un composant existant

### Phase 3 : Composant d'Edition (Semaine 3)

**Objectifs :**
- Creer l'UI d'edition des overrides
- Visualiser la hierarchie
- Tester creation/suppression d'overrides

### Phase 4 : Redis Cache (Semaine 4 - Optionnel)

**Pre-requis :** Installation Redis sous Windows ou via Docker (WSL2)

**Variables d'environnement :**

```env
# .env
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true
```

## Metriques de Performance

### Benchmarks Attendus

| Scenario | Sans Cache | Redis | Client |
|----------|-----------|-------|--------|
| Premier chargement categorie | ~50ms | ~3ms | <1ms |
| Resolution cle unique | ~50ms | ~3ms | <1ms |
| Switch playspace (meme hack) | ~50ms | ~3ms | <1ms |
| Creation override | ~100ms | ~100ms | ~100ms |
| Invalidation cache | N/A | ~10ms | <1ms |

### Limites de Scalabilite

- **Traductions par systeme** : Illimite (PostgreSQL)
- **Categorie par playspace** : 10-20 recommandees
- **Cles par categorie** : 100-500 recommandees
- **Taille cache client** : ~50KB par categorie
- **Taille cache Redis** : ~100KB par contexte (systemId+hackId+playspaceId+category)

## Avantages de cette Architecture

1. **Heritage clair** : Systeme → Hack → Univers
2. **Pas de duplication** : Chaque niveau ne stocke que ses overrides
3. **Flexibilite** : Un hack peut etre utilise par plusieurs univers
4. **Tracabilite** : On voit exactement d'ou vient chaque valeur
5. **Rollback facile** : Supprimer un override = retour au niveau parent
6. **Scalabilite** : Ajout facile de nouveaux niveaux si besoin
7. **Performance** : Resolution en 1 requete max avec joins optimises

## Points d'Attention

### Performance
- Toujours indexer les colonnes `systemId`, `hackId`, `universeId`, `category`, `key`
- Utiliser le cache client Vue systematiquement
- Ajouter Redis si > 1000 utilisateurs simultanees
- Monitorer les requetes lentes (> 100ms)

### Securite
- Valider les entrees avec Zod
- Verifier les permissions (ownership du playspace) avant modification
- Proteger les API routes avec middleware auth

### Maintenabilite
- Documenter chaque cle de traduction avec `description`
- Utiliser des prefixes clairs (`character.`, `theme.`, etc.)
- Versionner les traductions si necessaire (v2.0+)

## Ressources et References

### Documentation
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Nuxt 4 Composables](https://nuxt.com/docs/guide/directory-structure/composables)
- [Redis](https://redis.io/docs/)

### Patterns Inspires
- i18n (vue-i18n, react-intl)
- Configuration multi-niveaux (ESLint, TypeScript)
- Cache multi-niveaux (browser, CDN, database)

## Maintenance de cette Documentation

Cette documentation doit etre mise a jour lors de :
- Ajout de nouveaux niveaux d'heritage
- Modifications du schema Prisma
- Optimisations de performance
- Retours d'experience d'implementation

Derniere mise a jour: 2025-01-20 (Architecture Traductions Multi-Niveaux)