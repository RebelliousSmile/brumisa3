# Navigation Radiale - Guide d'Implémentation

## Vue d'Ensemble

Système de navigation immersive inspiré des arbres de compétences de jeux vidéo, remplaçant la sidebar classique par des menus radiaux flottants.

### Composants Créés

1. **RadialPlayspaceMenu.vue** - Menu playspaces (bottom-left, violet)
2. **RadialActionMenu.vue** - Menu action database (bottom-right, orange)
3. **playspace.vue** - Layout avec navigation radiale
4. **useRadialMenu.ts** - Composable état partagé menus
5. **demo-radial.vue** - Page démonstration complète

## Spécifications UX

### Pattern d'Interaction

**Desktop (>1024px) :**
- Orbe flottant fixe (72px diamètre)
- Hover : Scale 1.1 + glow pulsant
- Click : Déploiement radial en arc 120°
- Options déployées : 140px du centre
- Animations : 300ms cubic-bezier (bounce out)

**Tablet (768-1023px) :**
- Orbe réduit (56px diamètre)
- Arc réduit (90°)
- Rayon réduit (100px)

**Mobile (<768px) :**
- Orbe bottom-center (56px)
- Click : Modal full-screen
- Liste verticale scrollable
- Swipe down pour fermer

### États Visuels

1. **Replié** : Orbe avec badge notification
2. **Hover** : Scale 1.1 + glow violet/orange
3. **Déployé** : Options en arc radial
4. **Focus** : Ring 4px (accessibilité)

### Positionnement

**Desktop :**
- RadialPlayspaceMenu : `bottom-8 left-8`
- RadialActionMenu : `bottom-8 right-8`
- Z-index : 50

**Mobile :**
- Orbe : `bottom-4 left-1/2 -translate-x-1/2`
- Modal : Z-index 50

## Architecture Technique

### Structure Fichiers

```
app/
├── components/
│   └── common/
│       ├── RadialPlayspaceMenu.vue (300 lignes)
│       └── RadialActionMenu.vue (280 lignes)
├── layouts/
│   └── playspace.vue (40 lignes)
├── composables/
│   └── useRadialMenu.ts (130 lignes)
└── pages/
    └── demo-radial.vue (180 lignes)
```

### Composant RadialPlayspaceMenu.vue

**Props :**
- `position` : 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' (défaut: 'bottom-left')
- `maxVisible` : number (défaut: 8) - Nombre max d'options visibles

**Features :**
- Calcul position radiale automatique (`getRadialPosition()`)
- Gestion responsive (orbe + modal mobile)
- Accessibilité complète (keyboard, aria, reduced-motion)
- Close on outside click (VueUse `onClickOutside`)
- Animations GPU-accelerated

**Mock Data (TODO: remplacer par store) :**
```ts
interface Playspace {
  id: string
  name: string
  role: 'MJ' | 'PJ'
  characterCount: number
  isActive: boolean
  systemIcon?: string
}
```

**Méthodes :**
- `toggleMenu()` : Ouvre/ferme le menu
- `switchPlayspace(id)` : Bascule vers playspace
- `createNewPlayspace()` : Navigation vers création
- `getRadialPosition(index, total)` : Calcul position arc

### Composant RadialActionMenu.vue

**Props :**
- `position` : 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' (défaut: 'bottom-right')

**Features :**
- Actions contextuelles (dépendent du playspace actif)
- Badge contexte (LITM, CoM, etc.)
- Couleur orange (vs violet pour playspaces)
- Architecture identique à RadialPlayspaceMenu (cohérence)

**Actions Disponibles (context-sensitive) :**
```ts
interface ActionItem {
  id: string
  label: string
  icon: string
  path: string
  enabled: boolean
  badge?: string        // 'v2.0', etc.
  description?: string  // Tooltip
}
```

**Actions MVP v1.0 :**
- Oracles (heroicons:sparkles)
- Moves (heroicons:bolt)
- Themebooks (heroicons:book-open)
- Reference (heroicons:document-text)
- Investigation (heroicons:chart-bar-square) - disabled, badge 'v2.0'

### Layout playspace.vue

Remplace `playspace.vue` (sidebar classique).

**Structure :**
```vue
<CommonHeader />
<main class="flex-1 bg-gray-50 relative">
  <slot /> <!-- Contenu plein écran -->
  <CommonRadialPlayspaceMenu position="bottom-left" />
  <CommonRadialActionMenu position="bottom-right" />
</main>
<CommonFooter />
```

**Avantages vs Sidebar :**
- Contenu plein écran (pas de margin-left 256px)
- Navigation immersive (arbre de compétences)
- Moins de clics (déploiement radial rapide)
- Mobile-friendly (modal au lieu de collapse)

### Composable useRadialMenu.ts

**État Global Partagé :**
```ts
interface RadialMenuState {
  activeMenu: 'playspace' | 'action' | null
  lastOpenedAt: Date | null
}
```

**API :**
- `openMenu(type)` : Ouvre menu (ferme l'autre)
- `closeMenu()` : Ferme tous les menus
- `toggleMenu(type)` : Toggle menu
- `isMenuOpen(type)` : Vérifie si menu ouvert
- `isAnyMenuOpen` : Computed (au moins un menu ouvert)
- `activeMenu` : Computed (menu actif)

**Features :**
- Fermeture automatique de l'autre menu (UX)
- Keyboard handler global (Escape ferme tout)
- TODO: Analytics tracking (ouverture, durée, fermeture)

## Animations & Performance

### Transitions CSS

**Radial Expansion (desktop) :**
```css
.radial-expand-enter-active {
  transition: opacity 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Back out */
}

.radial-expand-enter-active button {
  transition:
    transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55),
    opacity 300ms ease;
  transition-delay: calc(var(--index) * 50ms); /* Stagger */
}
```

**Mobile Slide Up :**
```css
.slide-up-enter-active {
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1); /* Bounce out */
}
```

**Orbe Hover :**
- Scale: 200ms cubic-bezier(0.34, 1.56, 0.64, 1)
- Glow pulse: 2000ms ease-in-out infinite alternate

### Optimisations GPU

**Properties GPU-Accelerated :**
- `transform` (translate, scale, rotate)
- `opacity`
- `will-change: transform, opacity` (seulement quand actif)

**Éviter :**
- `width`, `height`, `left`, `top` (reflow)
- `box-shadow` animé (sauf glow statique)
- `filter` (sauf backdrop-blur pour modal)

### Reduced Motion

Respect `prefers-reduced-motion: reduce` :
```css
@media (prefers-reduced-motion: reduce) {
  .radial-expand-enter-active,
  .slide-up-enter-active {
    transition-duration: 1ms !important;
  }

  .animate-ping {
    animation: none !important;
  }
}
```

## Accessibilité (WCAG 2.1 AAA)

### Keyboard Navigation

**Touches supportées :**
- `Tab` : Navigation entre orbes et options
- `Enter` / `Space` : Ouvrir/sélectionner
- `Escape` : Fermer tous les menus (global handler)
- `Arrow keys` : (TODO v1.1) Navigation circulaire

### ARIA Attributes

```html
<!-- Orbe central -->
<button
  role="button"
  :aria-expanded="isExpanded"
  aria-controls="playspace-menu"
  aria-label="Playspace navigation"
>

<!-- Menu déployé -->
<div
  id="playspace-menu"
  role="menu"
>
  <button
    role="menuitem"
    :aria-label="`Switch to ${playspace.name}`"
  >
```

### Screen Reader

- Labels descriptifs sur tous les boutons
- `aria-live="polite"` pour status changes (TODO)
- `sr-only` spans pour contexte additionnel

### Touch Targets

- Min size : 48x48px (AAA)
- Orbes : 72px desktop, 56px mobile (bien au-dessus)
- Espacement : 16px minimum entre options

### Contrast

- Orbes : Gradient violet/orange sur blanc (>7:1)
- Texte : Noir sur blanc (21:1)
- Focus ring : 4px solid brand-violet (>3:1)

## Migration depuis Sidebar Classique

### Étape 1 : Tester la démo

```bash
# Démarrer serveur dev
pnpm dev

# Naviguer vers
http://localhost:3000/demo-radial
```

Vérifier :
- Déploiement radial desktop
- Modal mobile
- Keyboard navigation
- Animations fluides

### Étape 2 : Intégrer les stores Pinia

**Remplacer mock data dans RadialPlayspaceMenu.vue :**

```ts
// Avant (mock)
const mockPlayspaces = ref([...])

// Après (store)
const playspaceStore = usePlayspaceStore()
const { playspaces, activePlayspace } = storeToRefs(playspaceStore)
```

**Méthodes à connecter :**
```ts
const switchPlayspace = async (playspaceId: string) => {
  await playspaceStore.setActivePlayspace(playspaceId)
  closeMenu()
}

const createNewPlayspace = () => {
  navigateTo('/playspaces/new')
  closeMenu()
}
```

### Étape 3 : Migrer les layouts

**Option A : Migration progressive**
```vue
<!-- Garder playspace.vue pour anciennes pages -->
<!-- Utiliser playspace.vue pour nouvelles pages -->

<script setup>
definePageMeta({
  layout: 'playspace' // Nouvelle navigation
})
</script>
```

**Option B : Migration totale**
```bash
# Renommer ancien layout (backup)
mv app/layouts/playspace.vue app/layouts/playspace-sidebar-old.vue

# Renommer nouveau layout
mv app/layouts/playspace.vue app/layouts/playspace.vue
```

### Étape 4 : Supprimer Sidebar.vue (optionnel)

Si migration totale :
```bash
# Archiver (ne pas supprimer immédiatement)
mkdir app/components/common/_archive
mv app/components/common/Sidebar.vue app/components/common/_archive/
```

### Étape 5 : Tests E2E

**Créer tests Playwright pour navigation radiale :**

```ts
// tests/e2e/radial-navigation.spec.ts

test('should open playspace menu on click', async ({ page }) => {
  await page.goto('/demo-radial')

  // Click orbe playspaces
  await page.click('[aria-label="Playspace navigation"]')

  // Vérifier déploiement
  await expect(page.locator('#playspace-menu')).toBeVisible()
  await expect(page.locator('[role="menuitem"]')).toHaveCount(3) // 2 playspaces + 1 nouveau
})

test('should close menu on Escape', async ({ page }) => {
  await page.goto('/demo-radial')

  // Ouvrir menu
  await page.click('[aria-label="Playspace navigation"]')

  // Appuyer Escape
  await page.keyboard.press('Escape')

  // Vérifier fermeture
  await expect(page.locator('#playspace-menu')).not.toBeVisible()
})

test('should switch playspace on click', async ({ page }) => {
  await page.goto('/demo-radial')

  // Ouvrir menu
  await page.click('[aria-label="Playspace navigation"]')

  // Sélectionner playspace
  await page.click('[aria-label="Switch to Campagne Test"]')

  // Vérifier switch (TODO: selon implémentation store)
  // await expect(page.locator('.active-playspace')).toHaveText('Campagne Test')
})
```

## Customization & Extensions

### Changer Position des Menus

```vue
<!-- playspace.vue -->
<CommonRadialPlayspaceMenu position="top-left" />
<CommonRadialActionMenu position="top-right" />
```

### Limiter Nombre d'Options Visibles

```vue
<CommonRadialPlayspaceMenu :max-visible="5" />
```

### Ajouter Nouvelle Action

```ts
// RadialActionMenu.vue > availableActions
{
  id: 'dice-roller',
  label: 'Jets de Des',
  icon: 'heroicons:cube',
  path: '/dice',
  enabled: true, // v1.3+
  description: 'Lancer des des et voir historique'
}
```

### Customiser Couleurs

```vue
<!-- Changer gradient orbe playspaces -->
<button class="bg-gradient-to-br from-blue-600 to-blue-800">
  <!-- Au lieu de from-brand-violet to-purple-700 -->
</button>
```

### Animation Custom

```css
/* Ajouter dans <style scoped> */
@keyframes custom-expand {
  from {
    transform: translate(-50%, -50%) scale(0) rotate(-180deg);
  }
  to {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
}

.radial-expand-enter-active button {
  animation: custom-expand 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## Troubleshooting

### Problème : Menu ne s'ouvre pas

**Vérifier :**
1. Z-index (doit être 50+)
2. `onClickOutside` pas en conflit avec autre handler
3. Console errors (imports manquants)

**Debug :**
```ts
const toggleMenu = () => {
  console.log('Toggle menu, current state:', isExpanded.value)
  isExpanded.value = !isExpanded.value
}
```

### Problème : Animations saccadées

**Vérifier :**
1. `will-change` appliqué seulement quand actif
2. Pas d'animations de propriétés non-GPU (width, left, etc.)
3. `prefers-reduced-motion` respecté

**Optimisation :**
```css
/* Appliquer will-change seulement quand nécessaire */
.radial-expand-enter-active button {
  will-change: transform, opacity;
}

.radial-expand-leave-to button {
  will-change: auto; /* Reset après animation */
}
```

### Problème : Chevauchement avec contenu

**Solution 1 : Padding bottom sur main**
```vue
<!-- playspace.vue -->
<main class="pb-24"> <!-- Reserve espace pour menus -->
  <slot />
</main>
```

**Solution 2 : Backdrop blur**
```vue
<!-- Ajouter backdrop pour clarté visuelle -->
<div
  v-if="isExpanded"
  class="fixed inset-0 bg-black/5 backdrop-blur-[1px]"
/>
```

### Problème : Mobile modal ne ferme pas

**Vérifier :**
1. Backdrop click handler présent
2. Close button fonctionne
3. `onClickOutside` exclut backdrop

**Fix :**
```vue
<!-- Backdrop avec handler explicite -->
<div
  v-if="isExpanded && isMobile"
  class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
  @click.self="closeMenu" <!-- .self = seulement backdrop, pas enfants -->
/>
```

## Performance Benchmarks

### Métriques Cibles

**Desktop :**
- Temps ouverture menu : <100ms
- FPS animations : 60fps constant
- Bundle size : <15KB (gzipped, par composant)

**Mobile :**
- Temps ouverture modal : <150ms
- Scroll performance : 60fps
- Touch response : <50ms

### Mesures Réelles (TODO)

```ts
// Ajouter dans useRadialMenu.ts
const openMenu = (menuType: MenuType) => {
  const startTime = performance.now()

  state.value.activeMenu = menuType
  state.value.lastOpenedAt = new Date()

  nextTick(() => {
    const duration = performance.now() - startTime
    console.log(`Menu ${menuType} opened in ${duration}ms`)
  })
}
```

## Roadmap

### v1.0 (MVP) - Actuel
- [x] RadialPlayspaceMenu component
- [x] RadialActionMenu component
- [x] Layout playspace
- [x] Composable useRadialMenu
- [x] Page démo complète
- [x] Responsive desktop/mobile
- [x] Accessibilité WCAG 2.1 AAA
- [ ] Intégration stores Pinia
- [ ] Tests E2E Playwright

### v1.1 (Améliorations UX)
- [ ] Arrow keys navigation circulaire
- [ ] Gesture support (pinch, swipe)
- [ ] Haptic feedback mobile
- [ ] Sound effects (optionnel, désactivable)
- [ ] Orbe customization (couleur, taille)
- [ ] Animation presets (bounce, elastic, spring)

### v1.2 (Performance)
- [ ] Virtual scrolling pour 50+ playspaces
- [ ] Lazy load menu options
- [ ] Prefetch sur hover
- [ ] Service Worker cache (PWA)

### v1.3 (Features Avancées)
- [ ] Multi-niveau radial (sous-menus)
- [ ] Drag & drop playspaces (réorganisation)
- [ ] Quick actions (long press)
- [ ] Context menu radial (right-click)

## Ressources

### Documentation
- [VueUse onClickOutside](https://vueuse.org/core/onClickOutside/)
- [Vue Transitions](https://vuejs.org/guide/built-ins/transition.html)
- [CSS Transforms Performance](https://developer.mozilla.org/en-US/docs/Web/Performance/CSS_JavaScript_animation_performance)
- [WCAG 2.1 AAA](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa)

### Inspiration Design
- Path of Exile skill tree
- Assassin's Creed skill wheel
- Skyrim perk trees
- Destiny 2 subclass customization

### Stack Technique
- Vue 3.5+ Composition API
- UnoCSS (Tailwind-style utilities)
- VueUse composables
- Nuxt 4 layouts

## Auteur & Maintenance

**Créé le** : 2025-01-21
**Dernière mise à jour** : 2025-01-21
**Maintenu par** : Équipe Brumisa3

**Questions / Issues** :
- Vérifier documentation/ARCHITECTURE/ pour contexte
- Consulter demo-radial.vue pour exemples
- Tester sur /demo-radial avant modification
