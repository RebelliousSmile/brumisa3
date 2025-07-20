# Charte Graphique - Générateur PDF JDR

## 🎨 Palette de couleurs

### Couleurs principales

| Couleur | Hex | RGB | Usage |
|---------|-----|-----|-------|
| **Brand violet** | `#7641d3` | rgb(118, 65, 211) | Couleur principale, CTAs primaires, liens actifs |
| **Brand violet foncé** | `#5c28ae` | rgb(92, 40, 174) | États hover, focus, variantes sombres |
| **Noir** | `#000000` | rgb(0, 0, 0) | Arrière-plans principaux |
| **Noir charbon** | `#1e1e1e` | rgb(30, 30, 30) | Arrière-plans secondaires, cartes |
| **Blanc** | `#ffffff` | rgb(255, 255, 255) | Textes sur fond sombre, contraste |

### Couleurs d'accent

| Couleur | Hex | RGB | Usage |
|---------|-----|-----|-------|
| **Gris foncé** | `#32373c` | rgb(50, 55, 60) | Boutons secondaires, bordures |
| **Gris clair** | `#abb8c3` | rgb(171, 184, 195) | Textes secondaires, placeholders |
| **Violet électrique** | `#9b51e0` | rgb(155, 81, 224) | Highlights, effets hover spéciaux |

### Couleurs fonctionnelles

| Couleur | Hex | Tailwind | Usage |
|---------|-----|----------|-------|
| **Succès** | `#22c55e` | `green-500` | Confirmations, validations (distinct d'emerald) |
| **Erreur** | `#f97316` | `orange-500` | Erreurs, échecs (distinct du rouge Metro) |
| **Avertissement** | `#eab308` | `yellow-500` | Alertes, warnings |
| **Information** | `#06b6d4` | `cyan-500` | Infos, aide (distinct du bleu générique) |

### Variables CSS
```css
:root {
  /* Couleurs principales */
  --brand-violet: #7641d3;
  --brand-violet-dark: #5c28ae;
  --noir: #000000;
  --noir-charbon: #1e1e1e;
  --blanc: #ffffff;
  
  /* Couleurs d'accent */
  --gris-fonce: #32373c;
  --gris-clair: #abb8c3;
  --violet-electrique: #9b51e0;
  
  /* Couleurs système JDR */
  --monsterhearts: #8b5cf6;  /* purple-500 */
  --engrenages: #10b981;     /* emerald-500 */
  --metro2033: #dc2626;      /* red-600 */
  --mistengine: #ec4899;     /* pink-500 */
  --generique: #3b82f6;      /* blue-500 */
  
  /* Couleurs fonctionnelles (évitent les conflits avec systèmes JDR) */
  --succes: #22c55e;        /* green-500 (distinct d'emerald) */
  --erreur: #f97316;        /* orange-500 (distinct du rouge Metro) */
  --avertissement: #eab308;  /* yellow-500 (neutre) */
  --info: #06b6d4;          /* cyan-500 (distinct du bleu générique) */
}
```

## 🔤 Typographie

### Polices principales

#### "Source Serif 4" - Police serif pour le corps de texte
- **Poids disponibles** : 400 (regular), 400i (italic), 500 (medium), 700 (bold)
- **Usage** : Texte principal, paragraphes, contenus longs
- **Chargement** : Google Fonts
```html
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
```

#### "Shackleton" - Police display/sans-serif (Adobe Fonts)
- **Usage** : Titres, boutons, navigation, éléments UI
- **Caractère** : Moderne, gaming, impactant
- **Chargement** : Adobe Fonts (Typekit)
```html
<link rel="stylesheet" href="https://use.typekit.net/vpm3oax.css">
```

### Hiérarchie typographique

| Élément | Police | Taille | Poids | Line-height |
|---------|--------|--------|-------|-------------|
| **H1** | Shackleton, sans-serif | 3rem (48px) | 700 | 1.2 |
| **H2** | Shackleton, sans-serif | 2.25rem (36px) | 600 | 1.25 |
| **H3** | Shackleton, sans-serif | 1.875rem (30px) | 600 | 1.3 |
| **H4** | Shackleton, sans-serif | 1.5rem (24px) | 500 | 1.35 |
| **H5** | Shackleton, sans-serif | 1.25rem (20px) | 500 | 1.4 |
| **H6** | Shackleton, sans-serif | 1.125rem (18px) | 500 | 1.4 |
| **Corps** | Source Serif 4, serif | 1rem (16px) | 400 | 1.6 |
| **Petit texte** | Source Serif 4, serif | 0.875rem (14px) | 400 | 1.5 |
| **Boutons** | Shackleton, sans-serif | 1rem (16px) | 500 | 1 |
| **Navigation** | Shackleton, sans-serif | 0.9375rem (15px) | 500 | 1 |

### Classes CSS typographiques
```css
/* Titres */
.heading-1 { font-family: 'Shackleton', sans-serif; font-size: 3rem; font-weight: 700; line-height: 1.2; }
.heading-2 { font-family: 'Shackleton', sans-serif; font-size: 2.25rem; font-weight: 600; line-height: 1.25; }
.heading-3 { font-family: 'Shackleton', sans-serif; font-size: 1.875rem; font-weight: 600; line-height: 1.3; }

/* Corps de texte */
.body-text { font-family: 'Source Serif 4', serif; font-size: 1rem; font-weight: 400; line-height: 1.6; }
.body-small { font-family: 'Source Serif 4', serif; font-size: 0.875rem; font-weight: 400; line-height: 1.5; }

/* UI Elements */
.button-text { font-family: 'Shackleton', sans-serif; font-size: 1rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
.nav-text { font-family: 'Shackleton', sans-serif; font-size: 0.9375rem; font-weight: 500; }
```

## 🎯 Caractéristiques du design

### Esthétique générale
- **Style** : Gaming/Horror avec touches élégantes
- **Inspiration** : Interfaces de jeux modernes, ambiance gothique raffinée
- **Équilibre** : Sombre et mystérieux mais professionnel et accessible

### Contraste et accessibilité
- **Ratio de contraste minimum** : 4.5:1 pour le texte normal, 3:1 pour le texte large
- **Texte principal** : Toujours blanc (#fff) sur fond sombre
- **Liens** : Brand violet sur fond clair, blanc sur fond sombre

### Ambiance visuelle
- **Mystérieuse** : Utilisation dominante du noir avec accents violets
- **Professionnelle** : Typographie claire et hiérarchie bien définie
- **Gaming** : Éléments UI inspirés des interfaces de jeu
- **Élégante** : Espaces généreux, animations subtiles

## 🎨 Applications par composant

### Boutons

#### Types de boutons

1. **Primaire** : Actions principales (CTA)
2. **Secondaire** : Actions secondaires 
3. **Tertiaire** : Actions minimales (liens stylisés)
4. **Danger** : Actions destructives
5. **Système** : Boutons thématisés par JDR

#### Définition des boutons

##### Structure de base
```html
<button class="btn btn-[type] btn-[size]">
  <i class="ra ra-icon mr-2"></i>
  <span>Texte du bouton</span>
</button>
```

##### Classes Tailwind
```css
/* Base - commune à tous les boutons */
.btn {
  @apply inline-flex items-center justify-center px-6 py-3 
         font-display font-medium text-base
         border-2 rounded-lg
         transition-all duration-200 ease-in-out
         cursor-pointer
         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900;
}

/* Tailles */
.btn-sm { @apply px-4 py-2 text-sm; }
.btn-md { @apply px-6 py-3 text-base; } /* default */
.btn-lg { @apply px-8 py-4 text-lg; }
.btn-xl { @apply px-10 py-5 text-xl; }

/* Types */
.btn-primary {
  @apply bg-blue-600 text-white border-blue-600
         hover:bg-blue-700 hover:border-blue-700
         focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-800 text-gray-300 border-gray-700
         hover:bg-gray-700 hover:text-white hover:border-gray-600
         focus:ring-gray-500;
}

.btn-tertiary {
  @apply bg-transparent text-gray-400 border-transparent
         hover:text-white hover:bg-gray-800/50
         focus:ring-gray-500;
}

.btn-danger {
  @apply bg-red-600 text-white border-red-600
         hover:bg-red-700 hover:border-red-700
         focus:ring-red-500;
}

/* États */
.btn:disabled {
  @apply opacity-50 cursor-not-allowed
         hover:bg-current hover:border-current;
}

/* Variantes */
.btn-outline {
  @apply bg-transparent;
}

.btn-outline.btn-primary {
  @apply text-blue-400 border-blue-400
         hover:bg-blue-600 hover:text-white hover:border-blue-600;
}

.btn-outline.btn-secondary {
  @apply text-gray-400 border-gray-600
         hover:bg-gray-800 hover:text-white hover:border-gray-700;
}

/* Boutons icon-only */
.btn-icon {
  @apply p-3;
}

.btn-icon.btn-sm { @apply p-2; }
.btn-icon.btn-lg { @apply p-4; }
```

#### Boutons par système JDR

Chaque système a sa propre couleur d'accent pour les boutons contextuels :

```css
/* Monsterhearts - Violet gothique */
.btn-monsterhearts {
  @apply bg-purple-600 text-white border-purple-600
         hover:bg-purple-700 hover:border-purple-700
         focus:ring-purple-500;
}

.btn-outline.btn-monsterhearts {
  @apply text-purple-400 border-purple-500
         hover:bg-purple-600 hover:text-white hover:border-purple-600;
}

/* Engrenages - Vert émeraude */
.btn-engrenages {
  @apply bg-emerald-600 text-white border-emerald-600
         hover:bg-emerald-700 hover:border-emerald-700
         focus:ring-emerald-500;
}

.btn-outline.btn-engrenages {
  @apply text-emerald-400 border-emerald-500
         hover:bg-emerald-600 hover:text-white hover:border-emerald-600;
}

/* Metro 2033 - Rouge post-apo */
.btn-metro2033 {
  @apply bg-red-700 text-white border-red-700
         hover:bg-red-800 hover:border-red-800
         focus:ring-red-600;
}

.btn-outline.btn-metro2033 {
  @apply text-red-400 border-red-600
         hover:bg-red-700 hover:text-white hover:border-red-700;
}

/* Mist Engine - Rose mystique */
.btn-mistengine {
  @apply bg-pink-600 text-white border-pink-600
         hover:bg-pink-700 hover:border-pink-700
         focus:ring-pink-500;
}

.btn-outline.btn-mistengine {
  @apply text-pink-400 border-pink-500
         hover:bg-pink-600 hover:text-white hover:border-pink-600;
}
```

#### Exemples d'utilisation

```html
<!-- Bouton primaire -->
<button class="btn btn-primary">
  <i class="ra ra-scroll mr-2"></i>
  <span>Créer un personnage</span>
</button>

<!-- Bouton secondaire outline -->
<button class="btn btn-secondary btn-outline">
  <span>Annuler</span>
</button>

<!-- Bouton système Monsterhearts -->
<button class="btn btn-monsterhearts btn-lg">
  <i class="ra ra-hearts mr-2"></i>
  <span>Jouer Monsterhearts</span>
</button>

<!-- Bouton icon-only -->
<button class="btn btn-primary btn-icon" aria-label="Paramètres">
  <i class="ra ra-gear"></i>
</button>

<!-- Bouton danger petit -->
<button class="btn btn-danger btn-sm">
  <i class="ra ra-trash mr-2"></i>
  <span>Supprimer</span>
</button>

<!-- Groupe de boutons -->
<div class="flex gap-3">
  <button class="btn btn-primary">Sauvegarder</button>
  <button class="btn btn-secondary btn-outline">Annuler</button>
</div>
```

#### Animations et effets

```css
/* Effet de pulsation pour CTA importants */
.btn-pulse {
  @apply relative overflow-hidden;
}

.btn-pulse::before {
  content: '';
  @apply absolute inset-0 bg-white/20;
  animation: pulse-wave 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
}

@keyframes pulse-wave {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* Effet de glitch pour Metro 2033 */
.btn-glitch {
  position: relative;
}

.btn-glitch:hover {
  animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
}
```

#### Accessibilité

- Toujours inclure un `aria-label` pour les boutons icon-only
- Respecter les ratios de contraste WCAG AA (4.5:1)
- États focus visibles avec `focus:ring`
- Support clavier complet (Enter/Espace)

#### Guidelines d'usage

1. **Un seul CTA primaire** par section/écran
2. **Hiérarchie claire** : primaire > secondaire > tertiaire
3. **Icônes cohérentes** : utiliser RPG Awesome pour l'ambiance JDR
4. **Espacement** : minimum 8px entre boutons groupés
5. **Mobile** : taille minimum 44x44px pour les zones tactiles

### Cartes et conteneurs
```css
.card {
  background: var(--noir-charbon);
  border: 1px solid var(--gris-fonce);
  color: var(--blanc);
}

.card-hover:hover {
  border-color: var(--brand-violet);
  box-shadow: 0 0 20px rgba(118, 65, 211, 0.3);
}
```

### Formulaires
```css
.input {
  background: var(--noir);
  border: 2px solid var(--gris-fonce);
  color: var(--blanc);
  font-family: 'Source Serif 4', serif;
}

.input:focus {
  border-color: var(--brand-violet);
  outline: none;
  box-shadow: 0 0 0 3px rgba(118, 65, 211, 0.2);
}
```

## 🌟 Effets et animations

### Transitions
- **Durée standard** : 200ms
- **Courbe d'accélération** : ease-in-out
- **Properties** : opacity, transform, border-color, box-shadow

### Effets hover
```css
/* Glow violet */
.glow-hover:hover {
  box-shadow: 0 0 30px rgba(118, 65, 211, 0.5);
  transform: translateY(-2px);
}

/* Pulse animation */
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(118, 65, 211, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(118, 65, 211, 0); }
  100% { box-shadow: 0 0 0 0 rgba(118, 65, 211, 0); }
}
```

## 📱 Adaptations mobile

### Breakpoints
- **Mobile** : < 640px
- **Tablette** : 640px - 1024px
- **Desktop** : > 1024px

### Ajustements typographiques mobiles
```css
@media (max-width: 640px) {
  .heading-1 { font-size: 2rem; }
  .heading-2 { font-size: 1.5rem; }
  .body-text { font-size: 0.9375rem; }
}
```

## 🎮 Thématiques par système JDR

Chaque système conserve le fond noir principal avec une couleur d'accent spécifique :

| Système | Couleur accent | Hex | Tailwind | Usage |
|---------|---------------|-----|----------|-------|
| **Monsterhearts** | Violet (horreur gothique) | `#8b5cf6` | `purple-500` | Romance gothique, monstres adolescents |
| **Engrenages** | Vert émeraude (fantasy médiéval) | `#10b981` | `emerald-500` | Roue du Temps, médiéval fantastique |
| **Metro 2033** | Rouge (post-apocalyptique) | `#dc2626` | `red-600` | Post-apocalypse, danger, radiations |
| **Mist Engine** | Rose (épique/poétique) | `#ec4899` | `pink-500` | Narratif mystique, épique poétique |
| **Contenu générique** | Bleu (neutre) | `#3b82f6` | `blue-500` | Features, contenus non-spécifiques |

### Principe d'application
- **Fond** : Toujours noir (#000) ou noir charbon (#1e1e1e)
- **Accent système** : Couleur spécifique au système pour bordures, hovers, badges
- **Contenu générique** : Bleu pour features, sections d'aide, contenus transversaux
- **Texte** : Blanc pour le contraste maximal
- **Cohérence** : Le violet reste la couleur principale du site, les accents sont contextuels

### Utilisation des couleurs
- **Violet brand** : Navigation, CTAs principaux, branding
- **Couleurs système** : Uniquement pour différencier les systèmes de jeu
- **Bleu générique** : Pour tous les contenus non liés à un système spécifique
- **Exemples** : Page d'accueil avec features → bleu, carte Monsterhearts → violet système

## 📦 Blocs et composants

### Structure des blocs
Inspiré du design gaming moderne, chaque bloc suit ces principes :

#### Hero Section
```css
.hero-section {
  background: var(--noir);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 4rem 2rem;
}

.hero-image {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.8;
  filter: contrast(1.2);
}
```

#### Blocs de contenu
```css
.content-block {
  background: var(--noir-charbon);
  border: 1px solid var(--gris-fonce);
  border-radius: 1rem;
  padding: 3rem 2rem;
  margin: 2rem 0;
  position: relative;
  overflow: hidden;
}

.content-block::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--brand-violet);
  opacity: 0;
  transition: opacity 200ms ease-in-out;
}

.content-block:hover::before {
  opacity: 1;
}
```

#### Cards système
```css
.system-card {
  background: var(--noir-charbon);
  border: 2px solid transparent;
  border-radius: 0.75rem;
  padding: 2rem;
  transition: all 200ms ease-in-out;
  cursor: pointer;
}

.system-card:hover {
  transform: translateY(-2px);
  border-color: var(--system-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
```

### Éléments UI récurrents

#### Badges et indicateurs
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: rgba(118, 65, 211, 0.2);
  color: var(--brand-violet);
  border: 1px solid var(--brand-violet);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

#### Sections avec images
```css
.image-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.image-section-content {
  order: 1;
}

.image-section-visual {
  order: 2;
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.image-section:nth-child(even) .image-section-content {
  order: 2;
}

.image-section:nth-child(even) .image-section-visual {
  order: 1;
}
```

### Boutons flottants

#### Bouton retour en haut
```css
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  background: var(--brand-violet);
  border: 2px solid var(--brand-violet);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  transition: all 200ms ease-in-out;
  z-index: 100;
}

.back-to-top.visible {
  opacity: 1;
  transform: translateY(0);
}

.back-to-top:hover {
  background: var(--brand-violet-dark);
  border-color: var(--brand-violet-dark);
  transform: translateY(-2px);
}
```

#### Menu latéral flottant
```css
.floating-menu {
  position: fixed;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 100;
}

.floating-menu-item {
  width: 3rem;
  height: 3rem;
  background: var(--noir-charbon);
  border: 2px solid var(--gris-fonce);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 200ms ease-in-out;
}

.floating-menu-item:hover {
  border-color: var(--brand-violet);
  transform: translateX(4px);
}

.floating-menu-item.active {
  background: var(--brand-violet);
  border-color: var(--brand-violet);
}
```

### Animations d'entrée
```css
.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in-left {
  opacity: 0;
  transform: translateX(-30px);
  animation: slideInLeft 0.6s ease-out forwards;
}

@keyframes slideInLeft {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Grilles et layouts

#### Grille 3 colonnes pour features
```css
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

.feature-card {
  background: var(--noir-charbon);
  border: 1px solid var(--gris-fonce);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  transition: all 200ms ease-in-out;
}

.feature-card:hover {
  border-color: var(--brand-violet);
  transform: translateY(-4px);
}

.feature-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(118, 65, 211, 0.1);
  border-radius: 1rem;
  color: var(--brand-violet);
  font-size: 2rem;
}
```

### Responsive breakpoints
```css
/* Mobile first approach */
@media (max-width: 768px) {
  .floating-menu {
    bottom: 2rem;
    left: 50%;
    top: auto;
    transform: translateX(-50%);
    flex-direction: row;
  }
  
  .image-section {
    grid-template-columns: 1fr;
  }
  
  .image-section-visual {
    order: -1 !important;
  }
}
```

## 🚀 Implémentation Tailwind

### Configuration custom
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-violet': '#7641d3',
        'brand-violet-dark': '#5c28ae',
        'noir': '#000000',
        'noir-charbon': '#1e1e1e',
        'gris-fonce': '#32373c',
        'gris-clair': '#abb8c3',
        'violet-electrique': '#9b51e0',
        // Couleurs système JDR
        'monsterhearts': '#8b5cf6',
        'engrenages': '#10b981',
        'metro2033': '#dc2626',
        'mistengine': '#ec4899',
        'generique': '#3b82f6',
      },
      fontFamily: {
        'serif': ['Source Serif 4', 'serif'],
        'display': ['Shackleton', 'sans-serif'],
      }
    }
  }
}
```