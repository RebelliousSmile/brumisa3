# Task - Schema Prisma pour Système de Traductions Multi-Niveaux

## Métadonnées

- **ID**: TASK-2025-01-20-021
- **Date de création**: 2025-01-20
- **Créé par**: Claude (ana2task)
- **Priorité**: Haute
- **Statut**: À faire
- **Temps estimé**: 3h
- **Temps réel**: -

## Description

### Objectif

Créer le schéma Prisma pour le système de traductions multi-niveaux avec héritage en cascade (System → Hack → Playspace/Universe), tout en préservant la compatibilité avec @nuxtjs/i18n pour l'internationalisation classique FR/EN.

### Contexte

Le projet nécessite deux systèmes de traductions complémentaires :
- **@nuxtjs/i18n** : Internationalisation classique de l'UI (FR/EN/ES...)
- **Système multi-niveaux** : Personnalisation terminologique par contexte de jeu

Le système multi-niveaux permet de surcharger la terminologie à 3 niveaux :
1. **SYSTEM** : Terminologie de base (ex: "Tags", "Themes")
2. **HACK** : Adaptation thématique (ex: "Power Tags" pour LITM, "Gift Tags" pour Otherscape)
3. **UNIVERSE/PLAYSPACE** : Customisation narrative spécifique

### Périmètre

**Inclus dans cette tâche**:
- Création du modèle `TranslationEntry` unifié
- Création des modèles `System` et `Hack`
- Extension du modèle `Playspace` existant
- Enums `TranslationLevel` et `TranslationCategory`
- Migration Prisma avec index optimisés
- Support de la colonne `locale` pour FR/EN

**Exclu de cette tâche** (à traiter séparément):
- Service de résolution des traductions (TASK-022)
- API Routes (TASK-023)
- Composable Vue (TASK-024)
- Seeds de données de test (TASK-025)

## Spécifications Techniques

### Stack & Technologies

- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Langage**: TypeScript
- **Framework**: Nuxt 4

### Architecture

Modèle unifié au lieu de 3 tables séparées pour optimiser les performances :

```
TranslationEntry (table unique)
├── id, key, value, locale, category, description
├── level (SYSTEM / HACK / UNIVERSE)
├── priority (1/2/3)
└── Relations polymorphiques (systemId, hackId, universeId)

System (métadonnées)
├── code (ex: "city-of-mist", "litm")
├── name, version
└── translations[]

Hack (métadonnées)
├── code (ex: "cyberpunk-city")
├── systemId
└── translations[]

Playspace (extension)
├── systemId (nouveau)
├── hackId (nouveau, optionnel)
└── translations[]
```

### Fichiers Concernés

**Nouveaux fichiers**:
- [ ] `prisma/migrations/YYYYMMDDHHMMSS_add_translation_system/migration.sql` - Migration Prisma

**Fichiers à modifier**:
- [ ] `prisma/schema.prisma` - Ajout des modèles System, Hack, TranslationEntry et extension de Playspace

## Plan d'Implémentation

### Étape 1: Définir les Enums

**Objectif**: Créer les enums TypeScript-safe pour niveaux et catégories

**Actions**:
- [ ] Créer enum `TranslationLevel` (SYSTEM, HACK, UNIVERSE)
- [ ] Créer enum `TranslationCategory` (CHARACTER, PLAYSPACE, GAME_MECHANICS, UI, THEMES, MOVES, STATUSES)
- [ ] Documenter l'usage de chaque catégorie

**Fichiers**: `prisma/schema.prisma`

**Critères de validation**:
- Les enums sont définis dans le schema
- Les valeurs sont explicites et documentées

### Étape 2: Créer le Modèle Unifié TranslationEntry

**Objectif**: Table unique pour les 3 niveaux avec polymorphisme

**Actions**:
- [ ] Définir les champs `id`, `key`, `value`, `locale`, `category`, `description`
- [ ] Ajouter `level` (TranslationLevel) et `priority` (Int)
- [ ] Ajouter relations polymorphiques `systemId`, `hackId`, `universeId` (nullable)
- [ ] Définir contrainte unique `@@unique([key, locale, category, systemId, hackId, universeId])`
- [ ] Créer index composites pour performance

**Fichiers**: `prisma/schema.prisma`

**Critères de validation**:
- Le modèle compile sans erreur
- Les contraintes d'unicité sont correctes
- Les index sont optimisés pour les requêtes de résolution

### Étape 3: Créer les Modèles System et Hack

**Objectif**: Métadonnées pour les systèmes et hacks de jeu

**Actions**:
- [ ] Créer `System` avec `code` (unique), `name`, `version`
- [ ] Créer `Hack` avec `code` (unique), `systemId`, `name`, `version`, `description`
- [ ] Définir les relations `System.translations[]` et `Hack.translations[]`
- [ ] Définir la relation `Hack.system` → `System`
- [ ] Ajouter `System.hacks[]` et `System.playspaces[]`

**Fichiers**: `prisma/schema.prisma`

**Critères de validation**:
- Les modèles sont cohérents
- Les relations bidirectionnelles fonctionnent
- Le code système est unique (index)

### Étape 4: Étendre le Modèle Playspace

**Objectif**: Ajouter systemId et hackId au Playspace existant

**Actions**:
- [ ] Ajouter champ `systemId` (String, required)
- [ ] Ajouter champ `hackId` (String?, optionnel)
- [ ] Créer relation `Playspace.system` → `System`
- [ ] Créer relation `Playspace.hack` → `Hack` (optionnel)
- [ ] Ajouter relation `Playspace.translations[]`

**Fichiers**: `prisma/schema.prisma`

**Critères de validation**:
- Le modèle Playspace existant n'est pas cassé
- Les nouvelles relations fonctionnent
- hackId peut être null (non obligatoire)

### Étape 5: Créer la Migration

**Objectif**: Générer la migration Prisma

**Actions**:
- [ ] Exécuter `pnpm prisma migrate dev --name add_translation_system`
- [ ] Vérifier la migration générée
- [ ] Tester rollback puis migrate à nouveau
- [ ] Générer le client Prisma avec `pnpm prisma generate`

**Fichiers**: `prisma/migrations/`, client Prisma généré

**Critères de validation**:
- La migration s'exécute sans erreur
- Les tables sont créées dans PostgreSQL
- Le client Prisma TypeScript inclut les nouveaux modèles
- Les index sont créés correctement

### Étape 6: Documenter le Schéma

**Objectif**: Ajouter documentation inline dans schema.prisma

**Actions**:
- [ ] Documenter chaque modèle avec `/// Description`
- [ ] Documenter les champs critiques
- [ ] Expliquer la stratégie d'index
- [ ] Ajouter exemples de requêtes commentés

**Fichiers**: `prisma/schema.prisma`

**Critères de validation**:
- Chaque modèle a un commentaire de documentation
- Les champs complexes sont expliqués
- Les contraintes sont justifiées

## Tests

### Tests Unitaires

- [ ] Pas de tests unitaires pour le schema Prisma (validé par migration)

### Tests d'Intégration

- [ ] Test de création d'un System
- [ ] Test de création d'un Hack lié à un System
- [ ] Test de création d'un Playspace avec system et hack
- [ ] Test de création de TranslationEntry pour chaque niveau
- [ ] Test des contraintes d'unicité (tentative de doublon)
- [ ] Test de cascade delete (suppression System → Hack → Translations)

### Tests Manuels

- [ ] Vérifier les tables dans PostgreSQL avec `psql` ou PgAdmin
- [ ] Vérifier les types TypeScript générés
- [ ] Tester l'autocomplétion dans VSCode

## Dépendances

### Bloqueurs

Aucun bloqueur - cette tâche est un prérequis pour les suivantes

### Dépendances Externes

- [ ] PostgreSQL déjà installé et configuré
- [ ] Prisma CLI déjà installé (`@prisma/client`, `prisma`)
- [ ] Variable `DATABASE_URL` configurée dans `.env`

### Tâches Liées

- **TASK-2025-01-20-022** : Dépend de cette tâche (service résolution)
- **TASK-2025-01-20-023** : Dépend de cette tâche (API routes)
- **TASK-2025-01-20-025** : Dépend de cette tâche (seeds)
- **TASK-2025-01-19-001** : Configuration i18n classique (déjà terminée)

## Critères d'Acceptation

- [ ] Le code respecte les principes SOLID et DRY
- [ ] Le schéma compile sans erreur Prisma
- [ ] La migration s'exécute sans erreur
- [ ] Les index sont optimisés pour les requêtes de résolution
- [ ] Les contraintes d'unicité empêchent les doublons
- [ ] La documentation inline est complète
- [ ] Le client TypeScript généré est correct
- [ ] Les relations bidirectionnelles fonctionnent
- [ ] La colonne `locale` supporte FR/EN
- [ ] Le modèle `Playspace` existant n'est pas cassé

## Risques & Contraintes

### Risques Identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Conflit avec schema Playspace existant | Élevé | Moyen | Vérifier le schema actuel, faire backup DB avant migration |
| Migration échoue sur DB production | Élevé | Faible | Tester en dev d'abord, prévoir rollback plan |
| Index mal optimisés → performance | Moyen | Moyen | Benchmarker avec EXPLAIN ANALYZE après création |
| Contrainte unique trop stricte | Faible | Moyen | Valider les cas d'usage avec PO avant migration |

### Contraintes

- **Technique**: Doit être compatible Prisma 5+, PostgreSQL 14+
- **Temporelle**: Maximum 3h (schema simple, pas de logique métier)
- **Ressources**: Accès PostgreSQL requis pour tests
- **Compatibilité**: Ne doit pas casser les playspaces existants

## Documentation

### Documentation à Créer

- [ ] Commentaires inline dans `schema.prisma`
- [ ] Exemples de requêtes dans `documentation/ARCHITECTURE/11-systeme-traductions-multi-niveaux.md` (déjà existant)

### Documentation à Mettre à Jour

- [ ] `documentation/ARCHITECTURE/11-systeme-traductions-multi-niveaux.md` - Confirmer l'implémentation finale
- [ ] `README.md` - Si pertinent (optionnel)

## Revue & Validation

### Checklist avant Review

- [ ] Le schema compile (`pnpm prisma format && pnpm prisma validate`)
- [ ] La migration s'exécute (`pnpm prisma migrate dev`)
- [ ] Le client génère sans erreur (`pnpm prisma generate`)
- [ ] Les types TypeScript sont corrects
- [ ] Les index PostgreSQL sont créés

### Reviewers

- [ ] Technical Architect (validation architecture)
- [ ] Senior Code Reviewer (validation schema)
- [ ] Product Owner (validation modèle métier)

### Critères de Validation

- [ ] Schema review approuvé
- [ ] Tests d'intégration passent
- [ ] Documentation vérifiée
- [ ] Performance acceptable (< 50ms pour résolution)

## Notes de Développement

### Décisions Techniques

**2025-01-20**: Choix d'un modèle unifié `TranslationEntry` au lieu de 3 tables
- **Raison**: Performance (1 requête au lieu de 3), simplicité, maintenabilité
- **Alternative rejetée**: 3 tables séparées (SystemTranslation, HackTranslation, UniverseTranslation)

**2025-01-20**: Ajout de la colonne `locale` pour supporter FR/EN dans les labels de jeu
- **Raison**: Même les labels de jeu personnalisés doivent être traduits
- **Impact**: Chaque traduction doit être saisie en FR et EN

**2025-01-20**: Utilisation de relations polymorphiques (systemId, hackId, universeId)
- **Raison**: Flexibilité, une table pour 3 niveaux
- **Contrainte**: Une seule relation active par entrée (validée par contrainte unique)

### Problèmes Rencontrés

(À remplir pendant l'implémentation)

### Questions & Réponses

**Q**: Faut-il supporter plus de 2 locales (FR/EN) ?
**R**: Le schema supporte n'importe quelle locale (String). FR/EN sont les priorités MVP, ES/DE peuvent être ajoutés plus tard sans migration.

**Q**: Que se passe-t-il si on supprime un System ?
**R**: Cascade delete grâce à `onDelete: Cascade` → Toutes les traductions System sont supprimées

**Q**: Comment gérer les playspaces existants sans systemId ?
**R**: Migration de données (TASK-025) : assigner un systemId par défaut ou créer un wizard

## Résultat Final

(À remplir une fois la tâche terminée)

### Ce qui a été accompli

- [À remplir]

### Déviations par rapport au plan initial

[À remplir]

### Prochaines Étapes Suggérées

- Passer à TASK-2025-01-20-022 (Service de résolution)
- Passer à TASK-2025-01-20-025 (Seeds de test)

## Références

- [Documentation Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Documentation Prisma Indexes](https://www.prisma.io/docs/concepts/components/prisma-schema/indexes)
- `documentation/ARCHITECTURE/11-systeme-traductions-multi-niveaux.md` - Architecture complète
