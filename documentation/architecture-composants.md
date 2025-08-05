# Architecture des Composants

## Vue d'ensemble

Ce document décrit le système de composants développé pour améliorer la réutilisabilité et la maintenabilité du code frontend.

## Structure

```
src/views/
├── components/           # Composants réutilisables
│   ├── component-registry.ejs  # Configuration globale
│   ├── ui-button.ejs           # Composant bouton universel
│   ├── ui-card.ejs             # Composant carte universelle
│   └── ...
├── partials/            # Composants métier spécifiques
│   ├── testimonials-cta.ejs
│   ├── oracle-card.ejs
│   └── ...
└── pages/               # Pages complètes
```

## Composants UI de Base

### ui-button.ejs v2.1

Composant bouton standardisé avec variants, tailles, états et **support thèmes système**.

**Usage standard :**
```ejs
<%- include('components/ui-button', {
    text: 'Mon bouton',
    variant: 'primary',
    size: 'md',
    action: 'submitForm()',
    icon: 'fa-solid fa-save'
}) %>
```

**Usage avec thème système :**
```ejs
<%- include('components/ui-button', {
    text: 'Créer un personnage',
    variant: 'primary',
    size: 'lg',
    gameSystem: 'monsterhearts'  // Bouton violet gothique
}) %>
```

**Variants disponibles :**
- `primary` : Bouton principal (adapté au système ou bleu générique)
- `secondary` : Bouton secondaire (gris)
- `success` : Bouton de succès (vert)
- `danger` : Bouton de danger (rouge/orange)
- `outline` : Bouton avec bordure (adapté au système)
- `ghost` : Bouton transparent (adapté au système)

**Systèmes supportés :**
- `monsterhearts` : Violet gothique
- `engrenages` : Vert émeraude steampunk
- `metro2033` : Rouge post-apocalyptique
- `mistengine` : Rose mystique
- `zombiology` : Jaune survival

**Tailles :**
- `sm`, `md`, `lg`, `xl`

### ui-card.ejs

Composant carte standardisé avec header, body et footer.

**Usage :**
```ejs
<%- include('components/ui-card', {
    title: 'Titre de la carte',
    subtitle: 'Description',
    variant: 'primary',
    content: '<p>Contenu de la carte</p>',
    hover: true,
    clickAction: 'naviguer("/page")'
}) %>
```

### ui-input.ejs

Composant de saisie universel supportant tous les types d'inputs.

**Usage :**
```ejs
<%- include('components/ui-input', {
    type: 'text',
    name: 'username',
    label: 'Nom d\'utilisateur',
    placeholder: 'Entrez votre nom',
    required: true,
    icon: 'fa-solid fa-user',
    helpText: 'Minimum 3 caractères'
}) %>
```

**Types supportés :**
- `text`, `email`, `password`, `number`, `tel`, `url`, `search`
- `textarea` - Zone de texte multiligne
- Gestion des icônes, erreurs, aide contextuelle

### ui-modal.ejs

Composant modal avec Alpine.js intégré.

**Usage :**
```ejs
<%- include('components/ui-modal', {
    id: 'confirmModal',
    title: 'Confirmer l\'action',
    size: 'md',
    closable: true,
    bodyContent: '<p>Êtes-vous sûr ?</p>',
    footerContent: '<!-- boutons -->'
}) %>
```

**Contrôle JavaScript :**
```javascript
openModal('confirmModal');
closeModal('confirmModal');
setModalContent('confirmModal', '<p>Nouveau contenu</p>');
```

### ui-badge.ejs

Composant badge/étiquette avec variants et options.

**Usage :**
```ejs
<%- include('components/ui-badge', {
    text: 'Nouveau',
    variant: 'primary',
    size: 'sm',
    icon: 'fa-solid fa-star',
    removable: true,
    href: '/lien-optionnel'
}) %>
```

**Variants :**
- Standard : `primary`, `secondary`, `success`, `warning`, `danger`, `info`
- Outline : `outline-primary`, `outline-success`, etc.

### ui-form.ejs

Composant formulaire structuré avec validation.

**Usage :**
```ejs
<%- include('components/ui-form', {
    title: 'Mon Formulaire',
    action: '/submit',
    fields: [
        {
            type: 'text',
            name: 'username',
            label: 'Nom d\'utilisateur',
            required: true,
            icon: 'fa-solid fa-user'
        },
        {
            type: 'select',
            name: 'category',
            label: 'Catégorie',
            options: [
                { value: '1', text: 'Option 1' },
                { value: '2', text: 'Option 2' }
            ]
        }
    ],
    submitButton: { text: 'Envoyer', variant: 'primary' }
}) %>
```

## Système Alpine.js

### Structure des Composants

```javascript
// Composant simple
window.AlpineComponents.monComposant = () => ({
    // État
    data: {},
    loading: false,
    
    // Cycle de vie
    init() {
        // Initialisation
    },
    
    // Méthodes
    async action() {
        // Logique métier
    }
});
```

### Store Global

```javascript
Alpine.store('app', {
    loading: false,
    user: null,
    
    setLoading(state) {
        this.loading = state;
    }
});
```

### Utilitaires

```javascript
// Requête API
await AlpineComponentSystem.utils.apiCall('/api/endpoint', options);

// Formatage
AlpineComponentSystem.utils.formatNumber(1234); // "1 234"
AlpineComponentSystem.utils.formatDate(new Date());

// Debounce
const debouncedSearch = AlpineComponentSystem.utils.debounce(search, 300);
```

## Conventions

### Nommage

- **Composants UI** : `ui-[nom].ejs` (ex: `ui-button.ejs`)
- **Composants métier** : `[domaine]-[nom].ejs` (ex: `oracle-card.ejs`)
- **Composants Alpine** : `camelCase` (ex: `menuUtilisateur`)

### Paramètres

Toujours définir des valeurs par défaut :
```ejs
<%
const {
    text = 'Défaut',
    variant = 'primary',
    disabled = false
} = locals;
%>
```

### Classes CSS

Utiliser les utilitaires Tailwind avec le système de variants défini dans `component-registry.ejs`.

## Migration Progressive

### Étape 1 : Identifier les Patterns
- Boutons récurrents
- Cartes similaires
- Formulaires répétitifs

### Étape 2 : Créer les Composants
- Extraire en composant réutilisable
- Standardiser les paramètres
- Documenter l'usage

### Étape 3 : Refactoriser
- Remplacer l'ancien code
- Tester la compatibilité
- Optimiser les performances

## Exemple Complet

### Avant (code dupliqué)
```ejs
<!-- Page 1 -->
<button class="bg-generique hover:bg-generique-dark text-white px-4 py-2 rounded-lg">
    Sauvegarder
</button>

<!-- Page 2 -->
<button class="bg-generique hover:bg-generique-dark text-white px-4 py-2 rounded-lg">
    Créer
</button>
```

### Après (composant réutilisable)
```ejs
<!-- Page 1 -->
<%- include('components/ui-button', { text: 'Sauvegarder' }) %>

<!-- Page 2 -->  
<%- include('components/ui-button', { text: 'Créer' }) %>
```

## Avantages

- **Cohérence** : Design system unifié
- **Maintenabilité** : Modifications centralisées
- **Productivité** : Développement plus rapide
- **Qualité** : Moins d'erreurs, code testé
- **Documentation** : Usage standardisé

---

# Inventaire Complet des Composants Existants

## PARTIALS EXISTANTS (`src/views/partials/`)

| Composant | Fonction | Complexité | Réutilisabilité | Statut | Priorité Migration |
|-----------|----------|------------|-----------------|--------|-------------------|
| **back-to-top.ejs** | Bouton scroll vers le haut | Moyenne | ⭐⭐⭐ Haute | ✅ Bon état | 🟡 Basse |
| **breadcrumb.ejs** | Navigation fil d'Ariane | Moyenne | ⭐⭐⭐ Haute | ✅ Adaptatif | 🟡 Basse |
| **button.ejs** ⚠️ | Composant bouton (ancien) | Complexe | ⭐⭐⭐ Haute | ⚠️ À migrer | 🔴 **HAUTE** |
| **content-block.ejs** | Bloc de contenu avec badge | Moyenne | ⭐⭐⭐ Haute | ✅ Bon état | 🟡 Basse |
| **feature-grid.ejs** | Grille de fonctionnalités | Moyenne | ⭐⭐⭐ Haute | ✅ Data-driven | 🟡 Basse |
| **floating-menu.ejs** | Menu flottant donations | Simple | ⭐ Faible | ⚠️ Spécifique | 🟢 Optionnelle |
| **footer-systeme.ejs** | Footer par système | Simple | ⭐⭐ Moyenne | ✅ Conditionnel | 🟡 Basse |
| **hero-section.ejs** | Section héros complète | Complexe | ⭐⭐⭐ Haute | ✅ Très flexible | 🟠 Moyenne |
| **oracle-card.ejs** | Carte d'oracle | Complexe | ⭐⭐ Moyenne | ✅ Spécialisé | 🟠 Moyenne |
| **systeme-comment-creer.ejs** | Guide de création | Moyenne | ⭐⭐⭐ Haute | ✅ Adaptatif | 🟡 Basse |
| **systeme-cta.ejs** | CTA par système | Simple | ⭐⭐⭐ Haute | ✅ Paramétrable | 🟡 Basse |
| **systeme-downloads.ejs** | Section téléchargements | Moyenne | ⭐⭐⭐ Haute | ✅ Data-driven | 🟡 Basse |
| **systeme-hero.ejs** | Héros par système | Moyenne | ⭐⭐⭐ Haute | ✅ Paramétrable | 🟠 Moyenne |
| **systeme-oracles.ejs** | Showcase oracles | Moyenne | ⭐⭐⭐ Haute | ✅ Flexible | 🟡 Basse |
| **testimonials-cta.ejs** | CTA témoignages | Moyenne | ⭐⭐ Moyenne | ✅ Récent | ✅ **Migré** |

## NOUVEAU SYSTÈME COMPOSANTS (`src/views/components/`)

| Composant | Fonction | Statut | Utilisation |
|-----------|----------|--------|-------------|
| **component-registry.ejs** | Configuration centrale | ✅ Créé | Base du système |
| **ui-button.ejs** ⭐ | Bouton standardisé | ✅ Créé | Remplace button.ejs |
| **ui-card.ejs** ⭐ | Carte standardisée | ✅ Créé | Base pour autres cartes |
| **ui-input.ejs** ⭐ | Champ de saisie universel | ✅ Créé | Tous types d'inputs |
| **ui-modal.ejs** ⭐ | Fenêtre modale Alpine.js | ✅ Créé | Modales réactives |
| **ui-badge.ejs** ⭐ | Badge et étiquette | ✅ Créé | Labels, états, compteurs |
| **ui-form.ejs** ⭐ | Formulaire structuré | ✅ Créé | Formulaires complexes |

## COMPOSANTS JAVASCRIPT (`public/js/components/`)

| Composant | Fonction | Statut | Action |
|-----------|----------|--------|--------|
| **ButtonComponent.js** | Système boutons SOLID | ✅ Maintenir | Architecture avancée |
| **ButtonHelpers.js** | Helpers boutons | ✅ Maintenir | Utilitaires |
| **alpine-component-system.js** | Système Alpine structuré | ✅ Créé | Base Alpine.js |

## PATTERNS IDENTIFIÉS

### Problèmes Majeurs
1. **⚠️ Triple système de boutons** : `partials/button.ejs`, `components/ui-button.ejs`, `ButtonComponent.js`
2. **📝 Conventions incohérentes** : Paramètres camelCase/snake_case/kebab-case
3. **🎨 Système couleurs mixte** : Anciennes couleurs vs nouvelles couleurs génériques

### Points Forts
- ✅ **15 composants** avec haute réutilisabilité
- ✅ **Architecture flexible** qui s'adapte
- ✅ **Système Alpine.js** bien intégré

## PLAN DE MIGRATION

### Phase 1 : Standardisation Boutons (Priorité haute) ✅ TERMINÉ
- [x] Migrer `partials/button.ejs` → `components/ui-button.ejs`
- [x] Identifier tous les usages de `button.ejs`
- [x] Tester compatibilité après migration

### Phase 2 : Composants Moyennement Complexes (Priorité moyenne) ✅ TERMINÉ
- [x] Créer `ui-input.ejs` pour les formulaires
- [x] Créer `ui-modal.ejs` pour les fenêtres modales
- [x] Créer `ui-badge.ejs` pour badges et labels
- [x] Standardiser `hero-section.ejs` avec le nouveau système
- [x] Améliorer `oracle-card.ejs` avec les nouveaux patterns
- [x] Migrer `systeme-hero.ejs` vers le nouveau système

### Phase 3 : Optimisations (Priorité basse) 🔄 EN COURS
- [x] Créer `ui-form.ejs` pour formulaires structurés
- [x] Documentation standardisée (ce fichier)
- [ ] Conventions nommage → camelCase
- [ ] Système couleurs unifié avec variants
- [ ] Optimiser floating-menu.ejs (optionnel)

## COMPOSANTS CRÉÉS ✅

### Composants UI Complets
- [x] `ui-button.ejs` - Bouton universel avec variants, tailles, états
- [x] `ui-card.ejs` - Carte standardisée avec header/body/footer
- [x] `ui-input.ejs` - Champs de saisie tous types (text, email, textarea, etc.)
- [x] `ui-modal.ejs` - Fenêtres modales avec Alpine.js
- [x] `ui-badge.ejs` - Badges, étiquettes, compteurs
- [x] `ui-form.ejs` - Formulaires structurés avec validation

### Composants Migrés avec Support Thèmes Système
- [x] `hero-section.ejs` v2.1 - Utilise ui-button, ui-badge + thèmes système
- [x] `oracle-card.ejs` v2.0 - Utilise ui-button et ui-badge
- [x] `systeme-hero.ejs` v2.0 - Utilise ui-button
- [x] `testimonials-cta.ejs` - Utilise ui-button

### Nouveaux Composants avec Thèmes Système
- [x] `ui-button.ejs` v2.1 - Support complet SystemThemeService
- [x] `ui-badge.ejs` v2.1 - Support complet SystemThemeService
- [x] Autres composants UI compatibles

## SYSTÈME COMPLET ⭐

Le système de composants est maintenant complet avec :

### 🎨 Design System Unifié
- **7 composants UI** standardisés
- **Variants cohérents** : primary, secondary, success, danger, outline, ghost
- **Tailles systématiques** : xs, sm, md, lg, xl
- **États gérés** : normal, hover, disabled, loading

### 🛠️ Architecture Technique
- **Paramètres par défaut** avec destructuring
- **Classes dynamiques** calculées
- **Alpine.js intégré** pour l'interactivité
- **Documentation inline** dans chaque composant

### 📱 Fonctionnalités Avancées
- **Responsiveness** automatique
- **Accessibilité** (ARIA, labels, focus)
- **Validation client** pour les formulaires
- **Animations** CSS et Alpine.js
- **Compatibilité** avec l'ancien système

### 📊 Page de Test
- **`public/test-components.html`** - Showcase complet
- **Tests visuels** de tous les variants
- **Exemples d'usage** interactifs
- **Validation fonctionnelle** des composants