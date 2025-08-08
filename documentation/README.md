# Documentation brumisater

**Créateur de fiches de personnages JDR immersives et professionnelles**

## 🚀 Démarrage rapide

### Pour les nouveaux développeurs
1. **Installation** → [`DEVELOPPEMENT/quickstart.md`](DEVELOPPEMENT/quickstart.md) - Configurez rapidement votre environnement
2. **Concepts fondamentaux** → [`ARCHITECTURE/architecture-overview.md`](ARCHITECTURE/architecture-overview.md) - Comprenez l'architecture MVC-CS
3. **Systèmes JDR** → [`SYSTEMES-JDR/systemes-configuration.md`](SYSTEMES-JDR/systemes-configuration.md) - Découvrez les 5 jeux supportés
4. **API** → [`api.md`](api.md) - Utilisez l'API REST pour intégrer le système

### Pour les contributeurs expérimentés
- **Pattern MVC-CS** → [`ARCHITECTURE/architecture-pattern.md`](ARCHITECTURE/architecture-pattern.md) - Architecture détaillée
- **Modèles de données** → [`ARCHITECTURE/architecture-models.md`](ARCHITECTURE/architecture-models.md)
- **Tests** → [`testing.md`](testing.md) - Stratégies de test Jest et Supertest
- **API complète** → [`api.md`](api.md) - Référence détaillée des endpoints

---

## 📚 Organisation de la documentation

### 🏗️ **ARCHITECTURE/** - Structure technique
- **`architecture-overview.md`** - Vue d'ensemble MVC-CS et concepts clés (6 types de documents)
- **`architecture-pattern.md`** - Pattern MVC-CS détaillé (Models, Views, Controllers, Components, Services)
- **`architecture-models.md`** - Modèles de données et relations PostgreSQL
- **`architecture-frontend.md`** - Composants Alpine.js et vues EJS
- **`architecture-avancee.md`** - Fonctionnalités avancées et optimisations

### 🎮 **SYSTEMES-JDR/** - Jeux de rôle supportés
- **`systemes-configuration.md`** - Configuration des 5 systèmes + types de données
- **`systemes-interfaces.md`** - Pages et layouts spécifiques par système

### 📋 **FONCTIONNALITES/** - Fonctionnalités métier
- **`01-vision-produit.md`** - Vision produit et personas utilisateur
- **`02-creation-documents.md`** - Création et gestion des documents
- **`03-gestion-personnages.md`** - Sauvegarde et gestion des personnages
- **`04-oracles.md`** - Système d'oracles et génération aléatoire
- **`05-partage-communaute.md`** - Système de votes et modération communautaire
- **`06-administration.md`** - Dashboard admin et outils de modération
- **`07-temoignages.md`** - Système de témoignages utilisateur
- **`08-systeme-premium.md`** - Fonctionnalités premium et monétisation
- **`09-gestion-compte.md`** - Gestion comptes et conformité RGPD

### 🎨 **DESIGN-SYSTEM/** - Charte graphique
- **`design-system-guide.md`** - Guide complet du design system avec composants UI (Phase 4)
- **`charte-graphique-web.md`** - Design système pour l'interface web (CSS, Tailwind)
- **`charte-graphique-pdf.md`** - Règles générales PDF (PDFKit, impression)
- **`charte-graphique-monsterhearts-pdf.md`** - Spécificités gothique/romantique (violet/rose)
- **`charte-graphique-engrenages-pdf.md`** - Spécificités steampunk victorien (émeraude/cuivre)
- **`charte-graphique-metro2033-pdf.md`** - Spécificités post-apocalyptique (rouge/gris)
- **`charte-graphique-zombiology-pdf.md`** - Spécificités survival horror (jaune/rouge)
- **`ux-mobile-first.md`** - Approche mobile-first et responsive design

### 🛠️ **DEVELOPPEMENT/** - Guides techniques
- **`quickstart.md`** - Guide de démarrage rapide (installation, configuration, tests)
- **`development-strategy.md`** - Stratégie de développement et patterns MVC-CS
- **`testing.md`** - Guide des tests unitaires et d'intégration (Phase 5)
- **`administration-technique.md`** - Dashboard admin et fonctionnalités d'administration
- **`commandes-windows.md`** - Commandes PowerShell et environnement Windows
- **`flux-generation-pdf.md`** - Processus complet de génération PDF avec DocumentFactory
- **`pdfkit.md`** - Architecture PDFKit et templates programmatiques
- **`deployment-production.md`** - Déploiement et configuration production
- **`phase6-production-guide.md`** - Guide optimisations performance et production (Phase 6)
- **`jsdoc-integration.md`** - Documentation automatique du code
- **`envoi-emails.md`** - Configuration email et notifications

### 📸 **Documentation transversale**
- **`api.md`** - Référence complète de l'API REST
- **`RELATIONS.md`** - Documentation des relations entre modèles (Phase 2)
- **`RESSOURCES/captures/`** - Screenshots et images de documentation
- **`RESSOURCES/templates/`** - Templates HTML pour les différents documents

---

## 🎯 Concepts fondamentaux

### Document vs Personnage
- **Document** : PDF généré (types: CHARACTER, TOWN, GROUP, ORGANIZATION, DANGER)
- **Personnage** : Données sauvegardées par un utilisateur connecté
- **Guest** : Utilisateur anonyme, peut créer des documents mais pas les retrouver

### Architecture MVC-CS
- **Models** : BaseModel + spécialisations (Utilisateur, Document, Personnage, PDF)
- **Views** : Templates EJS avec layouts thématiques
- **Controllers** : Routage Express.js avec validation
- **Components** : Composants Alpine.js réactifs
- **Services** : Logique métier et orchestration

### 6 Types de Documents
1. **CHARACTER** : Feuilles de personnage (tous systèmes)
2. **TOWN** : Cadres de ville (Monsterhearts)
3. **GROUP** : Plans de classe (Monsterhearts) 
4. **ORGANIZATION** : Listes de PNJs (tous systèmes)
5. **DANGER** : Fronts et dangers (Mist Engine)
6. **GENERIQUE** : Documents libres avec structure flexible (tous systèmes)

### 5 Systèmes JDR Supportés
- **Monsterhearts** : Romance gothique, PbtA
- **Engrenages (Roue du Temps)** : Steampunk, pool d10
- **Metro 2033** : Post-apocalyptique, d20
- **Mist Engine** : Narratif mystique, d6
- **Zombiology** : Survie zombie, d100

---

## 🔍 Index des concepts

| Concept | Fichier principal | Détails supplémentaires |
|---------|------------------|------------------------|
| **Alpine.js** | `ARCHITECTURE/architecture-frontend.md` | Composants, état, réactivité |
| **Architecture MVC-CS** | `ARCHITECTURE/architecture-pattern.md` | Models, Views, Controllers, Components, Services |
| **Authentification** | `ARCHITECTURE/architecture-models.md` | Sessions, rôles, codes d'accès |
| **BaseModel** | `ARCHITECTURE/architecture-models.md` | CRUD, validation, hooks |
| **Cache & Performance** | `DEVELOPPEMENT/phase6-production-guide.md` | CacheService, QueueService, monitoring |
| **Design System** | `DESIGN-SYSTEM/design-system-guide.md` | Composants UI, variables CSS, thèmes |
| **Déploiement** | `DEVELOPPEMENT/deployment-production.md` | Production, environnement, SSL |
| **Documents PDF** | `DEVELOPPEMENT/flux-generation-pdf.md` | 6 types, 5 thèmes, DocumentFactory |
| **EJS Templates** | `ARCHITECTURE/architecture-frontend.md` | Layouts, vues, composants UI |
| **Génération PDF** | `DEVELOPPEMENT/pdfkit.md` | PDFKit, templates programmatiques |
| **Modération** | `FONCTIONNALITES/05-partage-communaute.md` | Workflow a posteriori, traçabilité |
| **Oracles** | `FONCTIONNALITES/04-oracles.md` | Tables aléatoires, générateurs |
| **PostgreSQL** | `ARCHITECTURE/architecture-models.md` | 16 modèles, relations, contraintes |
| **RGPD** | `FONCTIONNALITES/09-gestion-compte.md` | Consentements, export données |
| **Services métier** | `ARCHITECTURE/architecture-models.md` | 20+ services avec logique business |
| **Systèmes JDR** | `SYSTEMES-JDR/systemes-configuration.md` | 5 systèmes supportés |
| **Tests** | `DEVELOPPEMENT/testing.md` | Jest, Supertest, couverture > 80% |
| **Votes communauté** | `FONCTIONNALITES/05-partage-communaute.md` | 3 critères, statistiques |

---

## 🛟 Aide et support

### Problèmes fréquents
- **Erreur génération PDF** → [`DEVELOPPEMENT/flux-generation-pdf.md`](DEVELOPPEMENT/flux-generation-pdf.md) (section gestion d'erreurs)
- **Configuration système JDR** → [`SYSTEMES-JDR/systemes-configuration.md`](SYSTEMES-JDR/systemes-configuration.md) (section contribution)
- **Commandes développement** → [`DEVELOPPEMENT/commandes-windows.md`](DEVELOPPEMENT/commandes-windows.md)

### Scripts utiles
```bash
# Tests PDFKit
node scripts/test-base-pdfkit.js

# Génération documentation  
npm run docs

# Déploiement
npm run deploy:production
```

---

*Documentation mise à jour le : 2025-08-08 - Version MVC-CS complète - Toutes phases terminées (1-6) avec production-ready*