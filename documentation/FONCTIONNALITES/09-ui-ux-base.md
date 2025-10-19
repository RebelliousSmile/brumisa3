# UI/UX Base MVP

## Vue d'Ensemble
Layout et navigation de base pour Brumisa3 avec header, sidebar playspaces, zone de contenu principale. Desktop uniquement en MVP, thème clair uniquement, responsive mobile et dark mode reportés en v1.1.

## User Stories

### US-090 : Naviguer dans l'application
**En tant que** Léa
**Je veux** naviguer facilement entre les sections de l'application
**Afin de** accéder rapidement à mes personnages, playspaces et paramètres

**Contexte** : Léa utilise Brumisa3 pour gérer 3 personnages et 2 playspaces.

**Critères d'acceptation** :
- [ ] Header persistant avec logo, navigation principale, profil utilisateur
- [ ] Sidebar gauche avec liste playspaces et switch rapide
- [ ] Zone de contenu principale (main) pour pages dynamiques
- [ ] Footer avec liens utiles (Dons, Sponsors, A Propos, Legal)
- [ ] Navigation responsive (desktop 1280px+ recommandé)

**Exemples** :
```
Léa visite /playspaces/workspace-aria
→ Header affiche : Logo | Personnages | Playspaces | Support
→ Sidebar affiche : Liste 2 playspaces (Workspace Aria actif)
→ Main affiche : Détails Workspace Aria
→ Footer affiche : Liens footer
```

### US-091 : Changer de playspace rapidement
**En tant que** Léa
**Je veux** switcher de playspace via sidebar
**Afin de** passer rapidement entre mes univers de jeu

**Contexte** : Léa gère 2 playspaces ("Workspace Aria" et "Campagne Marc") et veut basculer entre les deux.

**Critères d'acceptation** :
- [ ] Sidebar gauche liste tous les playspaces de l'utilisateur
- [ ] Playspace actif surligné visuellement (background, bordure)
- [ ] Clic sur playspace → Redirection vers /playspaces/:id
- [ ] Indicateur visuel du playspace actif dans header ou breadcrumb
- [ ] Temps chargement switch < 500ms

**Exemples** :
```
Sidebar:
+---------------------------+
| MES PLAYSPACES            |
+---------------------------+
| [Active] Workspace Aria   |  ← Background bleu, bordure gauche
|          3 personnages    |
+---------------------------+
| Campagne Marc             |  ← Background gris clair
| 1 personnage              |
+---------------------------+
| [+ Nouveau Playspace]     |
+---------------------------+

Léa clique "Campagne Marc"
→ Redirection /playspaces/campagne-marc-uuid
→ Header breadcrumb : Campagne Marc > Personnages
→ Sidebar : "Campagne Marc" devient actif
```

### US-092 : Accéder aux sections principales
**En tant que** Léa
**Je veux** accéder aux sections via navigation header
**Afin de** naviguer entre Personnages, Playspaces, Profil, Support

**Contexte** : Léa veut créer un nouveau personnage depuis n'importe quelle page.

**Critères d'acceptation** :
- [ ] Navigation header : Personnages | Playspaces | Profil | Support
- [ ] Lien "Personnages" → /playspaces/:activeId/characters
- [ ] Lien "Playspaces" → /playspaces
- [ ] Lien "Profil" → /profile
- [ ] Lien "Support" → /support (dons, sponsors)
- [ ] Item actif souligné ou surligné

**Exemples** :
```
Header:
+--------------------------------------------------+
| [Logo Brumisa3]  Personnages | Playspaces |     |
|                  Profil | Support          [Avatar] |
+--------------------------------------------------+

Léa clique "Personnages"
→ Redirection /playspaces/workspace-aria/characters
→ "Personnages" souligné dans header
```

### US-093 : Utiliser le thème clair (MVP uniquement)
**En tant que** Léa
**Je veux** utiliser l'application en thème clair
**Afin de** avoir une expérience visuelle cohérente

**Contexte** : MVP v1.0 propose uniquement thème clair, dark mode en v1.1.

**Critères d'acceptation** :
- [ ] Thème clair par défaut (background blanc/gris clair)
- [ ] Palette Brumisa : Blues (#1E40AF, #3B82F6), Purples (#7C3AED), Grays (#6B7280, #F3F4F6)
- [ ] Contraste WCAG AA minimum (4.5:1 texte, 3:1 UI)
- [ ] Pas de toggle dark mode en MVP (reporté v1.1)
- [ ] Consistent avec identité visuelle "Brume et Mystère"

**Exemples** :
```
Palette MVP v1.0:
- Background principal : #FFFFFF
- Background secondaire : #F3F4F6 (gris clair)
- Texte principal : #1F2937 (gris foncé)
- Texte secondaire : #6B7280 (gris moyen)
- Primary actions : #3B82F6 (bleu)
- Danger : #EF4444 (rouge)
- Success : #10B981 (vert)
```

### US-094 : Naviguer en desktop uniquement (MVP)
**En tant que** Léa
**Je veux** utiliser l'application sur desktop
**Afin de** gérer mes personnages confortablement

**Contexte** : MVP v1.0 cible desktop uniquement (1280px+), mobile en v1.1.

**Critères d'acceptation** :
- [ ] Résolution recommandée : 1280px width minimum
- [ ] Layout fixe (pas de responsive mobile en MVP)
- [ ] Message d'avertissement si viewport < 1024px : "Version mobile en v1.1"
- [ ] Navigation optimisée souris/clavier (pas de touch gestures)
- [ ] Support browsers : Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

**Exemples** :
```
Léa ouvre Brumisa3 sur laptop 1920x1080
→ Layout complet : Header + Sidebar + Main + Footer
→ Sidebar 280px, Main fluide, confortable

Léa essaie sur tablette 768px
→ Banner sticky : "Version mobile en développement (v1.1)"
→ Layout fonctionne mais non optimisé
→ Suggestion : "Utilisez un écran 1280px+ pour meilleure expérience"
```

## Layout Principal

### Structure Générale
```
+--------------------------------------------------+
|                    HEADER                        |
|  [Logo] Navigation          [Avatar] [Logout]    |
+--------------------------------------------------+
|         |                                         |
| SIDEBAR |              MAIN CONTENT               |
|         |                                         |
| Play-   |  +----------------------------------+  |
| spaces  |  |                                  |  |
|         |  |  Page dynamique                  |  |
| - WS 1  |  |  (Characters, Playspaces, etc.)  |  |
| - WS 2  |  |                                  |  |
|         |  |                                  |  |
| [+ New] |  +----------------------------------+  |
|         |                                         |
+--------------------------------------------------+
|                    FOOTER                        |
|  Dons | Sponsors | A Propos | Mentions Légales   |
+--------------------------------------------------+
```

### Dimensions
```
Header : 64px hauteur fixe
Sidebar : 280px largeur fixe (collapsible en v1.2)
Main : Fluide (width: calc(100% - 280px))
Footer : 48px hauteur fixe
Total width recommandé : 1280px minimum
```

## Navigation

### Routes Principales
```typescript
const routes = [
  { path: '/', component: HomePage },                      // Landing page
  { path: '/signup', component: SignupPage },              // Inscription
  { path: '/login', component: LoginPage },                // Connexion
  { path: '/playspaces', component: PlayspacesListPage },  // Liste playspaces
  { path: '/playspaces/:id', component: PlayspaceDetailPage }, // Détail playspace
  { path: '/playspaces/:id/characters', component: CharactersListPage }, // Liste personnages
  { path: '/characters/:id', component: CharacterDetailPage }, // Détail personnage
  { path: '/characters/:id/edit', component: CharacterEditPage }, // Edition personnage
  { path: '/profile', component: ProfilePage },            // Profil utilisateur
  { path: '/support', component: SupportPage },            // Support/Dons
  { path: '/about', component: AboutPage },                // A propos
  { path: '/legal', component: LegalPage },                // Mentions légales
];
```

### Breadcrumbs
```
Affichage contexte navigation actuel

Exemples:
/playspaces/workspace-aria
→ Playspaces > Workspace Aria

/playspaces/workspace-aria/characters
→ Workspace Aria > Personnages

/characters/aria-uuid/edit
→ Workspace Aria > Personnages > Aria the Mist Weaver > Edition
```

### Indicateur Playspace Actif
```
Header (ou sous-header) affiche playspace actif:

+--------------------------------------------------+
| [Logo] Navigation              [Avatar] [Logout] |
+--------------------------------------------------+
| Playspace actif : Workspace Aria (3 personnages) |
+--------------------------------------------------+
```

## Design System

### Tailwind Configuration (suggestion)
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        brumisa: {
          blue: {
            DEFAULT: '#3B82F6',
            dark: '#1E40AF',
            light: '#93C5FD',
          },
          purple: {
            DEFAULT: '#7C3AED',
            dark: '#5B21B6',
            light: '#C4B5FD',
          },
          gray: {
            DEFAULT: '#6B7280',
            dark: '#1F2937',
            light: '#F3F4F6',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px
        'base': '1rem',     // 16px
        'lg': '1.125rem',   // 18px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
      }
    }
  }
};
```

### Composants de Base

#### Button
```vue
<template>
  <button
    :class="[
      'px-4 py-2 rounded-md font-medium transition-colors',
      variantClasses[variant],
      sizeClasses[size]
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary, secondary, danger, ghost
  size: { type: String, default: 'md' },         // sm, md, lg
  disabled: { type: Boolean, default: false }
});

const variantClasses = {
  primary: 'bg-brumisa-blue text-white hover:bg-brumisa-blue-dark',
  secondary: 'bg-brumisa-gray-light text-brumisa-gray-dark hover:bg-gray-200',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  ghost: 'bg-transparent text-brumisa-blue hover:bg-brumisa-gray-light'
};

const sizeClasses = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3'
};
</script>
```

#### Card
```vue
<template>
  <div class="bg-white rounded-lg shadow-md border border-brumisa-gray-light p-6">
    <h3 v-if="title" class="text-xl font-heading font-semibold mb-4">
      {{ title }}
    </h3>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: { type: String, required: false }
});
</script>
```

#### Input
```vue
<template>
  <div class="space-y-1">
    <label v-if="label" :for="id" class="block text-sm font-medium text-brumisa-gray-dark">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="w-full px-3 py-2 border border-brumisa-gray rounded-md focus:ring-2 focus:ring-brumisa-blue focus:border-transparent"
      v-model="modelValue"
    />
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    <p v-if="hint" class="text-sm text-brumisa-gray">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  id: { type: String, required: true },
  label: { type: String },
  type: { type: String, default: 'text' },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  error: { type: String },
  hint: { type: String },
  modelValue: { type: String }
});
</script>
```

#### Modal
```vue
<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50"
        @click="$emit('close')"
      ></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <button
          class="absolute top-4 right-4 text-brumisa-gray hover:text-brumisa-gray-dark"
          @click="$emit('close')"
        >
          <IconClose />
        </button>

        <h2 v-if="title" class="text-2xl font-heading font-semibold mb-4">
          {{ title }}
        </h2>

        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps({
  show: { type: Boolean, required: true },
  title: { type: String }
});

defineEmits(['close']);
</script>
```

## Règles Métier UX

### Performance
1. **Temps de chargement pages < 2s** : Toutes pages principales (liste, détail) chargent en < 2s
2. **Transitions < 300ms** : Animations navigation, modals, hover states en < 300ms
3. **Feedback immédiat** : Loading states affichés dès le clic (< 100ms)
4. **Optimistic UI** : Mise à jour UI immédiate, rollback si erreur serveur

### Accessibilité
1. **WCAG AA minimum** : Contraste 4.5:1 texte, 3:1 UI components
2. **Navigation clavier** : Tab, Enter, Espace fonctionnent partout
3. **Labels ARIA** : Tous inputs, buttons, links ont labels appropriés
4. **Focus visible** : Indicateurs focus visibles (outline, ring)
5. **Alt text images** : Toutes images ont alt descriptif

### Feedback Utilisateur
1. **Loading states** : Spinners, skeletons, progress bars pour opérations > 500ms
2. **Success messages** : Toasts verts 3s pour actions réussies
3. **Error messages** : Messages rouges clairs avec action corrective suggérée
4. **Confirmations** : Modals confirmation pour actions destructives (suppression)
5. **Tooltips** : Informations contextuelles sur hover (délai 500ms)

### Cohérence Visuelle
1. **Espacement système 4px** : Multiples de 4px pour tous espacements (4, 8, 12, 16, 24, 32, 48, 64)
2. **Typographie cohérente** : Heading (Poppins), Body (Inter), tailles définies
3. **Couleurs limitées** : Palette Brumisa uniquement, pas de couleurs custom
4. **Icônes uniformes** : Heroicons ou Lucide Icons, taille 20px/24px
5. **Borders radius** : 4px (small), 8px (medium), 12px (large)

## Critères d'Acceptation Globaux

### Fonctionnel
- [ ] Header persistant avec navigation et profil utilisateur
- [ ] Sidebar playspaces avec switch rapide et indicateur actif
- [ ] Routes principales fonctionnelles (/playspaces, /characters, /profile, /support)
- [ ] Breadcrumbs contextuels affichés
- [ ] Footer avec liens utiles

### Performance
- [ ] Temps chargement pages < 2s (liste 10 items, détail complet)
- [ ] Transitions navigation < 300ms
- [ ] Switch playspace < 500ms
- [ ] Feedback loading immédiat (< 100ms après clic)
- [ ] First Contentful Paint (FCP) < 1.5s

### UX
- [ ] Navigation intuitive (3 clics max pour atteindre n'importe quelle page)
- [ ] Indicateurs visuels états (actif, hover, focus, disabled)
- [ ] Messages succès/erreur clairs et actionnables
- [ ] Loading states pendant opérations asynchrones
- [ ] Accessibilité clavier complète

### Technique
- [ ] Nuxt 4 avec Vue 3 Composition API
- [ ] Tailwind CSS avec configuration Brumisa custom
- [ ] Pinia pour state global (playspace actif, session utilisateur)
- [ ] Composables pour navigation (usePlayspace, useNavigation)
- [ ] Layout système Nuxt (<NuxtLayout>, <NuxtPage>)

## Exemples Concrets

### Parcours Léa : Navigation Quotidienne (Timeline)

**Jour 1 - 20h00** : Ouverture application
```
Léa visite https://brumisa3.app
→ Landing page (/) avec présentation
→ Clique [Se connecter]
→ /login → Formulaire login
→ Login en 380ms
→ Redirection /playspaces (liste playspaces)
```

**Jour 1 - 20h01** : Sélection playspace
```
Page /playspaces affiche 2 playspaces
→ Sidebar vide (pas encore de playspace actif)
→ Léa clique "Workspace Aria"
→ Redirection /playspaces/workspace-aria
→ Sidebar : "Workspace Aria" devient actif (background bleu)
→ Header breadcrumb : "Workspace Aria"
→ Main affiche : Dashboard playspace (3 personnages)
```

**Jour 1 - 20h02** : Navigation vers personnages
```
Léa clique "Personnages" dans header
→ Redirection /playspaces/workspace-aria/characters
→ "Personnages" souligné dans header
→ Breadcrumb : "Workspace Aria > Personnages"
→ Liste 3 personnages affichée en < 500ms
```

**Jour 1 - 20h05** : Edition personnage
```
Léa clique "Modifier" sur Aria
→ Redirection /characters/aria-uuid/edit
→ Breadcrumb : "Workspace Aria > Personnages > Aria"
→ Page édition chargée en 1.2s
→ Sidebar : "Workspace Aria" reste actif
```

**Jour 1 - 20h15** : Switch playspace rapide
```
Léa veut vérifier personnage dans autre playspace
→ Clique "Campagne Marc" dans sidebar
→ Redirection /playspaces/campagne-marc-uuid
→ Switch en 320ms
→ Sidebar : "Campagne Marc" devient actif
→ Header breadcrumb : "Campagne Marc"
→ Main affiche : Dashboard Campagne Marc (1 personnage)
```

**Jour 1 - 20h20** : Accès profil
```
Léa clique avatar dans header
→ Dropdown menu : Profil | Paramètres | Déconnexion
→ Clique "Profil"
→ Redirection /profile
→ Page profil chargée en 450ms
```

### Parcours Léa : Message Mobile (Desktop Requis)

**Jour 3 - 12h00** : Tentative mobile
```
Léa ouvre Brumisa3 sur smartphone (375px)
→ Banner sticky top:
   "Version mobile en développement (v1.1)
    Utilisez un écran 1280px+ pour meilleure expérience"
→ Layout fonctionne mais sidebar collapse en menu hamburger
→ Léa décide d'attendre desktop
```

## Contraintes Techniques

### Layout Composant (suggestion)
```vue
<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="h-16 bg-white border-b border-brumisa-gray-light sticky top-0 z-40">
      <div class="container mx-auto h-full flex items-center justify-between px-4">
        <div class="flex items-center space-x-8">
          <NuxtLink to="/" class="flex items-center space-x-2">
            <img src="/logo.svg" alt="Brumisa3" class="h-8" />
            <span class="font-heading font-bold text-xl">Brumisa3</span>
          </NuxtLink>

          <nav class="flex space-x-6">
            <NuxtLink to="/playspaces" class="hover:text-brumisa-blue">Playspaces</NuxtLink>
            <NuxtLink to="/characters" class="hover:text-brumisa-blue">Personnages</NuxtLink>
            <NuxtLink to="/support" class="hover:text-brumisa-blue">Support</NuxtLink>
          </nav>
        </div>

        <div class="flex items-center space-x-4">
          <UserMenu />
        </div>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="flex-1 flex">
      <!-- Sidebar -->
      <aside class="w-70 bg-brumisa-gray-light border-r border-brumisa-gray">
        <PlayspacesSidebar />
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>

    <!-- Footer -->
    <footer class="h-12 bg-brumisa-gray-light border-t border-brumisa-gray">
      <div class="container mx-auto h-full flex items-center justify-center space-x-6 text-sm text-brumisa-gray">
        <NuxtLink to="/support" class="hover:text-brumisa-blue">Dons</NuxtLink>
        <NuxtLink to="/sponsors" class="hover:text-brumisa-blue">Sponsors</NuxtLink>
        <NuxtLink to="/about" class="hover:text-brumisa-blue">A Propos</NuxtLink>
        <NuxtLink to="/legal" class="hover:text-brumisa-blue">Mentions Légales</NuxtLink>
      </div>
    </footer>
  </div>
</template>
```

### Pinia Store Playspace (suggestion)
```typescript
// stores/playspace.ts
import { defineStore } from 'pinia';

export const usePlayspaceStore = defineStore('playspace', () => {
  const activePlayspaceId = ref<string | null>(null);
  const playspaces = ref<Playspace[]>([]);

  const activePlayspace = computed(() =>
    playspaces.value.find(p => p.id === activePlayspaceId.value)
  );

  const setActivePlayspace = (id: string) => {
    activePlayspaceId.value = id;
    // Optionnel : sauvegarder dans localStorage pour persistance
    localStorage.setItem('activePlayspaceId', id);
  };

  const fetchPlayspaces = async () => {
    const data = await $fetch('/api/playspaces');
    playspaces.value = data;

    // Restaurer playspace actif depuis localStorage
    const savedId = localStorage.getItem('activePlayspaceId');
    if (savedId && playspaces.value.find(p => p.id === savedId)) {
      activePlayspaceId.value = savedId;
    } else if (playspaces.value.length > 0) {
      activePlayspaceId.value = playspaces.value[0].id;
    }
  };

  return {
    activePlayspaceId,
    activePlayspace,
    playspaces,
    setActivePlayspace,
    fetchPlayspaces
  };
});
```

### Composable Navigation (suggestion)
```typescript
// composables/useNavigation.ts
export const useNavigation = () => {
  const router = useRouter();
  const playspaceStore = usePlayspaceStore();

  const goToPlayspace = (playspaceId: string) => {
    playspaceStore.setActivePlayspace(playspaceId);
    router.push(`/playspaces/${playspaceId}`);
  };

  const goToCharacters = () => {
    const activeId = playspaceStore.activePlayspaceId;
    if (activeId) {
      router.push(`/playspaces/${activeId}/characters`);
    } else {
      router.push('/playspaces');
    }
  };

  const goToCharacterEdit = (characterId: string) => {
    router.push(`/characters/${characterId}/edit`);
  };

  return {
    goToPlayspace,
    goToCharacters,
    goToCharacterEdit
  };
};
```

## Scope MVP vs Versions Futures

### MVP v1.0
- Layout desktop avec header, sidebar, main, footer
- Navigation playspaces via sidebar
- Thème clair uniquement
- Desktop 1280px+ recommandé
- Routes principales fonctionnelles
- Composants base : Button, Card, Input, Modal
- Accessibilité WCAG AA
- Performance < 2s chargement pages

### v1.1
- Dark mode avec toggle header
- Responsive mobile (320px+)
- Sidebar collapsible
- Touch gestures support
- PWA offline mode
- Command palette (Cmd+K)

### v2.0+
- Thèmes custom utilisateur
- Layout personnalisable (drag & drop widgets)
- Raccourcis clavier avancés
- Animations avancées (transitions pages, micro-interactions)
- Accessibilité WCAG AAA

---
**Date** : 2025-01-19
**Version** : 1.0
**Statut** : Validé
**Priorité** : P0 (MVP)