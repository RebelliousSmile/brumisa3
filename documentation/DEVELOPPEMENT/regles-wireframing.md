# Regles de Creation des Wireframes - Brumisa3

Date: 2025-01-19
Version: 2.0 (MVP - Multi-device)

---

## Table des matieres

1. [Approche Recommandee : Wireframes avec UnoCSS](#approche-recommandee-wireframes-avec-unocss) **NOUVEAU**
2. [Architecture Multi-Device](#architecture-multi-device) **NOUVEAU**
3. [Philosophie du Wireframing](#philosophie-du-wireframing)
4. [Structure HTML de Base](#structure-html-de-base)
5. [Systeme de Grilles](#systeme-de-grilles)
6. [Bibliotheque de Composants Wireframe](#bibliotheque-de-composants-wireframe)
7. [Templates Desktop](#templates-desktop)
8. [Templates Mobile](#templates-mobile)
9. [Guidelines de Creation](#guidelines-de-creation)
10. [Outils et Workflow](#outils-et-workflow)

---

## Approche Recommandee : Wireframes avec UnoCSS

### Pourquoi UnoCSS pour les Wireframes ?

**UnoCSS est deja utilise dans le projet Brumisa3**, donc l'utiliser pour les wireframes offre plusieurs avantages :

1. **Coherence** : Memes classes que le code final (transition wireframe → code simplifiee)
2. **Rapidite** : Pas besoin de creer un systeme CSS custom
3. **Flexibilite** : Toutes les classes Tailwind-compatible disponibles
4. **Maintenabilite** : Un seul systeme de classes a maitriser

### Template Wireframe Minimal avec UnoCSS

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wireframe - [Nom de la page]</title>

    <!-- UnoCSS CDN -->
    <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>

    <style>
        /* Variables wireframe minimales */
        :root {
            --wf-border: #cccccc;
            --wf-placeholder: #999999;
            --wf-active: #3b82f6;
        }

        /* Placeholders patterns */
        .wf-placeholder {
            background: repeating-linear-gradient(
                45deg,
                #f0f0f0,
                #f0f0f0 10px,
                #e0e0e0 10px,
                #e0e0e0 20px
            );
            border: 1px dashed var(--wf-border);
        }

        /* Annotations */
        .wf-annotation {
            position: relative;
            border: 2px solid var(--wf-active);
        }

        .wf-annotation::before {
            content: attr(data-note);
            position: absolute;
            top: -12px;
            left: 8px;
            background: var(--wf-active);
            color: white;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10;
        }
    </style>
</head>
<body class="bg-gray-50 text-gray-900">
    <!-- Contenu avec classes UnoCSS -->
    <div class="max-w-7xl mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Wireframe Titre</h1>

        <!-- Exemple de grille responsive -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="border border-gray-300 p-4 rounded">Card 1</div>
            <div class="border border-gray-300 p-4 rounded">Card 2</div>
            <div class="border border-gray-300 p-4 rounded">Card 3</div>
        </div>
    </div>
</body>
</html>
```

### Classes UnoCSS Essentielles pour Wireframes

#### Layout et Spacing

```html
<!-- Conteneurs -->
<div class="max-w-7xl mx-auto">Conteneur centre max 1280px</div>
<div class="container mx-auto">Conteneur responsive</div>

<!-- Padding / Margin -->
<div class="p-4">padding 1rem (16px)</div>
<div class="px-6 py-3">padding horizontal 1.5rem, vertical 0.75rem</div>
<div class="m-4">margin 1rem</div>
<div class="space-y-4">espace vertical 1rem entre enfants</div>

<!-- Flexbox -->
<div class="flex items-center justify-between">
    <span>Gauche</span>
    <span>Droite</span>
</div>

<!-- Grid -->
<div class="grid grid-cols-12 gap-4">
    <div class="col-span-3">Sidebar 3/12</div>
    <div class="col-span-9">Main 9/12</div>
</div>

<!-- Grille responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Items -->
</div>
```

#### Typographie

```html
<!-- Tailles -->
<h1 class="text-3xl font-bold">Titre H1</h1>
<h2 class="text-2xl font-semibold">Titre H2</h2>
<p class="text-base">Texte normal 16px</p>
<p class="text-sm text-gray-600">Texte secondaire 14px</p>

<!-- Couleurs texte -->
<p class="text-gray-900">Texte principal</p>
<p class="text-gray-500">Texte muted</p>
<p class="text-blue-600">Texte accent</p>
```

#### Bordures et Backgrounds

```html
<!-- Bordures -->
<div class="border border-gray-300 rounded">Bordure standard</div>
<div class="border-2 border-blue-500 rounded-lg">Bordure epaisse bleue</div>
<div class="border-dashed border-gray-400">Bordure pointillee</div>

<!-- Backgrounds -->
<div class="bg-white">Fond blanc</div>
<div class="bg-gray-50">Fond gris tres clair</div>
<div class="bg-gray-100">Fond gris clair</div>
<div class="bg-blue-500 text-white">Fond bleu texte blanc</div>
```

#### Composants Courants

```html
<!-- Bouton primaire -->
<button class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
    Action Primaire
</button>

<!-- Bouton secondaire -->
<button class="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50">
    Action Secondaire
</button>

<!-- Card -->
<div class="border border-gray-300 rounded-lg p-4 bg-white">
    <h3 class="font-bold text-lg mb-2">Titre Card</h3>
    <p class="text-sm text-gray-600">Description...</p>
</div>

<!-- Input -->
<input
    type="text"
    class="border border-gray-300 rounded px-4 py-2 w-full focus:border-blue-500 focus:outline-none"
    placeholder="Placeholder..."
>
```

### Exemple Complet : Page Dashboard avec UnoCSS

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wireframe - Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
    <style>
        .wf-placeholder {
            background: repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #e0e0e0 10px, #e0e0e0 20px);
            border: 1px dashed #ccc;
        }
        .wf-annotation {
            position: relative;
            border: 2px solid #3b82f6;
        }
        .wf-annotation::before {
            content: attr(data-note);
            position: absolute;
            top: -12px;
            left: 8px;
            background: #3b82f6;
            color: white;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10;
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-300 wf-annotation" data-note="Header 64px">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div class="flex items-center space-x-8">
                <div class="wf-placeholder px-6 py-2 rounded">LOGO</div>
                <nav class="flex space-x-4">
                    <a href="#" class="px-4 py-2 bg-blue-600 text-white rounded">Personnages</a>
                    <a href="#" class="px-4 py-2 hover:bg-gray-100 rounded">Playspaces</a>
                    <a href="#" class="px-4 py-2 hover:bg-gray-100 rounded">Support</a>
                </nav>
            </div>
            <div class="wf-placeholder w-10 h-10 rounded-full">👤</div>
        </div>
    </header>

    <!-- Layout avec Sidebar -->
    <div class="flex max-w-7xl mx-auto">
        <!-- Sidebar -->
        <aside class="w-70 bg-gray-100 border-r border-gray-300 p-4 wf-annotation" data-note="Sidebar 280px">
            <div class="mb-6">
                <h3 class="text-xs font-bold text-gray-500 uppercase mb-2">Playspaces</h3>
                <div class="space-y-2">
                    <div class="bg-blue-600 text-white p-3 rounded font-medium">
                        Workspace Aria
                        <div class="text-xs opacity-75">3 personnages</div>
                    </div>
                    <div class="bg-white border border-gray-300 p-3 rounded hover:bg-gray-50">
                        Campagne Marc
                        <div class="text-xs text-gray-500">1 personnage</div>
                    </div>
                </div>
                <button class="w-full border-2 border-dashed border-gray-400 p-3 rounded text-gray-500 mt-2 hover:border-blue-500 hover:text-blue-500">
                    + Nouveau Playspace
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-6">
            <!-- Breadcrumbs -->
            <nav class="flex items-center space-x-2 text-sm mb-4">
                <a href="#" class="text-blue-600">Playspaces</a>
                <span class="text-gray-400">/</span>
                <span class="font-medium">Workspace Aria</span>
            </nav>

            <!-- Page Header -->
            <div class="flex items-center justify-between mb-6 wf-annotation" data-note="Page Header">
                <div>
                    <h1 class="text-3xl font-bold">Workspace Aria</h1>
                    <p class="text-sm text-gray-500">Lost in the Mist - Chicago Noir</p>
                </div>
                <div class="flex space-x-2">
                    <button class="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50">Modifier</button>
                    <button class="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50">Exporter</button>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-3 gap-4 mb-6 wf-annotation" data-note="Stats">
                <div class="bg-white border border-gray-300 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold">3</div>
                    <div class="text-sm text-gray-500">Personnages</div>
                </div>
                <div class="bg-white border border-gray-300 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold">12</div>
                    <div class="text-sm text-gray-500">Theme Cards</div>
                </div>
                <div class="bg-white border border-gray-300 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold">2j</div>
                    <div class="text-sm text-gray-500">Derniere modif</div>
                </div>
            </div>

            <!-- Personnages Grid -->
            <div class="wf-annotation" data-note="Personnages Grid">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold">Personnages (3)</h2>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700">
                        + Nouveau Personnage
                    </button>
                </div>

                <div class="grid grid-cols-3 gap-4">
                    <!-- Card Personnage 1 -->
                    <div class="bg-white border border-gray-300 rounded-lg overflow-hidden">
                        <div class="wf-placeholder h-48 flex items-center justify-center">Avatar</div>
                        <div class="p-4">
                            <h3 class="font-bold">Aria the Mist Weaver</h3>
                            <p class="text-sm text-gray-500 mb-3">Niveau 3 - Modifie il y a 2h</p>
                            <div class="flex space-x-2">
                                <button class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm">Modifier</button>
                                <button class="flex-1 border border-gray-300 px-3 py-2 rounded text-sm">Dupliquer</button>
                            </div>
                        </div>
                    </div>

                    <!-- Card Personnage 2 -->
                    <div class="bg-white border border-gray-300 rounded-lg overflow-hidden">
                        <div class="wf-placeholder h-48 flex items-center justify-center">Avatar</div>
                        <div class="p-4">
                            <h3 class="font-bold">Raven Nightshade</h3>
                            <p class="text-sm text-gray-500 mb-3">Niveau 2 - Cree il y a 5j</p>
                            <div class="flex space-x-2">
                                <button class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm">Modifier</button>
                                <button class="flex-1 border border-gray-300 px-3 py-2 rounded text-sm">Dupliquer</button>
                            </div>
                        </div>
                    </div>

                    <!-- Card Personnage 3 -->
                    <div class="bg-white border border-gray-300 rounded-lg overflow-hidden">
                        <div class="wf-placeholder h-48 flex items-center justify-center">Avatar</div>
                        <div class="p-4">
                            <h3 class="font-bold">Baron Vordak</h3>
                            <p class="text-sm text-gray-500 mb-3">PNJ - Cree il y a 1 sem</p>
                            <div class="flex space-x-2">
                                <button class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm">Modifier</button>
                                <button class="flex-1 border border-gray-300 px-3 py-2 rounded text-sm">Dupliquer</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
```

### Avantages de cette Approche

1. **Code reutilisable** : Les classes wireframe sont identiques au code final
2. **Rapidite** : Pas besoin d'ecrire du CSS custom
3. **Responsive immediat** : Classes `md:` et `lg:` integrees
4. **Coherence** : Un seul systeme de classes a maitriser
5. **Transition facile** : Wireframe → Code = changer couleurs et ajouter interactions

### Differences avec CSS Custom (Section 3+)

Les sections suivantes documentent l'approche CSS custom **pour reference** ou si UnoCSS n'est pas disponible. **L'approche UnoCSS est recommandee pour Brumisa3.**

---

## Architecture Multi-Device

### Principe : Sous-repertoires par Device

Pour garantir une experience optimale sur chaque plateforme, **les wireframes sont organises par device** dans des sous-repertoires dedies :

```
documentation/WIREFRAMES/propositionC/
├── desktop/          # Version desktop (1280px+)
│   ├── landing.html
│   ├── dashboard.html
│   ├── character-edit.html
│   ├── characters-list.html
│   └── playspaces-list.html
├── mobile/           # Version mobile (< 768px)
│   ├── landing.html
│   ├── dashboard.html
│   ├── character-edit.html
│   ├── characters-list.html
│   └── playspaces-list.html
└── tablet/           # Version tablette (768px-1024px)
    ├── landing.html
    ├── dashboard.html
    ├── character-edit.html
    ├── characters-list.html
    └── playspaces-list.html
```

### Breakpoints et Caracteristiques

#### Desktop (1280px+)

**Caracteristiques techniques :**
- Largeur minimale : 1280px
- Grille : 12 colonnes
- Sidebar fixe : 280px
- Header : 64px
- Touch targets : 32px minimum
- Navigation : Sidebar gauche + Header horizontal

**Composants specifiques :**
- Sidebar persistante avec liste playspaces
- Navigation horizontale complete
- Grilles multi-colonnes (2-3-4 colonnes)
- Modales larges (600px+)
- Breadcrumbs detailles

**Exemple de structure :**
```html
<div class="flex">
    <aside class="w-70 bg-navy-800">Sidebar 280px fixe</aside>
    <main class="flex-1">Contenu principal</main>
</div>
```

#### Tablet (768px-1024px)

**Caracteristiques techniques :**
- Largeur : 768px - 1024px
- Grille : 8 colonnes
- Sidebar collapsible : 280px
- Header : 64px
- Touch targets : 44px minimum
- Navigation : Sidebar collapsible + Header horizontal

**Composants specifiques :**
- Sidebar collapsible avec toggle hamburger
- Grilles 2 colonnes maximum
- Touch targets agrandis (44px)
- Modales adaptatives (90% largeur)
- Gestures swipe supportes

**Exemple de structure :**
```html
<div class="flex">
    <aside class="w-70 bg-navy-800 sidebar-collapsible">
        <!-- Toggle hamburger pour collapse -->
    </aside>
    <main class="flex-1">Contenu principal</main>
</div>
```

#### Mobile (< 768px)

**Caracteristiques techniques :**
- Largeur maximale : 767px
- Grille : Stack vertical (1 colonne)
- Pas de sidebar fixe
- Header simplifie : 56px
- Bottom navigation : 64px
- Touch targets : 48px minimum (WCAG AAA)
- Navigation : Drawer hamburger + Bottom nav

**Composants specifiques :**
- Bottom navigation (4 icones principales)
- Drawer swipable pour playspaces
- FAB (Floating Action Button) pour actions principales
- Stack vertical complet
- Tabs swipables horizontalement
- Modales plein ecran

**Exemple de structure :**
```html
<div class="flex flex-col min-h-screen">
    <header class="h-14">Header simplifie</header>
    <main class="flex-1">Stack vertical</main>
    <nav class="h-16 bottom-nav">Bottom navigation 4 icones</nav>
</div>
```

### Workflow de Creation Multi-Device

#### Etape 1 : Desktop First (Recommande)

1. **Creer la structure complete desktop** avec toutes les fonctionnalites
2. **Valider la navigation** selon arborescence-navigation.md
3. **Tester l'architecture** de l'information
4. **Obtenir l'approbation** utilisateur/product owner

**Pourquoi desktop first ?**
- Structure complete = vision d'ensemble claire
- Plus facile de simplifier que de complexifier
- Navigation complete definie en premier
- Composants complexes concus pour grand ecran

#### Etape 2 : Adaptation Mobile

5. **Analyser les composants desktop** : Lesquels adapter ?
6. **Reorganiser en stack vertical** : Navigation devient bottom nav + drawer
7. **Simplifier les interactions** : Tabs devient swipable
8. **Ajouter FAB** pour actions principales
9. **Agrandir touch targets** : 48px minimum

**Adaptations typiques :**
- Sidebar -> Drawer hamburger + Bottom nav
- Navigation horizontale -> Bottom nav (4 items max)
- Grilles multi-colonnes -> Stack vertical
- Modales -> Plein ecran
- Tabs horizontales -> Swipables

#### Etape 3 : Hybridation Tablet

10. **Combiner desktop et mobile** : Sidebar collapsible
11. **Adapter les grilles** : 8 colonnes max
12. **Touch targets 44px** : Entre mobile (48px) et desktop (32px)
13. **Tester gestures** : Swipe, pinch, rotate

### Conventions de Nommage Multi-Device

#### Fichiers HTML

```
[device]/[section]-[page].html

Exemples:
- desktop/landing.html
- desktop/dashboard.html
- desktop/character-edit.html
- mobile/landing.html
- mobile/dashboard.html
- tablet/landing.html
```

**IMPORTANT** : Le nom du fichier doit etre **identique** sur tous les devices pour faciliter la navigation.

#### Classes CSS Specifiques

```css
/* Classes communes UnoCSS */
.flex, .grid, .p-4, etc.

/* Classes device-specific (media queries) */
.sidebar-desktop { /* desktop only */ }
.sidebar-tablet { /* tablet collapsible */ }
.bottom-nav-mobile { /* mobile only */ }

/* Classes responsive UnoCSS */
.grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

### Guidelines d'Adaptation par Device

#### Navigation

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| **Sidebar** | Fixe 280px | Collapsible 280px | Drawer hamburger |
| **Header** | 64px horizontal | 64px horizontal | 56px simplifie |
| **Footer** | 48px horizontal | 48px horizontal | Cache (sauf legal) |
| **Bottom Nav** | Non | Non | Oui (64px, 4 items) |
| **Breadcrumbs** | Complets | Complets | Simplifies (< 3 items) |

#### Composants

| Composant | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| **Cards grilles** | 3-4 colonnes | 2 colonnes | 1 colonne (stack) |
| **Modales** | 600px centre | 90% largeur | Plein ecran |
| **Tabs** | Horizontales | Horizontales | Swipables |
| **Forms** | Multi-colonnes | 2 colonnes | 1 colonne |
| **Actions** | Boutons groupes | Boutons groupes | FAB principale |

#### Espacement

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| **Padding conteneur** | 24px | 20px | 16px |
| **Gap grilles** | 24px | 20px | 16px |
| **Margin sections** | 48px | 40px | 32px |
| **Touch targets** | 32px | 44px | 48px |

### Checklist Multi-Device

Avant de considerer un wireframe multi-device termine :

**Desktop**
- [ ] Sidebar fixe 280px avec liste playspaces
- [ ] Header 64px avec navigation horizontale complete
- [ ] Grilles 12 colonnes responsive
- [ ] Navigation selon arborescence-navigation.md
- [ ] Touch targets 32px minimum
- [ ] Breadcrumbs complets

**Tablet**
- [ ] Sidebar collapsible avec toggle hamburger
- [ ] Header 64px identique desktop
- [ ] Grilles 8 colonnes maximum
- [ ] Touch targets 44px minimum
- [ ] Gestures swipe supportes
- [ ] Modales adaptatives (90% largeur)

**Mobile**
- [ ] Drawer hamburger pour playspaces
- [ ] Bottom navigation 64px (4 icones max)
- [ ] Header simplifie 56px
- [ ] Stack vertical complet
- [ ] Touch targets 48px minimum (WCAG AAA)
- [ ] FAB pour action principale
- [ ] Tabs swipables
- [ ] Modales plein ecran

### Exemple Complet : Dashboard Multi-Device

#### Desktop (desktop/dashboard.html)

```html
<div class="flex">
    <!-- Sidebar fixe 280px -->
    <aside class="w-70 bg-navy-800 border-r border-navy-600">
        <div class="p-4">
            <h3 class="text-xs font-bold text-gray-500 uppercase mb-3">Playspaces</h3>
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg mb-3">
                Workspace Aria
            </div>
        </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-6">
        <div class="grid grid-cols-3 gap-4">
            <!-- Personnages cards 3 colonnes -->
        </div>
    </main>
</div>
```

#### Tablet (tablet/dashboard.html)

```html
<div class="flex">
    <!-- Sidebar collapsible 280px -->
    <aside class="w-70 bg-navy-800 border-r border-navy-600 sidebar-collapsible">
        <button class="hamburger-toggle">☰</button>
        <div class="p-4">
            <h3 class="text-xs font-bold text-gray-500 uppercase mb-3">Playspaces</h3>
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg mb-3">
                Workspace Aria
            </div>
        </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-5">
        <div class="grid grid-cols-2 gap-4">
            <!-- Personnages cards 2 colonnes -->
        </div>
    </main>
</div>
```

#### Mobile (mobile/dashboard.html)

```html
<div class="flex flex-col min-h-screen">
    <!-- Header simplifie 56px -->
    <header class="h-14 bg-navy-800 border-b border-navy-600 flex items-center justify-between px-4">
        <button class="w-12 h-12">☰</button>
        <div class="font-bold text-white">Workspace Aria</div>
        <div class="w-10 h-10 rounded-full bg-blue-500"></div>
    </header>

    <!-- Main content stack vertical -->
    <main class="flex-1 p-4">
        <div class="flex flex-col gap-4">
            <!-- Personnages cards stack vertical -->
        </div>
    </main>

    <!-- FAB -->
    <button class="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 rounded-full shadow-lg">+</button>

    <!-- Bottom navigation 64px -->
    <nav class="h-16 bg-navy-800 border-t border-navy-600 flex justify-around items-center">
        <div class="flex flex-col items-center text-blue-400">
            <div class="w-6 h-6 mb-1"></div>
            <span class="text-xs">Personnages</span>
        </div>
        <div class="flex flex-col items-center text-gray-400">
            <div class="w-6 h-6 mb-1"></div>
            <span class="text-xs">Playspaces</span>
        </div>
        <div class="flex flex-col items-center text-gray-400">
            <div class="w-6 h-6 mb-1"></div>
            <span class="text-xs">Actions</span>
        </div>
        <div class="flex flex-col items-center text-gray-400">
            <div class="w-6 h-6 mb-1"></div>
            <span class="text-xs">Profil</span>
        </div>
    </nav>
</div>
```

### Outils pour Tester Multi-Device

**Chrome DevTools**
- Toggle Device Toolbar (Ctrl + Shift + M)
- Presets : Desktop (1280px), Tablet (768px), Mobile (375px)
- Test responsive en temps reel

**Firefox Responsive Design Mode**
- Ctrl + Shift + M
- Presets similaires Chrome
- Test touch events

**BrowserStack / LambdaTest**
- Test sur devices reels
- iOS Safari, Android Chrome
- Screenshots automatises

**Principes de Test Multi-Device**
1. Tester desktop en premier (structure complete)
2. Tester tablet (sidebar collapsible fonctionne ?)
3. Tester mobile (bottom nav + drawer fonctionnels ?)
4. Verifier touch targets (48px mobile, 44px tablet, 32px desktop)
5. Valider navigation complete sur tous devices

---

## Philosophie du Wireframing

### Objectifs des Wireframes

Les wireframes Brumisa3 doivent :

1. **Communiquer la structure** sans distraire avec le design visuel
2. **Valider l'architecture** de l'information rapidement
3. **Tester les parcours utilisateur** avant le developpement
4. **Etre interactifs** pour simuler la navigation (prototype cliquable)
5. **Rester simples** : grayscale, typographie basique, pas d'images

### Niveaux de Fidelite

#### Low-Fidelity (Phase 1 - Exploration)
- Boxes et placeholders
- Pas de texte reel, lorem ipsum
- Focus sur layout et hierarchie
- Noir et blanc uniquement

#### Mid-Fidelity (Phase 2 - Validation)
- Contenu reel ou representatif
- Navigation fonctionnelle (liens)
- Interactions basiques (hover, active)
- Grayscale avec 1-2 couleurs d'accent

#### High-Fidelity (Phase 3 - Specification)
- Contenu definitif
- Toutes interactions definies
- Annotations et specifications
- Pret pour handoff developpeurs

**Pour Brumisa3 MVP, nous visons Mid-to-High Fidelity.**

---

## Structure HTML de Base

### Template Minimal Wireframe

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wireframe - [Nom de la page]</title>
    <style>
        /* === RESET === */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        /* === VARIABLES WIREFRAME === */
        :root {
            --wireframe-bg: #ffffff;
            --wireframe-border: #cccccc;
            --wireframe-text: #333333;
            --wireframe-placeholder: #999999;
            --wireframe-active: #0066cc;
            --wireframe-warning: #ff6600;
            --wireframe-spacing: 8px;
        }

        /* === BASE === */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: var(--wireframe-text);
            background: var(--wireframe-bg);
        }

        /* === LAYOUT === */
        .wireframe {
            max-width: 1440px;
            margin: 0 auto;
            padding: var(--wireframe-spacing);
        }

        /* === GRID === */
        .grid {
            display: grid;
            gap: calc(var(--wireframe-spacing) * 2);
        }

        /* === PLACEHOLDERS === */
        .placeholder {
            background: repeating-linear-gradient(
                45deg,
                #f0f0f0,
                #f0f0f0 10px,
                #e0e0e0 10px,
                #e0e0e0 20px
            );
            border: 1px dashed var(--wireframe-border);
            padding: calc(var(--wireframe-spacing) * 2);
            text-align: center;
            color: var(--wireframe-placeholder);
        }

        /* === ANNOTATIONS === */
        .annotation {
            position: relative;
            border: 2px solid var(--wireframe-active);
            padding: calc(var(--wireframe-spacing) * 2);
        }

        .annotation::before {
            content: attr(data-note);
            position: absolute;
            top: -12px;
            left: 8px;
            background: var(--wireframe-active);
            color: white;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="wireframe">
        <!-- Contenu du wireframe ici -->
    </div>
</body>
</html>
```

### Systeme de Classes Utilitaires

```css
/* === SPACING === */
.p-1 { padding: calc(var(--wireframe-spacing) * 1); }
.p-2 { padding: calc(var(--wireframe-spacing) * 2); }
.p-3 { padding: calc(var(--wireframe-spacing) * 3); }
.p-4 { padding: calc(var(--wireframe-spacing) * 4); }

.m-1 { margin: calc(var(--wireframe-spacing) * 1); }
.m-2 { margin: calc(var(--wireframe-spacing) * 2); }
.m-3 { margin: calc(var(--wireframe-spacing) * 3); }
.m-4 { margin: calc(var(--wireframe-spacing) * 4); }

/* === BORDERS === */
.border { border: 1px solid var(--wireframe-border); }
.border-2 { border: 2px solid var(--wireframe-border); }
.border-dashed { border-style: dashed; }

/* === DISPLAY === */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }

/* === TEXT === */
.text-center { text-align: center; }
.text-sm { font-size: 14px; }
.text-lg { font-size: 18px; }
.text-xl { font-size: 24px; }
.font-bold { font-weight: bold; }

/* === COLORS === */
.bg-gray { background: #f5f5f5; }
.bg-light { background: #fafafa; }
.text-muted { color: var(--wireframe-placeholder); }
```

---

## Systeme de Grilles

### Grille Desktop Standard

```html
<!-- Grille 12 colonnes -->
<style>
.grid-12 {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 16px;
}

.col-span-1 { grid-column: span 1; }
.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }
.col-span-4 { grid-column: span 4; }
.col-span-6 { grid-column: span 6; }
.col-span-8 { grid-column: span 8; }
.col-span-9 { grid-column: span 9; }
.col-span-12 { grid-column: span 12; }
</style>

<div class="grid-12">
    <div class="col-span-3 border p-2">Sidebar (3/12)</div>
    <div class="col-span-9 border p-2">Main Content (9/12)</div>
</div>
```

### Grille Responsive

```html
<style>
.grid-responsive {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
}

/* Tablette */
@media (min-width: 768px) {
    .grid-responsive {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .grid-responsive {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>

<div class="grid-responsive">
    <div class="border p-2">Item 1</div>
    <div class="border p-2">Item 2</div>
    <div class="border p-2">Item 3</div>
</div>
```

### Layout Application Standard

```html
<style>
.app-layout {
    display: grid;
    grid-template-areas:
        "header header"
        "sidebar main"
        "footer footer";
    grid-template-columns: 280px 1fr;
    grid-template-rows: 64px 1fr 48px;
    min-height: 100vh;
}

.app-header { grid-area: header; }
.app-sidebar { grid-area: sidebar; }
.app-main { grid-area: main; }
.app-footer { grid-area: footer; }

/* Mobile : stack vertical */
@media (max-width: 768px) {
    .app-layout {
        grid-template-areas:
            "header"
            "main"
            "footer";
        grid-template-columns: 1fr;
        grid-template-rows: 64px 1fr 64px;
    }

    .app-sidebar {
        display: none; /* Drawer hamburger a la place */
    }
}
</style>

<div class="app-layout">
    <header class="app-header border">Header</header>
    <aside class="app-sidebar border">Sidebar</aside>
    <main class="app-main border">Main Content</main>
    <footer class="app-footer border">Footer</footer>
</div>
```

---

## Bibliotheque de Composants Wireframe

### Header / Navigation

```html
<style>
.wf-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 2px solid var(--wireframe-border);
    background: #fafafa;
}

.wf-logo {
    width: 120px;
    height: 40px;
    background: var(--wireframe-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.wf-nav {
    display: flex;
    gap: 24px;
}

.wf-nav-item {
    padding: 8px 16px;
    border: 1px solid var(--wireframe-border);
    cursor: pointer;
    text-decoration: none;
    color: var(--wireframe-text);
}

.wf-nav-item:hover {
    background: #f0f0f0;
}

.wf-nav-item.active {
    background: var(--wireframe-active);
    color: white;
    border-color: var(--wireframe-active);
}
</style>

<header class="wf-header">
    <div class="wf-logo">LOGO</div>
    <nav class="wf-nav">
        <a href="#" class="wf-nav-item active">Personnages</a>
        <a href="#" class="wf-nav-item">Playspaces</a>
        <a href="#" class="wf-nav-item">Support</a>
    </nav>
    <div class="wf-user">
        <div class="placeholder" style="width: 40px; height: 40px; border-radius: 50%;">Avatar</div>
    </div>
</header>
```

### Sidebar

```html
<style>
.wf-sidebar {
    width: 280px;
    border-right: 1px solid var(--wireframe-border);
    padding: 16px;
    background: #fafafa;
}

.wf-sidebar-section {
    margin-bottom: 24px;
}

.wf-sidebar-title {
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    color: var(--wireframe-placeholder);
    margin-bottom: 8px;
}

.wf-sidebar-item {
    padding: 12px;
    margin-bottom: 4px;
    border: 1px solid transparent;
    cursor: pointer;
}

.wf-sidebar-item:hover {
    background: #f0f0f0;
    border-color: var(--wireframe-border);
}

.wf-sidebar-item.active {
    background: var(--wireframe-active);
    color: white;
    font-weight: bold;
}

.wf-sidebar-add {
    padding: 12px;
    border: 2px dashed var(--wireframe-border);
    text-align: center;
    cursor: pointer;
    color: var(--wireframe-placeholder);
}

.wf-sidebar-add:hover {
    border-color: var(--wireframe-active);
    color: var(--wireframe-active);
}
</style>

<aside class="wf-sidebar">
    <div class="wf-sidebar-section">
        <div class="wf-sidebar-title">Playspaces</div>
        <div class="wf-sidebar-item active">
            Workspace Aria
            <div class="text-sm text-muted">3 personnages</div>
        </div>
        <div class="wf-sidebar-item">
            Campagne Marc
            <div class="text-sm text-muted">1 personnage</div>
        </div>
        <div class="wf-sidebar-add">+ Nouveau Playspace</div>
    </div>
</aside>
```

### Boutons

```html
<style>
.wf-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border: 2px solid var(--wireframe-border);
    background: white;
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;
    color: var(--wireframe-text);
}

.wf-button:hover {
    background: #f0f0f0;
}

.wf-button-primary {
    background: var(--wireframe-active);
    border-color: var(--wireframe-active);
    color: white;
}

.wf-button-primary:hover {
    background: #0052a3;
    border-color: #0052a3;
}

.wf-button-secondary {
    background: transparent;
}

.wf-button-danger {
    background: var(--wireframe-warning);
    border-color: var(--wireframe-warning);
    color: white;
}

.wf-button-sm {
    padding: 8px 16px;
    font-size: 14px;
}

.wf-button-lg {
    padding: 16px 32px;
    font-size: 18px;
}
</style>

<button class="wf-button">Button Default</button>
<button class="wf-button wf-button-primary">Button Primary</button>
<button class="wf-button wf-button-secondary">Button Secondary</button>
<button class="wf-button wf-button-danger">Button Danger</button>
```

### Cards

```html
<style>
.wf-card {
    border: 1px solid var(--wireframe-border);
    background: white;
    padding: 16px;
}

.wf-card-header {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--wireframe-border);
}

.wf-card-body {
    margin-bottom: 12px;
}

.wf-card-footer {
    padding-top: 12px;
    border-top: 1px solid var(--wireframe-border);
    display: flex;
    gap: 8px;
}
</style>

<div class="wf-card">
    <div class="wf-card-header">Aria the Mist Weaver</div>
    <div class="wf-card-body">
        <div class="placeholder" style="height: 100px;">Image / Avatar</div>
        <p class="text-sm text-muted">Lost in the Mist - Niveau 3</p>
    </div>
    <div class="wf-card-footer">
        <button class="wf-button wf-button-sm wf-button-primary">Modifier</button>
        <button class="wf-button wf-button-sm">Dupliquer</button>
        <button class="wf-button wf-button-sm">Exporter</button>
    </div>
</div>
```

### Formulaires

```html
<style>
.wf-form-group {
    margin-bottom: 16px;
}

.wf-label {
    display: block;
    font-weight: 500;
    margin-bottom: 8px;
}

.wf-input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--wireframe-border);
    font-size: 16px;
}

.wf-input:focus {
    outline: none;
    border-color: var(--wireframe-active);
}

.wf-textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--wireframe-border);
    font-size: 16px;
    min-height: 100px;
    resize: vertical;
}

.wf-select {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--wireframe-border);
    font-size: 16px;
}
</style>

<form>
    <div class="wf-form-group">
        <label class="wf-label">Nom du personnage</label>
        <input type="text" class="wf-input" placeholder="Entrez le nom...">
    </div>

    <div class="wf-form-group">
        <label class="wf-label">Description</label>
        <textarea class="wf-textarea" placeholder="Description du personnage..."></textarea>
    </div>

    <div class="wf-form-group">
        <label class="wf-label">Systeme JDR</label>
        <select class="wf-select">
            <option>Lost in the Mist</option>
            <option>Otherscape</option>
        </select>
    </div>

    <button type="submit" class="wf-button wf-button-primary">Creer Personnage</button>
</form>
```

### Modales

```html
<style>
.wf-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.wf-modal {
    background: white;
    border: 2px solid var(--wireframe-border);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.wf-modal-header {
    padding: 16px 24px;
    border-bottom: 1px solid var(--wireframe-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    font-size: 18px;
}

.wf-modal-body {
    padding: 24px;
}

.wf-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--wireframe-border);
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.wf-modal-close {
    cursor: pointer;
    font-size: 24px;
    color: var(--wireframe-placeholder);
}

.wf-modal-close:hover {
    color: var(--wireframe-text);
}
</style>

<div class="wf-modal-overlay">
    <div class="wf-modal">
        <div class="wf-modal-header">
            Supprimer le Playspace ?
            <span class="wf-modal-close">&times;</span>
        </div>
        <div class="wf-modal-body">
            <p>Cette action supprimera definitivement :</p>
            <ul>
                <li>Le playspace "Workspace Aria"</li>
                <li>3 personnages associes</li>
                <li>Toutes les donnees liees</li>
            </ul>
            <p><strong>Cette action est irreversible.</strong></p>
        </div>
        <div class="wf-modal-footer">
            <button class="wf-button">Annuler</button>
            <button class="wf-button wf-button-danger">Supprimer</button>
        </div>
    </div>
</div>
```

### Breadcrumbs

```html
<style>
.wf-breadcrumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 0;
    font-size: 14px;
    color: var(--wireframe-placeholder);
}

.wf-breadcrumb-item {
    text-decoration: none;
    color: var(--wireframe-text);
}

.wf-breadcrumb-item:hover {
    text-decoration: underline;
}

.wf-breadcrumb-separator {
    color: var(--wireframe-border);
}

.wf-breadcrumb-current {
    font-weight: bold;
    color: var(--wireframe-text);
}
</style>

<nav class="wf-breadcrumbs">
    <a href="#" class="wf-breadcrumb-item">Playspaces</a>
    <span class="wf-breadcrumb-separator">/</span>
    <a href="#" class="wf-breadcrumb-item">Workspace Aria</a>
    <span class="wf-breadcrumb-separator">/</span>
    <span class="wf-breadcrumb-current">Personnages</span>
</nav>
```

### Tabs

```html
<style>
.wf-tabs {
    border-bottom: 2px solid var(--wireframe-border);
    display: flex;
    gap: 0;
}

.wf-tab {
    padding: 12px 24px;
    border: 2px solid transparent;
    border-bottom: none;
    cursor: pointer;
    background: transparent;
    color: var(--wireframe-placeholder);
}

.wf-tab:hover {
    background: #f5f5f5;
}

.wf-tab.active {
    color: var(--wireframe-active);
    border-color: var(--wireframe-border);
    border-bottom-color: white;
    font-weight: bold;
    position: relative;
    bottom: -2px;
}

.wf-tab-content {
    padding: 24px 0;
}
</style>

<div class="wf-tabs">
    <button class="wf-tab active">Informations</button>
    <button class="wf-tab">Theme Cards</button>
    <button class="wf-tab">Hero Card</button>
    <button class="wf-tab">Trackers</button>
</div>

<div class="wf-tab-content">
    <p>Contenu de l'onglet actif...</p>
</div>
```

---

## Templates Desktop

### Template 1 : Landing Page

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wireframe - Landing Page</title>
    <!-- Inclure les styles de base ici -->
</head>
<body>
    <!-- Header -->
    <header class="wf-header">
        <div class="wf-logo">BRUMISATER</div>
        <nav class="wf-nav">
            <a href="#" class="wf-nav-item">Fonctionnalites</a>
            <a href="#" class="wf-nav-item">A Propos</a>
            <a href="#" class="wf-nav-item">Support</a>
        </nav>
        <div class="flex gap-2">
            <button class="wf-button">Se connecter</button>
            <button class="wf-button wf-button-primary">Creer un compte</button>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="annotation" data-note="Hero - 100vh" style="padding: 80px 24px; text-align: center; background: #fafafa;">
        <h1 class="text-xl font-bold" style="margin-bottom: 16px;">L'outil du Mist Engine</h1>
        <p class="text-lg" style="margin-bottom: 32px; color: #666;">
            Creez et gerez vos personnages Lost in the Mist avec facilite
        </p>
        <div class="flex items-center justify-center gap-4">
            <button class="wf-button wf-button-primary wf-button-lg">Commencer sans compte</button>
            <button class="wf-button wf-button-lg">En savoir plus</button>
        </div>
        <div class="placeholder" style="margin-top: 48px; height: 400px;">
            Illustration Hero / Screenshot App
        </div>
    </section>

    <!-- Features Section -->
    <section class="annotation" data-note="Features Grid" style="padding: 80px 24px;">
        <h2 class="text-xl font-bold text-center" style="margin-bottom: 48px;">Fonctionnalites</h2>
        <div class="grid-responsive">
            <div class="wf-card">
                <div class="placeholder" style="height: 60px; width: 60px; margin-bottom: 16px;">Icon</div>
                <h3 class="font-bold" style="margin-bottom: 8px;">Playspaces</h3>
                <p class="text-sm">Organisez vos univers de jeu separement</p>
            </div>
            <div class="wf-card">
                <div class="placeholder" style="height: 60px; width: 60px; margin-bottom: 16px;">Icon</div>
                <h3 class="font-bold" style="margin-bottom: 8px;">Personnages</h3>
                <p class="text-sm">Theme Cards, Hero Card, Trackers complets (Mist Engine)</p>
            </div>
            <div class="wf-card">
                <div class="placeholder" style="height: 60px; width: 60px; margin-bottom: 16px;">Icon</div>
                <h3 class="font-bold" style="margin-bottom: 8px;">Export JSON</h3>
                <p class="text-sm">Partagez vos personnages facilement</p>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section style="padding: 80px 24px; text-align: center; background: #fafafa;">
        <h2 class="text-xl font-bold" style="margin-bottom: 16px;">Pret a commencer ?</h2>
        <p style="margin-bottom: 32px;">Creez votre premier personnage en moins de 5 minutes</p>
        <button class="wf-button wf-button-primary wf-button-lg">Commencer maintenant</button>
    </section>

    <!-- Footer -->
    <footer style="padding: 24px; border-top: 1px solid #ccc; text-align: center; background: #f5f5f5;">
        <nav class="flex justify-center gap-4" style="margin-bottom: 16px;">
            <a href="#">Support</a>
            <a href="#">A Propos</a>
            <a href="#">Legal</a>
            <a href="#">Sponsors</a>
        </nav>
        <p class="text-sm text-muted">2025 Brumisa3 - Tous droits reserves</p>
    </footer>
</body>
</html>
```

### Template 2 : Dashboard Playspaces (Authentifie)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wireframe - Dashboard Playspaces</title>
    <!-- Inclure les styles de base ici -->
</head>
<body>
    <div class="app-layout">
        <!-- Header -->
        <header class="app-header wf-header">
            <div class="wf-logo">BRUMISATER</div>
            <nav class="wf-nav">
                <a href="#" class="wf-nav-item active">Mes Personnages</a>
                <a href="#" class="wf-nav-item">Mes Playspaces</a>
                <a href="#" class="wf-nav-item">Support</a>
            </nav>
            <div class="flex items-center gap-2">
                <div class="placeholder" style="width: 40px; height: 40px; border-radius: 50%;">Avatar</div>
            </div>
        </header>

        <!-- Sidebar -->
        <aside class="app-sidebar wf-sidebar">
            <div class="wf-sidebar-section">
                <div class="wf-sidebar-title">Playspaces</div>
                <div class="wf-sidebar-item active">
                    Workspace Aria
                    <div class="text-sm text-muted">3 personnages</div>
                </div>
                <div class="wf-sidebar-item">
                    Campagne Marc
                    <div class="text-sm text-muted">1 personnage</div>
                </div>
                <div class="wf-sidebar-item">
                    Test Otherscape
                    <div class="text-sm text-muted">0 personnage</div>
                </div>
                <div class="wf-sidebar-add">+ Nouveau Playspace</div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="app-main" style="padding: 24px;">
            <!-- Breadcrumbs -->
            <nav class="wf-breadcrumbs">
                <a href="#" class="wf-breadcrumb-item">Playspaces</a>
                <span class="wf-breadcrumb-separator">/</span>
                <span class="wf-breadcrumb-current">Workspace Aria</span>
            </nav>

            <!-- Page Header -->
            <div class="annotation" data-note="Page Header" style="margin-bottom: 24px;">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-xl font-bold">Workspace Aria</h1>
                        <p class="text-sm text-muted">Lost in the Mist - Chicago Noir</p>
                    </div>
                    <div class="flex gap-2">
                        <button class="wf-button wf-button-sm">Modifier</button>
                        <button class="wf-button wf-button-sm">Dupliquer</button>
                        <button class="wf-button wf-button-sm">Exporter tous</button>
                    </div>
                </div>
            </div>

            <!-- Stats -->
            <div class="annotation" data-note="Stats Grid" style="margin-bottom: 24px;">
                <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                    <div class="wf-card text-center">
                        <div class="text-xl font-bold">3</div>
                        <div class="text-sm text-muted">Personnages</div>
                    </div>
                    <div class="wf-card text-center">
                        <div class="text-xl font-bold">12</div>
                        <div class="text-sm text-muted">Theme Cards</div>
                    </div>
                    <div class="wf-card text-center">
                        <div class="text-xl font-bold">2 jours</div>
                        <div class="text-sm text-muted">Derniere modif</div>
                    </div>
                </div>
            </div>

            <!-- Personnages Grid -->
            <div class="annotation" data-note="Personnages Grid">
                <div class="flex justify-between items-center" style="margin-bottom: 16px;">
                    <h2 class="text-lg font-bold">Personnages</h2>
                    <button class="wf-button wf-button-primary">+ Nouveau Personnage</button>
                </div>

                <div class="grid-responsive">
                    <!-- Personnage 1 -->
                    <div class="wf-card">
                        <div class="placeholder" style="height: 200px; margin-bottom: 12px;">Avatar / Image</div>
                        <h3 class="font-bold">Aria the Mist Weaver</h3>
                        <p class="text-sm text-muted">Niveau 3 - Modifie il y a 2 jours</p>
                        <div class="wf-card-footer" style="margin-top: 16px;">
                            <button class="wf-button wf-button-sm wf-button-primary">Modifier</button>
                            <button class="wf-button wf-button-sm">Dupliquer</button>
                            <button class="wf-button wf-button-sm">Exporter</button>
                        </div>
                    </div>

                    <!-- Personnage 2 -->
                    <div class="wf-card">
                        <div class="placeholder" style="height: 200px; margin-bottom: 12px;">Avatar / Image</div>
                        <h3 class="font-bold">Raven Nightshade</h3>
                        <p class="text-sm text-muted">Niveau 2 - Modifie il y a 5 jours</p>
                        <div class="wf-card-footer" style="margin-top: 16px;">
                            <button class="wf-button wf-button-sm wf-button-primary">Modifier</button>
                            <button class="wf-button wf-button-sm">Dupliquer</button>
                            <button class="wf-button wf-button-sm">Exporter</button>
                        </div>
                    </div>

                    <!-- Personnage 3 -->
                    <div class="wf-card">
                        <div class="placeholder" style="height: 200px; margin-bottom: 12px;">Avatar / Image</div>
                        <h3 class="font-bold">Baron Vordak</h3>
                        <p class="text-sm text-muted">PNJ - Modifie il y a 1 semaine</p>
                        <div class="wf-card-footer" style="margin-top: 16px;">
                            <button class="wf-button wf-button-sm wf-button-primary">Modifier</button>
                            <button class="wf-button wf-button-sm">Dupliquer</button>
                            <button class="wf-button wf-button-sm">Exporter</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="app-footer" style="padding: 16px 24px; border-top: 1px solid #ccc; background: #f5f5f5;">
            <div class="flex justify-between items-center text-sm">
                <div>2025 Brumisa3</div>
                <div class="flex gap-4">
                    <a href="#">Support</a>
                    <a href="#">Legal</a>
                    <a href="#">Sponsors</a>
                </div>
            </div>
        </footer>
    </div>
</body>
</html>
```

### Template 3 : Edition Personnage

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wireframe - Edition Personnage</title>
    <!-- Inclure les styles de base ici -->
</head>
<body>
    <div class="app-layout">
        <!-- Header (identique) -->
        <header class="app-header wf-header">
            <div class="wf-logo">BRUMISATER</div>
            <nav class="wf-nav">
                <a href="#" class="wf-nav-item active">Mes Personnages</a>
                <a href="#" class="wf-nav-item">Mes Playspaces</a>
                <a href="#" class="wf-nav-item">Support</a>
            </nav>
            <div class="flex items-center gap-2">
                <div class="placeholder" style="width: 40px; height: 40px; border-radius: 50%;">Avatar</div>
            </div>
        </header>

        <!-- Sidebar (identique) -->
        <aside class="app-sidebar wf-sidebar">
            <!-- ... contenu sidebar ... -->
        </aside>

        <!-- Main Content -->
        <main class="app-main" style="padding: 24px;">
            <!-- Breadcrumbs -->
            <nav class="wf-breadcrumbs">
                <a href="#" class="wf-breadcrumb-item">Playspaces</a>
                <span class="wf-breadcrumb-separator">/</span>
                <a href="#" class="wf-breadcrumb-item">Workspace Aria</a>
                <span class="wf-breadcrumb-separator">/</span>
                <a href="#" class="wf-breadcrumb-item">Personnages</a>
                <span class="wf-breadcrumb-separator">/</span>
                <span class="wf-breadcrumb-current">Aria the Mist Weaver</span>
            </nav>

            <!-- Page Header avec Actions -->
            <div class="annotation" data-note="Character Header" style="margin-bottom: 24px;">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-4">
                        <div class="placeholder" style="width: 80px; height: 80px; border-radius: 50%;">Avatar</div>
                        <div>
                            <h1 class="text-xl font-bold">Aria the Mist Weaver</h1>
                            <p class="text-sm text-muted">Niveau 3 - Lost in the Mist</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="wf-button wf-button-primary">Sauvegarder</button>
                        <button class="wf-button">Annuler</button>
                    </div>
                </div>
            </div>

            <!-- Tabs Navigation -->
            <div class="wf-tabs">
                <button class="wf-tab active">Informations</button>
                <button class="wf-tab">Theme Cards</button>
                <button class="wf-tab">Hero Card</button>
                <button class="wf-tab">Trackers</button>
            </div>

            <!-- Tab Content: Theme Cards -->
            <div class="wf-tab-content annotation" data-note="Theme Cards Section">
                <div class="flex justify-between items-center" style="margin-bottom: 16px;">
                    <h2 class="text-lg font-bold">Theme Cards (3/4)</h2>
                    <button class="wf-button wf-button-primary wf-button-sm">+ Ajouter Theme Card</button>
                </div>

                <!-- Theme Card 1 -->
                <div class="wf-card" style="margin-bottom: 16px;">
                    <div class="wf-card-header">
                        Shadow Dancer (Mythos)
                    </div>
                    <div class="wf-card-body">
                        <div style="margin-bottom: 16px;">
                            <strong>Power Tags (4/5)</strong>
                            <div class="flex gap-2" style="margin-top: 8px;">
                                <span class="border p-1 text-sm">Teleport through shadows</span>
                                <span class="border p-1 text-sm">Night vision</span>
                                <span class="border p-1 text-sm">Shadow manipulation</span>
                                <span class="border p-1 text-sm">Stealth master</span>
                            </div>
                        </div>
                        <div>
                            <strong>Weakness Tags (1/2)</strong>
                            <div class="flex gap-2" style="margin-top: 8px;">
                                <span class="border p-1 text-sm" style="border-color: var(--wireframe-warning);">Vulnerable to light</span>
                            </div>
                        </div>
                    </div>
                    <div class="wf-card-footer">
                        <button class="wf-button wf-button-sm">Modifier</button>
                        <button class="wf-button wf-button-sm wf-button-danger">Supprimer</button>
                    </div>
                </div>

                <!-- Theme Card 2 -->
                <div class="wf-card" style="margin-bottom: 16px;">
                    <div class="wf-card-header">
                        Street Detective (Logos)
                    </div>
                    <div class="wf-card-body">
                        <div style="margin-bottom: 16px;">
                            <strong>Power Tags (3/5)</strong>
                            <div class="flex gap-2" style="margin-top: 8px;">
                                <span class="border p-1 text-sm">Investigation expert</span>
                                <span class="border p-1 text-sm">Chicago underworld contacts</span>
                                <span class="border p-1 text-sm">Analytical mind</span>
                            </div>
                        </div>
                        <div>
                            <strong>Weakness Tags (2/2)</strong>
                            <div class="flex gap-2" style="margin-top: 8px;">
                                <span class="border p-1 text-sm" style="border-color: var(--wireframe-warning);">Obsessive</span>
                                <span class="border p-1 text-sm" style="border-color: var(--wireframe-warning);">Distrusts authority</span>
                            </div>
                        </div>
                    </div>
                    <div class="wf-card-footer">
                        <button class="wf-button wf-button-sm">Modifier</button>
                        <button class="wf-button wf-button-sm wf-button-danger">Supprimer</button>
                    </div>
                </div>

                <!-- Placeholder Theme Card 3 -->
                <div class="wf-card" style="margin-bottom: 16px; border-style: dashed;">
                    <div class="placeholder" style="padding: 48px;">
                        Theme Card 3 - Non remplie
                    </div>
                </div>
            </div>
        </main>

        <!-- Footer (identique) -->
        <footer class="app-footer" style="padding: 16px 24px; border-top: 1px solid #ccc; background: #f5f5f5;">
            <div class="flex justify-between items-center text-sm">
                <div>2025 Brumisa3</div>
                <div class="flex gap-4">
                    <a href="#">Support</a>
                    <a href="#">Legal</a>
                    <a href="#">Sponsors</a>
                </div>
            </div>
        </footer>
    </div>
</body>
</html>
```

---

## Templates Mobile

### Template Mobile : Navigation Bottom

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wireframe Mobile - Dashboard</title>
    <style>
        /* === MOBILE LAYOUT === */
        .mobile-layout {
            display: grid;
            grid-template-rows: 64px 1fr 64px;
            min-height: 100vh;
        }

        .mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            border-bottom: 1px solid var(--wireframe-border);
            background: #fafafa;
        }

        .mobile-main {
            padding: 16px;
            overflow-y: auto;
        }

        .mobile-bottom-nav {
            display: flex;
            justify-content: space-around;
            align-items: center;
            border-top: 1px solid var(--wireframe-border);
            background: #fafafa;
        }

        .mobile-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px;
            cursor: pointer;
            color: var(--wireframe-placeholder);
        }

        .mobile-nav-item.active {
            color: var(--wireframe-active);
            font-weight: bold;
        }

        .mobile-nav-icon {
            width: 24px;
            height: 24px;
            background: currentColor;
            margin-bottom: 4px;
        }

        /* === MOBILE COMPONENTS === */
        .mobile-card {
            border: 1px solid var(--wireframe-border);
            padding: 16px;
            margin-bottom: 16px;
            background: white;
        }

        .mobile-fab {
            position: fixed;
            bottom: 80px;
            right: 16px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: var(--wireframe-active);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="mobile-layout">
        <!-- Header Mobile -->
        <header class="mobile-header">
            <div class="placeholder" style="width: 32px; height: 32px;">☰</div>
            <div class="font-bold">BRUMISATER</div>
            <div class="placeholder" style="width: 32px; height: 32px; border-radius: 50%;">👤</div>
        </header>

        <!-- Main Content -->
        <main class="mobile-main">
            <!-- Playspace Header -->
            <div class="mobile-card">
                <h1 class="font-bold">Workspace Aria</h1>
                <p class="text-sm text-muted">Lost in the Mist - Chicago Noir</p>
            </div>

            <!-- Personnages List -->
            <h2 class="font-bold" style="margin-bottom: 12px;">Personnages (3)</h2>

            <!-- Personnage 1 -->
            <div class="mobile-card">
                <div class="flex items-center gap-3">
                    <div class="placeholder" style="width: 60px; height: 60px; border-radius: 50%;">Avatar</div>
                    <div style="flex: 1;">
                        <h3 class="font-bold">Aria the Mist Weaver</h3>
                        <p class="text-sm text-muted">Niveau 3</p>
                    </div>
                </div>
                <div class="flex gap-2" style="margin-top: 12px;">
                    <button class="wf-button wf-button-sm wf-button-primary" style="flex: 1;">Modifier</button>
                    <button class="wf-button wf-button-sm" style="flex: 1;">Exporter</button>
                </div>
            </div>

            <!-- Personnage 2 -->
            <div class="mobile-card">
                <div class="flex items-center gap-3">
                    <div class="placeholder" style="width: 60px; height: 60px; border-radius: 50%;">Avatar</div>
                    <div style="flex: 1;">
                        <h3 class="font-bold">Raven Nightshade</h3>
                        <p class="text-sm text-muted">Niveau 2</p>
                    </div>
                </div>
                <div class="flex gap-2" style="margin-top: 12px;">
                    <button class="wf-button wf-button-sm wf-button-primary" style="flex: 1;">Modifier</button>
                    <button class="wf-button wf-button-sm" style="flex: 1;">Exporter</button>
                </div>
            </div>

            <!-- Personnage 3 -->
            <div class="mobile-card">
                <div class="flex items-center gap-3">
                    <div class="placeholder" style="width: 60px; height: 60px; border-radius: 50%;">Avatar</div>
                    <div style="flex: 1;">
                        <h3 class="font-bold">Baron Vordak</h3>
                        <p class="text-sm text-muted">PNJ</p>
                    </div>
                </div>
                <div class="flex gap-2" style="margin-top: 12px;">
                    <button class="wf-button wf-button-sm wf-button-primary" style="flex: 1;">Modifier</button>
                    <button class="wf-button wf-button-sm" style="flex: 1;">Exporter</button>
                </div>
            </div>
        </main>

        <!-- FAB Button -->
        <div class="mobile-fab">+</div>

        <!-- Bottom Navigation -->
        <nav class="mobile-bottom-nav">
            <div class="mobile-nav-item active">
                <div class="mobile-nav-icon"></div>
                <span class="text-sm">Personnages</span>
            </div>
            <div class="mobile-nav-item">
                <div class="mobile-nav-icon"></div>
                <span class="text-sm">Playspaces</span>
            </div>
            <div class="mobile-nav-item">
                <div class="mobile-nav-icon"></div>
                <span class="text-sm">Actions</span>
            </div>
            <div class="mobile-nav-item">
                <div class="mobile-nav-icon"></div>
                <span class="text-sm">Profil</span>
            </div>
        </nav>
    </div>
</body>
</html>
```

---

## Guidelines de Creation

### 1. Principes Generaux

**Simplicite avant tout**
- Utiliser uniquement des rectangles, lignes et texte
- Pas de couleurs sauf annotations (bleu) et warnings (orange)
- Typographie basique (system fonts)

**Hierarchie visuelle**
- Tailles de texte : H1 (24px) > H2 (18px) > Body (16px) > Small (14px)
- Epaisseur de bordures : Primaire (2px) > Secondaire (1px) > Placeholder (dashed)
- Espacements : 8px, 16px, 24px, 32px, 48px

**Annotations obligatoires**
- Utiliser `data-note` pour specifier les zones importantes
- Annoter toutes les interactions (hover, click, swipe)
- Indiquer les dimensions critiques (sidebar 280px, header 64px)

### 2. Checklist de Validation

Avant de considerer un wireframe termine :

- [ ] Tous les textes sont lisibles (min 14px)
- [ ] Les zones cliquables font minimum 44px (mobile) ou 32px (desktop)
- [ ] La hierarchie visuelle est claire (3 niveaux max)
- [ ] Les annotations sont presentes sur les zones critiques
- [ ] La navigation fonctionne (liens entre pages)
- [ ] Les placeholders sont explicites ("Avatar", "Image", etc.)
- [ ] Le layout est responsive (test desktop + mobile)
- [ ] Les actions destructives sont identifiees (rouge/orange)
- [ ] Les etats interactifs sont definis (hover, active, disabled)
- [ ] Le breadcrumb montre la position dans l'arbo

### 3. Processus de Creation

**Etape 1 : Structure (30 min)**
1. Definir le layout principal (header, sidebar, main, footer)
2. Placer les zones de contenu (placeholders rectangulaires)
3. Ajouter la navigation principale

**Etape 2 : Contenu (45 min)**
4. Remplacer les placeholders par des composants (cards, forms, buttons)
5. Ajouter le texte reel ou representatif
6. Definir la hierarchie visuelle (titres, corps, secondaire)

**Etape 3 : Interactions (30 min)**
7. Creer les liens entre pages (navigation fonctionnelle)
8. Definir les etats interactifs (hover, active)
9. Ajouter les modales et overlays

**Etape 4 : Annotations (15 min)**
10. Annoter les zones critiques avec `data-note`
11. Specifier les dimensions importantes
12. Documenter les interactions complexes

**Total : ~2h par page complexe**

### 4. Conventions de Nommage

**Fichiers HTML**
```
wireframe-[section]-[page].html

Exemples:
- wireframe-public-landing.html
- wireframe-app-dashboard.html
- wireframe-character-edit.html
- wireframe-mobile-characters.html
```

**Classes CSS**
```
.wf-[composant]-[variante]

Exemples:
- .wf-button-primary
- .wf-card-header
- .wf-sidebar-item
- .wf-modal-overlay
```

---

## Outils et Workflow

### Outils Recommandes

**Pour Wireframes Statiques**
1. **Balsamiq** : Low-fi rapide, style sketch
2. **Figma** : Mid-to-High fi, collaboratif
3. **Sketch** : Mid-to-High fi, Mac only
4. **Adobe XD** : Mid-to-High fi, Adobe suite

**Pour Wireframes HTML (Brumisa3)**
1. **VS Code** + Live Server : Developpement rapide
2. **CodePen** : Prototypage en ligne
3. **Tailwind Play** : Rapid prototyping avec Tailwind

### Workflow de Validation

1. **Creation** : Designer cree le wireframe HTML
2. **Review interne** : Equipe valide la structure
3. **Test utilisateur** : 5 utilisateurs testent le prototype cliquable
4. **Iteration** : Ajustements bases sur feedbacks
5. **Handoff dev** : Wireframe annote + specs techniques

### Integration avec le Design System

Une fois le wireframe valide :

1. **Remplacer les classes wireframe** par les classes du design system
   ```html
   <!-- Wireframe -->
   <button class="wf-button wf-button-primary">Action</button>

   <!-- Design System -->
   <button class="btn btn-primary">Action</button>
   ```

2. **Appliquer les couleurs** du design system
   ```css
   /* Wireframe : grayscale */
   background: #f0f0f0;

   /* Design System : couleurs reelles */
   background: var(--brumisa-bleu);
   ```

3. **Ajouter les images et assets** reels
4. **Implementer les interactions** JavaScript
5. **Tester sur devices** reels

---

## Annexes

### Ressources

- **Arborescence navigation** : `arborescence-navigation.md`
- **Charte graphique web** : `charte-graphique-web.md`
- **Design system guide** : `design-system-guide.md`
- **UX mobile-first** : `ux-mobile-first.md`

### Templates Disponibles

1. Landing Page (Public)
2. Dashboard Playspaces (Authentifie)
3. Edition Personnage (Authentifie)
4. Mobile Dashboard (Responsive)

### Contacts

- Questions design : Voir documentation/DESIGN-SYSTEM/
- Questions UX : Voir documentation/FONCTIONNALITES/
- Questions techniques : Voir documentation/ARCHITECTURE/

---

**Ce guide garantit des wireframes coherents, fonctionnels et prets pour le developpement.**