# Architecture Frontend - Composants et Vues

## Vue d'ensemble

L'architecture frontend de brumisater combine **EJS** pour les templates côté serveur et **Alpine.js** pour la réactivité côté client, avec un système de composants modulaires et des layouts thématiques par système de jeu.

## Stack Frontend

### Technologies principales
- **Templates** : EJS avec layouts et partials
- **Réactivité** : Alpine.js 3.x avec composants modulaires  
- **CSS** : Tailwind CSS avec variables CSS personnalisées
- **Build** : PostCSS + Autoprefixer
- **Approche** : Progressive Enhancement + Mobile-first

### Architecture en couches
```
┌─────────────────────────────────────────┐
│              Alpine.js Components      │  ← Logique réactive
├─────────────────────────────────────────┤
│                EJS Views               │  ← Templates serveur
├─────────────────────────────────────────┤
│            Tailwind CSS + Thèmes       │  ← Styles adaptatifs
├─────────────────────────────────────────┤
│              Progressive Enhancement    │  ← Fonctionnement sans JS
└─────────────────────────────────────────┘
```

## Système de Vues EJS

### Structure des dossiers
```
src/views/
├── layouts/              # Layouts thématiques
│   ├── base.ejs         # Structure HTML commune
│   ├── principal.ejs    # Layout principal (bleu)
│   ├── monsterhearts.ejs # Layout gothique (violet)
│   ├── engrenages.ejs   # Layout steampunk (émeraude)
│   ├── metro2033.ejs    # Layout post-apo (rouge)
│   ├── mistengine.ejs   # Layout mystique (rose)
│   └── zombiology.ejs   # Layout survival (jaune)
├── components/          # Composants UI réutilisables
│   ├── ui-button.ejs    # Boutons avec variants système
│   ├── ui-card.ejs      # Cartes standardisées
│   ├── ui-input.ejs     # Inputs avec validation
│   └── component-registry.ejs
├── partials/            # Composants métier spécifiques  
│   ├── breadcrumb.ejs   # Fil d'ariane adaptatif
│   ├── footer-systeme.ejs # Footer thématique
│   ├── oracle-card.ejs  # Carte oracle
│   └── testimonials-cta.ejs
├── systemes/            # Pages par système JDR
│   ├── monsterhearts/
│   ├── engrenages/
│   └── ...
└── pages/               # Pages génériques
    ├── auth/            # Authentification
    ├── personnages/     # Gestion personnages
    ├── oracles/         # Oracles
    └── errors/          # Erreurs
```

### Layouts thématiques

#### Layout de base (base.ejs)
Structure HTML commune avec :
- Meta tags SEO et responsive
- Chargement fonts système-spécifiques
- Variables CSS par défaut
- Scripts Alpine.js différés

#### Layouts par système
Chaque système JDR a son propre layout avec :
```css
/* Variables CSS thématiques */
--system-primary: #8b5cf6;    /* Violet pour Monsterhearts */
--system-secondary: #1f2937;   /* Gris sombre */
--system-accent: #f59e0b;      /* Accent doré */
```

**Exemple d'utilisation :**
```javascript
// Dans un contrôleur
res.render('systemes/monsterhearts/creer', {
    layout: 'layouts/monsterhearts',
    titre: 'Créer un Personnage',
    gameSystem: 'monsterhearts',
    personnage: data
});
```

### Variables disponibles
Dans tous les templates EJS :
- **`locals.utilisateur`** : Utilisateur connecté (null si anonyme)
- **`locals.systemes`** : Liste des systèmes JDR disponibles
- **`locals.isGuest`** : Booléen indiquant un utilisateur anonyme
- **`gameSystem`** : Système JDR actuel (pour thématisation)

## Système de Composants UI

### Composants de base standardisés

#### ui-button.ejs v2.1
Bouton universel avec support thématique par système :

```ejs
<%- include('components/ui-button', {
    text: 'Créer un personnage',
    variant: 'primary',
    size: 'lg',
    gameSystem: 'monsterhearts',  // Thème violet gothique
    icon: 'fa-solid fa-plus',
    action: 'createCharacter()'
}) %>
```

**Variants disponibles :**
- `primary` : Adapté au système ou bleu générique
- `secondary` : Gris neutre
- `success` : Vert de validation
- `danger` : Rouge d'alerte
- `outline` : Bordure thématique
- `ghost` : Transparent thématique

**Systèmes supportés :**
- `monsterhearts` → Violet gothique (`#8b5cf6`)
- `engrenages` → Vert émeraude (`#059669`)
- `metro2033` → Rouge post-apo (`#dc2626`)
- `mistengine` → Rose mystique (`#ec4899`)
- `zombiology` → Jaune survival (`#eab308`)

#### ui-card.ejs
Carte standardisée avec header, body, footer :

```ejs
<%- include('components/ui-card', {
    title: 'Mes Personnages',
    subtitle: '3 personnages sauvegardés',
    variant: 'primary',
    content: '<div>Liste des personnages...</div>',
    hover: true,
    gameSystem: 'monsterhearts'
}) %>
```

#### ui-input.ejs
Input universel avec validation et états :

```ejs
<%- include('components/ui-input', {
    type: 'text',
    name: 'nom_personnage',
    label: 'Nom du personnage',
    placeholder: 'Luna la Vampire',
    required: true,
    icon: 'fa-solid fa-user',
    helpText: 'Minimum 2 caractères',
    validation: 'required|min:2'
}) %>
```

### Composants métier spécialisés

#### oracle-card.ejs
Carte d'oracle avec tirage intégré :
```ejs
<%- include('partials/oracle-card', {
    oracle: oracleData,
    gameSystem: 'monsterhearts',
    showHistory: true
}) %>
```

#### breadcrumb.ejs
Fil d'ariane adaptatif au système :
```ejs
<%- include('partials/breadcrumb', {
    chemin: [
        { nom: 'Accueil', url: '/' },
        { nom: 'Monsterhearts', url: '/systemes/monsterhearts' },
        { nom: 'Créer', url: null }
    ],
    gameSystem: 'monsterhearts'
}) %>
```

## Architecture Alpine.js

### Structure Réelle des Composants
```
public/js/
├── alpine-component-system.js    # Système centralisé de composants
├── app.js                        # Stores globaux et configuration
├── components/                   # Composants métier par domaine
│   ├── AuthComponent.js         # Authentification (fonctions)
│   ├── ButtonComponent.js       # Système de boutons SOLID
│   ├── PersonnageComponent.js   # Gestion personnages (fonctions)
│   ├── MesDocumentsComponent.js # Composants de pages spécifiques
│   ├── TableauBordComponent.js  # Dashboard utilisateur
│   └── NavigationMobile.js      # Navigation mobile
├── services/                     # Services métier frontend
│   ├── PersonnageService.js     # Service personnages (classe)
│   ├── PdfService.js           # Service PDF
│   └── NavigationService.js     # Service navigation
└── helpers/                     # Utilitaires
    └── ButtonHelpers.js
```

### Architecture en 4 Couches

#### 1. Système de Composants Centralisé (alpine-component-system.js)
```javascript
window.AlpineComponentSystem = {
    // Store global partagé
    stores: {},
    
    // Composants de base réutilisables
    components: {
        button: (config = {}) => ({ /* logique bouton */ }),
        modal: (config = {}) => ({ /* logique modal */ }),
        form: (config = {}) => ({ /* logique formulaire */ })
    },
    
    // Utilitaires globaux
    utils: {
        formatNumber(num) { /* ... */ },
        debounce(func, wait) { /* ... */ },
        async apiCall(url, options) { /* requêtes standardisées */ }
    }
};
```

#### 2. Stores Alpine Globaux (app.js)
```javascript
// Store principal de l'application
Alpine.store('app', {
    utilisateur: window.APP_DATA?.utilisateur || null,
    systemes: window.APP_DATA?.systemes || {},
    messages: [], // Notifications flash
    
    // API centralisée avec gestion d'erreurs
    async requeteApi(url, options = {}) {
        try {
            const response = await fetch(`/api${url}`, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });
            
            if (!response.ok) throw new Error(`Erreur ${response.status}`);
            return response.json();
        } catch (erreur) {
            this.ajouterMessage('erreur', erreur.message);
            throw erreur;
        }
    }
});

// Store pour navigation mobile avec gestures
Alpine.store('navigation', {
    menuMobileOuvert: false,
    currentSection: 'infos-base',
    hasUnsavedChanges: false,
    isOffline: false
});

// Store pour création avec auto-sauvegarde
Alpine.store('creation', {
    sauvegarderLocalement(formData) { /* localStorage */ },
    getFormulaireSauvegardes() { /* récupération */ }
});
```

#### 3. Composants Métier Fonctionnels
```javascript
// Exemple : PersonnageComponent.js
function listePersonnages() {
    return {
        // État local du composant
        personnages: [],
        personnagesFiltres: [],
        filtreSysteme: '',
        chargement: true,
        
        // Cycle de vie
        async init() {
            await this.chargerPersonnages();
        },
        
        // Actions métier
        async chargerPersonnages() {
            try {
                this.chargement = true;
                this.personnages = await window.personnageService.lister();
                this.filtrerPersonnages();
            } catch (erreur) {
                console.error('Erreur chargement:', erreur);
            } finally {
                this.chargement = false;
            }
        },
        
        async genererPdf(idPersonnage) {
            const pdf = await window.personnageService.genererPdf(idPersonnage);
            window.location.href = `/pdfs/${pdf.id}`;
        },
        
        // Getters réactifs
        get statistiques() {
            return {
                total: this.personnages.length,
                parSysteme: this.personnages.reduce((acc, p) => {
                    acc[p.systeme_jeu] = (acc[p.systeme_jeu] || 0) + 1;
                    return acc;
                }, {})
            };
        }
    };
}

// Enregistrement global
window.AlpineComponents = window.AlpineComponents || {};
Object.assign(window.AlpineComponents, { listePersonnages });
```

#### 4. Services Métier (Couche Business)
```javascript
// PersonnageService.js - Classe avec logique métier
class PersonnageService {
    constructor() {
        this.store = null;
    }
    
    initStore() {
        if (!this.store && typeof Alpine !== 'undefined') {
            this.store = Alpine.store('app');
        }
        return this.store;
    }
    
    async lister(filtres = {}) {
        const store = this.initStore();
        const params = new URLSearchParams(filtres);
        const data = await store.requeteApi(`/personnages?${params}`);
        return data.donnees || [];
    }
    
    async creer(donnees) {
        const store = this.initStore();
        const data = await store.requeteApi('/personnages', {
            method: 'POST',
            body: JSON.stringify(donnees)
        });
        store.ajouterMessage('succes', 'Personnage créé avec succès');
        return data.donnees;
    }
    
    // Validation côté client
    validerDonnees(donnees, systeme) {
        const store = this.initStore();
        const erreurs = [];
        
        if (systeme && store.systemes[systeme]) {
            const template = store.systemes[systeme];
            // Validation selon template système
        }
        
        return { valide: erreurs.length === 0, erreurs };
    }
}

// Instance globale
window.personnageService = new PersonnageService();
```

### Patterns d'Architecture Utilisés

#### Pattern SOLID (ButtonComponent.js)
```javascript
// Single Responsibility : Chaque classe a une responsabilité
class AlpineButtonRenderer extends IButtonRenderer {
    render(config) { /* rendu HTML uniquement */ }
}

// Open/Closed : Extensible via Factory
class ButtonStyleFactory {
    static createPrimary() { /* style primaire */ }
    static createDanger() { /* style danger */ }
}

// Interface Segregation : Builders spécialisés
class CreateButtonBuilder {
    withText(text) { return this; }
    withIcon(icon) { return this; }
    build() { return this.renderer.render(this.config); }
}
```

#### Pattern Service Layer
- Séparation logique métier (services) / présentation (composants)
- Services réutilisables entre composants
- Gestion d'erreurs centralisée

#### Pattern Store Pattern
- État global partagé via Alpine.store()
- Réactivité automatique entre composants
- Persistence avec localStorage

### Intégration avec EJS

#### Approche 1 : Composant Fonctionnel
```ejs
<!-- Page mes-documents.ejs -->
<script>
window.initialPersonnages = <%-JSON.stringify(personnages)%>;
window.initialPdfs = <%-JSON.stringify(pdfs)%>;
</script>

<div class="min-h-screen bg-black text-white" x-data="mesDocuments()">
    <div x-show="ongletActif === 'personnages'">
        <template x-for="personnage in personnagesFiltres">
            <div @click="genererPdf(personnage.id)">
                <h3 x-text="personnage.nom"></h3>
            </div>
        </template>
    </div>
</div>
```

#### Approche 2 : Store Global
```ejs
<!-- Navigation avec store -->
<nav x-data="{ get menuOuvert() { return Alpine.store('navigation').menuMobileOuvert } }">
    <button @click="Alpine.store('navigation').basculerMenuMobile()">
        Menu
    </button>
</nav>
```

#### Approche 3 : Système de Composants
```ejs
<!-- Utilisation composant centralisé -->
<div x-data="AlpineComponentSystem.components.form({
    validate: (data) => { /* validation */ },
    submit: async (data) => { /* soumission */ }
})">
    <form @submit.prevent="submit()">
        <!-- Formulaire réactif -->
    </form>
</div>
```

### Auto-sauvegarde et Offline

#### Auto-sauvegarde toutes les 30 secondes
```javascript
// Dans app.js
setInterval(() => {
    if (Alpine.store('navigation').hasUnsavedChanges) {
        const formComponent = document.querySelector('[data-auto-save]');
        if (formComponent?._x_dataStack?.[0]?.sauvegarderAuto) {
            formComponent._x_dataStack[0].sauvegarderAuto();
        }
    }
}, 30000);
```

#### Gestion mode hors ligne
```javascript
window.addEventListener('offline', () => {
    Alpine.store('navigation').isOffline = true;
    Alpine.store('app').ajouterMessage('avertissement', 'Mode hors ligne activé');
});
```

#### Gestures mobiles
```javascript
// Swipe navigation dans les formulaires
function handleGesture() {
    if (swipeDistance > 50) {
        Alpine.store('navigation').prevSection();
    } else if (swipeDistance < -50) {
        Alpine.store('navigation').nextSection();
    }
}
```

## Workflows Utilisateur

### Workflow utilisateur anonyme (guest)
```
Accueil → Choisir système → Formulaire → Générer PDF
                                      ↓
                              Document en base
                         (visible_admin_only: true)
```

### Workflow utilisateur connecté
```
Accueil → Tableau de bord → Mes personnages
                         ↓
            Créer nouveau ← → Éditer existant
                         ↓
                   Sauvegarder comme personnage
                         ↓
                   Générer document PDF
```

## Responsive Design

### Approche Mobile-First
```css
/* Base mobile */
.container { width: 100%; }

/* Tablet */
@media (min-width: 768px) {
    .container { max-width: 768px; }
}

/* Desktop */
@media (min-width: 1024px) {
    .container { max-width: 1024px; }
}
```

### Composants adaptatifs
Les composants s'adaptent automatiquement :
- **Boutons** : `size` responsive (`sm` mobile, `lg` desktop)
- **Cartes** : Grille adaptative (1 col mobile → 3 cols desktop)
- **Formulaires** : Colonnes flexibles selon l'écran

## Performance et Optimisation

### Progressive Enhancement
1. **Base HTML/CSS** : Fonctionne sans JavaScript
2. **Enhanced Alpine.js** : Ajoute l'interactivité
3. **Advanced features** : Validation temps réel, auto-save

### Optimisations
- **Lazy loading** : Composants Alpine chargés à la demande
- **LocalStorage** : Cache des données formulaire
- **CSS critique** : Styles above-fold inline
- **Scripts différés** : Alpine.js en footer

### Debugging
```javascript
// Mode développement
if (process.env.NODE_ENV === 'development') {
    window.Alpine = Alpine; // Expose Alpine pour debug
    Alpine.data('debug', () => ({ /* helper debug */ }));
}
```

## Extension et Maintenance

### Ajouter un nouveau système JDR
1. **Layout** : Créer `layouts/nouveau-systeme.ejs`
2. **Variables CSS** : Définir les couleurs système
3. **Composant Alpine** : `NouveauSystemeAlpine.js`
4. **Vues** : Dossier `systemes/nouveau-systeme/`
5. **Tests** : Valider responsive + interactions

### Ajouter un nouveau composant UI
1. **Template EJS** : `components/ui-nouveau.ejs`
2. **Documentation** : Paramètres et exemples
3. **Tests** : Variations et edge cases
4. **Registry** : Ajouter dans `component-registry.ejs`

---

*Cette architecture garantit la cohérence visuelle, la maintenabilité du code et une expérience utilisateur optimale sur tous les appareils.*