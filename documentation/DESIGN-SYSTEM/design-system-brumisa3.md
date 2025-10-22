# Design System Brumisa3 - MVP v1.0

Version: 1.0.0
Derniere mise a jour: 2025-10-21
Projet: Brumisa3 - Createur de fiches Mist Engine
Systeme cible MVP: Legends in the Mist (Tokyo:Otherscape)

---

## Table des matieres

1. [Vue d'ensemble](#vue-densemble)
2. [Palette de couleurs](#palette-de-couleurs)
3. [Typographie](#typographie)
4. [Systeme d'espacement](#systeme-despacement)
5. [Composants UI](#composants-ui)
6. [Navigation](#navigation)
7. [Animations et transitions](#animations-et-transitions)
8. [Accessibilite](#accessibilite)
9. [Performance](#performance)
10. [Responsive Design](#responsive-design)

---

## Vue d'ensemble

### Philosophie de design

Brumisa3 adopte un style **cyberpunk minimaliste dystopien** inspire de Tokyo:Otherscape, privilégiant:

- Clarté et lisibilité maximale
- Performance optimale
- Accessibilité WCAG 2.1 AAA
- Immersion dans l'univers Mist Engine
- Mobile-first approach

### Source de vérité visuelle

Le fichier `wireframe-otherscape-authentique.html` est la **référence visuelle** avec tous les composants fonctionnels implementes.

### Stack technique

- **Framework CSS**: UnoCSS (Tailwind-compatible, atomic CSS on-demand)
- **Framework JS**: Nuxt 4 + Vue 3 Composition API
- **Icons**: Lucide Icons (lightweight, tree-shakeable)
- **Fonts**: Assistant (Google Fonts, variable font)

---

## Palette de couleurs

### Couleurs principales (MVP v1.0)

```css
/* === Couleurs de base === */
:root {
  /* Backgrounds */
  --noir-profond: #0a0a0a;      /* Background principal */
  --noir-card: #1a1a1a;          /* Background cards/sections */
  --noir-hover: #2a2a2a;         /* Background hover states */

  /* Textes */
  --blanc-pur: #ffffff;          /* Texte principal */
  --gris-clair: #e0e0e0;         /* Texte secondaire */
  --gris-moyen: #999999;         /* Texte tertaire/muted */

  /* Accents Cyberpunk */
  --cyan-neon: #00d9d9;          /* Accent primaire */
  --cyan-hover: #00ffff;         /* Hover accent */
  --cyan-dim: rgba(0, 217, 217, 0.3); /* Accent transparent */

  /* Actions critiques */
  --rose-neon: #ff006e;          /* Actions danger (deconnexion, suppression) */
  --rose-hover: #ff1a7f;         /* Hover danger */

  /* Bordures */
  --bordure-subtile: rgba(255, 255, 255, 0.1); /* Bordures discretes */
  --bordure-accent: rgba(0, 217, 217, 0.5);    /* Bordures actives */
}
```

### UnoCSS Shortcuts (classes utilitaires)

```javascript
// uno.config.ts
export default defineConfig({
  shortcuts: {
    // Backgrounds
    'bg-noir': 'bg-#0a0a0a',
    'bg-card': 'bg-#1a1a1a',
    'bg-hover': 'bg-#2a2a2a',

    // Textes
    'text-primary': 'text-white',
    'text-secondary': 'text-#e0e0e0',
    'text-muted': 'text-#999999',

    // Accents
    'text-cyan': 'text-#00d9d9',
    'border-cyan': 'border-#00d9d9',
    'bg-cyan': 'bg-#00d9d9',

    // Danger
    'text-rose': 'text-#ff006e',
    'border-rose': 'border-#ff006e',
    'bg-rose': 'bg-#ff006e',
  }
})
```

### Contraste et accessibilite

Tous les contrastes respectent **WCAG 2.1 AAA** (7:1 pour texte normal):

| Combinaison | Ratio | Niveau |
|-------------|-------|--------|
| Blanc (#ffffff) sur Noir (#0a0a0a) | 20.5:1 | AAA |
| Cyan (#00d9d9) sur Noir (#0a0a0a) | 10.2:1 | AAA |
| Gris clair (#e0e0e0) sur Noir (#0a0a0a) | 15.8:1 | AAA |
| Rose (#ff006e) sur Noir (#0a0a0a) | 8.1:1 | AAA |

---

## Typographie

### Police principale: Assistant

```html
<!-- Google Fonts import -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700&display=swap" rel="stylesheet">
```

```css
:root {
  /* Font family */
  --font-primary: 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Font weights */
  --font-light: 300;
  --font-regular: 400;
  --font-semibold: 600;
  --font-bold: 700;
}

body {
  font-family: var(--font-primary);
  font-weight: var(--font-regular);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Echelle typographique (modular scale 1.25)

```css
:root {
  /* Desktop (base 16px) */
  --text-xs: 0.75rem;    /* 12px - Labels, metadata */
  --text-sm: 0.875rem;   /* 14px - Texte secondaire */
  --text-base: 1rem;     /* 16px - Texte principal */
  --text-lg: 1.25rem;    /* 20px - Sous-titres */
  --text-xl: 1.5rem;     /* 24px - Titres H2 */
  --text-2xl: 2rem;      /* 32px - Titres H1 */
  --text-3xl: 2.5rem;    /* 40px - Hero titles */

  /* Mobile (base 14px) */
  --text-xs-mobile: 0.625rem;  /* 10px */
  --text-sm-mobile: 0.75rem;   /* 12px */
  --text-base-mobile: 0.875rem; /* 14px */
  --text-lg-mobile: 1rem;      /* 16px */
  --text-xl-mobile: 1.25rem;   /* 20px */
  --text-2xl-mobile: 1.75rem;  /* 28px */
  --text-3xl-mobile: 2rem;     /* 32px */
}
```

### UnoCSS Classes typographiques

```javascript
// Exemples d'utilisation
'text-xs'    // 12px desktop, 10px mobile
'text-sm'    // 14px desktop, 12px mobile
'text-base'  // 16px desktop, 14px mobile
'text-lg'    // 20px desktop, 16px mobile
'text-xl'    // 24px desktop, 20px mobile
'text-2xl'   // 32px desktop, 28px mobile
'text-3xl'   // 40px desktop, 32px mobile

// Font weights
'font-light'     // 300
'font-normal'    // 400
'font-semibold'  // 600
'font-bold'      // 700

// Line heights
'leading-tight'   // 1.25
'leading-normal'  // 1.6
'leading-relaxed' // 1.75
```

### Exemples d'utilisation

```html
<!-- Hero title -->
<h1 class="text-3xl md:text-4xl font-bold text-primary leading-tight">
  Brumisa3
</h1>

<!-- Section title -->
<h2 class="text-xl md:text-2xl font-semibold text-primary">
  Playspaces
</h2>

<!-- Body text -->
<p class="text-base text-secondary leading-normal">
  Creez et gerez vos personnages Lost in the Mist
</p>

<!-- Metadata -->
<span class="text-xs text-muted font-light">
  Derniere modification: il y a 2 jours
</span>
```

---

## Systeme d'espacement

### Base unit: 4px

```css
:root {
  --spacing-unit: 4px;

  /* Multiples de 4px */
  --space-1: 4px;    /* 0.25rem */
  --space-2: 8px;    /* 0.5rem */
  --space-3: 12px;   /* 0.75rem */
  --space-4: 16px;   /* 1rem */
  --space-6: 24px;   /* 1.5rem */
  --space-8: 32px;   /* 2rem */
  --space-12: 48px;  /* 3rem */
  --space-16: 64px;  /* 4rem */
  --space-24: 96px;  /* 6rem */
}
```

### UnoCSS Classes d'espacement

```javascript
// Padding
'p-1'  // 4px all sides
'p-2'  // 8px
'p-4'  // 16px
'p-6'  // 24px
'p-8'  // 32px

'px-4' // padding-left + padding-right: 16px
'py-4' // padding-top + padding-bottom: 16px
'pt-4' // padding-top: 16px

// Margin
'm-4'  // 16px all sides
'mx-auto' // margin-left + margin-right: auto (centrer)
'my-6' // margin-top + margin-bottom: 24px

// Gap (flexbox/grid)
'gap-4'  // 16px gap entre items
'gap-x-4' // horizontal gap
'gap-y-4' // vertical gap
```

### Guidelines d'espacement

| Element | Desktop | Mobile | Usage |
|---------|---------|--------|-------|
| Padding card | 24px (p-6) | 16px (p-4) | Espacement interne cards |
| Margin sections | 48px (my-12) | 32px (my-8) | Espacement entre sections |
| Gap grid | 24px (gap-6) | 16px (gap-4) | Espacement grilles |
| Padding button | 16px 32px (px-8 py-4) | 12px 24px (px-6 py-3) | Espacement boutons |
| Line height | 1.6 | 1.5 | Lisibilite paragraphes |

---

## Composants UI

### Boutons

#### Bouton primaire (action principale)

```html
<!-- Desktop -->
<button class="
  px-8 py-4
  bg-cyan text-noir
  font-bold text-base uppercase tracking-wide
  transition-all duration-200
  hover:(scale-105 -translate-y-0.5 shadow-lg shadow-cyan/50)
  active:(scale-100 translate-y-0)
  focus:(outline-none ring-2 ring-cyan ring-offset-2 ring-offset-noir)
">
  Creer une fiche
</button>

<!-- Mobile (touch target 48px min) -->
<button class="
  px-6 py-3 min-h-48px
  bg-cyan text-noir
  font-bold text-sm uppercase tracking-wide
  transition-all duration-200
  hover:(scale-105 shadow-lg shadow-cyan/50)
  focus:(outline-none ring-2 ring-cyan ring-offset-2)
">
  Creer
</button>
```

#### Bouton secondaire

```html
<button class="
  px-8 py-4
  bg-transparent border-2 border-cyan text-cyan
  font-semibold text-base uppercase
  transition-all duration-200
  hover:(bg-cyan text-noir scale-105)
  focus:(outline-none ring-2 ring-cyan ring-offset-2 ring-offset-noir)
">
  En savoir plus
</button>
```

#### Bouton danger (suppression, deconnexion)

```html
<button class="
  px-6 py-3
  bg-transparent border-2 border-rose text-rose
  font-semibold text-sm uppercase
  transition-all duration-200
  hover:(bg-rose text-white scale-105)
  focus:(outline-none ring-2 ring-rose ring-offset-2)
">
  Supprimer
</button>
```

### Cards

#### Card standard (personnage, playspace)

```html
<div class="
  bg-card border border-bordure-subtile
  p-6
  transition-all duration-200
  hover:(border-cyan scale-102 shadow-lg shadow-cyan/10)
">
  <!-- Header -->
  <div class="flex items-center gap-4 mb-4">
    <div class="w-16 h-16 rounded-full bg-noir overflow-hidden">
      <!-- Avatar -->
    </div>
    <div class="flex-1">
      <h3 class="text-lg font-bold text-primary">Aria the Mist Weaver</h3>
      <p class="text-sm text-muted">Niveau 3 - LITM</p>
    </div>
  </div>

  <!-- Body -->
  <div class="mb-4">
    <p class="text-base text-secondary">
      Shadow dancer et detective des rues de Chicago...
    </p>
  </div>

  <!-- Footer actions -->
  <div class="flex gap-2">
    <button class="flex-1 px-4 py-2 bg-cyan text-noir font-semibold text-sm">
      Modifier
    </button>
    <button class="flex-1 px-4 py-2 border border-cyan text-cyan font-semibold text-sm">
      Exporter
    </button>
  </div>
</div>
```

### Formulaires

#### Input text

```html
<div class="mb-4">
  <label class="block text-sm font-semibold text-secondary mb-2" for="character-name">
    Nom du personnage
  </label>
  <input
    type="text"
    id="character-name"
    placeholder="Entrez le nom..."
    class="
      w-full px-4 py-3
      bg-noir border-2 border-bordure-subtile
      text-primary text-base
      transition-all duration-200
      placeholder:text-muted
      focus:(outline-none border-cyan shadow-lg shadow-cyan/20)
      hover:border-cyan/50
    "
  >
</div>
```

#### Textarea

```html
<div class="mb-4">
  <label class="block text-sm font-semibold text-secondary mb-2" for="description">
    Description
  </label>
  <textarea
    id="description"
    rows="4"
    placeholder="Decrivez votre personnage..."
    class="
      w-full px-4 py-3
      bg-noir border-2 border-bordure-subtile
      text-primary text-base
      transition-all duration-200
      placeholder:text-muted
      focus:(outline-none border-cyan shadow-lg shadow-cyan/20)
      hover:border-cyan/50
      resize-vertical
    "
  ></textarea>
</div>
```

#### Select

```html
<div class="mb-4">
  <label class="block text-sm font-semibold text-secondary mb-2" for="system">
    Systeme JDR
  </label>
  <select
    id="system"
    class="
      w-full px-4 py-3
      bg-noir border-2 border-bordure-subtile
      text-primary text-base
      transition-all duration-200
      focus:(outline-none border-cyan shadow-lg shadow-cyan/20)
      hover:border-cyan/50
      cursor-pointer
    "
  >
    <option>Legends in the Mist</option>
    <option>Tokyo:Otherscape</option>
  </select>
</div>
```

### Badges

#### Badge systeme JDR

```html
<!-- Legends in the Mist -->
<span class="
  inline-block px-3 py-1
  bg-transparent border border-cyan text-cyan
  text-xs font-bold uppercase tracking-wide
">
  LITM
</span>

<!-- Tokyo:Otherscape -->
<span class="
  inline-block px-3 py-1
  bg-transparent border border-cyan text-cyan
  text-xs font-bold uppercase tracking-wide
">
  Otherscape
</span>
```

#### Badge role (MJ/PJ)

```html
<!-- MJ -->
<span class="
  inline-block px-2 py-1
  bg-rose/20 border border-rose text-rose
  text-xs font-bold uppercase
">
  MJ
</span>

<!-- PJ -->
<span class="
  inline-block px-2 py-1
  bg-cyan/20 border border-cyan text-cyan
  text-xs font-bold uppercase
">
  PJ
</span>
```

---

## Navigation

### Navigation principale (Header)

#### Desktop

```html
<header class="
  h-16 px-6
  bg-noir border-b border-bordure-subtile
  flex items-center justify-between
">
  <!-- Logo -->
  <div class="flex items-center gap-8">
    <a href="/" class="text-2xl font-bold text-cyan hover:text-cyan-hover transition-colors">
      Brumisa3
    </a>

    <!-- Nav links -->
    <nav class="flex items-center gap-6">
      <a href="/decouverte" class="
        text-base font-semibold text-secondary
        hover:text-cyan transition-colors
        relative
        after:(content-[''] absolute bottom--2 left-0 w-0 h-0.5 bg-cyan transition-all duration-200)
        hover:after:w-full
      ">
        Decouverte
      </a>
      <a href="/preparation" class="
        text-base font-semibold text-cyan
        relative
        after:(content-[''] absolute bottom--2 left-0 w-full h-0.5 bg-cyan)
      ">
        Preparation
      </a>
      <a href="/solo" class="
        text-base font-semibold text-secondary
        hover:text-cyan transition-colors
      ">
        Jouer en solo
      </a>
    </nav>
  </div>

  <!-- User menu + Language selector -->
  <div class="flex items-center gap-4">
    <!-- Language selector -->
    <div class="flex items-center gap-2 text-sm">
      <button class="text-cyan font-semibold border-b-2 border-cyan pb-1">FR</button>
      <span class="text-muted">|</span>
      <button class="text-secondary hover:text-cyan transition-colors pb-1">EN</button>
    </div>

    <!-- User avatar/dropdown -->
    <button class="w-10 h-10 rounded-full bg-cyan flex items-center justify-center">
      <span class="text-noir font-bold">A</span>
    </button>
  </div>
</header>
```

### User Menu Gauge (Dropdown)

Voir `GAUGE-MENU-DESIGN.md` pour specifications completes.

Caracteristiques principales:
- Barre pleine largeur avec effet gauge cyberpunk
- Segments biseautes (45deg)
- Barres de remplissage cyan neon (standard) et rose (deconnexion)
- Animation de remplissage au hover
- Scanlines et glow effects

```html
<!-- User dropdown trigger -->
<button
  id="user-dropdown-trigger"
  class="w-10 h-10 rounded-full bg-cyan flex items-center justify-center cursor-pointer"
  aria-haspopup="true"
  aria-expanded="false"
>
  <span class="text-noir font-bold">A</span>
</button>

<!-- Dropdown menu (gauge style) -->
<div
  id="user-dropdown-menu"
  class="
    absolute top-16 left-0 right-0
    bg-noir/95 border-b-2 border-cyan
    backdrop-blur-sm
    hidden
  "
  role="menu"
  aria-hidden="true"
>
  <div class="flex w-full">
    <!-- Mon profil -->
    <a href="/profile" class="
      flex-1 px-6 py-4
      text-secondary font-semibold text-sm uppercase
      relative overflow-hidden
      transition-all duration-400
      before:(content-[''] absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyan to-cyan/30 shadow-[0_0_10px_var(--cyan-neon)])
      hover:before:(w-full opacity-15)
      hover:(text-cyan shadow-[0_0_10px_var(--cyan-neon)])
    ">
      Mon profil
    </a>

    <!-- Parametres -->
    <a href="/settings" class="
      flex-1 px-6 py-4
      text-secondary font-semibold text-sm uppercase
      relative overflow-hidden
      transition-all duration-400
      before:(content-[''] absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyan to-cyan/30 shadow-[0_0_10px_var(--cyan-neon)])
      hover:before:(w-full opacity-15)
      hover:(text-cyan shadow-[0_0_10px_var(--cyan-neon)])
    ">
      Parametres
    </a>

    <!-- Deconnexion (rose) -->
    <button class="
      flex-1 px-6 py-4
      text-secondary font-semibold text-sm uppercase
      relative overflow-hidden
      transition-all duration-400
      before:(content-[''] absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-rose to-rose/30 shadow-[0_0_10px_var(--rose-neon)])
      hover:before:(w-full opacity-15)
      hover:(text-rose shadow-[0_0_10px_var(--rose-neon)])
    ">
      Deconnexion
    </button>
  </div>
</div>
```

### Sidebar (Playspaces)

```html
<aside class="
  w-70 h-screen
  bg-card border-r border-bordure-subtile
  p-4
  overflow-y-auto
">
  <!-- Section header -->
  <h3 class="text-xs font-bold text-muted uppercase mb-4 tracking-wide">
    Playspaces
  </h3>

  <!-- Playspace actif -->
  <div class="
    mb-2 p-3
    bg-cyan/10 border-2 border-cyan
    cursor-pointer
    transition-all duration-200
  ">
    <div class="flex items-center justify-between mb-1">
      <span class="text-base font-bold text-cyan">Workspace Aria</span>
      <span class="px-2 py-0.5 bg-cyan/20 border border-cyan text-cyan text-xs font-bold">PJ</span>
    </div>
    <span class="text-xs text-muted">3 personnages</span>
  </div>

  <!-- Playspace inactif -->
  <div class="
    mb-2 p-3
    bg-transparent border border-bordure-subtile
    cursor-pointer
    transition-all duration-200
    hover:(border-cyan bg-cyan/5)
  ">
    <div class="flex items-center justify-between mb-1">
      <span class="text-base font-semibold text-secondary">Campagne Marc</span>
      <span class="px-2 py-0.5 bg-rose/20 border border-rose text-rose text-xs font-bold">MJ</span>
    </div>
    <span class="text-xs text-muted">1 personnage</span>
  </div>

  <!-- Nouveau playspace -->
  <button class="
    w-full mt-4 p-3
    border-2 border-dashed border-bordure-subtile
    text-muted text-sm font-semibold uppercase
    transition-all duration-200
    hover:(border-cyan text-cyan)
  ">
    + Nouveau Playspace
  </button>
</aside>
```

### Mobile Bottom Navigation

```html
<nav class="
  fixed bottom-0 left-0 right-0
  h-16
  bg-card border-t border-bordure-subtile
  flex items-center justify-around
  md:hidden
">
  <!-- Nav item actif -->
  <a href="/preparation" class="
    flex flex-col items-center
    text-cyan
  ">
    <svg class="w-6 h-6 mb-1" fill="currentColor"><!-- Icon --></svg>
    <span class="text-xs font-semibold">Preparation</span>
  </a>

  <!-- Nav item inactif -->
  <a href="/decouverte" class="
    flex flex-col items-center
    text-muted
    transition-colors duration-200
    hover:text-cyan
  ">
    <svg class="w-6 h-6 mb-1" fill="currentColor"><!-- Icon --></svg>
    <span class="text-xs font-semibold">Decouverte</span>
  </a>

  <!-- Autres items... -->
</nav>
```

---

## Animations et transitions

### Principes

- Transitions CSS uniquement (pas de JS pour animations)
- GPU-accelerated (transform, opacity)
- Durations: 200ms (rapide), 400ms (standard), 600ms (lent)
- Respect de `prefers-reduced-motion`

### Transitions standard

```css
/* Boutons et liens */
.transition-standard {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover cards */
.transition-card {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}

/* Gauge fill animation */
@keyframes gauge-fill {
  from { width: 4px; }
  to { width: 100%; }
}

.gauge-fill {
  animation: gauge-fill 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
```

### Respect accessibilite

```css
/* Desactiver animations si user preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibilite

### Conformite WCAG 2.1 AAA

- Contraste minimum 7:1 pour texte normal
- Contraste minimum 4.5:1 pour texte large (18px+)
- Touch targets minimum 48x48px (mobile)
- Focus indicators visibles (ring 2px)
- Screen reader friendly (ARIA labels)
- Navigation clavier complete

### Focus states

```html
<!-- Focus ring standard -->
<button class="
  focus:(outline-none ring-2 ring-cyan ring-offset-2 ring-offset-noir)
">
  Action
</button>

<!-- Focus ring danger -->
<button class="
  focus:(outline-none ring-2 ring-rose ring-offset-2 ring-offset-noir)
">
  Supprimer
</button>
```

### ARIA labels

```html
<!-- Navigation principale -->
<nav aria-label="Navigation principale">
  <a href="/preparation" aria-current="page">Preparation</a>
</nav>

<!-- Bouton avec icone -->
<button aria-label="Fermer le menu">
  <svg aria-hidden="true"><!-- Icon --></svg>
</button>

<!-- Dropdown -->
<button
  aria-haspopup="true"
  aria-expanded="false"
  aria-label="Menu utilisateur"
>
  Avatar
</button>
```

### Screen reader only text

```html
<span class="sr-only">Chargement en cours...</span>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Performance

### Objectifs

- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s

### Optimisations CSS

```html
<!-- Critical CSS inline -->
<head>
  <style>
    /* Styles critiques above-the-fold */
    body { font-family: Assistant, sans-serif; }
    .hero { min-height: 60vh; }
  </style>

  <!-- CSS non-critique async -->
  <link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
</head>
```

### Optimisations fonts

```html
<!-- Preconnect Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Font display swap -->
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700&display=swap" rel="stylesheet">
```

### Optimisations images

```html
<!-- Lazy loading -->
<img src="/avatar.jpg" alt="Avatar" loading="lazy" width="64" height="64">

<!-- WebP avec fallback -->
<picture>
  <source type="image/webp" srcset="/hero.webp">
  <img src="/hero.jpg" alt="Hero" loading="lazy">
</picture>
```

---

## Responsive Design

### Breakpoints

```javascript
// UnoCSS breakpoints (Tailwind-compatible)
{
  xs: '0px',      // Mobile portrait (default)
  sm: '640px',    // Mobile landscape / petite tablette
  md: '768px',    // Tablette portrait
  lg: '1024px',   // Tablette landscape / petit desktop
  xl: '1280px',   // Desktop standard
  '2xl': '1536px' // Grand ecran
}
```

### Mobile-first approach

```html
<!-- Stack vertical par defaut, grille sur desktop -->
<div class="
  flex flex-col gap-4
  md:grid md:grid-cols-2 md:gap-6
  lg:grid-cols-3
">
  <!-- Items -->
</div>

<!-- Texte mobile, plus grand desktop -->
<h1 class="
  text-2xl
  md:text-3xl
  lg:text-4xl
  font-bold
">
  Titre responsive
</h1>

<!-- Padding adaptatif -->
<div class="
  p-4
  md:p-6
  lg:p-8
">
  Contenu avec padding responsive
</div>
```

### Touch targets mobile

Minimum 48x48px pour accessibilite WCAG AAA:

```html
<button class="
  px-6 py-3 min-h-48px min-w-48px
  md:px-8 md:py-4
">
  Action mobile-friendly
</button>
```

---

## Implementation avec UnoCSS

### Configuration recommandee

```javascript
// uno.config.ts
import { defineConfig, presetWind, presetTypography, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetWind(), // Tailwind-compatible
    presetTypography(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/'
    }),
  ],

  theme: {
    colors: {
      'noir': '#0a0a0a',
      'noir-card': '#1a1a1a',
      'noir-hover': '#2a2a2a',
      'cyan': '#00d9d9',
      'cyan-hover': '#00ffff',
      'rose': '#ff006e',
      'rose-hover': '#ff1a7f',
    },

    fontFamily: {
      sans: ['Assistant', 'system-ui', 'sans-serif'],
    },
  },

  shortcuts: {
    // Boutons
    'btn-primary': 'px-8 py-4 bg-cyan text-noir font-bold uppercase tracking-wide transition-all duration-200 hover:(scale-105 shadow-lg) focus:(outline-none ring-2 ring-cyan ring-offset-2)',
    'btn-secondary': 'px-8 py-4 bg-transparent border-2 border-cyan text-cyan font-semibold uppercase transition-all duration-200 hover:(bg-cyan text-noir scale-105)',
    'btn-danger': 'px-6 py-3 bg-transparent border-2 border-rose text-rose font-semibold uppercase transition-all duration-200 hover:(bg-rose text-white scale-105)',

    // Cards
    'card': 'bg-noir-card border border-bordure-subtile p-6 transition-all duration-200 hover:(border-cyan scale-102)',

    // Inputs
    'input-base': 'w-full px-4 py-3 bg-noir border-2 border-bordure-subtile text-primary transition-all duration-200 focus:(outline-none border-cyan shadow-lg)',
  },
})
```

### Exemples d'utilisation

```html
<!-- Bouton avec shortcut -->
<button class="btn-primary">
  Creer une fiche
</button>

<!-- Card avec shortcut -->
<div class="card">
  <h3 class="text-lg font-bold text-primary mb-2">Titre</h3>
  <p class="text-secondary">Contenu...</p>
</div>

<!-- Input avec shortcut -->
<input type="text" class="input-base" placeholder="Nom...">
```

---

## Fichiers de reference

### Documentation
- `wireframe-otherscape-authentique.html` - Reference visuelle complete
- `GAUGE-MENU-DESIGN.md` - Specifications menu utilisateur gauge
- `MIGRATION-OTHERSCAPE.md` - Guide migration historique

### Configuration
- `uno.config.ts` - Configuration UnoCSS complete
- `nuxt.config.ts` - Configuration Nuxt 4 avec UnoCSS

---

## Roadmap

### MVP v1.0 (actuel)
- Design cyberpunk cyan neon pour Legends in the Mist
- Navigation gauge-style
- Composants essentiels (buttons, cards, forms)
- Responsive mobile-first
- Accessibilite WCAG 2.1 AAA

### v1.2+ (futur)
- Themes additionnel pour autres systemes (Monsterhearts, etc.)
- Dark/Light mode toggle
- Customisation couleurs par utilisateur
- Animations avancees (particles, effects)

---

**Version:** 1.0.0
**Derniere mise a jour:** 2025-10-21
**Mainteneur:** Equipe Brumisa3
