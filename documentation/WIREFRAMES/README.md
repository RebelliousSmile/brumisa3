# Wireframes Brumisa3 - Design Dark Immersif

Date: 2025-01-19
Version: 2.0 (MVP - Multi-device)

**STATUT : EN DEVELOPPEMENT**
Ce projet est actuellement en cours de développement et n'est **aucunement utilisable en l'état**.
Pour tester l'application actuelle en production : [brumisa3.fr](https://brumisa3.fr)

---

## Vue d'ensemble

Ce repertoire contient les **wireframes multi-device** pour l'application Brumisa3 avec un design dark immersif qui colle parfaitement au theme "brume/mystere" du Mist Engine.

### Approche Multi-Device

Les wireframes sont organises par **device** pour optimiser l'experience sur chaque plateforme :

- **desktop/** : Version desktop (1280px+) avec sidebar fixe
- **tablet/** : Version tablette (768px-1024px) avec sidebar collapsible
- **mobile/** : Version mobile (< 768px) avec bottom nav + drawer

### Pages wireframees

Pour chaque device :
1. **landing.html** - Page d'accueil publique
2. **preparation-pj.html** - Page Preparation MODE JOUEUR (personnages uniquement)
3. **preparation-mj.html** - Page Preparation MODE MAITRE DU JEU (dangers uniquement)

---

## Design Dark Immersif - Caracteristiques

### Identite Visuelle

**Palette Dark**
- Fond navy fonce : #0f1419, #1a2332, #1e2a47
- Accents vibrants : Blue #4a90e2, Purple #8b5cf6, Pink #ec4899
- Textes : White #ffffff, Gray #9ca3af, Muted #6b7280

**Elements Signature**
- Gradients vibrants sur CTAs (blue-to-purple, purple-to-pink)
- Glows colores sur hover (shadow-blue-500/30, shadow-purple-500/30)
- Badges power/weakness avec gradients (vert/rouge)
- Cards dark avec borders subtiles et hover effects
- Illustrations avec effet glow blur-3xl

**Section "Choisissez votre univers"**
- Cards systemes colorees (PBTA violet, Mist Engine rose, Engrenages orange, MTZ rouge, Zombology jaune)
- Inspiration de la page actuelle en production
- Badges distinctifs par systeme

### Architecture

**Desktop (1280px+)**
- Sidebar fixe 280px avec liste playspaces (actions kebab menu)
- Header 64px avec auth et breadcrumbs
- Navigation horizontale principale (4 sections : Decouverte, Preparation, Jouer en solo, Table VTT)
- Grille 12 colonnes responsive

**Tablet (768px-1024px)**
- Sidebar collapsible 280px (toggle hamburger)
- Header 64px identique desktop
- Grille 8 colonnes responsive
- Touch targets 44x44px minimum

**Mobile (< 768px)**
- Pas de sidebar, drawer swipe/hamburger
- Bottom navigation 64px (4 icones)
- Header simplifie 56px
- Stack vertical, FAB pour actions principales
- Touch targets 48x48px minimum (WCAG AAA)

---

## Navigation Complete (Selon Arborescence)

### Pages Desktop Essentielles

```
documentation/WIREFRAMES/propositionC/desktop/
├── landing.html (Public - Page d'accueil)
├── preparation-pj.html (Authentifie - MODE JOUEUR : personnages uniquement)
├── preparation-mj.html (Authentifie - MODE MAITRE DU JEU : dangers uniquement)
├── profile.html (Profil utilisateur - a creer)
├── settings.html (Parametres - a creer)
└── support.html (Support & Dons - a creer)
```

### Pages Mobile Specifiques

```
documentation/WIREFRAMES/propositionC/mobile/
├── landing.html (Hero simplifie, CTAs empiles)
├── preparation-pj.html (MODE JOUEUR : bottom nav + drawer + personnages)
├── preparation-mj.html (MODE MJ : bottom nav + drawer + dangers - a creer)
└── (memes pages que desktop mais adaptees)
```

### Pages Tablet Hybrides

```
documentation/WIREFRAMES/propositionC/tablet/
├── (Compromis entre desktop et mobile)
├── Sidebar collapsible
├── Grilles adaptatives
└── Touch targets 44x44px
```

---

## Composants Cles

### Header Dark (Desktop)

```html
<header class="bg-navy-800 border-b border-navy-600 h-16">
    <div class="flex items-center justify-between px-6">
        <div class="flex items-center space-x-8">
            <div class="w-10 h-10 bg-blue-500 rounded-lg">Logo</div>
            <nav class="flex space-x-6">
                <a class="text-gray-400 hover:text-blue-400">Decouverte</a>
                <a class="text-blue-400 border-b-2 border-blue-500">Preparation</a>
                <a class="text-gray-500 hover:text-gray-400">Jouer en solo</a>
                <a class="text-gray-500 hover:text-gray-400">Table VTT</a>
            </nav>
        </div>
        <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full">Avatar + Dropdown</div>
        </div>
    </div>
</header>
```

**Note** : Items "Jouer en solo" et "Table VTT" sont grises en MVP v1.0 (disponibles v1.3+ et v2.0+)

### Sidebar Dark Playspaces

```html
<aside class="w-70 bg-navy-800 border-r border-navy-600">
    <div class="p-4">
        <!-- Bouton Nouveau Playspace en haut -->
        <button class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg text-sm font-medium mb-4">
            + Nouveau Playspace
        </button>

        <div class="text-xs font-bold text-gray-500 uppercase mb-3">Playspaces</div>

        <!-- Playspace actif avec badge role -->
        <div class="flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg mb-3 shadow-lg shadow-blue-500/30">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium">Workspace Aria</span>
                    <span class="bg-blue-500/30 px-2 py-0.5 rounded text-xs">[PJ]</span>
                </div>
                <div class="text-xs opacity-75">3 personnages</div>
            </div>
            <!-- Kebab menu pour actions -->
            <button class="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10">
                <svg class="w-5 h-5" fill="currentColor">
                    <circle cx="12" cy="6" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="12" cy="18" r="1.5"/>
                </svg>
            </button>
        </div>
        <!-- Autres playspaces -->
    </div>
</aside>
```

**Actions kebab menu (⋮)** : Modifier, Dupliquer, Exporter ZIP, Supprimer

### Cards Personnages Dark

```html
<div class="bg-navy-700 border border-navy-600 rounded-2xl p-6 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 transition-all">
    <h3 class="font-extrabold text-xl text-white">Aria the Mist Weaver</h3>
    <span class="bg-purple-900/50 border border-purple-500 text-purple-300 px-3 py-1 rounded-full text-xs font-bold">Niv. 3</span>
</div>
```

### Badges Power/Weakness Tags

```html
<!-- Power Tag - Gradient vert -->
<span class="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md border border-green-500/50">
    Teleport through shadows (30ft)
</span>

<!-- Weakness Tag - Gradient rouge -->
<span class="bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md border border-red-500/50">
    Vulnerable to bright light
</span>
```

### Bottom Navigation (Mobile)

```html
<nav class="fixed bottom-0 w-full h-16 bg-navy-800 border-t border-navy-600 flex justify-around items-center">
    <a class="flex flex-col items-center text-gray-400">
        <div class="w-6 h-6 mb-1">Icon Decouverte</div>
        <span class="text-xs">Decouverte</span>
    </a>
    <a class="flex flex-col items-center text-blue-400">
        <div class="w-6 h-6 mb-1">Icon Preparation</div>
        <span class="text-xs">Preparation</span>
    </a>
    <a class="flex flex-col items-center text-gray-500">
        <div class="w-6 h-6 mb-1">Icon Solo (grise)</div>
        <span class="text-xs">Solo</span>
    </a>
    <a class="flex flex-col items-center text-gray-500">
        <div class="w-6 h-6 mb-1">Icon VTT (grise)</div>
        <span class="text-xs">VTT</span>
    </a>
</nav>
```

**Note** : Items "Solo" et "VTT" sont grises en MVP v1.0 (tooltip "Disponible v1.3+" et "Disponible v2.0+"). Acces Profil/Settings via drawer hamburger.

---

## Metriques de Developpement

### Temps de Realisation Estime

| Page | Desktop | Mobile | Tablet | Total |
|------|---------|--------|--------|-------|
| **Landing** | 7h | 5h | 4h | 16h |
| **Preparation PJ** | 10h | 8h | 6h | 24h |
| **Preparation MJ** | 10h | 8h | 6h | 24h |
| **TOTAL** | **27h** | **21h** | **16h** | **64h** |

**Note** : 64h pour l'ensemble desktop + mobile + tablet (2 versions Preparation). Pour MVP v1.0, focus desktop (27h) puis mobile v1.1 (21h).

### Performance

- **CSS size** : ~18KB (dark + gradients + glows)
- **Complexity** : Elevee (sidebar + dark + effets)
- **Repaints** : Sidebar fixe + glows = moyen
- **Mobile** : Drawer dark = JS requis

### Accessibilite (WCAG)

| Aspect | Desktop | Mobile | Tablet |
|--------|---------|--------|--------|
| **Contraste** | AA (4.8:1 textes gris sur navy) | AA | AA |
| **Touch targets** | 32px+ | 48px+ | 44px+ |
| **Navigation clavier** | Excellent | Excellent | Excellent |
| **Dark mode natif** | Oui (uniquement) | Oui | Oui |

**Ameliorations prevues v1.2** :
- Theme switcher dark/light pour accessibilite
- Contrastes textes WCAG AAA (7:1)
- Personnalisation couleurs accents

---

## Avantages du Design Dark Immersif

### Branding Unique
- Design "brume/mystere" qui colle au Mist Engine
- Se demarque des outils JDR traditionnels (Roll20 clair, Foundry VTT sombre mais moins moderne)
- Look gaming/immersif qui plait aux joueurs JDR

### UX Optimisee
- Sidebar playspaces = switch rapide (1 clic)
- Badges power/weakness expressifs = lecture immediate
- Dark theme = moins fatiguant pour sessions longues
- Glows colores = feedback visuel immediat

### Performance
- CSS optimise avec UnoCSS
- Sidebar fixe = pas de reflow
- Loading optimiste sur basculement playspaces

### Scalabilite
- Architecture prete pour Investigation Board (v2.0)
- Theme switcher dark/light (v1.2)
- Personnalisation couleurs par playspace (v2.0)

---

## Guidelines de Creation

### Principes Generaux

1. **Dark-first** : Partir du navy fonce, ajouter les accents vibrants
2. **Gradients expressifs** : Power tags verts, Weakness tags rouges, CTAs blue-purple
3. **Glows subtils** : shadow-[color]-500/30 sur hover uniquement
4. **Contraste WCAG AA minimum** : Textes white/gray sur navy (4.8:1+)
5. **Touch targets** : 48px mobile, 44px tablet, 32px desktop minimum

### Workflow Multi-Device

1. **Partir du desktop** : Structure complete avec sidebar
2. **Adapter au tablet** : Sidebar collapsible, grilles 8 colonnes
3. **Refondre pour mobile** : Bottom nav, drawer, stack vertical

### Annotations Obligatoires

```html
<div class="wf-annotation" data-note="Section critique">
    <!-- Annoter toutes les zones importantes -->
</div>
```

---

## 📁 Structure des Fichiers

```
documentation/WIREFRAMES/
├── README.md (ce fichier)
└── propositionC/
    ├── desktop/
    │   ├── landing.html
    │   ├── dashboard.html
    │   ├── character-edit.html
    │   ├── characters-list.html
    │   └── playspaces-list.html
    ├── mobile/
    │   ├── landing.html
    │   ├── dashboard.html
    │   ├── character-edit.html
    │   ├── characters-list.html
    │   └── playspaces-list.html
    └── tablet/
        ├── landing.html
        ├── dashboard.html
        ├── character-edit.html
        ├── characters-list.html
        └── playspaces-list.html
```

---

## 🔗 References

### Design System & Architecture
- **Arborescence navigation** : `documentation/DESIGN-SYSTEM/arborescence-navigation.md`
- **Regles de wireframing** : `documentation/DESIGN-SYSTEM/regles-wireframing.md`
- **Charte graphique web** : `documentation/DESIGN-SYSTEM/charte-graphique-web.md`
- **UX Mobile-First** : `documentation/DESIGN-SYSTEM/ux-mobile-first.md`

### Documentation Fonctionnelle
- **Organisation des 4 sections** : `documentation/FONCTIONNALITES/00-organisation-sections.md`
  - Decouverte (onboarding, guides, tutoriels)
  - Preparation (playspaces, personnages, dangers selon role MJ/PJ)
  - Jouer en solo (HUD, Trackers, Action Database - v1.3+)
  - Table VTT (HUD partage, sync temps reel - v2.0+)

---

## Prochaines Etapes

### Phase 1 : Desktop MVP (Priorite)
- [x] Landing.html complete
- [x] Preparation-pj.html complete (MODE JOUEUR : personnages uniquement, badge bleu visible)
- [x] Preparation-mj.html complete (MODE MJ : dangers uniquement, badge violet visible)
- [x] Navigation 4 sections (Decouverte, Preparation, Solo, VTT)
- [x] Sidebar playspaces avec kebab menu et badges role [PJ]/[MJ]
- [x] Suppression boutons export et stats grid
- [ ] Tester accessibilite WCAG AA
- [ ] Prototype cliquable pour tests utilisateurs

### Phase 2 : Mobile v1.1
- [x] Landing.html mobile complete
- [x] Preparation-pj.html mobile adapte (en cours)
- [ ] Preparation-mj.html mobile adapte (a creer)
- [x] Bottom nav 4 sections (Solo et VTT grises)
- [x] Drawer playspaces avec kebab menu
- [ ] FAB pour actions principales

### Phase 3 : Tablet v1.2
- [ ] Landing.html tablet
- [ ] Preparation-pj.html tablet
- [ ] Preparation-mj.html tablet
- [ ] Sidebar collapsible
- [ ] Grilles 8 colonnes adaptatives
- [ ] Touch targets 44x44px

### Phase 4 : Theme Switcher v1.3
- [ ] Light mode pour accessibilite
- [ ] Toggle dark/light dans settings
- [ ] Persistance preference localStorage
- [ ] Amelioration contrastes WCAG AAA

---

**Document maintenu par : Agent UI/UX Designer**
**Derniere mise a jour : 2025-01-19 (restructuration multi-device)**
