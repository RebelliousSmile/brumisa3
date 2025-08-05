# Règles de Présentation par Système JDR

## 🎨 Pattern Général - Basé sur Monsterhearts

### Structure Hero Section

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

### Structure CTA Section

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

## 🎯 Configuration par Système

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

## 🎨 Filtres d'Image Thématiques

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

## 📐 Règles d'Espacement Standard

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

## 🔧 Implementation

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

Cette architecture permet de :
1. **Maintenir la cohérence** visuelle entre tous les systèmes
2. **Personnaliser facilement** chaque système avec ses couleurs
3. **Réutiliser les patterns** sans dupliquer le code
4. **Étendre facilement** à de nouveaux systèmes JDR