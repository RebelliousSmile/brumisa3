# Architecture Pattern MVC-CS - brumisater

## Pattern Architectural : MVC-CS

brumisater implémente un pattern **MVC-CS** (Model-View-Controller with Components & Services), une évolution naturelle du MVC classique adaptée aux applications web modernes.

### Définition du Pattern

**MVC-CS** combine :
- **MVC traditionnel** pour la structure backend et le rendu serveur
- **Components** pour l'interactivité frontend réactive
- **Services** pour l'isolation de la logique métier

## Les 5 Couches du Pattern

### 1. Models (M) - Couche de Données
**Responsabilité** : Gestion des données et interaction avec la base

```
BaseModel (classe abstraite)
    ├── Utilisateur
    ├── Personnage
    ├── Document
    └── Pdf
```

**Caractéristiques** :
- Pattern Active Record pour l'accès aux données
- Validation intégrée avec Joi
- Hooks de cycle de vie (beforeCreate, afterUpdate)
- Relations déclaratives entre modèles

### 2. Views (V) - Couche de Présentation
**Responsabilité** : Structure HTML et rendu initial

```
Views EJS (rendu serveur)
    ├── Layouts (structure commune)
    ├── Partials (fragments réutilisables)
    └── Pages (vues complètes)
```

**Caractéristiques** :
- Templates EJS avec héritage de layouts
- Rendu serveur pour SEO et performance
- Progressive Enhancement ready
- Mobile-first avec Tailwind CSS

### 3. Controllers (C) - Couche de Routage
**Responsabilité** : Orchestration des requêtes HTTP

```
BaseController (classe abstraite)
    ├── UtilisateurController
    ├── PersonnageController
    ├── PdfController
    └── AdminController
```

**Caractéristiques** :
- Gestion centralisée des erreurs
- Validation des entrées systématique
- Réponses uniformisées (JSON/HTML)
- Middleware de sécurité intégrés

### 4. Components (C) - Couche Interactive
**Responsabilité** : Logique UI réactive côté client

```
Alpine.js Components
    ├── Composants de formulaire
    ├── Composants de liste
    ├── Composants de navigation
    └── Stores globaux
```

**Architecture 4 couches Alpine** :
1. **Données** : État local et props
2. **Computed** : Propriétés calculées
3. **Méthodes** : Actions et mutations
4. **Cycle de vie** : init(), destroy()

### 5. Services (S) - Couche Métier
**Responsabilité** : Logique métier et orchestration complexe

```
BaseService (classe abstraite)
    ├── PersonnageService
    ├── PdfService
    ├── DocumentFactory
    └── SystemThemeService
```

**Caractéristiques** :
- Séparation complète de la logique métier
- Réutilisable entre controllers
- Testable indépendamment
- Injection de dépendances

## Flux de Données dans MVC-CS

### Flux Synchrone (Rendu Initial)
```
1. Requête HTTP
    ↓
2. Controller (routage)
    ↓
3. Service (logique métier)
    ↓
4. Model (données)
    ↓
5. View (rendu EJS)
    ↓
6. Response HTML
```

### Flux Asynchrone (Interactions)
```
1. Action utilisateur
    ↓
2. Component Alpine.js
    ↓
3. Appel API (fetch)
    ↓
4. Controller API
    ↓
5. Service
    ↓
6. Model
    ↓
7. Response JSON
    ↓
8. Component (mise à jour réactive)
```

## Avantages du Pattern MVC-CS

### 1. Séparation des Responsabilités
- **Models** : Uniquement les données
- **Views** : Uniquement la structure
- **Controllers** : Uniquement le routage
- **Components** : Uniquement l'interactivité UI
- **Services** : Uniquement la logique métier

### 2. Testabilité
- Services testables sans HTTP
- Components testables sans serveur
- Models testables sans UI
- Controllers testables avec mocks

### 3. Scalabilité
- Ajout facile de nouveaux services
- Extension des components sans impact backend
- Nouveaux modèles sans refactoring

### 4. Performance
- Rendu serveur pour le contenu initial
- Réactivité client pour les interactions
- Lazy loading des components
- Cache intelligent multi-niveaux

## Implémentation dans brumisater

### Structure des Fichiers
```
src/
├── models/           # Couche M
│   ├── base/
│   └── *.model.js
├── views/           # Couche V
│   ├── layouts/
│   ├── partials/
│   └── pages/
├── controllers/     # Couche C (backend)
│   ├── base/
│   └── *.controller.js
├── services/        # Couche S
│   ├── base/
│   └── *.service.js
└── public/
    └── js/
        └── components/  # Couche C (frontend)
```

### Exemple Concret : Création de Personnage

#### 1. Component (déclencheur)
```javascript
// public/js/components/form-personnage.js
function formPersonnage() {
    return {
        donnees: {},
        async sauvegarder() {
            const response = await fetch('/api/personnages', {
                method: 'POST',
                body: JSON.stringify(this.donnees)
            });
        }
    };
}
```

#### 2. Controller (routage)
```javascript
// src/controllers/personnage.controller.js
class PersonnageController extends BaseController {
    async creer(req, res) {
        const service = new PersonnageService();
        const resultat = await service.creer(req.body);
        this.sendSuccess(res, resultat);
    }
}
```

#### 3. Service (logique)
```javascript
// src/services/personnage.service.js
class PersonnageService extends BaseService {
    async creer(donnees) {
        // Validation métier
        // Transformation
        // Orchestration
        return await Personnage.create(donnees);
    }
}
```

#### 4. Model (données)
```javascript
// src/models/personnage.model.js
class Personnage extends BaseModel {
    static async create(donnees) {
        // Interaction DB
        return await this.query(sql, params);
    }
}
```

## Principes SOLID dans MVC-CS

### Single Responsibility
- Chaque couche a une responsabilité unique
- Chaque classe dans sa couche a un rôle précis

### Open/Closed
- Extension via nouveaux services/components
- Pas de modification des classes de base

### Liskov Substitution
- Tous les controllers héritent de BaseController
- Tous les services héritent de BaseService

### Interface Segregation
- Interfaces spécifiques par type (CRUD, Auth, PDF)
- Pas d'interface monolithique

### Dependency Inversion
- Controllers dépendent d'abstractions (services)
- Services dépendent d'abstractions (models)

## Evolution Future

### Court Terme
- TypeScript pour typage fort
- Tests d'intégration automatisés
- Documentation OpenAPI

### Moyen Terme
- WebSockets pour temps réel
- Workers pour tâches lourdes
- Cache Redis distribué

### Long Terme
- Microservices pour scaling
- GraphQL pour API flexible
- SSR avec framework moderne

## Conclusion

Le pattern **MVC-CS** représente une évolution mature du MVC traditionnel, adaptée aux besoins des applications web modernes. Il combine :

- La **robustesse** du MVC côté serveur
- La **réactivité** des components côté client
- La **maintenabilité** des services métier

Cette architecture permet à brumisater d'offrir une expérience utilisateur riche tout en maintenant une base de code claire, testable et évolutive.