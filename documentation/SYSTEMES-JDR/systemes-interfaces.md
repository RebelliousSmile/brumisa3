# Interfaces des Systèmes JDR - Architecture Nuxt 4

## Vue d'ensemble

L'application Brumisater utilise **Nuxt 4** avec **Vue 3 Composition API** pour offrir une architecture moderne basée sur les composants. Chaque système de jeu bénéficie d'une expérience visuelle cohérente tout en permettant une personnalisation complète.

**Architecture actuelle** : Nuxt 4 + Vue 3 + Composition API + File-based routing

## Architecture des Routes (Nuxt 4)

### Structure des dossiers app/pages

```
app/pages/
├── index.vue                      # Page d'accueil (affiche les systèmes Mist)
├── systemes/
│   ├── index.vue                  # Liste des systèmes
│   └── [slug]/
│       ├── index.vue              # Page d'un système (ex: /systemes/mistengine)
│       └── [univers].vue          # Page d'un univers (ex: /systemes/mistengine/city-of-mist)
└── univers/
    └── [slug].vue                 # Page univers alternative (ex: /univers/city-of-mist)
```

### Routes générées automatiquement

- `/` - Page d'accueil avec systèmes Mist Engine
- `/systemes` - Liste tous les systèmes disponibles
- `/systemes/mistengine` - Page du système Mist Engine
- `/systemes/mistengine/city-of-mist` - Page de l'univers City of Mist
- `/systemes/mistengine/otherscape` - Page de l'univers Tokyo: Otherscape
- `/systemes/mistengine/post_mortem` - Page de l'univers Post-Mortem
- `/systemes/mistengine/obojima` - Page de l'univers Obojima (Legends in the Mist)
- `/systemes/mistengine/zamanora` - Page de l'univers Zamanora (Legends in the Mist)

## Composants d'Interface

### Composants système (app/components/)

```
app/components/
├── Hero.vue                    # Section hero personnalisable par système
├── SystemCard.vue              # Carte de présentation d'un système
├── UniversCard.vue             # Carte de présentation d'un univers
├── NewsletterJoin.vue          # Formulaire newsletter
├── TestimonialForm.vue         # Formulaire témoignages
├── PdfCard.vue                 # Carte PDF récent
└── RecentPdfs.vue              # Liste des PDFs récents
```

### Composables (app/composables/)

```
app/composables/
└── useSystemes.ts              # Logique métier pour systèmes
    ├── chargerSystemes()       # Récupère tous les systèmes
    ├── obtenirSysteme(id)      # Récupère un système spécifique
    ├── getCouleursPourSysteme()  # Retourne les couleurs du système
    ├── getIconPourSysteme()      # Retourne l'icône du système
    └── getNomCompletSysteme()    # Retourne le nom complet
```

## Configuration Thématique Mist Engine

### Couleurs et Styles

```typescript
// app/composables/useSystemes.ts
const getCouleursPourSysteme = (systemeId: string) => {
  return {
    mistengine: {
      primary: '#8b5cf6',      // violet-500
      secondary: '#7c3aed',     // violet-600
      classes: {
        bg: 'bg-violet-500/20',
        border: 'border-violet-500/30',
        text: 'text-violet-400',
        badgeBg: 'bg-violet-500/20',
        badgeBorder: 'border-violet-500/30'
      }
    }
  }[systemeId]
}
```

### Icônes par univers

```typescript
const getIconPourSysteme = (systemeId: string): string => {
  return {
    mistengine: 'ra:ra-fog'
  }[systemeId] || 'ra:ra-dice'
}
```

## Layouts Nuxt 4

### Layout principal (app/layouts/default.vue)

Structure de base pour toutes les pages :

```vue
<template>
  <div class="min-h-screen bg-gray-950">
    <!-- Navigation -->
    <nav class="bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
      <!-- Menu navigation -->
    </nav>

    <!-- Contenu de la page -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 border-t border-gray-800">
      <!-- Footer content -->
    </footer>
  </div>
</template>
```

### Utilisation dans les pages

```vue
<script setup lang="ts">
// app/pages/systemes/[slug]/index.vue
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const systemId = route.params.slug as string

const { obtenirSysteme, getCouleursPourSysteme } = useSystemes()
const systeme = await obtenirSysteme(systemId)
const couleurs = getCouleursPourSysteme(systemId)
</script>

<template>
  <div :class="`bg-gradient-to-br ${couleurs.classes.bg}`">
    <!-- Contenu de la page système -->
  </div>
</template>
```

## Pattern de Présentation des Pages

### Hero Section Standard

```vue
<template>
  <header class="relative pt-20 pb-16 px-4 overflow-hidden">
    <!-- Background Effects -->
    <div class="absolute inset-0 bg-gradient-to-br from-violet-900 via-violet-800 to-purple-900"></div>
    <div class="absolute inset-0">
      <div class="absolute top-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full filter blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"></div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Image -->
        <div class="relative">
          <NuxtImg
            src="/images/mist-character.png"
            alt="Mist Engine"
            class="w-full h-auto mystical-character-filter"
          />
        </div>

        <!-- Contenu -->
        <div class="text-center lg:text-left">
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 font-display">
            NAVIGUEZ DANS
            <span class="text-violet-400">LA BRUME</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-300 font-serif">
            Histoires mystiques où légendes et réalité se mêlent
          </p>
        </div>
      </div>
    </div>
  </header>
</template>
```

### CTA Section Standard

```vue
<template>
  <section class="relative z-10 px-4 mb-16">
    <div class="max-w-6xl mx-auto">
      <div class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-violet-900 to-violet-600 p-8">
        <div class="relative z-10">
          <h2 class="text-2xl md:text-3xl font-bold text-white mb-8 text-center font-display">
            Créez Votre Personnage
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Cartes univers -->
            <UniversCard
              v-for="univers in systeme.univers"
              :key="univers.id"
              :univers="univers"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
```

## TypeScript Interfaces

### Interfaces Systèmes

```typescript
// app/composables/useSystemes.ts
interface SystemeJeu {
  id: string
  nomComplet: string
  description: string
  siteOfficiel?: string
  versionSupportee?: string
  actif: boolean
  couleurPrimaire?: string
  couleurSecondaire?: string
  pictogramme?: string
  univers?: UniversJeu[]
}

interface UniversJeu {
  id: string
  nomComplet: string
  description?: string
  siteOfficiel?: string
  actif: boolean
  couleurPrimaire?: string
  couleurSecondaire?: string
  pictogramme?: string
}

interface SystemCard {
  code: string
  nom: string
  description: string
  icon: string
  classes: {
    bg: string
    border: string
    text: string
    badgeBg: string
    badgeBorder: string
  }
  univers?: Array<{
    code: string
    nom: string
    icon?: string
  }>
}
```

### Interface Document / Personnage

```typescript
interface Document {
  id: number
  titre: string
  type: 'CHARACTER' | 'TOWN' | 'GROUP' | 'ORGANIZATION' | 'DANGER' | 'GENERIQUE'
  systemeJeu: string
  contenu: Record<string, any>
  statut: 'BROUILLON' | 'PUBLIE' | 'ARCHIVE' | 'TEMPORAIRE'
  utilisateurId?: number
}
```

## State Management (Pinia)

### Store Systèmes

```typescript
// shared/stores/systemes.ts
import { defineStore } from 'pinia'

export const useSystemesStore = defineStore('systemes', {
  state: (): SystemesState => ({
    systemes: [],
    systemesCards: { mainColumn: [], secondColumn: [] },
    systemeActuel: null,
    universActuel: null,
    isLoading: false,
    error: null
  }),

  getters: {
    systemesActifs: (state) => state.systemes.filter(s => s.actif),
    systemesSupportes: () => ['mistengine']
  },

  actions: {
    async chargerSystemes() {
      const { chargerSystemes } = useSystemes()
      await chargerSystemes()
      this.systemes = systemes.value
    }
  }
})
```

## Composants Réutilisables

### SystemCard Component

```vue
<!-- app/components/SystemCard.vue -->
<script setup lang="ts">
interface Props {
  system: SystemCard
}
defineProps<Props>()
</script>

<template>
  <div
    :class="`bg-gray-900 rounded-lg p-6 border ${system.classes.border} hover:${system.classes.border} transition-all`"
  >
    <div class="flex items-start justify-between mb-4">
      <Icon
        :name="system.icon"
        :class="`text-4xl ${system.classes.text}`"
      />
    </div>

    <h3 class="text-xl font-bold text-white mb-2">{{ system.nom }}</h3>
    <p class="text-gray-400 mb-4">{{ system.description }}</p>

    <!-- Liste des univers -->
    <div class="flex flex-wrap gap-2">
      <span
        v-for="univers in system.univers"
        :key="univers.code"
        :class="`px-2 py-1 rounded text-xs ${system.classes.badgeBg} ${system.classes.text} border ${system.classes.badgeBorder}`"
      >
        {{ univers.nom }}
      </span>
    </div>
  </div>
</template>
```

### UniversCard Component

```vue
<!-- app/components/UniversCard.vue -->
<script setup lang="ts">
interface Props {
  univers: UniversJeu
}
defineProps<Props>()
</script>

<template>
  <NuxtLink
    :to="`/systemes/mistengine/${univers.id}`"
    class="block bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-violet-500/20 hover:border-violet-500/40 transition-all"
  >
    <h3 class="text-lg font-bold text-white mb-2">{{ univers.nomComplet }}</h3>
    <p class="text-gray-400 text-sm">{{ univers.description }}</p>
  </NuxtLink>
</template>
```

## Styles Tailwind CSS

### Classes personnalisées

```css
/* app/assets/css/tailwind.css */

/* Filtres d'images */
.mystical-character-filter {
  filter: hue-rotate(320deg) saturate(0.8) brightness(0.9) contrast(1.0);
}

/* Classes helper pour les sections */
.hero-section {
  @apply relative pt-20 pb-16 px-4 overflow-hidden;
}

.hero-content {
  @apply max-w-7xl mx-auto relative z-10;
}

.cta-section {
  @apply relative z-10 px-4 mb-16;
}

.cta-container {
  @apply relative rounded-2xl overflow-hidden p-8 mb-12;
}
```

### Configuration Tailwind pour Mist Engine

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'mist': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',  // primary
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        }
      }
    }
  }
}
```

## Règles d'Espacement Standard

### Espacements Nuxt 4

- **Hero padding** : `pt-20 pb-16 px-4`
- **Section padding** : `px-4 mb-16`
- **Container max** : `max-w-6xl mx-auto` (standard), `max-w-7xl mx-auto` (hero)
- **Grille gap** : `gap-6` (cartes), `gap-12` (hero layout)
- **Boutons gap** : `gap-4`

### Z-Index Hiérarchie

- **Background effects** : `absolute inset-0`
- **Content** : `relative z-10`
- **Modals/Overlays** : `z-50`

### Border Radius

- **Cartes** : `rounded-lg`
- **CTA containers** : `rounded-2xl`
- **Boutons** : `rounded-lg`
- **Inputs** : `rounded-lg`

## Navigation Adaptative

### Menu principal dynamique

```vue
<template>
  <nav class="bg-gray-900/90 backdrop-blur-sm">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="text-white font-bold text-xl">
          Brumisater
        </NuxtLink>

        <!-- Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <NuxtLink
            to="/systemes/mistengine"
            class="flex items-center text-gray-300 hover:text-violet-400 transition-colors"
          >
            <Icon name="ra:ra-fog" class="text-violet-400 mr-2" />
            <span>Mist Engine</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>
```

### Breadcrumbs automatiques

```vue
<template>
  <nav class="text-sm text-gray-400 mb-4">
    <div class="flex items-center space-x-2">
      <NuxtLink to="/" class="hover:text-violet-400">
        Accueil
      </NuxtLink>
      <Icon name="heroicons:chevron-right" class="text-gray-600" />

      <NuxtLink :to="`/systemes/${systemeId}`" class="hover:text-violet-400">
        {{ systemeName }}
      </NuxtLink>
      <Icon name="heroicons:chevron-right" class="text-gray-600" />

      <span class="text-violet-400">{{ universName }}</span>
    </div>
  </nav>
</template>
```

## API Routes Utilisées

### Récupération des systèmes

```typescript
// GET /api/systems
// Retourne tous les systèmes actifs avec leurs univers

// GET /api/systems/:id
// Retourne un système spécifique

// GET /api/systems/cards
// Retourne les systèmes formatés pour affichage en cartes
```

### Exemple d'utilisation dans une page

```vue
<script setup lang="ts">
const { data: systemes } = await useFetch('/api/systems')
const { data: systemCards } = await useFetch('/api/systems/cards')
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <SystemCard
      v-for="system in systemCards.data.mainColumn"
      :key="system.code"
      :system="system"
    />
  </div>
</template>
```

## Avantages de l'Architecture Nuxt 4

### Performance

- **Hydration partielle** : Composants chargés à la demande
- **Auto-imports** : Composables et composants importés automatiquement
- **Tree-shaking** : Code non utilisé supprimé
- **Image optimization** : Avec NuxtImg

### Développement

- **TypeScript natif** : Support complet TS
- **Hot Module Replacement** : Rechargement instantané
- **File-based routing** : Routes générées automatiquement
- **Composition API** : Code réutilisable et testable

### SEO

- **SSR/SSG** : Rendu côté serveur ou statique
- **Meta tags dynamiques** : useHead() pour le SEO
- **URLs propres** : `/systemes/mistengine/city-of-mist`

### Maintenabilité

- **Composables** : Logique réutilisable
- **Typage fort** : TypeScript partout
- **Auto-imports** : Moins de boilerplate
- **Convention over configuration** : Structure claire

## Références

- [Nuxt 4 Documentation](https://nuxt.com/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Pinia State Management](https://pinia.vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
