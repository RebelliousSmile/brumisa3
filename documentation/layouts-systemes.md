# Layouts par Système de Jeu

> **Références** : Voir aussi [`vues-et-layouts.md`](./vues-et-layouts.md) pour l'architecture générale et [`pages-systemes.md`](./pages-systemes.md) pour les pages dédiées.

## Vue d'ensemble

L'application utilise un système de layouts thématiques pour assurer la cohérence visuelle tout en permettant la personnalisation par système de jeu.

## Architecture des layouts

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

#### 🌐 Layout générique
**Fichier** : `src/views/layouts/generique.ejs`
- **Fond** : `bg-gray-900` avec effets blue
- **Couleur principale** : Blue (#3b82f6)
- **Ambiance** : Neutre, gaming
- **Usage** : Pages communes, oracles sans système

## Structure d'un layout système

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

## Utilisation dans les contrôleurs

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

## Composants partagés

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
Le fil d'Ariane s'adapte automatiquement selon le contexte :
- `/` → `Accueil`
- `/monsterhearts` → `Accueil > Monsterhearts`
- `/oracles/systeme/monsterhearts` → `Accueil > Oracles > Monsterhearts`
- `/oracles/[id]` → `Accueil > Oracles > [Nom Oracle]`

## Migration nécessaire

### 1. Créer les layouts
```bash
# Structure à créer
src/views/layouts/
├── base.ejs              # Layout HTML de base
├── generique.ejs         # Layout générique (blue)
├── monsterhearts.ejs     # Layout Monsterhearts (purple)
├── engrenages.ejs        # Layout Engrenages (emerald)
├── metro2033.ejs         # Layout Metro 2033 (red)
└── mistengine.ejs        # Layout Mist Engine (pink)
```

### 2. Créer les partials
```bash
src/views/partials/
├── breadcrumb.ejs        # Fil d'Ariane adaptatif
├── footer-systeme.ejs    # Footer avec couleurs système
└── head-meta.ejs         # Meta tags réutilisables
```

### 3. Refactoriser les vues existantes
- **Oracles** : Utiliser layout adaptatif selon le système
- **Pages système** : Utiliser leur layout dédié
- **Pages génériques** : Utiliser layout générique

### 4. Middleware de détection automatique
```javascript
// src/middleware/layoutMiddleware.js
function detectSystemLayout(req, res, next) {
    const gameSystem = req.params.gameSystem || req.query.system || detectFromPath(req.path);
    
    if (gameSystem && ['monsterhearts', 'engrenages', 'metro2033', 'mistengine'].includes(gameSystem)) {
        res.locals.layout = `layouts/${gameSystem}`;
        res.locals.gameSystem = gameSystem;
    } else {
        res.locals.layout = 'layouts/generique';
    }
    
    res.locals.systemNames = {
        'monsterhearts': 'Monsterhearts',
        'engrenages': 'Engrenages & Sortilèges', 
        'metro2033': 'Metro 2033',
        'mistengine': 'Mist Engine'
    };
    
    next();
}
```

## Avantages de cette architecture

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

## Plan de migration

### Phase 1 : Infrastructure
1. Créer les layouts de base
2. Créer les partials réutilisables  
3. Implémenter le middleware de détection

### Phase 2 : Oracles
1. Migrer `/oracles` vers layout générique
2. Migrer `/oracles/systeme/monsterhearts` vers layout Monsterhearts
3. Tester la cohérence visuelle

### Phase 3 : Pages système
1. Migrer `/monsterhearts` vers son layout
2. Créer les autres pages système avec leurs layouts
3. Vérifier la navigation

### Phase 4 : Finalisation
1. Nettoyer le code dupliqué
2. Documenter les nouveaux patterns
3. Tests de régression visuelle

Cette architecture permettra une bien meilleure organisation du code et une cohérence visuelle parfaite entre toutes les pages d'un même système !