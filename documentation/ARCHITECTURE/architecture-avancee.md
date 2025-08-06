# Fonctionnalités Avancées

## Vue d'ensemble

Ce document présente les fonctionnalités avancées de brumisater qui enrichissent l'expérience utilisateur au-delà de la génération PDF de base.

## Architecture Alpine.js 4 Couches

### Système de Composants Centralisé

Le framework utilise une architecture sophistiquée basée sur Alpine.js avec 4 couches distinctes :

1. **Système de Composants Centralisé** (`alpine-component-system.js`)
2. **Stores Alpine Globaux** (`app.js`)
3. **Composants Métier Fonctionnels** (`components/`)
4. **Services Métier** (`services/`)

#### Patterns SOLID Implémentés

- **Single Responsibility** : Chaque composant a une responsabilité unique
- **Open/Closed** : Extensibilité via Factory patterns
- **Liskov Substitution** : Interfaces communes pour les composants
- **Interface Segregation** : Builders spécialisés par domaine
- **Dependency Inversion** : Services injectés via le store global

### Composants Réactifs Avancés

#### Auto-sauvegarde Intelligente

- **Fréquence** : Sauvegarde automatique toutes les 30 secondes
- **Détection de changements** : Via `hasUnsavedChanges` dans le store navigation
- **Persistance locale** : Utilisation de localStorage en fallback
- **Récupération** : Restauration automatique en cas de fermeture accidentelle

```javascript
// Auto-save toutes les 30 secondes
setInterval(() => {
    if (Alpine.store('navigation').hasUnsavedChanges) {
        const formComponent = document.querySelector('[data-auto-save]');
        if (formComponent?._x_dataStack?.[0]?.sauvegarderAuto) {
            formComponent._x_dataStack[0].sauvegarderAuto();
        }
    }
}, 30000);
```

#### Gestion Hors Ligne

- **Détection** : Surveillance des événements `offline/online`
- **Mode dégradé** : Fonctionnement limité sans connexion
- **Synchronisation** : Reprise automatique dès reconnexion
- **Notifications** : Messages utilisateur appropriés

```javascript
window.addEventListener('offline', () => {
    Alpine.store('navigation').isOffline = true;
    Alpine.store('app').ajouterMessage('avertissement', 'Mode hors ligne activé');
});
```

#### Gestures Mobiles

- **Navigation par gestes** : Swipe entre sections de formulaires
- **Seuil de déclenchement** : 50px minimum
- **Feedback visuel** : Animations de transition
- **Accessibilité** : Compatible avec les readers d'écran

```javascript
function handleGesture() {
    if (swipeDistance > 50) {
        Alpine.store('navigation').prevSection();
    } else if (swipeDistance < -50) {
        Alpine.store('navigation').nextSection();
    }
}
```

## Système d'Authentification Avancé

### Élévation de Rôle Dynamique

- **Codes d'accès** : 6 chiffres pour PREMIUM et ADMIN
- **Vérification temps réel** : Validation immédiate
- **Interface modale** : UX intuitive avec focus automatique
- **Sécurité** : Codes changeable via variables d'environnement

#### Hiérarchie des Rôles

1. **UTILISATEUR** : Fonctionnalités de base
2. **PREMIUM** : Fonctionnalités avancées (personnalisation, export)
3. **ADMIN** : Accès complet + gestion utilisateurs

### Sessions Persistantes

- **Express-session** : Gestion serveur des sessions
- **Store Alpine** : Synchronisation côté client
- **Auto-reconnexion** : Récupération état utilisateur
- **Déconnexion sécurisée** : Nettoyage complet localStorage + session

## Système de Messages Flash

### Types de Messages

- **Succès** : Actions réussies (vert)
- **Erreur** : Échecs et problèmes (rouge)  
- **Avertissement** : Informations importantes (jaune)
- **Information** : Messages neutres (bleu)

### Gestion Centralisée

```javascript
// Store Alpine pour les messages
Alpine.store('app', {
    messages: [],
    
    ajouterMessage(type, texte) {
        const id = Date.now();
        this.messages.push({ id, type, texte });
        
        // Auto-suppression après 5 secondes
        setTimeout(() => {
            this.supprimerMessage(id);
        }, 5000);
    }
});
```

## Formulaires Intelligents

### Validation Temps Réel

- **Validation côté client** : Feedback immédiat
- **Validation côté serveur** : Sécurité renforcée
- **Messages contextuels** : Explications claires des erreurs
- **Accessibilité** : Attributs ARIA appropriés

### Progression Visuelle

- **Sections multiples** : Division logique des formulaires longs
- **Indicateur de progression** : Barre de progression dynamique
- **Navigation sections** : Boutons précédent/suivant
- **Validation par étapes** : Vérification section par section

### Auto-complétion Intelligente

- **Données système** : Suggestions basées sur le système JDR
- **Historique utilisateur** : Réutilisation des données précédentes
- **Recherche floue** : Tolérance aux fautes de frappe
- **Performance** : Debouncing des requêtes

## Génération PDF Avancée

### Types de Documents Spécialisés

#### Documents Thématiques

- **CHARACTER** : Fiches personnages avec grilles statistiques
- **TOWN** : Cadres de ville (Monsterhearts) avec relations PNJ
- **GROUP** : Plans de classe avec dynamiques sociales
- **ORGANIZATION** : Structures hiérarchiques de PNJs
- **DANGER** : Fronts et menaces (Mist Engine)
- **GENERIQUE** : Documents libres avec Markdown

#### Styles Visuels Adaptatifs

Chaque système JDR possède sa propre charte graphique :

- **Monsterhearts** : Gothic romantique (violet/rose)
- **Engrenages** : Steampunk victorien (emeraude/cuivre)
- **Metro 2033** : Post-apocalyptique (rouge/gris)
- **Mist Engine** : Mystique poétique (rose/violet)
- **Zombiology** : Survival horror (jaune/rouge)

### Génération Asynchrone

- **File d'attente** : Gestion des demandes multiples
- **Progression en temps réel** : Statuts détaillés (10% → 100%)
- **Gestion d'erreurs** : Recovery automatique + retry
- **Performance** : Optimisation mémoire pour documents longs

## Oracles et Génération Aléatoire

### Système d'Oracles Avancé

- **Tables personnalisées** : Création d'oracles spécifiques
- **Génération contextuelle** : Résultats adaptés au système
- **Historique des tirages** : Sauvegarde des résultats
- **Partage social** : Export/import d'oracles

### Types d'Oracles Supportés

1. **Action/Thème** : Inspiration narrative générale
2. **Personnages** : Génération de PNJs
3. **Lieux** : Création d'environnements
4. **Événements** : Complications et opportunités
5. **Spécifiques système** : Adaptés à chaque JDR

## Dashboard Utilisateur Avancé

### Page Mes Documents

- **Vue unifiée** : Personnages et PDFs dans une interface
- **Filtrage intelligent** : Par système, date, statut
- **Actions groupées** : Opérations sur plusieurs éléments
- **Statistiques** : Métriques d'utilisation personnelles

### Gestion des Personnages

- **Duplication intelligente** : Copie avec variations
- **Versioning** : Historique des modifications
- **Export/Import** : Formats JSON, CSV
- **Partage** : URLs temporaires pour collaboration

## Système de Templates

### Templates Dynamiques

- **Configuration par système** : Types de données exhaustifs
- **Validation automatique** : Vérification cohérence
- **Extensibilité** : Ajout facile de nouveaux systèmes
- **Backward compatibility** : Support versions antérieures

### Factory Pattern

```javascript
// DocumentFactory pour création dynamique
class DocumentFactory {
    static create(type, systemCode, data) {
        const documentClass = this.getDocumentClass(type, systemCode);
        const theme = ThemeFactory.create(systemCode);
        return new documentClass(data, theme);
    }
}
```

## Performance et Optimisations

### Progressive Enhancement

1. **Base HTML/CSS** : Fonctionne sans JavaScript
2. **Enhanced Alpine.js** : Ajoute l'interactivité
3. **Advanced features** : Fonctionnalités premium

### Optimisations Techniques

- **Lazy Loading** : Composants chargés à la demande
- **Code Splitting** : Bundles par système JDR
- **Cache Intelligent** : LocalStorage + service workers
- **Debouncing** : Limitation des appels API

### Monitoring Performances

- **Web Vitals** : CLS, FID, LCP tracking
- **API Response Times** : Surveillance des endpoints
- **PDF Generation Times** : Métriques par type/système
- **User Experience** : Tracking erreurs/abandons

## Sécurité Avancée

### Protection CSRF

- **Tokens par session** : Validation côté serveur
- **SameSite Cookies** : Protection supplémentaire
- **Rotation automatique** : Renouvellement périodique
- **API Protection** : Headers requis

### Sanitisation des Données

- **Input Validation** : Côté client et serveur
- **XSS Prevention** : Échappement HTML automatique
- **SQL Injection** : Requêtes préparées exclusivement
- **File Upload** : Validation type/taille

### Audit Trail

- **Actions utilisateur** : Log des modifications importantes
- **Failed Attempts** : Tentatives d'élévation échouées
- **System Events** : Démarrages, erreurs critiques
- **GDPR Compliance** : Anonymisation et suppression

## Extensibilité

### Plugin System (Prévu)

- **Hooks System** : Points d'extension dans le code
- **Custom Themes** : Thèmes utilisateur
- **System Extensions** : Nouveaux systèmes JDR
- **API Extensions** : Endpoints personnalisés

### Intégration Externe

- **Webhooks** : Notifications vers services externes
- **API REST** : Intégration avec outils tiers
- **Export Formats** : JSON, XML, CSV standardisés
- **OAuth Integration** : Connexion via services tiers (prévu)

## Maintenance et Debug

### Outils de Debug

- **Mode Développement** : Logs détaillés + Alpine exposé
- **Error Boundaries** : Capture d'erreurs React-style
- **Performance Profiling** : Mesure composants individuels
- **State Inspector** : Visualisation stores Alpine

### Monitoring Production

- **Health Checks** : Endpoints de vérification
- **Error Tracking** : Intégration Sentry (prévu)
- **Performance Metrics** : Dashboards temps réel
- **User Analytics** : Patterns d'utilisation

Cette architecture avancée permet une évolutivité maximale tout en conservant la simplicité d'utilisation qui fait le succès de brumisater.