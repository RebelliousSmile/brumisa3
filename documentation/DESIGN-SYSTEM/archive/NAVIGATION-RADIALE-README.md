# Navigation Radiale - Interface Immersive

Interface de navigation inspirée des arbres de compétences de jeux vidéo, remplaçant la sidebar classique par des menus radiaux flottants.

## Aperçu Rapide

**2 Menus Flottants :**
- Menu Playspaces (violet, bottom-left) - Gestion univers de jeu
- Menu Action Database (orange, bottom-right) - Outils contextuels

**Navigation :**
- Desktop : Déploiement radial en arc 120°
- Mobile : Modal full-screen avec liste verticale
- Keyboard : Tab, Enter, Escape
- Accessibilité WCAG 2.1 AAA complète

## Démarrage Rapide

### 1. Tester la Démo

```bash
pnpm dev
```

Naviguer vers : `http://localhost:3000/demo-radial`

### 2. Utiliser dans une Page

```vue
<script setup>
definePageMeta({
  layout: 'playspace'
})
</script>

<template>
  <div>
    <!-- Votre contenu plein écran -->
    <!-- Les menus radiaux sont automatiques -->
  </div>
</template>
```

### 3. Intégration Stores (TODO)

```ts
// Dans RadialPlayspaceMenu.vue, remplacer les mocks

// Avant (mock)
const mockPlayspaces = ref([...])

// Après (store Pinia)
const playspaceStore = usePlayspaceStore()
const { playspaces, activePlayspace } = storeToRefs(playspaceStore)

const switchPlayspace = async (playspaceId: string) => {
  await playspaceStore.setActivePlayspace(playspaceId)
  closeMenu()
}
```

## Composants Créés

### 1. RadialPlayspaceMenu.vue
**Localisation** : `app/components/common/RadialPlayspaceMenu.vue`

**Features :**
- Orbe violet bottom-left avec badge notification
- Déploiement radial 120° (8 playspaces max visible)
- Bouton "Nouveau Playspace" inclus
- Responsive : Desktop (radial) / Mobile (modal)
- Keyboard navigation complète

**Props :**
```ts
interface Props {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  maxVisible?: number // default: 8
}
```

### 2. RadialActionMenu.vue
**Localisation** : `app/components/common/RadialActionMenu.vue`

**Features :**
- Orbe orange bottom-right avec badge contexte (LITM, CoM, etc.)
- Actions contextuelles (Oracles, Moves, Themebooks, etc.)
- Actions désactivées affichent badge version (v2.0, etc.)
- Architecture identique à RadialPlayspaceMenu

**Actions Disponibles (MVP) :**
- Oracles (enabled)
- Moves (enabled)
- Themebooks (enabled)
- Reference (enabled)
- Investigation Board (disabled, badge v2.0)

### 3. Layout playspace.vue
**Localisation** : `app/layouts/playspace.vue`

**Structure :**
```
Header (CommonHeader)
Main (plein écran, pas de margin-left)
  └── Slot (contenu page)
  └── RadialPlayspaceMenu (bottom-left)
  └── RadialActionMenu (bottom-right)
Footer (CommonFooter)
```

### 4. Composable useRadialMenu.ts
**Localisation** : `app/composables/useRadialMenu.ts`

**API :**
```ts
const {
  activeMenu,        // 'playspace' | 'action' | null
  isAnyMenuOpen,     // boolean
  openMenu,          // (type) => void
  closeMenu,         // () => void
  toggleMenu,        // (type) => void
  isMenuOpen         // (type) => boolean
} = useRadialMenu()
```

**Features :**
- État global partagé entre menus
- Ferme automatiquement l'autre menu quand l'un s'ouvre
- Keyboard handler global (Escape ferme tout)
- TODO: Analytics tracking

### 5. Page Démo demo-radial.vue
**Localisation** : `app/pages/demo-radial.vue`

**URL** : `/demo-radial`

**Contenu :**
- Guide d'utilisation complet
- Grille features avec cartes
- Instructions desktop/mobile
- Status indicator (menu ouvert/fermé)
- Zone démo interactive

## Architecture Technique

### Animations GPU-Accelerated

**Propriétés utilisées :**
- `transform` (translate, scale, rotate)
- `opacity`
- `will-change` (seulement quand actif)

**Éviter :**
- `width`, `height`, `left`, `top` (reflow)
- `box-shadow` animé
- `filter` (sauf backdrop-blur modal)

### Transitions CSS

**Radial Expansion (desktop) :**
```css
.radial-expand-enter-active {
  transition: opacity 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.radial-expand-enter-active button {
  transition:
    transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55),
    opacity 300ms ease;
  transition-delay: calc(var(--index) * 50ms);
}
```

**Mobile Slide Up :**
```css
.slide-up-enter-active {
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Reduced Motion Support

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

### Calcul Position Radiale

```ts
const getRadialPosition = (index: number, total: number) => {
  const spreadAngle = 120 // degrees
  const startAngle = position.includes('bottom') ? -150 : -30
  const radius = isMobile ? 100 : 140 // px

  const angle = startAngle + (spreadAngle / (total - 1)) * index
  const radian = (angle * Math.PI) / 180

  const x = Math.cos(radian) * radius
  const y = Math.sin(radian) * radius

  return {
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
    transitionDelay: `${index * 50}ms`
  }
}
```

## Accessibilité (WCAG 2.1 AAA)

### Keyboard Navigation
- `Tab` : Navigation entre orbes et options
- `Enter` / `Space` : Ouvrir/sélectionner
- `Escape` : Fermer tous les menus

### ARIA Attributes
- `role="button"` sur orbes centraux
- `role="menu"` sur conteneurs déployés
- `role="menuitem"` sur chaque option
- `aria-expanded` sur orbes
- `aria-controls` pour lier orbe et menu
- `aria-label` descriptif sur tous les boutons

### Touch Targets
- Orbes : 72px desktop, 56px mobile (bien au-dessus minimum 48px)
- Options radiales : 64px diamètre
- Espacement : 16px minimum

### Contrast
- Orbes : Gradient violet/orange sur blanc (>7:1)
- Texte : Noir sur blanc (21:1)
- Focus ring : 4px solid (>3:1)

## Responsive Breakpoints

**Desktop (>1024px) :**
- Orbes 72px
- Déploiement radial arc 120°
- Rayon 140px

**Tablet (768-1023px) :**
- Orbes 56px
- Arc réduit 90°
- Rayon 100px

**Mobile (<768px) :**
- Orbes 56px bottom-center
- Modal full-screen
- Liste verticale scrollable

## Migration depuis Sidebar

### Option A : Migration Progressive

```vue
<!-- Anciennes pages gardent playspace.vue -->
<!-- Nouvelles pages utilisent playspace.vue -->

<script setup>
definePageMeta({
  layout: 'playspace'
})
</script>
```

### Option B : Migration Totale

```bash
# 1. Renommer ancien layout (backup)
mv app/layouts/playspace.vue app/layouts/playspace-sidebar-old.vue

# 2. Renommer nouveau layout
mv app/layouts/playspace.vue app/layouts/playspace.vue

# 3. Archiver sidebar (ne pas supprimer immédiatement)
mkdir app/components/common/_archive
mv app/components/common/Sidebar.vue app/components/common/_archive/
```

## Tests E2E (TODO)

```ts
// tests/e2e/radial-navigation.spec.ts

test('should open playspace menu on click', async ({ page }) => {
  await page.goto('/demo-radial')
  await page.click('[aria-label="Playspace navigation"]')
  await expect(page.locator('#playspace-menu')).toBeVisible()
})

test('should close menu on Escape', async ({ page }) => {
  await page.goto('/demo-radial')
  await page.click('[aria-label="Playspace navigation"]')
  await page.keyboard.press('Escape')
  await expect(page.locator('#playspace-menu')).not.toBeVisible()
})
```

## Customization

### Changer Position des Menus

```vue
<CommonRadialPlayspaceMenu position="top-left" />
<CommonRadialActionMenu position="top-right" />
```

### Limiter Nombre d'Options

```vue
<CommonRadialPlayspaceMenu :max-visible="5" />
```

### Ajouter Nouvelle Action

```ts
// Dans RadialActionMenu.vue > availableActions
{
  id: 'dice-roller',
  label: 'Jets de Des',
  icon: 'heroicons:cube',
  path: '/dice',
  enabled: true,
  description: 'Lancer des des et voir historique'
}
```

### Customiser Couleurs

```vue
<!-- Changer gradient orbe -->
<button class="bg-gradient-to-br from-blue-600 to-blue-800">
  <!-- Au lieu de from-brand-violet to-purple-700 -->
</button>
```

## Performance

### Métriques Cibles
- Temps ouverture menu : <100ms
- FPS animations : 60fps constant
- Bundle size : <15KB gzipped par composant

### Optimisations Appliquées
- GPU acceleration (transform, opacity)
- `will-change` seulement quand nécessaire
- Transitions CSS pures (pas de JS)
- Lazy load components (TODO)
- Virtual scrolling 50+ playspaces (TODO v1.2)

## Troubleshooting

### Menu ne s'ouvre pas
1. Vérifier Z-index (doit être 50+)
2. Console errors (imports manquants)
3. Vérifier `isExpanded` state

### Animations saccadées
1. `will-change` seulement actif quand nécessaire
2. Pas d'animations propriétés non-GPU
3. `prefers-reduced-motion` respecté

### Chevauchement avec contenu
```vue
<main class="pb-24"> <!-- Reserve espace -->
  <slot />
</main>
```

## Roadmap

**v1.0 (MVP) - Actuel :**
- [x] RadialPlayspaceMenu component
- [x] RadialActionMenu component
- [x] Layout playspace
- [x] Composable useRadialMenu
- [x] Page démo complète
- [x] Responsive desktop/mobile
- [x] Accessibilité WCAG 2.1 AAA
- [ ] Intégration stores Pinia
- [ ] Tests E2E Playwright

**v1.1 (Améliorations) :**
- [ ] Arrow keys navigation circulaire
- [ ] Gesture support (pinch, swipe)
- [ ] Haptic feedback mobile
- [ ] Animation presets

**v1.2 (Performance) :**
- [ ] Virtual scrolling 50+ playspaces
- [ ] Lazy load menu options
- [ ] Service Worker cache

**v1.3 (Features) :**
- [ ] Multi-niveau radial (sous-menus)
- [ ] Drag & drop playspaces
- [ ] Quick actions (long press)

## Documentation Complète

Voir : `documentation/FONCTIONNALITES/navigation-radiale-implementation.md`

## Inspiration Design

- Path of Exile skill tree
- Assassin's Creed skill wheel
- Skyrim perk trees
- Destiny 2 subclass customization

## Stack Technique

- Vue 3.5+ Composition API
- UnoCSS (Tailwind-style utilities)
- Nuxt 4 layouts
- Vanilla JS (pas de VueUse pour éviter dépendance)

## Support

**Questions / Issues :**
- Consulter `/demo-radial` pour exemples visuels
- Vérifier `documentation/ARCHITECTURE/` pour contexte
- Tester sur `/demo-radial` avant modification

Créé le : 2025-01-21
Dernière mise à jour : 2025-01-21
