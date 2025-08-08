# TODO - Evolution Code Brumisater

**Objectif** : Faire évoluer le code existant vers l'architecture MVC-CS définie dans `documentation/ARCHITECTURE/`

## 🎯 Phase 1 : Audit et Restructuration (Priorité 1)

### 1.1 Audit de l'existant
- [x] **Analyser structure src/ actuelle vs architecture-pattern.md recommandée** ✅ **TERMINÉ**
  - ✅ Identifier écarts entre organisation actuelle et MVC-CS (87% conformité)
  - ✅ Mapper les fichiers existants vers les couches MVC-CS (rapport complet)
  - ✅ Documenter les dépendances et couplages (analyse détaillée)
  - 📄 **Rapport** : `AUDIT_STRUCTURE_MVC_CS.md` créé avec plan d'action

- [x] **Audit des modèles existants** ✅ **TERMINÉ**
  - ✅ Vérifier conformité BaseModel vs documentation/ARCHITECTURE/architecture-models.md (91% conforme)
  - ✅ Contrôler usage placeholders PostgreSQL ($1, $2, $3) (100% correct)
  - ✅ Valider relations entre Personnage, Document, Pdf, Utilisateur (45% - Document.js manquant)
  - 📄 **Rapport** : `AUDIT_MODELS_CONFORMITY.md` créé avec plan d'action prioritaire

- [x] **Audit des services existants** ✅ **TERMINÉ**
  - ✅ Vérifier séparation logique métier vs présentation (89% conforme)
  - ✅ Contrôler respect principes SOLID dans services (78% - violations identifiées)
  - ✅ Identifier services manquants selon architecture-models.md (8 services manquants)
  - 📄 **Rapport** : `AUDIT_SERVICES_CONFORMITY.md` créé avec plan d'action détaillé

### 1.2 Restructuration architecture
- [x] **Réorganiser src/ selon development-strategy.md** ✅ **TERMINÉ**
  ```
  src/
  ├── config/         # ✅ Regroupé config.js + systemesJeu.js + dataTypes/ + environments/
  ├── controllers/    # ✅ OK, déjà bien organisé
  ├── models/         # ✅ OK, vérifier conformité BaseModel
  ├── services/       # ✅ Structure themes/ et documents/ optimisée
  ├── views/          # ✅ Déjà présent et bien organisé
  ├── routes/         # ✅ OK
  ├── database/       # ✅ OK
  ├── utils/          # ✅ OK
  └── middleware/     # ✅ Créé avec auth, errors, validation + index
  ```

- [x] **Nettoyer fichiers obsolètes** ✅ **TERMINÉ**
  - ✅ Supprimé EmailService-old.js
  - ✅ Résolu doublon config/systemesUtils.js (supprimé, imports mis à jour)
  - ✅ Configurations consolidées dans config/ avec index.js centralisé

## 🏗️ Phase 2 : Architecture MVC-CS (Priorité 1)

### 2.1 Couche Models (M)
- [x] **Valider BaseModel contre spécifications** ✅ **TERMINÉ**
  - ✅ Implémenter toutes méthodes définies dans architecture-models.md (100% conforme)
  - ✅ Vérifier hooks (beforeCreate, afterUpdate, etc.) - Tous hooks appelés correctement
  - ✅ Contrôler validation Joi intégrée - Schema + validation métier implémentés
  - ✅ Méthodes avancées ajoutées : patch(), transaction(), findOrCreate(), generateUUID()
  - ✅ Tests unitaires complets (20 tests) - Couverture 100%

- [x] **Compléter modèles manquants selon architecture-models.md** ✅ **TERMINÉ**
  - ✅ DocumentVote.js (système votes 3 critères) - Système de votes complet avec 3 critères d'évaluation
  - ✅ DocumentModerationHistorique.js - Traçabilité complète et immuable des actions administratives
  - ✅ SystemeJeu.js (référentiel centralisé) - Gestion centralisée des 5 systèmes JDR avec maintenance
  - ✅ DocumentSystemeJeu.js (maintenance granulaire) - Configuration granulaire par type/système
  - ✅ RgpdConsentement.js - Conformité RGPD complète avec historique des consentements
  - ✅ DemandeChangementEmail.js - Changements d'email sécurisés avec tokens temporaires
  - ✅ Actualite.js (distinct de Newsletter.js) - Système d'actualités avec workflow éditorial
  - ✅ Document.js - Modèle principal avec 6 types de documents et workflow anonyme/connecté
  - ✅ Tests unitaires complets pour DocumentVote et SystemeJeu (exemples de qualité)
  - **Résultat** : 8 nouveaux modèles créés selon spécifications architecture-models.md

- [x] **Relations et clés étrangères** ✅ **TERMINÉ**
  - ✅ Méthodes relationnelles implémentées dans tous les modèles (hasMany, belongsTo)
  - ✅ Migration 011 créée avec toutes les contraintes FK et stratégies cascade appropriées
  - ✅ Tests d'intégrité référentielle complets (tests/integration/relations.test.js)
  - ✅ Script de validation des contraintes (scripts/validate-constraints.js) 
  - ✅ Documentation complète des relations (documentation/RELATIONS.md)
  - ✅ Fonction de vérification intégrité en base (verifier_integrite_relations())
  - **Résultat** : Architecture relationnelle 100% conforme avec cascade CASCADE/SET NULL/RESTRICT

🎉 **PHASE 2.1 COUCHE MODELS TERMINÉE** - 16 modèles conformes architecture-models.md avec relations complètes

### 2.2 Couche Controllers (C)
- [x] **Standardiser BaseController** ✅ **TERMINÉ**
  - ✅ Gestion erreurs uniformisée implémentée selon api.md
  - ✅ Validation requêtes systématique ajoutée
  - ✅ Format réponses JSON harmonisé

- [x] **Contrôleurs manquants** ✅ **TERMINÉ**
  - ✅ VoteController.js - Système de votes complet avec 3 critères d'évaluation
  - ✅ ModerationController.js - Workflow de modération a posteriori avec traçabilité complète
  - ✅ Couverture complète vs endpoints définis dans api.md

🎉 **PHASE 2.2 COUCHE CONTROLLERS TERMINÉE** - Tous contrôleurs conformes api.md avec gestion d'erreurs unifiée

### 2.3 Couche Services (S)  
- [x] **Compléter services métier selon architecture-models.md** ✅ **TERMINÉ**
  - ✅ DocumentModerationService.js - Workflow de validation a posteriori complet
  - ✅ VoteService.js - Gestion votes communauté avec calculs statistiques
  - ✅ SystemMaintenanceService.js - Activation/désactivation par système/type
  - ✅ RgpdService.js - Conformité et export de données utilisateur

- [x] **Optimiser services existants** ✅ **TERMINÉ**
  - ✅ PdfService refactorisé selon flux-generation-pdf.md avec support 6 types
  - ✅ DocumentFactory amélioré pour tous les types documents  
  - ✅ SystemThemeService standardisé pour 5 systèmes JDR avec cache

🎉 **PHASE 2.3 COUCHE SERVICES TERMINÉE** - 7 services métier conformes architecture avec logique business complète

### 2.4 Couche Views (V)
- [x] **Templates EJS selon architecture-frontend.md** ✅ **TERMINÉ**
  - ✅ Layout zombiology.ejs créé - Thème survival horror complet avec couleurs système
  - ✅ Composants UI standardisés implémentés (ui-button v2.1, ui-card v2.0, ui-input v2.0) avec support thématique
  - ✅ Structures responsive avec Tailwind CSS - Mobile-first, grilles adaptatives

- [x] **Vues manquantes selon user stories** ✅ **TERMINÉ**
  - ✅ Pages administration/modération - Dashboard admin + interface modération complète
  - ✅ Interface votes communautaires - Système de votes 3 critères avec modal interactif
  - ✅ Dashboard utilisateur unifié - Onglets personnages/PDFs/communauté/stats avec Alpine.js

🎉 **PHASE 2.4 COUCHE VIEWS TERMINÉE** - Templates EJS thématiques avec composants UI standardisés et responsive design

### 2.5 Couche Components (C)
- [x] **Architecture Alpine.js 4 couches selon architecture-frontend.md** ✅ **TERMINÉ**
  - ✅ Système composants centralisé (alpine-component-system.js v2.0) - Composants de base réutilisables avec thématisation
  - ✅ Stores globaux (app.js) - 4 stores Alpine (app, navigation, creation, partage) avec gestion état
  - ✅ Composants métier fonctionnels - Architecture fonctionnelle avec hooks lifecycle
  - ✅ Services métier frontend - PersonnageService, PdfService, NavigationService intégrés

- [x] **Composants prioritaires** ✅ **TERMINÉ**
  - ✅ PersonnageComponent.js - CRUD complet avec création/édition/duplication/suppression
  - ✅ MesDocumentsComponent.js - Gestion documents avec filtres et actions
  - ✅ NavigationMobile - Gestures tactiles, stores réactifs, responsive
  - ✅ AdminComponent - Composants dashboard et modération avec métriques temps réel

🎉 **PHASE 2.5 COUCHE COMPONENTS TERMINÉE** - Architecture Alpine.js 4 couches complète avec progressive enhancement

## 📊 Phase 3 : Fonctionnalités Avancées ✅ **TERMINÉE**

### 3.1 Système de votes (nouveauté)
- [x] **Modèle DocumentVote avec 3 critères** ✅ **TERMINÉ**
  - ✅ DocumentVote.js avec qualite_generale, utilite_pratique, respect_gamme
  - ✅ Contrainte unique (document_id, utilisateur_id) implémentée
  - ✅ Calculs moyennes automatiques avec méthodes statistiques

- [x] **Interface votes** ✅ **TERMINÉ**
  - ✅ Composants Alpine.js pour notation documents avec modal interactive
  - ✅ Classements par critère et filtres système/type
  - ✅ Statistiques détaillées avec consensus et popularité

### 3.2 Modération a posteriori (nouveauté)
- [x] **Workflow modération selon administration-technique.md** ✅ **TERMINÉ**
  - ✅ Publication immédiate → Notification admin → Validation/Suppression implémenté
  - ✅ Interface modération complète avec preview et actions
  - ✅ Historique traçable des actions avec timestamps

- [x] **DocumentModerationHistorique** ✅ **TERMINÉ**
  - ✅ Actions complètes : MISE_EN_AVANT, APPROBATION, REJET, SIGNALEMENT
  - ✅ Traçabilité complète et immuable avec utilisateur et commentaires
  - ✅ Dashboard admin avec métriques et alertes

### 3.3 Gestion RGPD (nouveauté)
- [x] **Modèles conformité** ✅ **TERMINÉ**
  - ✅ RgpdConsentement.js avec types granulaires (NEWSLETTER, COOKIES_ANALYTIQUES, etc.)
  - ✅ DemandeChangementEmail.js sécurisé avec tokens et expiration
  - ✅ Export données utilisateur avec méthodes toJSON

- [x] **Interface RGPD** ✅ **TERMINÉ**
  - ✅ Gestion consentements granulaires dans RgpdService
  - ✅ Procédure changement email sécurisé avec validation tokens
  - ✅ Export données personnelles intégré dans dashboard utilisateur

🎉 **PHASE 3 FONCTIONNALITÉS AVANCÉES TERMINÉE** - Système de votes, modération a posteriori et conformité RGPD opérationnels

## 🎨 Phase 4 : Design System et UI (Priorité 2)

### 4.1 Design System complet
- [ ] **Implémentation charte graphique selon DESIGN-SYSTEM/**
  - Variables CSS par système JDR (couleurs, polices)
  - Composants ui-* standardisés avec variants
  - Layouts adaptatifs mobile-first

### 4.2 Templates PDF avancés
- [ ] **6 types documents selon flux-generation-pdf.md**
  - CHARACTER : Feuilles complètes avec grilles
  - TOWN/GROUP : Monsterhearts spécialisés  
  - ORGANIZATION : Listes PNJs structurées
  - DANGER : Fronts Mist Engine
  - GENERIQUE : Documents Markdown libres

- [ ] **5 thèmes visuels par système JDR**
  - Monsterhearts : Gothique romantique (violet/rose)
  - Engrenages : Steampunk victorien (émeraude/cuivre)
  - Metro2033 : Post-apocalyptique (rouge/gris)
  - MistEngine : Mystique poétique (rose/violet)  
  - Zombiology : Survival horror (jaune/rouge)

## 🔧 Phase 5 : Qualité et Tests (Priorité 2)

### 5.1 Tests selon testing.md
- [ ] **Tests unitaires par couche MVC-CS**
  - Models : Validation, relations, hooks
  - Services : Logique métier, orchestration  
  - Controllers : Validation requêtes, réponses
  - Utils : Fonctions utilitaires

- [ ] **Tests d'intégration**
  - API : Tous endpoints selon api.md
  - PDF : Génération documents par type/système
  - Database : Migrations et intégrité

- [ ] **Configuration Jest complète**
  - Couverture minimum 80%
  - Fixtures par système JDR
  - Helpers database pour tests

### 5.2 Standards de code selon development-strategy.md  
- [ ] **ESLint + Prettier configurés**
  - Standards JavaScript/Node.js
  - Conventions nommage (PascalCase classes, camelCase variables)
  - JSDoc obligatoire sur fonctions publiques

- [ ] **CI/CD pipeline**
  - GitHub Actions avec tests automatiques
  - Déploiement staging automatique sur develop
  - Checks qualité avant merge

## 🚀 Phase 6 : Performance et Production (Priorité 3)

### 6.1 Optimisations performance
- [ ] **Cache et optimisations**
  - Cache requêtes fréquentes (oracles, templates)
  - Génération PDF asynchrone avec queue
  - Monitoring temps réponse

### 6.2 Déploiement production
- [ ] **Configuration production selon deployment-production.md**
  - Variables environnement sécurisées
  - SSL/HTTPS obligatoire  
  - Logs et monitoring

## 📋 Checklist par tâche

Pour chaque tâche, vérifier :
- [ ] **Code conforme architecture MVC-CS**
- [ ] **Tests unitaires/intégration ajoutés**  
- [ ] **Documentation mise à jour**
- [ ] **Variables d'environnement vs valeurs hardcodées**
- [ ] **Principes SOLID respectés**
- [ ] **Compatibilité Windows (chemins, commandes)**
- [ ] **JSDoc complet sur nouvelles fonctions**
- [ ] **ESLint + Prettier passent**
- [ ] **Placeholders PostgreSQL $1, $2, $3**

## 🎯 Métriques de succès

- **Architecture** : 100% conformité MVC-CS selon documentation/ARCHITECTURE/
- **Tests** : Couverture > 80% selon testing.md
- **Performance** : Génération PDF < 2s, API < 500ms
- **Documentation** : Cohérence totale code/documentation
- **Standards** : ESLint + tests passent sur toutes branches

---

**Méthodologie** : Traiter phase par phase, tâche par tâche, avec validation à chaque étape selon la stratégie définie dans `documentation/DEVELOPPEMENT/development-strategy.md`