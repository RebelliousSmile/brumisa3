# Interfaces des Systèmes JDR

## Vue d'ensemble

L'application utilise une architecture d'interfaces thématiques pour assurer la cohérence visuelle tout en permettant la personnalisation complète par système de jeu. Chaque système dispose de ses propres pages dédiées et de layouts spécialisés.

## Architecture des Pages

### URLs des pages systèmes
- `/monsterhearts` - Page dédiée Monsterhearts
- `/engrenages` - Page dédiée Engrenages & Sortilèges  
- `/metro2033` - Page dédiée Metro 2033
- `/mistengine` - Page dédiée Mist Engine
- `/zombiology` - Page dédiée Zombiology

### Routes (src/routes/web.js)
```javascript
// Page Monsterhearts
router.get('/monsterhearts', (req, res) => {
    res.render('systemes/monsterhearts', {
        title: 'Monsterhearts - Générateur PDF JDR',
        description: 'Créez des fiches de personnages pour Monsterhearts',
        systeme: 'monsterhearts'
    });
});
```

### Templates (src/views/systemes/)
- `monsterhearts.ejs` - Page Monsterhearts (créée)
- `engrenages.ejs` - Page Engrenages (à créer)
- `metro2033.ejs` - Page Metro 2033 (à créer)
- `mistengine.ejs` - Page Mist Engine (à créer)
- `zombiology.ejs` - Page Zombiology (à créer)

## Architecture des Layouts

### 🌐 Layout principal (base.ejs)
**Fichier** : `src/views/layouts/base.ejs`
- Structure HTML de base (head, meta, fonts, scripts)
- Variables communes à toutes les pages
- Inclusion conditionnelle des layouts système

### 🎮 Layouts par système
Chaque système de jeu a son propre layout pour la cohérence thématique :

#### 🧛 Layout Monsterhearts
**Fichier** : `src/views/layouts/monsterhearts.ejs`
- **Fond** : `bg-gray-900` avec effets purple/blue
- **Couleur principale** : Purple (#8b5cf6)
- **Ambiance** : Gothique romantique, mystérieux
- **Usage** : Pages Monsterhearts, oracles Monsterhearts

#### ⚙️ Layout Engrenages  
**Fichier** : `src/views/layouts/engrenages.ejs`
- **Fond** : `bg-gray-900` avec effets emerald/gold
- **Couleur principale** : Emerald (#10b981)
- **Ambiance** : Fantasy épique, médiéval
- **Usage** : Pages Engrenages, oracles Engrenages

#### ☢️ Layout Metro 2033
**Fichier** : `src/views/layouts/metro2033.ejs`
- **Fond** : `bg-gray-900` avec effets red/orange
- **Couleur principale** : Red (#dc2626)
- **Ambiance** : Post-apocalyptique, brutal
- **Usage** : Pages Metro 2033, oracles Metro 2033

#### 🌸 Layout Mist Engine
**Fichier** : `src/views/layouts/mistengine.ejs`
- **Fond** : `bg-gray-900` avec effets pink/purple
- **Couleur principale** : Pink (#ec4899)
- **Ambiance** : Poétique, onirique
- **Usage** : Pages Mist Engine, oracles Mist Engine

#### ☣️ Layout Zombiology
**Fichier** : `src/views/layouts/zombiology.ejs`
- **Fond** : `bg-gray-900` avec effets yellow/red
- **Couleur principale** : Yellow (#d4af37)
- **Ambiance** : Survival horror
- **Usage** : Pages Zombiology, oracles Zombiology

#### 🌐 Layout générique
**Fichier** : `src/views/layouts/generique.ejs`
- **Fond** : `bg-gray-900` avec effets blue
- **Couleur principale** : Blue (#3b82f6)
- **Ambiance** : Neutre, gaming
- **Usage** : Pages communes, oracles sans système

## Structure d'un Layout Système

### Template type
```ejs
<!-- Layout Monsterhearts -->
<div class="min-h-screen bg-gray-900 relative overflow-hidden">
    <!-- Background Effects -->
    <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-purple-800/30 to-gray-900"></div>
    <div class="absolute inset-0">
        <div class="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl"></div>
        <div class="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Fil d'Ariane -->
    <%- include('../partials/breadcrumb', { systeme: 'monsterhearts' }) %>

    <!-- Contenu principal -->
    <main class="relative z-10">
        <%- body %>
    </main>

    <!-- Footer système (optionnel) -->
    <%- include('../partials/footer-systeme', { systeme: 'monsterhearts' }) %>
</div>
```

### Variables système
Chaque layout définit ses propres variables CSS :

```ejs
<style>
:root {
    --system-primary: #8b5cf6;    /* Purple pour Monsterhearts */
    --system-secondary: #a855f7;  /* Purple clair */
    --system-accent: #ec4899;     /* Rose */
    --system-bg-from: #581c87;    /* Purple sombre */
    --system-bg-to: #1f2937;      /* Gris sombre */
}
</style>
```

## Pattern de Présentation des Pages

### 🎨 Pattern Général - Basé sur Monsterhearts

#### Structure Hero Section

**Template générique** :
```html
<header class="relative pt-20 pb-16 px-4 overflow-hidden">
    <!-- Background Effects - Dégradé système -->
    <div class="absolute inset-0 bg-gradient-to-br from-[system]-900 via-[system]-800 to-[accent]-900"></div>
    <div class="absolute inset-0">
        <div class="absolute top-20 left-10 w-72 h-72 bg-[system]/20 rounded-full filter blur-3xl"></div>
        <div class="absolute bottom-20 right-10 w-96 h-96 bg-[accent]/20 rounded-full filter blur-3xl"></div>
    </div>
    
    <div class="max-w-7xl mx-auto relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <!-- Image/Visual à gauche -->
            <div class="relative lg:order-first order-first">
                <div class="relative max-w-md mx-auto lg:ml-0">
                    <div class="absolute inset-0 bg-gradient-to-r from-[system]/30 to-[accent]/30 rounded-full filter blur-3xl"></div>
                    <img src="[image-thématique]" alt="[alt-text]" class="relative z-10 w-full h-auto [filter-thématique]">
                </div>
            </div>
            
            <!-- Contenu à droite -->
            <div class="text-center lg:text-left lg:order-last relative z-10">
                <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight font-display">
                    [TITRE PRINCIPAL]
                    <span class="text-[system]">
                        [SOUS-TITRE COLORÉ]
                    </span>
                </h1>
                <p class="text-xl md:text-2xl text-gray-300 leading-relaxed font-serif">
                    [Description immersive du système]
                </p>
            </div>
        </div>
    </div>
</header>
```

#### Structure CTA Section

**Template générique** :
```html
<section class="relative z-10 px-4 mb-16">
    <div class="max-w-6xl mx-auto">
        <div class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-[system]-900 to-[system] p-8 mb-12">
            <div class="relative z-10">
                <h2 class="text-2xl md:text-3xl font-bold text-white mb-8 text-center font-display">
                    [Titre de la section CTA]
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Cartes de contenu -->
                    <div class="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-[system]/20">
                        [Contenu carte]
                    </div>
                </div>
                
                <div class="text-center mt-8">
                    <button class="bg-[system] hover:bg-[system]/80 text-white px-8 py-3 rounded-lg font-semibold transition-colors font-display">
                        [Texte CTA]
                    </button>
                </div>
            </div>
        </div>
    </div>
</section>
```

## Configuration Thématique par Système

### Générique (Brumisa3) - Home Page
```javascript
const generique = {
    system: 'generique',       // #3b82f6 (blue-500)
    accent: 'purple-500',      // #8b5cf6
    heroGradient: 'from-gray-900 via-blue-900 to-generique',
    ctaGradient: 'from-gray-900 via-blue-900 to-generique',
    image: '/images/transhumans-bueno.png',
    imageFilter: 'hero-character-filter',
    titre: 'N\'EMBARQUEZ PAS DANS LA BRUME',
    sousTitre: 'LES MAINS VIDES',
    description: 'Transformez vos héros en légendes épiques dans des fiches de personnages immersives.'
}
```

### Monsterhearts - Romance Gothique
```javascript
const monsterhearts = {
    system: 'purple-600',      // #8b5cf6
    accent: 'pink-600',        // #ec4899
    heroGradient: 'from-purple-900 via-purple-800 to-pink-900',
    ctaGradient: 'from-gray-900 via-purple-900 to-purple-600',
    image: '/images/monsterhearts-character.png',
    imageFilter: 'gothic-character-filter',
    titre: 'EXPLOREZ VOS DÉSIRS',
    sousTitre: 'DANS LES TÉNÈBRES',
    description: 'Des histoires de romance sombre et de pouvoir surnaturel dans un lycée hanté.'
}
```

### Engrenages - Fantasy Épique
```javascript
const engrenages = {
    system: 'emerald-600',     // #10b981
    accent: 'green-600',       // #16a34a
    heroGradient: 'from-emerald-900 via-emerald-800 to-green-900',
    ctaGradient: 'from-gray-900 via-emerald-900 to-emerald-600',
    image: '/images/engrenages-character.png',
    imageFilter: 'fantasy-character-filter',
    titre: 'LA ROUE TISSE',
    sousTitre: 'VOTRE DESTIN',
    description: 'Aventures épiques dans l\'univers de la Roue du Temps avec magie et politique.'
}
```

### Metro 2033 - Post-Apocalyptique
```javascript
const metro2033 = {
    system: 'red-600',         // #dc2626
    accent: 'orange-600',      // #ea580c
    heroGradient: 'from-gray-900 via-red-900 to-red-600',
    ctaGradient: 'from-gray-900 via-red-900 to-red-600',
    image: '/images/metro-character.png',
    imageFilter: 'post-apo-character-filter',
    titre: 'SURVIVEZ DANS',
    sousTitre: 'LES TUNNELS',
    description: 'Exploration des métros post-apocalyptiques de Moscou avec horreur et survie.'
}
```

### Mist Engine - Narratif Poétique
```javascript
const mistengine = {
    system: 'pink-500',        // #ec4899
    accent: 'purple-500',      // #8b5cf6
    heroGradient: 'from-pink-900 via-pink-800 to-purple-900',
    ctaGradient: 'from-gray-900 via-pink-900 to-pink-500',
    image: '/images/mist-character.png',
    imageFilter: 'mystical-character-filter',
    titre: 'NAVIGUEZ DANS',
    sousTitre: 'LA BRUME',
    description: 'Histoires oniriques et poétiques où la narration prime sur les mécaniques.'
}
```

### Zombiology - Survival Horror
```javascript
const zombiology = {
    system: 'yellow-600',      // #d4af37 (or)
    accent: 'red-600',         // #dc2626
    heroGradient: 'from-gray-900 via-yellow-900 to-red-900',
    ctaGradient: 'from-gray-900 via-yellow-900 to-yellow-600',
    image: '/images/zombie-character.png',
    imageFilter: 'horror-character-filter',
    titre: 'SURVIVEZ À',
    sousTitre: 'L\'APOCALYPSE',
    description: 'Combat pour la survie dans un monde ravagé par l\'infection zombie.'
}
```

## Filtres d'Image Thématiques

### CSS Filters par Système
```css
/* Générique - Cyberpunk blues */
.hero-character-filter {
    filter: hue-rotate(280deg) saturate(0.7) brightness(0.8) contrast(1.2);
}

/* Monsterhearts - Gothic purples */
.gothic-character-filter {
    filter: hue-rotate(270deg) saturate(1.1) brightness(0.7) contrast(1.3);
}

/* Engrenages - Nature greens */
.fantasy-character-filter {
    filter: hue-rotate(120deg) saturate(0.9) brightness(0.8) contrast(1.1);
}

/* Metro 2033 - Post-apo reds */
.post-apo-character-filter {
    filter: hue-rotate(0deg) saturate(1.2) brightness(0.6) contrast(1.4);
}

/* Mist Engine - Mystical pinks */
.mystical-character-filter {
    filter: hue-rotate(320deg) saturate(0.8) brightness(0.9) contrast(1.0);
}

/* Zombiology - Horror yellows */
.horror-character-filter {
    filter: hue-rotate(45deg) saturate(1.3) brightness(0.7) contrast(1.3);
}
```

## Navigation et Composants Partagés

### Menu principal
Le menu de navigation (src/views/layouts/principal.ejs) pointe vers les pages dédiées :
- Utilisateurs connectés ET non connectés : même liens vers `/systeme`
- Plus de logique conditionnelle selon l'authentification

```html
<!-- Game Links (public pages) -->
<div class="hidden md:flex items-center space-x-8 font-display">
    <a href="/monsterhearts" class="flex items-center text-gray-300 hover:text-purple-400 transition-colors">
        <i class="ra ra-heartburn text-purple-400 mr-2"></i>
        <span class="text-sm">Monsterhearts</span>
    </a>
    <!-- ... autres liens -->
</div>
```

### 🧭 Fil d'Ariane (breadcrumb.ejs)
**Fichier** : `src/views/partials/breadcrumb.ejs`
```ejs
<nav class="relative z-10 pt-8 pb-4 px-4">
    <div class="max-w-7xl mx-auto">
        <div class="flex items-center text-sm text-gray-400 space-x-2">
            <a href="/" class="hover:text-purple-400 transition-colors">
                <i class="ra ra-dice-five mr-1"></i>
                Accueil
            </a>
            <i class="fas fa-chevron-right text-gray-600"></i>
            
            <% if (locals.gameSystem) { %>
                <% if (section && section !== 'systeme') { %>
                    <a href="/<%= gameSystem %>" class="hover:text-purple-400 transition-colors">
                        <%= systemNames[gameSystem] || gameSystem %>
                    </a>
                    <i class="fas fa-chevron-right text-gray-600"></i>
                <% } %>
                <span class="text-purple-400">
                    <%= pageTitle || 'Page' %>
                </span>
            <% } else { %>
                <span class="text-purple-400"><%= pageTitle || titre %></span>
            <% } %>
        </div>
    </div>
</nav>
```

### 📱 Navigation adaptative
Le fil d'ariane s'adapte automatiquement selon le contexte :
- `/` → `Accueil`
- `/monsterhearts` → `Accueil > Monsterhearts`
- `/oracles/systeme/monsterhearts` → `Accueil > Oracles > Monsterhearts`
- `/oracles/[id]` → `Accueil > Oracles > [Nom Oracle]`

## Page /mes-documents

### Principe
- Page réservée aux utilisateurs connectés
- Affiche TOUS les contenus créés par l'utilisateur (personnages + PDFs)
- Filtrage par système de jeu via interface (pas de query strings)
- Accès via le menu utilisateur

### Fonctionnalités
- Onglets personnages/PDFs
- Filtres par système de jeu
- Actions : créer, modifier, supprimer, générer PDF

## Règles d'Espacement Standard

### Espacements Fixes
- **Hero padding** : `pt-20 pb-16 px-4`
- **Section padding** : `px-4 mb-16`
- **Container max** : `max-w-6xl mx-auto` (standard), `max-w-7xl mx-auto` (hero)
- **Grille gap** : `gap-6` (cartes), `gap-12` (hero layout)
- **Boutons gap** : `gap-4`

### Z-Index Hiérarchie
- **Background effects** : `absolute inset-0`
- **Content** : `relative z-10`
- **Sections** : `relative z-10`

### Border Radius Standard
- **Cartes** : `rounded-lg`
- **CTA containers** : `rounded-2xl`
- **Boutons** : `rounded-lg`
- **Inputs** : `rounded-lg`

## Utilisation dans les Contrôleurs

### Méthode actuelle (à corriger)
```javascript
// ❌ Problématique : duplication HTML dans chaque view
res.render('oracles/liste', {
    titre: 'Oracles Disponibles',
    oracles: oracles.data
});
```

### Nouvelle méthode (avec layouts)
```javascript
// ✅ Solution : utilisation d'un layout système
res.render('oracles/liste', {
    layout: 'layouts/monsterhearts', // ou détecté automatiquement
    titre: 'Oracles Monsterhearts',
    oracles: oracles.data,
    gameSystem: 'monsterhearts'
});
```

## Implementation Technique

### Utilisation Dynamic Classes
```javascript
// Exemple d'usage dans EJS
const systemConfig = systemConfigs[currentSystem] || systemConfigs.generique;

// Dans le template EJS
<div class="bg-gradient-to-br <%= systemConfig.heroGradient %>">
    <span class="text-<%= systemConfig.system %>"><%= systemConfig.sousTitre %></span>
</div>
```

### Classes CSS Helper
```css
/* Classes génériques pour tous les systèmes */
.hero-section {
    @apply relative pt-20 pb-16 px-4 overflow-hidden;
}

.hero-bg-effects {
    @apply absolute inset-0;
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

.cta-content {
    @apply relative z-10;
}
```

### Middleware de détection automatique
```javascript
// src/middleware/layoutMiddleware.js
function detectSystemLayout(req, res, next) {
    const gameSystem = req.params.gameSystem || req.query.system || detectFromPath(req.path);
    
    if (gameSystem && ['monsterhearts', 'engrenages', 'metro2033', 'mistengine', 'zombiology'].includes(gameSystem)) {
        res.locals.layout = `layouts/${gameSystem}`;
        res.locals.gameSystem = gameSystem;
    } else {
        res.locals.layout = 'layouts/generique';
    }
    
    res.locals.systemNames = {
        'monsterhearts': 'Monsterhearts',
        'engrenages': 'Engrenages & Sortilèges', 
        'metro2033': 'Metro 2033',
        'mistengine': 'Mist Engine',
        'zombiology': 'Zombiology'
    };
    
    next();
}
```

## Avantages de cette Architecture

### ✅ SEO
- Une URL propre par système : `/monsterhearts` vs `/?systeme=monsterhearts`
- Meta descriptions spécifiques par système
- Contenu personnalisé pour chaque univers

### ✅ UX
- Navigation cohérente entre connectés/non connectés
- Pages dédiées permettent une personnalisation poussée (couleurs, images, contenu spécifique)
- Séparation claire : pages publiques vs espace personnel (/mes-documents)

### ✅ Développement
- Code plus maintenable avec un template par système
- Possibilité d'ajouter des fonctionnalités spécifiques par système
- Meilleure organisation des fichiers

### ✅ Cohérence
- Même structure pour toutes les pages d'un système
- Fil d'Ariane uniforme et fonctionnel
- Effets de fond cohérents

### ✅ Maintenabilité  
- Un seul endroit pour modifier l'apparence d'un système
- Réutilisation des composants (breadcrumb, effects)
- Code DRY (Don't Repeat Yourself)

### ✅ Évolutivité
- Ajout facile de nouveaux systèmes
- Personnalisation avancée possible
- Migration progressive des pages existantes

### ✅ Performance
- CSS système chargé une seule fois
- Effets JavaScript réutilisables
- Moins de duplication HTML

Cette architecture permet de :
1. **Maintenir la cohérence** visuelle entre tous les systèmes
2. **Personnaliser facilement** chaque système avec ses couleurs
3. **Réutiliser les patterns** sans dupliquer le code
4. **Étendre facilement** à de nouveaux systèmes JDR