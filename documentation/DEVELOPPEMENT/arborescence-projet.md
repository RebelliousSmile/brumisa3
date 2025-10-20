# Arborescence et Architecture du Projet - Brumisater v1.0

## Vue d'Ensemble

Ce document décrit l'organisation complète du projet Brumisater, basé sur **Nuxt 4** avec architecture moderne.

### Stack Technique

- **Framework**: Nuxt 4 + Vue 3 Composition API
- **Backend**: Nitro Server + PostgreSQL + Prisma ORM
- **Frontend**: Vue 3 + UnoCSS (Tailwind-style) + Pinia
- **État global**: Pinia stores
- **Routage**: Auto-routing Nuxt 4

---

## Arborescence `app/` (Frontend Nuxt)

### Structure Complète

```
app/
├── components/          # Composants Vue réutilisables
│   ├── ui/             # Composants UI génériques
│   │   ├── UiButton.vue
│   │   ├── UiInput.vue
│   │   ├── UiModal.vue
│   │   └── ...
│   ├── common/         # Composants métier transverses
│   │   ├── Header.vue
│   │   ├── Footer.vue
│   │   ├── Navigation.vue
│   │   └── ...
│   ├── playspace/      # Composants Playspace
│   │   ├── PlayspaceCard.vue
│   │   ├── PlayspaceList.vue
│   │   ├── PlayspaceForm.vue
│   │   └── ...
│   └── litm/           # Composants spécifiques LITM (Mist Engine)
│       ├── base/       # Composants de base LITM
│       │   ├── CardBase.vue
│       │   ├── TrackerBase.vue
│       │   └── ...
│       ├── CharacterSheet.vue
│       ├── ThemeCard.vue
│       ├── HeroCard.vue
│       ├── DangerCard.vue
│       └── ...
├── composables/        # Composables Vue (logique réutilisable)
│   ├── useAuth.ts      # Authentification
│   ├── usePlayspace.ts # Gestion playspace actif
│   ├── useCharacter.ts # Gestion personnage
│   ├── litm/           # Composables LITM
│   │   ├── useThemeCard.ts
│   │   ├── useHeroCard.ts
│   │   ├── useDanger.ts
│   │   └── ...
│   └── ...
├── layouts/            # Layouts Nuxt
│   ├── default.vue     # Layout par défaut
│   ├── auth.vue        # Layout pages auth
│   ├── playspace.vue   # Layout avec contexte playspace
│   └── ...
├── pages/              # Routes Nuxt (auto-routing)
│   ├── index.vue       # Page d'accueil
│   ├── auth/           # Routes authentification
│   │   ├── login.vue
│   │   ├── register.vue
│   │   └── forgot-password.vue
│   ├── playspaces/     # Routes playspaces
│   │   ├── index.vue        # Liste playspaces
│   │   ├── nouveau.vue      # Créer playspace
│   │   └── [id]/            # Playspace spécifique
│   │       ├── index.vue    # Dashboard playspace
│   │       └── personnages/
│   │           ├── index.vue
│   │           ├── nouveau.vue
│   │           └── [characterId].vue
│   └── univers/        # Routes par système de jeu
│       └── legends-in-the-mist/
│           └── personnages/
│               ├── index.vue
│               ├── nouveau.vue
│               └── [id].vue
├── middleware/         # Middlewares Nuxt
│   ├── auth.ts         # Vérification authentification
│   ├── playspace.ts    # Vérification playspace actif
│   └── ...
└── utils/              # Utilitaires frontend
    ├── validators.ts   # Validateurs Zod
    ├── formatters.ts   # Formateurs de données
    └── ...
```

### Conventions `app/`

**Composants UI** : Préfixe `Ui*` (ex: `UiButton.vue`)
- Composants réutilisables sans logique métier
- Props typées, événements `emit`
- Exemples : `UiButton`, `UiInput`, `UiModal`

**Composants Métier** : PascalCase (ex: `ThemeCard.vue`)
- Composants avec logique métier
- Peuvent utiliser des composables/stores
- Organisation par domaine (`playspace/`, `litm/`)

**Composables** : Préfixe `use*` (ex: `useAuth.ts`)
- Logique réutilisable avec Vue Composition API
- Retournent des refs, computed, fonctions
- Organisation par domaine (`litm/` pour logique LITM)

**Pages** : kebab-case (ex: `login.vue`, `forgot-password.vue`)
- Auto-routing Nuxt
- Utilisation de `[param]` pour routes dynamiques

**Layouts** : kebab-case (ex: `default.vue`, `playspace.vue`)
- Wrappent les pages avec structure commune
- Utilisés via `definePageMeta({ layout: 'nom' })`

---

## Arborescence `server/` (Backend Nitro)

### Structure Complète

```
server/
├── api/                # Routes API REST
│   ├── auth/           # Endpoints authentification
│   │   ├── login.post.ts
│   │   ├── register.post.ts
│   │   └── logout.post.ts
│   ├── playspaces/     # Endpoints playspaces
│   │   ├── index.get.ts        # GET /api/playspaces
│   │   ├── index.post.ts       # POST /api/playspaces
│   │   └── [id]/
│   │       ├── index.get.ts    # GET /api/playspaces/:id
│   │       ├── index.patch.ts  # PATCH /api/playspaces/:id
│   │       ├── index.delete.ts # DELETE /api/playspaces/:id
│   │       ├── characters/
│   │       │   ├── index.get.ts  # GET /api/playspaces/:id/characters
│   │       │   └── index.post.ts # POST /api/playspaces/:id/characters
│   │       └── dangers/
│   │           ├── index.get.ts
│   │           └── index.post.ts
│   ├── characters/     # Endpoints characters
│   │   ├── [id]/
│   │   │   ├── index.get.ts
│   │   │   ├── index.patch.ts
│   │   │   ├── index.delete.ts
│   │   │   ├── theme-cards/
│   │   │   │   ├── index.get.ts
│   │   │   │   └── index.post.ts
│   │   │   └── hero-card/
│   │   │       ├── index.get.ts
│   │   │       └── index.patch.ts
│   │   └── ...
│   ├── dangers/        # Endpoints dangers
│   │   └── [id]/
│   │       ├── index.get.ts
│   │       ├── index.patch.ts
│   │       └── index.delete.ts
│   └── systems/        # Endpoints systèmes de jeu
│       └── index.get.ts
├── database/           # Database utilities
│   ├── client.ts       # Prisma client singleton
│   └── seeds/          # Seed scripts
│       └── systems.seed.ts
├── middleware/         # Server middlewares
│   ├── auth.ts         # Middleware auth
│   └── error.ts        # Error handling middleware
├── services/           # Business logic
│   ├── auth.service.ts
│   ├── playspace.service.ts
│   ├── character.service.ts
│   ├── danger.service.ts
│   └── litm/           # Services LITM
│       ├── themeCard.service.ts
│       ├── heroCard.service.ts
│       └── ...
└── utils/              # Utilitaires backend
    ├── validators.ts   # Zod schemas
    ├── errors.ts       # Error classes
    └── ...
```

### Conventions `server/`

**Routes API** : Dossiers avec fichiers `index.[method].ts`
- Pattern : `[resource]/[id]/index.[method].ts`
- Méthodes : `.get.ts`, `.post.ts`, `.patch.ts`, `.delete.ts`
- Exemple : `playspaces/[id]/index.patch.ts` → `PATCH /api/playspaces/:id`

**Services** : Suffixe `.service.ts`
- Contiennent la logique métier
- Utilisent Prisma pour accès DB
- Exemple : `playspace.service.ts`, `character.service.ts`

**Validators** : Zod schemas dans `utils/validators.ts`
- Validation des requêtes API
- Exemple : `CreatePlayspaceSchema`, `UpdateCharacterSchema`

**Middleware** : Préfixe du dossier `server/middleware/`
- Exécutés avant les routes
- Exemple : `auth.ts` (vérification JWT)

---

## Arborescence `shared/` (Stores Pinia)

### Structure Complète

```
shared/
└── stores/             # Stores Pinia
    ├── auth.ts         # Store auth (user connecté)
    ├── playspace.ts    # Store playspace actif
    ├── ui.ts           # Store UI (modals, toasts, etc.)
    └── litm/           # Stores LITM
        ├── character.ts # Store character LITM en édition
        └── danger.ts    # Store danger LITM en édition
```

### Conventions `shared/`

**Stores** : snake_case sans préfixe (ex: `auth.ts`, `playspace.ts`)
- Pattern `defineStore('storeName', { state, getters, actions })`
- Exemple : `defineStore('playspace', { ... })`

**Organisation** : Sous-dossiers par système (ex: `litm/`)
- Stores spécifiques à un système de jeu
- Exemple : `litm/character.ts` pour personnages LITM

**Responsabilités** :
- `auth.ts` : État utilisateur, tokens, logout
- `playspace.ts` : Playspace actif, liste playspaces
- `ui.ts` : État UI global (modals, toasts, loading)
- `litm/character.ts` : État du personnage LITM en édition

---

## Patterns Architecturaux

### Pattern 1: Composant + Composable + Store

**Quand utiliser** : Feature complexe avec état global

**Exemple** : ThemeCard

```
app/components/litm/ThemeCard.vue        # Vue (affichage)
app/composables/litm/useThemeCard.ts     # Logique métier
shared/stores/litm/character.ts          # État global
```

**Flow de données** :
```
ThemeCard.vue (affichage)
  → useThemeCard() (logique locale : validation, formatage)
    → useCharacterStore() (état global : CRUD character)
      → API /api/characters/:id/theme-cards (persistence)
```

**Exemple de code** :

```vue
<!-- app/components/litm/ThemeCard.vue -->
<script setup lang="ts">
import { useThemeCard } from '~/composables/litm/useThemeCard'

const props = defineProps<{ themeCardId: string }>()

const { themeCard, updateTitle, addTag, removeTag, isLoading } = useThemeCard(props.themeCardId)
</script>

<template>
  <div class="theme-card">
    <h3>{{ themeCard.title }}</h3>
    <button @click="addTag('Power')">Add Power Tag</button>
  </div>
</template>
```

```typescript
// app/composables/litm/useThemeCard.ts
export function useThemeCard(themeCardId: string) {
  const characterStore = useCharacterStore()

  const themeCard = computed(() =>
    characterStore.character?.theme_cards.find(tc => tc.id === themeCardId)
  )

  const updateTitle = async (title: string) => {
    await characterStore.updateThemeCard(themeCardId, { title })
  }

  return { themeCard, updateTitle, addTag, removeTag, isLoading }
}
```

```typescript
// shared/stores/litm/character.ts
export const useCharacterStore = defineStore('litm-character', {
  state: () => ({
    character: null as Character | null,
    isLoading: false
  }),

  actions: {
    async updateThemeCard(themeCardId: string, data: Partial<ThemeCard>) {
      this.isLoading = true
      const response = await $fetch(`/api/theme-cards/${themeCardId}`, {
        method: 'PATCH',
        body: data
      })
      // Update local state
      this.isLoading = false
    }
  }
})
```

---

### Pattern 2: Composant Simple (UI)

**Quand utiliser** : Composant réutilisable sans logique métier

**Exemple** : UiButton

```
app/components/ui/UiButton.vue           # Vue pure (props + emit)
```

**Flow** :
```
UiButton.vue (props: label, disabled, onClick)
  → Emit click event
```

**Exemple de code** :

```vue
<!-- app/components/ui/UiButton.vue -->
<script setup lang="ts">
defineProps<{
  label: string
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    :class="['btn', `btn-${variant}`]"
    :disabled="disabled"
    @click="emit('click')"
  >
    {{ label }}
  </button>
</template>
```

---

### Pattern 3: Route API + Service

**Quand utiliser** : Endpoint backend avec logique métier

**Exemple** : GET /api/playspaces/:id

```
server/api/playspaces/[id]/index.get.ts  # Route (validation + appel service)
server/services/playspace.service.ts     # Logique métier + Prisma
```

**Flow** :
```
Route API
  → Validate request (Zod)
  → Call service
    → Service (business logic)
      → Prisma (database)
  → Return response
```

**Exemple de code** :

```typescript
// server/api/playspaces/[id]/index.get.ts
import { GetPlayspaceSchema } from '~/server/utils/validators'
import { getPlayspace } from '~/server/services/playspace.service'

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, GetPlayspaceSchema.parse)

  const playspace = await getPlayspace(id)

  if (!playspace) {
    throw createError({ statusCode: 404, message: 'Playspace not found' })
  }

  return playspace
})
```

```typescript
// server/services/playspace.service.ts
import { prisma } from '~/server/database/client'

export async function getPlayspace(id: string) {
  return await prisma.playspace.findUnique({
    where: { id },
    include: {
      characters: true,
      dangers: true
    }
  })
}
```

---

## Guide de Décision : "Où Mettre Mon Code ?"

### Q1: J'ai besoin d'afficher quelque chose

**Composant réutilisable sans logique métier ?**
→ `app/components/ui/` (ex: `UiButton.vue`, `UiInput.vue`)

**Composant métier transverse ?**
→ `app/components/common/` (ex: `Header.vue`, `Navigation.vue`)

**Composant spécifique à un système de jeu ?**
→ `app/components/[system]/` (ex: `litm/ThemeCard.vue`)

**Page complète ?**
→ `app/pages/` (ex: `playspaces/index.vue`)

---

### Q2: J'ai de la logique métier à partager

**Logique Vue (ref, computed, watch) ?**
→ `app/composables/` (ex: `useAuth.ts`, `usePlayspace.ts`)

**Logique Vue spécifique à un système ?**
→ `app/composables/[system]/` (ex: `litm/useThemeCard.ts`)

**Logique backend (sans Vue) ?**
→ `server/services/` (ex: `playspace.service.ts`)

**Utilitaire pur (sans dépendances) ?**
→ `app/utils/` ou `server/utils/` (ex: `formatters.ts`, `validators.ts`)

---

### Q3: J'ai besoin d'état global

**État utilisateur/session ?**
→ `shared/stores/auth.ts`

**État playspace actif ?**
→ `shared/stores/playspace.ts`

**État UI (modals, toasts, loading) ?**
→ `shared/stores/ui.ts`

**État spécifique à un système de jeu ?**
→ `shared/stores/[system]/` (ex: `litm/character.ts`)

---

### Q4: J'ai besoin d'une API

**CRUD simple ?**
→ `server/api/[resource]/index.[method].ts`
Exemple : `server/api/playspaces/index.post.ts` → `POST /api/playspaces`

**Logique complexe ?**
→ `server/api/[resource]/` + `server/services/[resource].service.ts`

**Endpoint avec ID ?**
→ `server/api/[resource]/[id]/index.[method].ts`
Exemple : `server/api/playspaces/[id]/index.get.ts` → `GET /api/playspaces/:id`

**Endpoint imbriqué ?**
→ `server/api/[resource]/[id]/[nested]/index.[method].ts`
Exemple : `server/api/playspaces/[id]/characters/index.get.ts` → `GET /api/playspaces/:id/characters`

---

### Q5: J'ai besoin de valider des données

**Validation frontend (formulaires, UI) ?**
→ `app/utils/validators.ts` (Zod schemas)

**Validation backend (API, sécurité) ?**
→ `server/utils/validators.ts` (Zod schemas)

**Validation partagée (frontend + backend) ?**
→ Créer dans `server/utils/validators.ts` et importer dans `app/`

---

## Conventions de Nommage Globales

### Fichiers Vue

- **Composants** : PascalCase (ex: `ThemeCard.vue`, `UiButton.vue`)
- **Pages** : kebab-case (ex: `login.vue`, `forgot-password.vue`)
- **Layouts** : kebab-case (ex: `default.vue`, `playspace.vue`)

### Fichiers TypeScript

- **Composables** : camelCase avec préfixe `use` (ex: `useAuth.ts`, `useThemeCard.ts`)
- **Services** : camelCase avec suffixe `.service` (ex: `playspace.service.ts`)
- **Stores** : camelCase (ex: `auth.ts`, `playspace.ts`)
- **Utils** : camelCase (ex: `validators.ts`, `formatters.ts`)

### Dossiers

- **Frontend** : kebab-case (ex: `app/components/theme-card/`)
- **Backend** : kebab-case (ex: `server/api/playspaces/`)
- **Systèmes** : kebab-case (ex: `litm/`, `city-of-mist/`)

### Variables & Fonctions

- **Variables** : camelCase (ex: `themeCard`, `currentPlayspace`)
- **Fonctions** : camelCase (ex: `createCharacter()`, `updateThemeCard()`)
- **Constantes** : UPPER_SNAKE_CASE (ex: `MAX_THEME_CARDS`, `API_VERSION`)

### Prisma (Base de données)

- **Modèles** : PascalCase singulier (ex: `User`, `Playspace`, `Character`)
- **Colonnes** : snake_case (ex: `user_id`, `created_at`, `password_hash`)
- **Tables** : snake_case pluriel via `@@map()` (ex: `users`, `playspaces`, `characters`)
- **Relations** : snake_case (même nom que colonne FK)

---

## Exemples d'Organisation

### Exemple 1: Feature Playspace

```
app/components/playspace/
  ├── PlayspaceCard.vue       # Affichage carte playspace
  ├── PlayspaceList.vue       # Liste de playspaces
  └── PlayspaceForm.vue       # Formulaire création/édition

app/composables/
  └── usePlayspace.ts         # Logique playspace (CRUD local)

app/pages/playspaces/
  ├── index.vue               # Liste playspaces
  ├── nouveau.vue             # Créer playspace
  └── [id]/
      └── index.vue           # Dashboard playspace

shared/stores/
  └── playspace.ts            # État global playspaces

server/api/playspaces/
  ├── index.get.ts            # GET /api/playspaces
  ├── index.post.ts           # POST /api/playspaces
  └── [id]/
      ├── index.get.ts        # GET /api/playspaces/:id
      ├── index.patch.ts      # PATCH /api/playspaces/:id
      └── index.delete.ts     # DELETE /api/playspaces/:id

server/services/
  └── playspace.service.ts    # Logique métier playspaces
```

### Exemple 2: Feature Character LITM

```
app/components/litm/
  ├── CharacterSheet.vue      # Feuille de personnage complète
  ├── ThemeCard.vue           # Carte de thème
  ├── HeroCard.vue            # Carte héros
  └── base/
      ├── CardBase.vue        # Base commune cartes
      └── TrackerBase.vue     # Base commune trackers

app/composables/litm/
  ├── useCharacter.ts         # Logique personnage
  ├── useThemeCard.ts         # Logique theme card
  └── useHeroCard.ts          # Logique hero card

shared/stores/litm/
  └── character.ts            # État character en édition

server/api/characters/
  └── [id]/
      ├── index.get.ts
      ├── index.patch.ts
      ├── theme-cards/
      │   ├── index.get.ts
      │   └── index.post.ts
      └── hero-card/
          ├── index.get.ts
          └── index.patch.ts

server/services/litm/
  ├── character.service.ts
  ├── themeCard.service.ts
  └── heroCard.service.ts
```

---

## Références

- [Nuxt 4 Directory Structure](https://nuxt.com/docs/guide/directory-structure)
- [Nitro Server Routes](https://nitro.unjs.io/guide/routing)
- [Pinia Store Setup](https://pinia.vuejs.org/core-concepts/)
- `documentation/DEVELOPPEMENT/nomenclature-et-conventions.md` - Conventions nommage
- `documentation/ARCHITECTURE/02-schema-base-donnees.md` - Schema Prisma

---

**Version** : 1.0 MVP
**Date** : 2025-01-20
**Auteur** : Claude (TASK-2025-01-20-000C)
