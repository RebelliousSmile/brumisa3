# Guide du Design System - Brumisa3

## Vue d'ensemble

Le Design System de Brumisa3 est un système cohérent et modulaire qui permet de créer des interfaces utilisateur adaptées aux différents systèmes JDR tout en maintenant une expérience utilisateur cohérente. Il intègre parfaitement l'architecture **MVC-CS** du projet.

### 🎨 Philosophie du Design

- **Web = Cohérence** : Interface homogène avec le bleu Brumisa3 (#3b82f6)
- **PDF = Immersion** : Thèmes visuels distincts par système JDR pour une immersion totale
- **Mobile-First** : Conçu d'abord pour mobile puis étendu aux écrans plus grands
- **Accessibilité** : Respect des standards WCAG pour une expérience inclusive

## Architecture du Design System

### Structure des fichiers

```
public/css/
├── design-system-variables.css    # Variables CSS centralisées
├── responsive-grid.css            # Système de grilles et layouts
└── component-styles.css           # Styles des composants (si nécessaire)

src/views/components/
├── ui-button.ejs                  # Composant bouton universel
├── ui-card.ejs                    # Composant carte
├── ui-input.ejs                   # Composant input
├── ui-table.ejs                   # Composant tableau responsive
├── ui-alert.ejs                   # Composant alerte/notification
├── ui-tabs.ejs                    # Composant onglets
├── ui-dropdown.ejs                # Composant menu déroulant
├── ui-modal.ejs                   # Composant modal
├── ui-form.ejs                    # Composant formulaire
├── ui-badge.ejs                   # Composant badge
└── ui-cta.ejs                     # Composant call-to-action

public/js/services/
└── ThemeService.js                # Service de gestion des thèmes côté client
```

## Système de Variables CSS

### Variables globales

Le fichier `design-system-variables.css` contient toutes les variables CSS utilisées dans l'application :

```css
:root {
  /* Couleurs principales */
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --color-accent: #f59e0b;
  
  /* Espacements */
  --spacing-1: 0.25rem;
  --spacing-4: 1rem;
  --spacing-8: 2rem;
  
  /* Typographie */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
  --text-base: 1rem;
  
  /* Bordures */
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
}
```

### Thèmes par système JDR

Chaque système JDR a ses propres variables CSS appliquées via `[data-theme="nom-systeme"]` :

#### Monsterhearts - Gothique Romantique
```css
[data-theme="monsterhearts"] {
  --system-primary: #8b5cf6;      /* Violet gothique */
  --system-secondary: #ec4899;    /* Rose passion */
  --system-gradient: linear-gradient(135deg, #1e1232, #3a1a5c, #2d1b3d);
  --system-font-title: 'Crimson Text', 'Source Serif 4', serif;
}
```

#### Engrenages - Steampunk Victorien
```css
[data-theme="engrenages"] {
  --system-primary: #10b981;      /* Vert émeraude */
  --system-secondary: #a16207;    /* Cuivre antique */
  --system-font-title: 'Cinzel', 'Times New Roman', serif;
}
```

#### Metro 2033 - Post-Apocalyptique
```css
[data-theme="metro2033"] {
  --system-primary: #dc2626;      /* Rouge danger */
  --system-font-title: 'Courier New', 'Share Tech Mono', monospace;
  --system-filter-distortion: contrast(1.2) saturate(0.8);
}
```

#### Mist Engine - Mystique Poétique
```css
[data-theme="mistengine"] {
  --system-primary: #ec4899;      /* Rose mystique */
  --system-background: #fdf2f8;   /* Fond pastel */
  --system-font-title: 'Dancing Script', 'Kalam', cursive;
}
```

#### Zombiology - Survival Horror
```css
[data-theme="zombiology"] {
  --system-primary: #eab308;      /* Jaune survival */
  --system-secondary: #dc2626;    /* Rouge danger */
  --system-font-title: 'Impact', 'Arial Black', sans-serif;
}
```

## Composants UI

### Bouton (ui-button.ejs)

Le composant bouton le plus polyvalent avec support thématique complet.

#### Usage de base
```ejs
<%- include('components/ui-button', {
    text: 'Créer un personnage',
    variant: 'primary',
    size: 'lg',
    gameSystem: 'monsterhearts'
}) %>
```

#### Paramètres disponibles
- **text** : Texte du bouton
- **variant** : `primary`, `secondary`, `success`, `danger`, `outline`, `ghost`
- **size** : `sm`, `md`, `lg`, `xl`
- **gameSystem** : Système JDR pour la thématisation
- **icon** : Icône Font Awesome
- **action** : Action Alpine.js à exécuter
- **href** : URL pour créer un lien au lieu d'un bouton

#### Exemples thématiques
```ejs
<!-- Bouton Monsterhearts -->
<%- include('components/ui-button', {
    text: 'Séduire',
    variant: 'primary',
    gameSystem: 'monsterhearts',
    icon: 'fa-solid fa-heart'
}) %>

<!-- Bouton Metro2033 -->
<%- include('components/ui-button', {
    text: 'Survivre',
    variant: 'danger',
    gameSystem: 'metro2033',
    icon: 'fa-solid fa-radiation'
}) %>
```

### Carte (ui-card.ejs)

Composant carte standardisé pour afficher du contenu structuré.

#### Usage
```ejs
<%- include('components/ui-card', {
    title: 'Luna la Vampire',
    subtitle: 'Monsterhearts - Niveau 3',
    variant: 'primary',
    gameSystem: 'monsterhearts',
    content: '<p>Description du personnage...</p>'
}) %>
```

### Tableau (ui-table.ejs)

Tableau responsive avec support thématique et fonctionnalités avancées.

#### Usage
```ejs
<%- include('components/ui-table', {
    headers: ['Nom', 'Système', 'Statut', 'Actions'],
    rows: [
        ['Document 1', 'Monsterhearts', 'Publié', '<button>Voir</button>'],
        ['Document 2', 'Engrenages', 'Brouillon', '<button>Éditer</button>']
    ],
    variant: 'striped',
    gameSystem: 'monsterhearts',
    responsive: true
}) %>
```

### Alerte (ui-alert.ejs)

Composant de notification avec différents types et thématisation.

#### Usage
```ejs
<%- include('components/ui-alert', {
    type: 'success',
    title: 'Personnage créé',
    message: 'Votre personnage a été sauvegardé avec succès.',
    dismissible: true,
    gameSystem: 'monsterhearts'
}) %>
```

### Onglets (ui-tabs.ejs)

Système d'onglets responsive avec support thématique.

#### Usage
```ejs
<%- include('components/ui-tabs', {
    tabs: [
        { 
            id: 'infos', 
            label: 'Informations', 
            content: '<div>Contenu des infos</div>', 
            active: true 
        },
        { 
            id: 'stats', 
            label: 'Statistiques', 
            content: '<div>Contenu des stats</div>' 
        }
    ],
    variant: 'underline',
    gameSystem: 'monsterhearts'
}) %>
```

### Menu déroulant (ui-dropdown.ejs)

Menu déroulant avec actions et liens, thématisé par système.

#### Usage
```ejs
<%- include('components/ui-dropdown', {
    trigger: { text: 'Actions', icon: 'fa-solid fa-chevron-down' },
    items: [
        { label: 'Éditer', icon: 'fa-solid fa-edit', action: 'editItem()' },
        { label: 'Dupliquer', icon: 'fa-solid fa-copy', action: 'duplicate()' },
        { divider: true },
        { label: 'Supprimer', icon: 'fa-solid fa-trash', action: 'delete()', danger: true }
    ],
    gameSystem: 'monsterhearts'
}) %>
```

## Système de Grilles Responsive

### Conteneurs

```css
.container        /* Conteneur responsive standard */
.container-fluid  /* Conteneur pleine largeur */
.container-sm     /* Max-width: 640px */
.container-md     /* Max-width: 768px */
.container-lg     /* Max-width: 1024px */
.container-xl     /* Max-width: 1280px */
```

### Grilles CSS Grid

```css
.grid            /* Grille de base */
.grid-1          /* 1 colonne */
.grid-2          /* 2 colonnes */
.grid-3          /* 3 colonnes */
.grid-auto       /* Colonnes automatiques */
```

### Breakpoints responsive

```css
/* Mobile first */
.sm\:grid-2      /* 2 colonnes à partir de 640px */
.md\:grid-3      /* 3 colonnes à partir de 768px */
.lg\:grid-4      /* 4 colonnes à partir de 1024px */
```

### Layouts spécialisés

#### Layout fiche de personnage
```css
.character-layout {
  display: grid;
  grid-template-areas: 
    "header header"
    "info stats"
    "skills skills"
    "equipment notes";
  grid-template-columns: 1fr 1fr;
}
```

#### Layout dashboard
```css
.dashboard-layout {
  display: grid;
  grid-template-areas: "sidebar main";
  grid-template-columns: 250px 1fr;
}
```

## Service de Gestion des Thèmes

### ThemeService.js

Le service côté client permet de gérer dynamiquement les thèmes :

```javascript
// Appliquer un thème
window.themeService.applyTheme('monsterhearts');

// Récupérer le thème actuel
const currentTheme = window.themeService.getCurrentThemeData();

// Écouter les changements
document.addEventListener('themeChanged', (event) => {
    console.log('Nouveau thème:', event.detail.theme);
});
```

### Intégration avec Alpine.js

```ejs
<div x-data="themeManager()">
    <select @change="changeTheme($event.target.value)">
        <template x-for="theme in themes">
            <option :value="theme.id" x-text="theme.name"></option>
        </template>
    </select>
</div>
```

## Bonnes Pratiques

### Utilisation des Thèmes

1. **Toujours passer le gameSystem** : Permet la thématisation automatique
```ejs
<%- include('components/ui-button', {
    text: 'Action',
    gameSystem: locals.gameSystem || 'default'
}) %>
```

2. **Utiliser les variables CSS** : Au lieu de couleurs hardcodées
```css
/* ✅ Correct */
.ma-classe {
    color: var(--system-primary);
}

/* ❌ Incorrect */
.ma-classe {
    color: #8b5cf6;
}
```

### Responsive Design

1. **Mobile First** : Commencer par la version mobile
```css
/* Base mobile */
.element { font-size: 14px; }

/* Desktop */
@media (min-width: 768px) {
    .element { font-size: 16px; }
}
```

2. **Utiliser les classes utilitaires**
```html
<div class="grid grid-1 md:grid-2 lg:grid-3 gap-4">
    <!-- Contenu responsive -->
</div>
```

### Accessibilité

1. **ARIA labels** : Toujours fournir des labels descriptifs
```ejs
<%- include('components/ui-button', {
    text: 'Supprimer',
    ariaLabel: 'Supprimer le personnage Luna'
}) %>
```

2. **Focus visible** : S'assurer que les éléments focusables le sont
```css
.ui-button:focus {
    outline: 2px solid var(--color-accent);
}
```

## Extension du Design System

### Ajouter un nouveau composant

1. **Créer le fichier EJS** : `src/views/components/ui-nouveau.ejs`
2. **Suivre la structure standard** :
   - Paramètres avec valeurs par défaut
   - Support du gameSystem
   - Classes modulaires et composables
   - Documentation JSDoc

3. **Exemple de structure** :
```ejs
<%
/**
 * Composant Nouveau v1.0
 * 
 * Usage: <%- include('components/ui-nouveau', {
 *   parametre1: 'valeur',
 *   gameSystem: 'monsterhearts'
 * }) %>
 */

const {
    parametre1 = 'default',
    gameSystem = ''
} = locals;

const SystemThemeService = require('../../services/SystemThemeService');
const systemTheme = gameSystem ? SystemThemeService.getTheme(gameSystem) : null;
%>

<div class="ui-nouveau">
    <!-- Contenu du composant -->
</div>
```

### Ajouter un nouveau thème de système

1. **Ajouter les variables CSS** dans `design-system-variables.css`
2. **Créer le service PDF** : `src/services/themes/NouveauSystemeTheme.js`
3. **Mettre à jour SystemThemeService** : Ajouter le mapping des couleurs
4. **Tester tous les composants** avec le nouveau thème

## Métriques et Validation

### Tests visuels recommandés

- [ ] Tous les composants s'affichent correctement sur mobile (320px min)
- [ ] Les thèmes s'appliquent uniformément sur tous les composants
- [ ] Les transitions et animations fonctionnent smoothly
- [ ] L'accessibilité clavier fonctionne sur tous les composants interactifs
- [ ] Les couleurs respectent les ratios de contraste WCAG AA

### Performance

- Variables CSS chargées une seule fois
- Composants réutilisables sans duplication
- CSS critiques inline pour above-fold
- Chargement progressif des thèmes non utilisés

---

**Ce Design System garantit une cohérence visuelle parfaite, une maintenabilité optimale et une expérience utilisateur exceptionnelle sur tous les appareils et systèmes JDR.**