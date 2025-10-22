# Design System Brumisa3

Guide de reference rapide du systeme de design pour Brumisa3 MVP v1.0

---

## Introduction

Brumisa3 utilise un **design cyberpunk minimaliste dystopien** inspire de Tokyo:Otherscape, optimise pour:

- Performance maximale (UnoCSS, 1 font, animations GPU)
- Accessibilite WCAG 2.1 AAA (contraste 7:1, touch targets 48px)
- Mobile-first responsive
- Immersion Mist Engine

---

## Fichiers essentiels

### Documentation principale
- **design-system-brumisa3.md** - Documentation complete consolidee (LIRE EN PREMIER)
  - Palette de couleurs (cyan neon #00d9d9, noir profond #0a0a0a)
  - Typographie (Assistant font)
  - Composants UI (boutons, cards, forms, navigation)
  - Accessibilite et performance
  - Configuration UnoCSS

### References visuelles
- **wireframe-otherscape-authentique.html** - Reference visuelle complete
  - Tous les composants implementes
  - Navigation gauge-style
  - Language selector
  - User menu dropdown
  - Formulaires et cards

### Composants specialises
- **GAUGE-MENU-DESIGN.md** - Specifications menu utilisateur gauge
  - Design jauge cyberpunk
  - Barres de remplissage cyan/rose
  - Animations et interactions
  - Responsive desktop/mobile

### Documentation historique
- **MIGRATION-OTHERSCAPE.md** - Guide migration vers style Otherscape
  - Contexte historique (ancien bleu #334fb4 → nouveau cyan #00d9d9)
  - Comparaison avant/apres
  - Checklist migration

---

## Quick Start

### 1. Palette de couleurs

```css
/* Backgrounds */
--noir-profond: #0a0a0a;     /* Background principal */
--noir-card: #1a1a1a;         /* Cards/sections */

/* Accents */
--cyan-neon: #00d9d9;         /* Accent primaire */
--rose-neon: #ff006e;         /* Actions danger */

/* Textes */
--blanc-pur: #ffffff;         /* Texte principal */
--gris-clair: #e0e0e0;        /* Texte secondaire */
```

### 2. Typographie

```css
/* Font family */
font-family: 'Assistant', sans-serif;

/* Weights */
font-weight: 300; /* Light */
font-weight: 400; /* Regular */
font-weight: 600; /* Semibold */
font-weight: 700; /* Bold */

/* Sizes (desktop) */
font-size: 12px;  /* xs - Labels */
font-size: 14px;  /* sm - Secondaire */
font-size: 16px;  /* base - Principal */
font-size: 20px;  /* lg - Sous-titres */
font-size: 24px;  /* xl - Titres H2 */
font-size: 32px;  /* 2xl - Titres H1 */
```

### 3. Composants essentiels (UnoCSS)

#### Bouton primaire

```html
<button class="
  px-8 py-4
  bg-cyan text-noir
  font-bold uppercase
  hover:(scale-105 shadow-lg)
  focus:(ring-2 ring-cyan)
">
  Action
</button>
```

#### Card

```html
<div class="
  bg-noir-card border border-gray-800
  p-6
  hover:(border-cyan scale-102)
">
  <h3 class="text-lg font-bold text-white">Titre</h3>
  <p class="text-gray-400">Contenu...</p>
</div>
```

#### Input

```html
<input
  type="text"
  class="
    w-full px-4 py-3
    bg-noir border-2 border-gray-800
    text-white
    focus:(border-cyan shadow-lg)
  "
>
```

---

## UnoCSS Configuration

```javascript
// uno.config.ts
export default defineConfig({
  presets: [
    presetWind(), // Tailwind-compatible
    presetTypography(),
    presetIcons(),
  ],

  theme: {
    colors: {
      'noir': '#0a0a0a',
      'noir-card': '#1a1a1a',
      'cyan': '#00d9d9',
      'rose': '#ff006e',
    },
  },

  shortcuts: {
    'btn-primary': 'px-8 py-4 bg-cyan text-noir font-bold uppercase hover:scale-105',
    'card': 'bg-noir-card border border-gray-800 p-6 hover:border-cyan',
  },
})
```

---

## Accessibilite (WCAG 2.1 AAA)

### Contrastes minimum
- Texte normal: 7:1 (AAA)
- Texte large (18px+): 4.5:1 (AAA)

### Touch targets
- Mobile: 48x48px minimum
- Desktop: 32x32px minimum

### Focus states
```html
<button class="focus:(outline-none ring-2 ring-cyan ring-offset-2)">
  Action
</button>
```

### ARIA labels
```html
<nav aria-label="Navigation principale">
  <a href="/preparation" aria-current="page">Preparation</a>
</nav>
```

---

## Responsive Breakpoints

```javascript
{
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablette portrait
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px' // Extra large
}
```

### Exemple mobile-first

```html
<div class="
  grid grid-cols-1 gap-4
  md:grid-cols-2 md:gap-6
  lg:grid-cols-3
">
  <!-- Items -->
</div>
```

---

## Performance

### Objectifs
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1

### Optimisations
- 1 seule font (Assistant) → 50% chargement plus rapide
- Animations GPU (transform, opacity)
- UnoCSS on-demand → CSS minimal
- Lazy loading images
- Critical CSS inline

---

## Navigation

### Header desktop
- Logo Brumisa3 (cyan)
- Navigation principale (Decouverte, Preparation, Solo, VTT)
- Language selector (FR/EN avec underline cyan)
- User menu dropdown (gauge style)

### Sidebar playspaces
- Liste playspaces avec badges role (MJ/PJ)
- Playspace actif: border cyan, bg cyan/10
- Hover: border cyan, bg cyan/5

### Mobile bottom navigation
- 4 icones max (WCAG recommendation)
- Item actif: text cyan
- Touch targets: 48x48px minimum

---

## Composants specialises

### User Menu Gauge
Reference: `GAUGE-MENU-DESIGN.md`

Caracteristiques:
- Barre pleine largeur cyberpunk
- Segments biseautes 45deg
- Barres de remplissage cyan (standard) et rose (deconnexion)
- Animation gauge-fill au hover
- Scanlines et glow effects

### Language Selector
```html
<div class="flex items-center gap-2">
  <button class="text-cyan font-semibold border-b-2 border-cyan pb-1">
    FR
  </button>
  <span class="text-gray-500">|</span>
  <button class="text-gray-400 hover:text-cyan pb-1">
    EN
  </button>
</div>
```

---

## Fichiers archives (ne pas utiliser)

Les fichiers suivants sont archives pour reference historique:
- `design-system-guide.md` - Architecture EJS obsolete
- `GAUGE-MENU-*.md` (sauf DESIGN) - Documentation redondante
- `navigation-radiale-*.md` - Concept non retenu
- `PRESENTATION-CLIENT.md` - Presentation historique

---

## Fichiers deplaces

Documentation generale (non specifique design):
- `ux-mobile-first.md` → `documentation/DEVELOPPEMENT/`
- `arborescence-navigation.md` → `documentation/ARCHITECTURE/`
- `regles-wireframing.md` → `documentation/DEVELOPPEMENT/`
- `charte-graphique-pdf.md` → `documentation/FONCTIONNALITES/`

---

## Roadmap

### MVP v1.0 (actuel - Legends in the Mist uniquement)
- Cyan neon (#00d9d9) comme accent primaire
- Navigation gauge-style
- Composants essentiels
- Mobile-first responsive
- WCAG 2.1 AAA

### v1.2+ (multi-systemes)
- Themes pour Monsterhearts (violet), Engrenages (orange), Metro (rouge)
- Dark/Light mode toggle
- Customisation couleurs utilisateur

---

## Support

### Questions design
Consulter `design-system-brumisa3.md` (documentation complete)

### Questions techniques UnoCSS
Voir configuration dans `design-system-brumisa3.md` section "Implementation avec UnoCSS"

### Questions accessibilite
Voir section "Accessibilite" dans `design-system-brumisa3.md`

### Reference visuelle
Ouvrir `wireframe-otherscape-authentique.html` dans navigateur

---

## Checklist implementation

Avant d'implementer un nouveau composant:

- [ ] Lire specifications dans `design-system-brumisa3.md`
- [ ] Verifier reference visuelle dans `wireframe-otherscape-authentique.html`
- [ ] Utiliser classes UnoCSS (ou shortcuts)
- [ ] Respecter contraste WCAG AAA (7:1)
- [ ] Touch targets 48px mobile, 32px desktop
- [ ] Tester responsive (mobile, tablet, desktop)
- [ ] Ajouter ARIA labels si necessaire
- [ ] Tester navigation clavier
- [ ] Verifier performance (Lighthouse)

---

**Version:** 1.0.0
**Derniere mise a jour:** 2025-10-21
**Mainteneur:** Equipe Brumisa3

Pour toute question, consulter `design-system-brumisa3.md` en premier.
