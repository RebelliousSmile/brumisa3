# Architecture Overview - brumisater

## Vue d'ensemble du projet

Générateur de **documents** PDF pour jeux de rôle, développé en **JavaScript pur** avec une architecture **MVC moderne** utilisant **Alpine.js** pour l'interactivité frontend.

### 🎯 Objectif principal
Créer et gérer des **personnages** (données sauvegardées) et générer des **documents** PDF stylisés pour différents systèmes de JDR, avec une approche mobile-first.

## Concepts fondamentaux

### Document vs Personnage
- **Document** : PDF généré à partir de données (5 types: CHARACTER, TOWN, GROUP, ORGANIZATION, DANGER)
- **Personnage** : Données sauvegardées par un utilisateur connecté, base pour générer des documents CHARACTER
- **Utilisateur anonyme (guest)** : Peut créer des documents directement mais ne peut pas les retrouver
- **Utilisateur connecté** : Peut sauvegarder des personnages et générer des documents depuis ces données

### Architecture des données
```
Utilisateur connecté ──► Personnage sauvegardé ──► Document CHARACTER
                    │
                    └──► Formulaire direct ──► Document (tous types)

Utilisateur anonyme ────► Formulaire direct ──► Document (visible admin uniquement)
```

### 5 Types de Documents
1. **CHARACTER** : Feuilles de personnage (tous systèmes)
2. **TOWN** : Cadres de ville (spécifique Monsterhearts)
3. **GROUP** : Plans de classe/groupe (spécifique Monsterhearts)
4. **ORGANIZATION** : Listes de PNJs organisées (tous systèmes)
5. **DANGER** : Fronts et dangers (spécifique Mist Engine)

### 5 Systèmes JDR Supportés
- **Monsterhearts** : Romance gothique adolescente, système PbtA (2d6)
- **Engrenages (Roue du Temps)** : Steampunk victorien, pool de d10
- **Metro 2033** : Post-apocalyptique survival, d20 + attribut
- **Mist Engine** : Narratif mystique japonais, dés d6
- **Zombiology** : Survie zombie biologique, d100 percentile

## Stack technique

### Backend
- **Runtime** : Node.js 18+
- **Framework web** : Express.js
- **Base de données** : SQLite (développement) / PostgreSQL (production)
- **Templates** : EJS avec layouts
- **Génération PDF** : PDFKit avec système de thèmes
- **Authentification** : Sessions Express avec codes d'accès
- **Logs** : Winston avec niveaux structurés

### Frontend
- **Framework réactif** : Alpine.js 3.x (composants modulaires)
- **CSS** : Tailwind CSS avec design system
- **Architecture** : Progressive Enhancement
- **Approche** : Mobile-first responsive
- **État** : LocalStorage + sessions serveur

### Outils de développement
- **Tests** : Jest (unitaires) + supertest (API)
- **Linting** : ESLint avec règles personnalisées
- **CSS** : PostCSS + Autoprefixer
- **Build** : Scripts pnpm personnalisés
- **Documentation** : JSDoc automatique

## Architecture MVC

### Modèles (Models)
- **BaseModel** : CRUD générique, validation, hooks
- **Utilisateur** : Authentification, rôles, préférences
- **Personnage** : Données sauvegardées par utilisateur
- **Document** : PDFs générés avec types et métadonnées
- **PDF** : Fichiers physiques avec statuts et partage

### Vues (Views)
- **Layouts EJS** : Structure commune avec includes
- **Composants Alpine.js** : Logique réactive modulaire
- **Templates responsive** : Mobile-first Tailwind
- **Formulaires dynamiques** : Adaptation par système JDR

### Contrôleurs (Controllers)
- **BaseController** : Gestion erreurs, validation, réponses
- **PdfController** : Génération documents par type
- **UtilisateurController** : Authentification et profils
- **PersonnageController** : CRUD données sauvegardées

## Architecture de génération PDF

### Hiérarchie des services
```
PdfService (orchestration)
    │
    ├── DocumentFactory (choix du type)
    │   ├── CharacterDocument
    │   ├── TownDocument
    │   ├── GroupDocument
    │   ├── OrganizationDocument
    │   └── DangerDocument
    │
    └── SystemThemeService (thèmes visuels)
        ├── MonsterheartsTheme
        ├── EngrenagesTheme
        ├── Metro2033Theme
        ├── MistEngineTheme
        └── ZombiologyTheme
```

### Responsabilités
- **PdfService** : Orchestration, statuts, base de données
- **DocumentFactory** : Sélection du bon type selon système/type
- **[Type]Document** : Génération du contenu spécifique
- **[System]Theme** : Personnalisation visuelle (polices, couleurs, éléments)
- **BasePdfKitService** : Utilitaires communs (marges, pagination, TOC)

### Flux de génération
1. **Demande** → PdfController selon le type
2. **Validation** → Données + disponibilité type/système (table document_systeme_jeu)
3. **Création** → Entrée Document en base (visible_admin_only si anonyme)
4. **Génération** → DocumentFactory + Theme approprié
5. **Finalisation** → Sauvegarde PDF + mise à jour statuts

## Principes de conception

### 🎯 SOLID
- **S**ingle Responsibility : Un modèle/service = une responsabilité
- **O**pen/Closed : Extension via nouveaux systèmes JDR sans modification
- **L**iskov Substitution : BaseModel/BaseService substituables
- **I**nterface Segregation : Services séparés (auth, CRUD, PDF, email)
- **D**ependency Inversion : Services injectés, pas couplés

### 🔄 DRY (Don't Repeat Yourself)
- **Classes de base** : BaseModel/BaseController/BaseService
- **Composants Alpine** réutilisables avec props
- **Configuration centralisée** : systemesJeu.js, dataTypes
- **Utilitaires partagés** : validation, formatage, logging

### 📱 Progressive Enhancement
- **Fonctionne sans JS** : Liens et formulaires de base
- **Enhanced avec Alpine.js** : Validation temps réel, interactivité
- **Responsive design** : Mobile-first avec Tailwind
- **Offline-first** : LocalStorage pour données temporaires

## Sécurité

### Authentification et autorisation
- **Sessions Express** avec cookies sécurisés HttpOnly
- **Codes d'accès** pour élévation PREMIUM/ADMIN
- **Validation Joi** systématique côté serveur
- **Protection CSRF** et rate limiting par IP

### Rôles utilisateur
- **GUEST** : Génération documents temporaires uniquement
- **UTILISATEUR** : CRUD personnages + génération persistante
- **PREMIUM** : Fonctionnalités avancées (thèmes, partage)
- **ADMIN** : Administration + accès documents anonymes

### Protection des données
- **Données anonymes** : visible_admin_only, nettoyage automatique
- **Personnages privés** : Isolation par utilisateur_id
- **PDFs temporaires** : Expiration automatique
- **Logs sécurisés** : Pas de données sensibles

## Performance et scalabilité

### Génération PDF optimisée
- **Génération asynchrone** : PDFKit en arrière-plan
- **Statuts temps réel** : EN_COURS → TERMINE → ERREUR
- **Cache templates** : Compilation unique des thèmes
- **Nettoyage automatique** : PDFs expirés supprimés

### Frontend performant
- **Composants lazy** : Chargement à la demande
- **LocalStorage intelligent** : Cache données formulaires
- **CSS critique** : Inline pour above-fold
- **Scripts différés** : Pas de blocage du rendu

### Extensions futures
- **Multi-tenant** : Isolation par domaine
- **Collaboration** : Partage temps réel (WebSockets)
- **API publique** : Intégration applications tierces
- **Cache Redis** : Mise à l'échelle horizontale

## Maintenance et monitoring

### Observabilité
- **Logs Winston structurés** : Niveaux appropriés (error, warn, info, debug)
- **Traces erreurs** : Stack complète + contexte métier
- **Métriques PDF** : Temps génération, taux succès
- **Health checks** : Base données, système fichiers

### Développement
- **Tests automatisés** : Unitaires (Jest) + intégration (supertest)
- **Linting strict** : ESLint + formatage automatique
- **Documentation vivante** : JSDoc + README techniques
- **Migrations DB** : Versionnées et réversibles

### Déploiement
- **Environnements** : dev/staging/production
- **Variables d'environnement** : Configuration externalisée
- **Scripts de déploiement** : Atomiques avec rollback
- **Monitoring production** : Alertes automatiques

---

*Ce document donne une vue d'ensemble de l'architecture. Consultez les fichiers spécialisés pour les détails techniques :*
- **Modèles** → [`architecture-models.md`](architecture-models.md)
- **Frontend** → [`architecture-frontend.md`](architecture-frontend.md)
- **Génération PDF** → [`../FONCTIONNALITES/generation-pdf.md`](../FONCTIONNALITES/generation-pdf.md)