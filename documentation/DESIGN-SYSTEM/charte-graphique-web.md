# Charte Graphique - Générateur PDF JDR

## 🎯 Vision Design (style cyberpunk minimaliste Otherscape)

### Philosophie générale
Brumisa3 adopte un style **cyberpunk minimaliste dystopien** inspiré de Tokyo:Otherscape, privilégiant la clarté, la performance et l'immersion. Le design web suit une approche épurée (98% noir/blanc, 2% bleu cyberpunk) tandis que les PDFs conservent une liberté créative totale pour l'immersion thématique.

### Principes directeurs
1. **Minimalisme radical** : Noir/blanc dominant, bleu accent uniquement au hover/focus
2. **Performance-first** : Ombres minimes (blur 5px), transitions 0.4s, angles droits (pas d'arrondi)
3. **Accessibilité WCAG AAA** : Contraste 7:1, textures plates, typographie bold
4. **Mobile-responsive** : Breakpoint 768px (Otherscape), espacements 36px/27px
5. **Cohérence système** : UnoCSS/Tailwind avec palette cyberpunk unifiée

### Design web vs PDF
| Aspect | Site Web | PDFs Thématiques |
|--------|----------|------------------|
| **Style** | Cyberpunk minimaliste | Immersion totale par système |
| **Couleurs** | 98% noir/blanc + 2% bleu | Palettes complètes thématiques |
| **Dégradés** | Aucun | Autorisés pour immersion |
| **Effets** | Hover simple (scale, translateY) | Effets thématiques libres |
| **Opacité** | 0% ou 100% uniquement | Variations autorisées |
| **Typographie** | Assistant (sans-serif) unique | Polices thématiques variées |

### Inspiration Otherscape
- **Palette** : Noir (#121212) / Blanc (#ffffff) / Bleu (#334fb4)
- **Espacements** : 36px desktop / 27px mobile / 8px grilles
- **Transitions** : 0.4s ease (fluide, performant)
- **Hover** : translateY(-4px) + scale(1.02)
- **Layout** : max-width 120rem, angles droits, ombres subtiles

## 🎨 Palette de couleurs

### Couleurs principales (style cyberpunk minimaliste)

| Couleur | Hex | RGB | Usage |
|---------|-----|-----|-------|
| **Noir profond** | `#121212` | rgb(18, 18, 18) | Arrière-plans principaux, boutons, éléments sombres |
| **Noir charbon** | `#242833` | rgb(36, 40, 51) | Arrière-plans secondaires, cartes, conteneurs |
| **Blanc pur** | `#ffffff` | rgb(255, 255, 255) | Textes principaux, contraste maximal |
| **Gris texte** | `#e5e5e5` | rgb(229, 229, 229) | Textes secondaires, descriptions |

### Couleurs d'accent (minimalisme moderne)

| Couleur | Hex | RGB | Usage |
|---------|-----|-----|-------|
| **Bleu cyberpunk** | `#334fb4` | rgb(51, 79, 180) | Accent principal, CTAs, liens actifs, hover interactif |
| **Gris bordure** | `#3a3f4a` | rgb(58, 63, 74) | Bordures subtiles, séparateurs |
| **Gris hover** | `#4a5060` | rgb(74, 80, 96) | États hover sur éléments neutres |

### Couleur principale du site

| Couleur | Hex | Tailwind | Usage |
|---------|-----|----------|-------|
| **Brumisa Bleu** | `#334fb4` | Personnalisé | **Couleur principale de brumisa3** - Navigation, boutons primaires, liens, authentification, contenu générique |

### Couleurs de différenciation JDR

| Couleur | Hex | Tailwind | Usage |
|---------|-----|----------|-------|
| **Monsterhearts** | `#8b5cf6` | `purple-500` | Bordures, badges, différenciation visuelle |
| **Engrenages** | `#d97706` | `amber-600` | Bordures, badges, différenciation visuelle |
| **Metro 2033** | `#dc2626` | `red-600` | Bordures, badges, différenciation visuelle |
| **Mist Engine** | `#ec4899` | `pink-500` | Bordures, badges, différenciation visuelle |
| **Zombiology** | `#d4af37` | Or métallique | Bordures, badges, différenciation visuelle |

### Pictogrammes des systèmes JDR

Chaque système utilise des icônes RPG Awesome spécifiques pour renforcer son identité visuelle :

| Système | Icône principale | Sous-univers | Icône spécifique | Thématique |
|---------|------------------|--------------|------------------|------------|
| **PBTA** | `ra-heartburn` | Monsterhearts | `ra-heartburn` | Romance gothique |
| | | Urban Shadows | `ra-moon-sun` | Urbain nocturne |
| **Engrenages** | `ra-cog` | La Roue du Temps | `ra-candle` | Fantasy mystique |
| | | Ecryme | `ra-chemical-arrow` | Corrosif/dangereux |
| **Mist Engine** | `ra-ocarina` | Obojima | `ra-ocarina` | Mystique musical |
| | | Zamanora | `ra-rune-stone` | Narratif runique |
| | | Post-Mortem | `ra-skull` | Mortuaire |
| | | Tokyo:Otherscape | `ra-surveillance-camera` | Cyberpunk |
| **MYZ** | `ra-pills` | Metro 2033 | `ra-pills` | Post-apocalyptique |
| **Zombiology** | `ra-death-skull` | - | `ra-death-skull` | Survival horror |

### Couleurs fonctionnelles

| Couleur | Hex | Tailwind | Usage |
|---------|-----|----------|-------|
| **Succès** | `#22c55e` | `green-500` | Confirmations, validations (distinct d'emerald) |
| **Erreur** | `#f97316` | `orange-500` | Erreurs, échecs (distinct du rouge Metro) |
| **Avertissement** | `#eab308` | `yellow-500` | Alertes, warnings |
| **Information** | `#06b6d4` | `cyan-500` | Infos, aide (distinct du bleu brumisa3) |

### Principes de simplicité visuelle (approche minimaliste)

**IMPORTANT** : Moins d'effets, plus de clarté - philosophie Otherscape

| Principe | Règle | Application |
|----------|-------|-------------|
| **Opacité minimale** | 0% ou 100% uniquement | Pas d'opacité intermédiaire sauf ombres |
| **Ombres subtiles** | Blur 5px, opacity 0.05 max | `shadow-sm` uniquement |
| **Pas de dégradés** | Couleurs plates | Sauf contexte système JDR (PDF) |
| **Contraste franc** | Noir/Blanc dominant | Bleu accent uniquement sur interactions |

**Éviter absolument** :
- Dégradés sur le site web (réservés aux PDFs thématiques)
- Opacités multiples (`/10`, `/20`, `/50`, etc.)
- Effets de glow ou néons
- Ombres prononcées

### Approche épurée

**Zones sans effets** (98% du site) :
- Cartes : Fond plat `#242833`, bordure `#3a3f4a` de 1px
- Boutons : Fond plat `#121212`, texte blanc, transition hover simple
- Navigation : Aucun dégradé, liens blancs avec hover bleu
- Formulaires : Inputs plats avec bordure fine

### Variables CSS (style cyberpunk minimaliste)
```css
:root {
  /* Couleurs principales - Noir/Blanc dominant */
  --noir-profond: #121212;      /* Arrière-plans, boutons */
  --noir-charbon: #242833;      /* Cartes, conteneurs */
  --blanc-pur: #ffffff;         /* Textes principaux */
  --gris-texte: #e5e5e5;        /* Textes secondaires */

  /* Couleurs d'accent - Minimalisme */
  --bleu-cyberpunk: #334fb4;    /* Accent interactif */
  --gris-bordure: #3a3f4a;      /* Bordures subtiles */
  --gris-hover: #4a5060;        /* États hover */

  /* Couleurs système JDR (uniquement pour différenciation contextuelle) */
  --monsterhearts: #8b5cf6;     /* purple-500 */
  --engrenages: #d97706;        /* amber-600 */
  --metro2033: #dc2626;         /* red-600 */
  --mistengine: #ec4899;        /* pink-500 */
  --zombiology: #d4af37;        /* or métallique */

  /* Couleur principale du site */
  --brumisa-bleu: #334fb4;      /* Bleu cyberpunk - Couleur principale */

  /* Couleurs fonctionnelles */
  --succes: #22c55e;            /* green-500 */
  --erreur: #f97316;            /* orange-500 */
  --avertissement: #eab308;     /* yellow-500 */
  --info: #06b6d4;              /* cyan-500 */

  /* Ombres minimalistes */
  --shadow-subtle: 0 4px 5px rgba(18, 18, 18, 0.05);
  --shadow-none: none;
}
```

## 🔤 Typographie (style cyberpunk épuré)

### Polices principales

#### "Assistant" - Police sans-serif moderne (Google Fonts)
- **Poids disponibles** : 400 (regular), 700 (bold)
- **Usage** : Titres, corps de texte, navigation, éléments UI
- **Caractère** : Moderne, lisible, épuré, cyberpunk
- **Chargement** : Google Fonts avec font-display: swap
```html
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap" rel="stylesheet">
```

#### Fallback système (performance)
- **Stack** : `'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Avantage** : Si Google Fonts échoue, polices système natives s'affichent instantanément

### Hiérarchie typographique (échelle fluide)

| Élément | Police | Taille | Poids | Line-height | Transformation |
|---------|--------|--------|-------|-------------|----------------|
| **H1** | Assistant, sans-serif | clamp(2.5rem, 4vw, 3.5rem) | 700 | 1.1 | uppercase |
| **H2** | Assistant, sans-serif | clamp(2rem, 3vw, 2.75rem) | 700 | 1.2 | uppercase |
| **H3** | Assistant, sans-serif | clamp(1.5rem, 2.5vw, 2rem) | 700 | 1.25 | none |
| **H4** | Assistant, sans-serif | clamp(1.25rem, 2vw, 1.5rem) | 700 | 1.3 | none |
| **H5** | Assistant, sans-serif | 1.125rem (18px) | 700 | 1.4 | none |
| **H6** | Assistant, sans-serif | 1rem (16px) | 700 | 1.4 | none |
| **Corps** | Assistant, sans-serif | clamp(0.9375rem, 2.5vw, 1rem) | 400 | 1.6 | none |
| **Petit texte** | Assistant, sans-serif | 0.875rem (14px) | 400 | 1.5 | none |
| **Boutons** | Assistant, sans-serif | 1rem (16px) | 700 | 1 | uppercase |
| **Navigation** | Assistant, sans-serif | 0.9375rem (15px) | 700 | 1 | none |

### Classes CSS typographiques (approche minimaliste)
```css
/* Titres - Toujours bold, uppercase pour H1/H2 */
.heading-1 {
  font-family: 'Assistant', sans-serif;
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.heading-2 {
  font-family: 'Assistant', sans-serif;
  font-size: clamp(2rem, 3vw, 2.75rem);
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.heading-3 {
  font-family: 'Assistant', sans-serif;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 700;
  line-height: 1.25;
}

/* Corps de texte - Même police, cohérence visuelle */
.body-text {
  font-family: 'Assistant', sans-serif;
  font-size: clamp(0.9375rem, 2.5vw, 1rem);
  font-weight: 400;
  line-height: 1.6;
}

.body-small {
  font-family: 'Assistant', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
}

/* UI Elements - Bold pour les interactions */
.button-text {
  font-family: 'Assistant', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-text {
  font-family: 'Assistant', sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
}
```

## 🎯 Caractéristiques du design (philosophie Otherscape)

### Esthétique générale
- **Style** : Cyberpunk minimaliste dystopien
- **Inspiration** : Interfaces gaming modernes, futurisme épuré, Tokyo:Otherscape
- **Équilibre** : Sombre et immersif, épuré et performant, accessible

### Contraste et accessibilité (WCAG AAA)
- **Ratio de contraste minimum** : 7:1 pour le texte normal (AAA), 4.5:1 pour le texte large (AA)
- **Texte principal** : Blanc pur (#ffffff) sur fond noir profond (#121212)
- **Liens** : Blanc avec hover bleu cyberpunk (#334fb4)
- **Bordures** : Gris subtil (#3a3f4a) pour éviter le contraste agressif

### Ambiance visuelle (minimalisme immersif)
- **Épurée** : Noir/blanc dominant, bleu accent rare et impactant
- **Performante** : Ombres minimes (blur 5px max), transitions rapides (0.4s)
- **Cyberpunk** : Typographie bold uppercase, contraste franc, grilles généreuses
- **Immersive** : Espaces généreux (36px desktop, 27px mobile), navigation intuitive

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

##### Classes UnoCSS/Tailwind (style cyberpunk minimaliste)
```css
/* Base - commune à tous les boutons (approche épurée) */
.btn {
  @apply inline-flex items-center justify-center
         px-6 py-3 min-h-[48px]
         font-sans font-bold text-base uppercase tracking-wider
         bg-[#121212] text-white border border-[#3a3f4a]
         rounded-none
         transition-all duration-[400ms] ease-out
         cursor-pointer
         focus:outline-none focus:ring-2 focus:ring-[#334fb4] focus:ring-offset-2 focus:ring-offset-[#121212];
}

/* Tailles (touch-friendly) */
.btn-sm { @apply px-4 py-2 min-h-[44px] text-sm; }
.btn-md { @apply px-6 py-3 min-h-[48px] text-base; } /* default */
.btn-lg { @apply px-8 py-4 min-h-[52px] text-lg; }
.btn-xl { @apply px-10 py-5 min-h-[56px] text-xl; }

/* Types (flat design, pas de dégradé) */
.btn-primary {
  @apply bg-[#334fb4] text-white border-[#334fb4]
         hover:bg-[#2a3f95] hover:scale-[1.02]
         focus:ring-[#334fb4];
}

.btn-secondary {
  @apply bg-[#242833] text-[#e5e5e5] border-[#3a3f4a]
         hover:bg-[#4a5060] hover:text-white
         focus:ring-[#4a5060];
}

.btn-tertiary {
  @apply bg-transparent text-[#e5e5e5] border-transparent
         hover:text-white hover:bg-[#242833]
         focus:ring-[#3a3f4a];
}

.btn-danger {
  @apply bg-[#f97316] text-white border-[#f97316]
         hover:bg-[#ea580c] hover:scale-[1.02]
         focus:ring-[#f97316];
}

/* États */
.btn:disabled {
  @apply bg-[#242833] text-[#4a5060] border-[#3a3f4a] cursor-not-allowed
         hover:bg-[#242833] hover:text-[#4a5060] hover:scale-100;
}

/* Variantes outline (minimaliste) */
.btn-outline {
  @apply bg-transparent;
}

.btn-outline.btn-primary {
  @apply text-[#334fb4] border-[#334fb4]
         hover:bg-[#334fb4] hover:text-white hover:scale-[1.02];
}

.btn-outline.btn-secondary {
  @apply text-[#e5e5e5] border-[#3a3f4a]
         hover:bg-[#242833] hover:text-white;
}

/* Boutons icon-only */
.btn-icon {
  @apply p-3 min-w-[48px];
}

.btn-icon.btn-sm { @apply p-2 min-w-[44px]; }
.btn-icon.btn-lg { @apply p-4 min-w-[52px]; }
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

/* Engrenages - Brun ambré */
.btn-engrenages {
  @apply bg-amber-700 text-white border-amber-700
         hover:bg-amber-800 hover:border-amber-800
         focus:ring-amber-600;
}

.btn-outline.btn-engrenages {
  @apply text-amber-600 border-amber-700
         hover:bg-amber-700 hover:text-white hover:border-amber-700;
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

/* Zombiology - Or métallique */
.btn-zombiology {
  @apply bg-zombie-500 text-gray-900 border-zombie-500
         hover:bg-zombie-600 hover:border-zombie-600
         focus:ring-zombie-400;
}

.btn-outline.btn-zombiology {
  @apply text-zombie-400 border-zombie-500
         hover:bg-zombie-500 hover:text-gray-900 hover:border-zombie-500;
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

#### Animations et effets (minimalisme cyberpunk)

```css
/* Effet hover simple - scale subtil (style Otherscape) */
.btn-hover-scale:hover {
  transform: scale(1.02);
  transition: transform 0.4s ease;
}

/* Effet hover - translateY pour cartes (style Otherscape) */
.card-hover:hover {
  transform: translateY(-4px);
  transition: transform 0.4s ease;
}

/* ÉVITER les effets suivants (trop complexes pour le style minimaliste) :
   - pulse/glow
   - glitch
   - néons
   - dégradés animés
   - ombres prononcées
*/

/* Transitions universelles (rapides, fluides) */
* {
  transition-duration: 0.4s;
  transition-timing-function: ease;
}
```

#### Accessibilité

- Toujours inclure un `aria-label` pour les boutons icon-only
- Respecter les ratios de contraste WCAG AA (4.5:1)
- États focus visibles avec `focus:ring`
- Support clavier complet (Enter/Espace)

#### Guidelines d'usage

1. **Un seul CTA primaire** par section/écran
2. **Icônes cohérentes** : utiliser RPG Awesome pour l'ambiance JDR
3. **Espacement** : minimum 8px entre boutons groupés
4. **Mobile** : taille minimum 44x44px pour les zones tactiles

### Cartes et conteneurs (style cyberpunk flat)
```css
.card {
  background: var(--noir-charbon); /* #242833 */
  border: 1px solid var(--gris-bordure); /* #3a3f4a */
  color: var(--blanc-pur); /* #ffffff */
  padding: 2rem;
  border-radius: 0; /* Angles droits, pas d'arrondi */
  box-shadow: none; /* Pas d'ombre par défaut */
}

.card-hover:hover {
  border-color: var(--bleu-cyberpunk); /* #334fb4 */
  transform: translateY(-4px); /* Effet Otherscape */
  transition: all 0.4s ease;
  box-shadow: 0 4px 5px rgba(18, 18, 18, 0.05); /* Ombre minimaliste */
}
```

### Formulaires (minimalisme fonctionnel)
```css
.input {
  background: var(--noir-profond); /* #121212 */
  border: 1px solid var(--gris-bordure); /* #3a3f4a */
  color: var(--blanc-pur); /* #ffffff */
  font-family: 'Assistant', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  padding: 0.75rem 1rem;
  border-radius: 0; /* Angles droits */
  transition: all 0.4s ease;
}

.input:focus {
  border-color: var(--bleu-cyberpunk); /* #334fb4 */
  outline: none;
  box-shadow: none; /* Pas de glow, juste bordure */
}

.input::placeholder {
  color: var(--gris-texte); /* #e5e5e5 */
  opacity: 0.6;
}
```

## 🌟 Effets et animations (approche minimaliste Otherscape)

### Transitions (performance-first)
- **Durée standard** : 400ms (fluide, pas trop rapide)
- **Courbe d'accélération** : ease (simplicité)
- **Properties** : transform, border-color uniquement (éviter opacity et box-shadow pour performance)

### Effets hover (subtils et impactants)
```css
/* Hover scale - Boutons (style Otherscape) */
.hover-scale:hover {
  transform: scale(1.02);
  transition: transform 0.4s ease;
}

/* Hover translateY - Cartes (style Otherscape) */
.hover-lift:hover {
  transform: translateY(-4px);
  border-color: var(--bleu-cyberpunk);
  transition: all 0.4s ease;
}

/* Hover couleur - Liens */
.hover-link:hover {
  color: var(--bleu-cyberpunk);
  transition: color 0.4s ease;
}

/* ÉVITER absolument :
   - box-shadow animés (performance)
   - pulse/glow (trop flashy)
   - rotations complexes
   - dégradés animés
*/
```

## 📱 Adaptations mobile (style Otherscape responsive)

### Breakpoints (alignés Otherscape)
- **Mobile** : < 768px (threshold Otherscape)
- **Tablette** : 768px - 1024px
- **Desktop** : > 1024px
- **Large desktop** : > 1580px (Otherscape extended)

### Layout responsive (max-width Otherscape)
```css
.container {
  max-width: 120rem; /* 1920px - Otherscape page-width */
  margin: 0 auto;
  padding: 36px; /* Desktop */
}

@media (max-width: 768px) {
  .container {
    padding: 27px; /* Mobile - Otherscape sections */
  }
}
```

### Espacements responsive (style Otherscape)
```css
/* Grilles avec espacements Otherscape */
.grid {
  display: grid;
  gap: 8px; /* Desktop - Otherscape grid spacing */
}

@media (max-width: 768px) {
  .grid {
    gap: 4px; /* Mobile - Otherscape grid mobile */
  }
}
```

### Ajustements typographiques mobiles (fluides)
```css
/* Déjà responsive avec clamp() - pas besoin de media queries */
.heading-1 {
  font-size: clamp(2.5rem, 4vw, 3.5rem); /* Fluide automatique */
}

.body-text {
  font-size: clamp(0.9375rem, 2.5vw, 1rem); /* Fluide automatique */
}
```

## 🌐 Utilisation des couleurs sur le site web

### Principe général : Bleu cyberpunk par défaut (style minimaliste)

**IMPORTANT** : Le site brumisa3 utilise le **bleu cyberpunk** (`#334fb4`) comme couleur d'accent principale pour :
- ✅ **Hover interactif** (boutons, liens, cartes)
- ✅ **États focus** (accessibilité, navigation clavier)
- ✅ **Accents contextuels** (bordures au hover, indicateurs)
- ✅ **CTA principaux** (boutons primaires uniquement)

**Noir/Blanc dominant** (98% du design) :
- Fonds : `#121212` (noir profond) et `#242833` (noir charbon)
- Textes : `#ffffff` (blanc pur) et `#e5e5e5` (gris texte)
- Bordures : `#3a3f4a` (gris bordure subtil)

### Utilisation contextuelle des systèmes JDR

Les couleurs spécifiques aux systèmes sont utilisées dans leur **contexte approprié** :
- 🎯 **Pages dédiées** au système (hero, navigation secondaire)
- 🎯 **Bordures de cartes** et conteneurs système
- 🎯 **Badges et indicateurs** de système  
- 🎯 **Boutons contextuels** spécifiques au système
- 🎯 **Dégradés hero** sur les pages système

| Système | Couleur | Hex | Usage limité |
|---------|---------|-----|-------------|
| **Monsterhearts** | Violet | `#8b5cf6` | Pages système, bordures, badges, dégradés hero |
| **Engrenages** | Brun ambré | `#d97706` | Pages système, bordures, badges, dégradés hero |
| **Metro 2033** | Rouge | `#dc2626` | Pages système, bordures, badges, dégradés hero |
| **Mist Engine** | Rose | `#ec4899` | Pages système, bordures, badges, dégradés hero |
| **Zombiology** | Or métallique | `#d4af37` | Pages système, bordures, badges, dégradés hero |

### ❌ Ce qu'il ne faut PAS faire

- ❌ Changer la couleur principale selon le système sur les pages communes
- ❌ Utiliser les couleurs de système de jeu pour les boutons primaires génériques
- ❌ Modifier la navigation selon le système de jeu

### ✅ Ce qu'il faut faire (approche minimaliste)

- ✅ Utiliser le **bleu cyberpunk** (`#334fb4`) uniquement au hover et focus
- ✅ Privilégier le noir/blanc pour 98% du design
- ✅ Utiliser les couleurs système JDR dans leur contexte (badges, bordures contextuelles)
- ✅ Garder une cohérence de navigation sur tout le site
- ✅ Éviter absolument les opacités (0% ou 100% uniquement)
- ✅ Pas de dégradés sur le site web (réservés aux PDFs thématiques)

#### Thématiques PDF par système

##### 🧛 Monsterhearts - Romance Gothique
```css
/* Style PDF Monsterhearts */
:root {
  --mh-primary: #8b5cf6;      /* Violet gothique */
  --mh-secondary: #a855f7;    /* Violet plus clair */
  --mh-accent: #ec4899;       /* Rose passion */
  --mh-dark: #2d1b3d;         /* Violet très sombre */
  --mh-bg: linear-gradient(135deg, #1e1232 0%, #3a1a5c 50%, #2d1b3d 100%);
}

/* Polices thématiques */
font-family: 'Crimson Text', 'Source Serif 4', serif; /* Élégance gothique */
/* Décorations : cœurs brisés, roses, épines */
/* Ambiance : Romantique sombre, mystérieuse, passionnelle */
```

##### ⚙️ Engrenages (Roue du Temps) - Fantasy Épique
```css
/* Style PDF Engrenages */
:root {
  --eng-primary: #d97706;     /* Brun ambré */
  --eng-secondary: #92400e;   /* Brun plus foncé */
  --eng-accent: #fbbf24;      /* Or antique */
  --eng-dark: #451a03;        /* Brun très sombre */
  --eng-bg: linear-gradient(135deg, #451a03 0%, #78350f 50%, #92400e 100%);
}

/* Polices thématiques */
font-family: 'Cinzel', 'Times New Roman', serif; /* Médiéval élégant */
/* Décorations : entrelacs celtiques, roues, serpents */
/* Ambiance : Épique médiéval, noble, mystique */
```

##### ☢️ Metro 2033 - Post-Apocalyptique
```css
/* Style PDF Metro 2033 */
:root {
  --metro-primary: #dc2626;   /* Rouge danger */
  --metro-secondary: #991b1b; /* Rouge plus sombre */
  --metro-accent: #fbbf24;    /* Jaune radioactif */
  --metro-dark: #7f1d1d;      /* Rouge très sombre */
  --metro-bg: linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%);
}

/* Polices thématiques */
font-family: 'Courier New', 'Share Tech Mono', monospace; /* Industriel/tech */
/* Décorations : fissures, radiation, métal rouillé */
/* Ambiance : Brutale, industrielle, dystopique */
/* Effets : glitch, distorsion, usure */
```

##### 🌸 Mist Engine - Narratif Poétique
```css
/* Style PDF Mist Engine */
:root {
  --mist-primary: #ec4899;    /* Rose mystique */
  --mist-secondary: #be185d;  /* Rose plus sombre */
  --mist-accent: #a78bfa;     /* Violet doux */
  --mist-dark: #831843;       /* Rose très sombre */
  --mist-bg: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f9a8d4 100%);
}

/* Polices thématiques */
font-family: 'Dancing Script', 'Kalam', cursive; /* Poétique, manuscrit */
/* Décorations : nuages, brumes, calligraphies */
/* Ambiance : Douce, onirique, poétique */
/* Effets : flou artistique, aquarelle */
```

##### ☣️ Zombiology - Survival Horror
```css
/* Style PDF Zombiology */
:root {
  --zombie-primary: #7f1d1d;    /* Rouge très foncé (red-900) */
  --zombie-secondary: #991b1b;  /* Rouge foncé (red-800) */
  --zombie-accent: #22c55e;     /* Vert infection (green-500) */
  --zombie-danger: #dc2626;     /* Rouge vif (red-600) */
  --zombie-bg: linear-gradient(135deg, #0f0f0f 0%, #1a0a0a 50%, #450a0a 100%);
}

/* Polices thématiques */
font-family: 'Bebas Neue', 'Impact', sans-serif; /* Urgence, impact */
/* Décorations : biohazard, sang, barricades */
/* Ambiance : Survie, horreur, urgence médicale */
/* Effets : éclaboussures, distorsion, contamination */
```

### Principe d'application (minimalisme web vs immersion PDF)

#### Pages Web (Minimalisme cyberpunk - style Otherscape)
- **Fond** : Toujours noir profond (#121212) ou noir charbon (#242833)
- **Texte** : Blanc pur (#ffffff) pour contraste maximal WCAG AAA
- **Bordures** : Gris subtil (#3a3f4a) par défaut, bleu (#334fb4) au hover uniquement
- **Accent bleu** : Uniquement sur interactions (hover, focus, CTA primaires)
- **Couleurs système** : Uniquement badges/bordures contextuelles (pas de fonds colorés)
- **Cohérence** : 98% noir/blanc, 2% bleu cyberpunk, 0% dégradé

#### PDFs (Immersion thématique - liberté totale)
- **Liberté créative** : Chaque système a son propre fond, polices, décorations
- **Dégradés autorisés** : Uniquement dans les PDFs pour l'immersion
- **Immersion** : Le design doit faire "sentir" l'univers du jeu
- **Narration visuelle** : Les éléments graphiques racontent l'histoire du monde
- **Fonctionnalité** : Reste lisible et utilisable en jeu

### Utilisation des couleurs (résumé)
- **Bleu cyberpunk (#334fb4)** : Hover, focus, CTA primaires uniquement (site web)
- **Noir/Blanc** : Base de tout le design web (98% du site)
- **Couleurs système (web)** : Badges, bordures contextuelles uniquement
- **Couleurs système (PDF)** : Palette complète thématique avec dégradés
- **Exemples concrets** :
  - Page d'accueil → fond noir, textes blancs, boutons avec hover bleu
  - Badge Monsterhearts → bordure violette fine, texte violet, fond transparent
  - PDF Monsterhearts → design gothique complet avec dégradés violets/roses

### 📝 Guidelines pour Templates PDF

#### Structure type d'un template PDF
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>[Système] - [Type de document]</title>
    <style>
        /* 1. Variables CSS thématiques */
        :root {
            --primary: #system-color;
            --secondary: #system-secondary;
            --accent: #system-accent;
            --dark: #system-dark;
            --bg: linear-gradient(...);
        }
        
        /* 2. Polices thématiques */
        @import url('https://fonts.googleapis.com/css2?family=...');
        
        /* 3. Reset et base */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: var(--system-font);
            background: var(--bg);
            color: var(--text-color);
        }
        
        /* 4. Styles thématiques spécifiques */
        .header { /* Style header thématique */ }
        .content { /* Style contenu */ }
        .footer { /* Style footer */ }
        
        /* 5. Print-specific styles */
        @media print {
            body { background: white !important; }
            .header { -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="document-container">
        <header class="header"><!-- Header thématique --></header>
        <main class="content"><!-- Contenu --></main>
        <footer class="footer"><!-- Footer --></footer>
    </div>
</body>
</html>
```

#### Bonnes pratiques PDF par système

##### 🧛 Monsterhearts - Romance Gothique
- **Polices** : Crimson Text, Source Serif Pro (élégantes, lisibles)
- **Couleurs** : Dégradés violet/rose, contrastes forts
- **Décorations** : Cœurs, roses, épines stylisées
- **Ambiance** : Dramatique mais lisible, mystérieuse
- **Éviter** : Comic Sans, couleurs criardes, décorations enfantines

##### ⚙️ Engrenages - Fantasy Épique  
- **Polices** : Cinzel, Times New Roman (médiévales, nobles)
- **Couleurs** : Bruns ambrés, ors, terres cuivrées
- **Décorations** : Entrelacs, roues, motifs celtiques
- **Ambiance** : Noble, épique, traditionnel
- **Éviter** : Polices modernes, néons, styles futuristes

##### ☢️ Metro 2033 - Post-Apocalyptique
- **Polices** : Courier New, Share Tech Mono (industrielles)
- **Couleurs** : Rouges danger, jaunes radioactifs, gris métal
- **Décorations** : Fissures, effets glitch, usure
- **Ambiance** : Brutale, pragmatique, dystopique
- **Éviter** : Polices cursives, couleurs pastel, décorations florales

##### 🌸 Mist Engine - Narratif Poétique
- **Polices** : Dancing Script, Kalam (manuscrites, douces)
- **Couleurs** : Roses, violets doux, bleus pastel
- **Décorations** : Nuages, brumes, calligraphies
- **Ambiance** : Douce, onirique, artistique  
- **Éviter** : Polices rigides, couleurs agressives, angles durs

##### ☣️ Zombiology - Survival Horror
- **Polices** : Bebas Neue, Impact (urgence, lisibilité)
- **Couleurs** : Rouges sang, verts toxiques, noirs profonds
- **Décorations** : Symboles biohazard, éclaboussures, barricades
- **Ambiance** : Urgence médicale, survie, contamination
- **Éviter** : Polices élégantes, couleurs vives, décorations propres

#### Checklist qualité PDF

✅ **Lisibilité**
- [ ] Contraste suffisant (4.5:1 minimum)
- [ ] Taille de police ≥ 11pt pour le corps de texte
- [ ] Espacement lignes ≥ 1.4

✅ **Impression**
- [ ] Marges suffisantes (15mm minimum)
- [ ] Couleurs compatibles impression N&B
- [ ] Styles `@media print` définis

✅ **Thématique**
- [ ] Palette couleurs respectée
- [ ] Police thématique appropriée
- [ ] Décorations cohérentes avec l'univers
- [ ] Ambiance immersive

✅ **Technique**
- [ ] Format A4 standard
- [ ] Pas de débordements
- [ ] Images optimisées
- [ ] Footer avec attribution

## 📦 Blocs et composants (style cyberpunk minimaliste)

### Structure des blocs (inspiré Otherscape)
Approche flat, angles droits, espacements généreux

#### Hero Section (minimaliste)
```css
.hero-section {
  background: var(--noir-profond); /* #121212 */
  min-height: 100vh;
  padding: 36px; /* Otherscape spacing */
  max-width: 120rem; /* Otherscape page-width */
  margin: 0 auto;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 4rem 2rem;
}

/* Pas d'image de fond, pas d'overlay, minimalisme total */

@media (max-width: 768px) {
  .hero-section {
    padding: 27px; /* Otherscape mobile */
  }
}
```

#### Blocs de contenu (flat design)
```css
.content-block {
  background: var(--noir-charbon); /* #242833 */
  border: 1px solid var(--gris-bordure); /* #3a3f4a */
  border-radius: 0; /* Angles droits */
  padding: 36px; /* Otherscape spacing */
  margin: 2rem 0;
  transition: all 0.4s ease;
}

.content-block:hover {
  border-color: var(--bleu-cyberpunk); /* #334fb4 */
  transform: translateY(-4px); /* Otherscape lift */
  box-shadow: 0 4px 5px rgba(18, 18, 18, 0.05); /* Ombre minimaliste */
}

/* Pas de pseudo-éléments ::before, simplicité totale */
```

#### Cards système (cyberpunk flat)
```css
.system-card {
  background: var(--noir-charbon); /* #242833 */
  border: 1px solid transparent;
  border-radius: 0; /* Angles droits */
  padding: 2rem;
  transition: all 0.4s ease;
  cursor: pointer;
}

.system-card:hover {
  transform: translateY(-4px); /* Otherscape style */
  border-color: var(--system-color);
  box-shadow: 0 4px 5px rgba(18, 18, 18, 0.05); /* Ombre subtile */
}
```

### Éléments UI récurrents (minimalisme cyberpunk)

#### Badges et indicateurs (flat design)
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: transparent; /* Pas de fond coloré */
  color: var(--bleu-cyberpunk); /* #334fb4 */
  border: 1px solid var(--bleu-cyberpunk);
  border-radius: 0; /* Angles droits */
  font-size: 0.75rem;
  font-weight: 700; /* Bold pour lisibilité */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: 'Assistant', sans-serif;
}

/* Badge système contextuel */
.badge-monsterhearts {
  color: #8b5cf6;
  border-color: #8b5cf6;
}

.badge-engrenages {
  color: #d97706;
  border-color: #d97706;
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
  background: var(--brumisa-bleu);
  border: 2px solid var(--brumisa-bleu);
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
  background: var(--brumisa-bleu);
  border-color: var(--brumisa-bleu);
  transform: translateY(-2px);
  opacity: 0.9;
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
  border-color: var(--brumisa-bleu);
  transform: translateX(4px);
}

.floating-menu-item.active {
  background: var(--brumisa-bleu);
  border-color: var(--brumisa-bleu);
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
  border-color: var(--brumisa-bleu);
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
  color: var(--brumisa-bleu);
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

## 🚀 Implémentation UnoCSS/Tailwind (style cyberpunk)

### Configuration UnoCSS (recommandé pour performance)
```javascript
// uno.config.ts
import { defineConfig, presetWind, presetTypography } from 'unocss'

export default defineConfig({
  presets: [
    presetWind(), // Compatibilité Tailwind
    presetTypography(),
  ],
  theme: {
    colors: {
      // Couleurs principales - Noir/Blanc
      'noir-profond': '#121212',
      'noir-charbon': '#242833',
      'blanc-pur': '#ffffff',
      'gris-texte': '#e5e5e5',
      'gris-bordure': '#3a3f4a',
      'gris-hover': '#4a5060',

      // Accent cyberpunk
      'bleu-cyberpunk': '#334fb4',
      'bleu-hover': '#2a3f95',

      // Couleurs système JDR
      'monsterhearts': '#8b5cf6',
      'engrenages': '#d97706',
      'metro2033': '#dc2626',
      'mistengine': '#ec4899',
      'zombiology': '#d4af37',

      // Couleurs fonctionnelles
      'succes': '#22c55e',
      'erreur': '#f97316',
      'avertissement': '#eab308',
      'info': '#06b6d4',
    },
    fontFamily: {
      'sans': ['Assistant', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
    maxWidth: {
      'container': '120rem', // Otherscape page-width
    },
    spacing: {
      'section-desktop': '36px', // Otherscape spacing
      'section-mobile': '27px',  // Otherscape mobile
      'grid-desktop': '8px',     // Otherscape grid
      'grid-mobile': '4px',
    },
  },
  shortcuts: {
    // Shortcuts pour composants réutilisables
    'btn-base': 'inline-flex items-center justify-center px-6 py-3 min-h-[48px] font-sans font-bold text-base uppercase tracking-wider bg-noir-profond text-blanc-pur border border-gris-bordure transition-all duration-[400ms] ease-out cursor-pointer',
    'card-base': 'bg-noir-charbon border border-gris-bordure p-8 transition-all duration-[400ms] ease-out',
    'input-base': 'bg-noir-profond border border-gris-bordure text-blanc-pur font-sans px-4 py-3 transition-all duration-[400ms] ease-out',
  },
})
```

### Alternative Tailwind (si UnoCSS non souhaité)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Cyberpunk palette
        'noir-profond': '#121212',
        'noir-charbon': '#242833',
        'blanc-pur': '#ffffff',
        'bleu-cyberpunk': '#334fb4',
        // Systèmes JDR
        'monsterhearts': '#8b5cf6',
        'engrenages': '#d97706',
        'metro2033': '#dc2626',
        'mistengine': '#ec4899',
        'zombiology': '#d4af37',
      },
      fontFamily: {
        'sans': ['Assistant', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        'container': '120rem',
      },
    }
  }
}
```