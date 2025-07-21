# Architecture Globale

## Vue d'ensemble du projet

Générateur de PDFs pour fiches de personnages et aides de jeu de rôle, développé en **JavaScript pur** avec une architecture **MVC moderne** utilisant **Alpine.js** pour l'interactivité frontend.

### 🎯 Objectif principal
Créer et gérer des fiches de personnages pour différents systèmes de JDR avec génération automatique de PDFs stylisés, tout en maintenant une approche mobile-first.

## Stack technique

### Backend
- **Runtime** : Node.js 18+
- **Framework web** : Express.js
- **Base de données** : SQLite (développement) / PostgreSQL (production)
- **Templates** : EJS
- **Génération PDF** : PDFKit
- **Authentification** : Sessions Express
- **Logs** : Winston

### Frontend
- **Framework réactif** : Alpine.js 3.x
- **CSS** : Tailwind CSS
- **Architecture** : Composants modulaires
- **Approche** : Progressive Enhancement
- **Mobile** : Mobile-first responsive

### Outils de développement
- **Tests** : Jest
- **Linting** : ESLint
- **CSS** : PostCSS + Autoprefixer
- **Build** : Scripts npm personnalisés

## Principes de conception

### 🎯 SOLID
- **S** : Modèles/Services avec responsabilité unique
- **O** : Extensions via nouveaux systèmes JDR
- **L** : Substitution BaseModel/BaseService  
- **I** : Interfaces séparées (auth, CRUD, PDF)
- **D** : Inversion dépendances (services injectés)

### 🔄 DRY (Don't Repeat Yourself)
- **BaseModel/BaseController/BaseService** : Logique commune
- **Composants Alpine réutilisables** : Une fonction = un usage
- **Configuration centralisée** : Systèmes JDR, couleurs, API
- **Utilitaires partagés** : Validation, formatage, logs

### 📱 Progressive Enhancement
- **Fonctionne sans JavaScript** (liens/formulaires de base)
- **Enhanced avec Alpine.js** (interactivité, validation temps réel)
- **Responsive design** (mobile-first Tailwind)

## Sécurité

### Authentification
- **Sessions Express** avec cookies sécurisés
- **Codes d'accès** pour élévation de rôles
- **Validation Joi** côté serveur
- **Protection CSRF** et rate limiting

### Rôles utilisateur
- **UTILISATEUR** : Accès de base (CRUD personnages)
- **PREMIUM** : Fonctionnalités avancées
- **ADMIN** : Administration complète

### Stockage sécurisé
- **Codes d'accès** : Hachage + salage
- **Sessions** : Configuration sécurisée
- **Fichiers PDF** : Nettoyage automatique

## Performance

### Génération PDF
- **Asynchrone** : Puppeteer en arrière-plan
- **Statuts** : Suivi EN_ATTENTE → EN_TRAITEMENT → TERMINÉ/ÉCHEC
- **Cache** : Templates compilés
- **Nettoyage** : Expiration automatique des PDFs

### Frontend
- **Lazy loading** : Composants à la demande
- **LocalStorage** : Cache et mode hors ligne
- **Optimisations** : CSS critique inline, scripts différés

## Évolutivité

### Nouveaux systèmes JDR
1. Configuration dans `systemesJeu.js`
2. Template PDF thématique
3. Validation métier spécifique
4. Tests avec personnages d'exemple

### Extensions futures
- **Collaboration** : Partage de fiches entre joueurs
- **Campagnes** : Groupement de personnages  
- **Templates personnalisés** : Éditeur visuel
- **Export formats** : JSON, XML, Roll20
- **API publique** : Intégration applications tierces

## Architecture de génération PDF

### Vue d'ensemble
L'architecture PDF suit un pattern de séparation des responsabilités :
- **BasePdfKitService** : Gère tous les aspects génériques du document (structure, marges, pagination)
- **GameDocument** : Classe abstraite pour la personnalisation visuelle par système de jeu
- **[Système]Document** : Classes concrètes pour chaque système (Monsterhearts, Engrenages, etc.)

### Hiérarchie des classes

```
BasePdfKitService (générique)
    ├── Marges et padding
    ├── Sidebar (positionnement, alternance)
    ├── Numéros de page
    ├── Watermark (positionnement)
    ├── Table des matières (TOC)
    ├── Page de garde
    ├── Gestion des sauts de page
    └── Structure des sections et titres

GameDocument (abstrait)
    ├── Polices spécifiques au système
    ├── Palette de couleurs
    ├── Images et logos
    ├── Texte personnalisé (sidebar, watermark)
    └── Style de la page de garde

MonsterheartsDocument extends GameDocument
    ├── Police : Crimson Text
    ├── Couleurs : noir/blanc minimaliste
    ├── Sidebar : titre du document
    └── Watermark : nom du système

EngrenagesDocument extends GameDocument
    ├── Police : Bebas Neue
    ├── Couleurs : steampunk (bronze, cuivre)
    ├── Images : engrenages, vapeur
    └── Style victorien

[Autres systèmes...]
```

### Responsabilités

#### BasePdfKitService (responsabilités génériques)
- Structure du document (A4, marges standards)
- Positionnement des éléments (sidebar gauche/droite selon page paire/impaire)
- Pagination automatique et numérotation
- Gestion des documents longs (> 5 pages = garde + TOC)
- Méthodes utilitaires : `addTitle()`, `addParagraph()`, `addBox()`, `addStarList()`
- Protection contre les sauts de page indésirables (pas de width/align)

#### GameDocument (responsabilités de personnalisation)
- `registerFonts()` : Chargement des polices spécifiques
- `getColors()` : Palette de couleurs du système
- `getSidebarText()` : Texte à afficher dans la sidebar
- `getWatermarkText()` : Texte du watermark
- `customizeCoverPage()` : Personnalisation de la page de garde
- `getImages()` : Images et assets du système

### Flux de génération

1. **PdfService** reçoit la demande de génération
2. **PdfService** détermine le système et instancie le bon `[Système]Document`
3. **[Système]Document** configure les éléments visuels via `GameDocument`
4. **BasePdfKitService** génère la structure du document
5. **[Système]Document** applique la personnalisation visuelle
6. **BasePdfKitService** finalise et sauvegarde le PDF

### Exemple d'implémentation

```javascript
// GameDocument.js (abstrait)
class GameDocument extends BasePdfKitService {
    // Méthodes abstraites à implémenter
    registerFonts(doc) { throw new Error('Must implement registerFonts'); }
    getColors() { throw new Error('Must implement getColors'); }
    getSidebarText(data) { throw new Error('Must implement getSidebarText'); }
    getWatermarkText(data) { throw new Error('Must implement getWatermarkText'); }
    
    // Méthode commune de génération
    async generateDocument(data, filePath) {
        this.chapterTitle = this.getSidebarText(data);
        const doc = this.createDocument({
            chapterTitle: this.chapterTitle
        });
        
        this.registerFonts(doc);
        // ... génération du contenu
        doc.end();
    }
}

// MonsterheartsDocument.js
class MonsterheartsDocument extends GameDocument {
    registerFonts(doc) {
        doc.registerFont('Crimson', 'fonts/CrimsonText-Regular.ttf');
    }
    
    getColors() {
        return {
            primary: '#000000',
            secondary: '#FFFFFF',
            accent: '#FF0000'
        };
    }
    
    getSidebarText(data) {
        return data.titre || 'MONSTERHEARTS';
    }
}
```

## Choix architecturaux

### Architecture moderne
- **Système de rôles** avec codes d'accès
- **Architecture MVC** bien structurée
- **Logging détaillé** avec Winston
- **Configuration flexible** par environnement
- **Templates EJS** avec layouts

### Innovation frontend
- **Architecture Alpine.js modulaire**
- **Services frontend séparés**
- **Validation côté client ET serveur**
- **Composants réutilisables**
- **Principes SOLID/DRY appliqués** systématiquement
- **Gestion d'erreurs unifiée**
- **Base de données relationnelle**

## Maintenance

### Monitoring
- **Logs structurés** avec niveaux appropriés
- **Messages d'erreur explicites** côté client et serveur
- **Traces de stack** en développement
- **Métriques** des performances PDF

### Mises à jour
1. **Tests** obligatoires avant modification
2. **Migrations base de données** versionnées
3. **Documentation** maintenue à jour
4. **Changelog** pour chaque version

### Debugging
- **Winston** pour logs serveur structurés
- **Alpine DevTools** pour debug frontend
- **Erreurs unifiées** avec codes et contexte
- **Mode développement** verbeux