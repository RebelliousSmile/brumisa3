# Task - Service Backend de Résolution de Traductions en Cascade

## Métadonnées

- **ID**: TASK-2025-01-20-022
- **Date de création**: 2025-01-20
- **Créé par**: Claude (ana2task)
- **Priorité**: Haute
- **Statut**: À faire
- **Temps estimé**: 4h
- **Temps réel**: -

## Description

### Objectif

Implémenter le service backend TypeScript de résolution des traductions en cascade (System → Hack → Universe) avec une performance cible de < 100ms sans cache et < 20ms avec cache.

### Contexte

Le service doit résoudre les traductions avec héritage en cascade :
- Niveau SYSTEM : Traductions de base
- Niveau HACK : Overrides thématiques
- Niveau UNIVERSE : Customisations playspace-spécifiques

**Algorithme** : 1 seule requête PostgreSQL avec OR + ORDER BY priority, puis résolution en mémoire.

### Périmètre

**Inclus dans cette tâche**:
- Service `resolveTranslations(context)` - Résolution en cascade
- Service `getTranslationHierarchy(key, context)` - Visualisation héritage
- Service `createOverride(key, value, context)` - Création override
- Service `removeOverride(key, context)` - Suppression override
- Logging de performance
- Validation des entrées avec erreurs explicites

**Exclu de cette tâche**:
- Cache Redis (optionnel, v1.1+)
- API Routes Nitro (TASK-023)
- Composable Vue (TASK-024)

## Spécifications Techniques

### Stack & Technologies

- **Framework**: Nuxt 4 / Nitro
- **Langage**: TypeScript
- **Base de données**: PostgreSQL + Prisma
- **Performance**: < 100ms cold, < 20ms avec cache client

### Architecture

```typescript
TranslationService
├── resolveTranslations(context) → ResolvedTranslations
├── getTranslationHierarchy(key, context) → HierarchyEntry[]
├── createOverride(key, value, context, desc?) → TranslationEntry
└── removeOverride(key, context) → { count }

Context = { systemId, hackId?, playspaceId?, category }
ResolvedTranslations = { [key]: { value, level, description } }
```

### Fichiers Concernés

**Nouveaux fichiers**:
- [ ] `server/services/translations.service.ts` - Service principal
- [ ] `server/types/translations.types.ts` - Types TypeScript

**Fichiers à modifier**:
Aucun (nouveau service isolé)

## Plan d'Implémentation

### Étape 1: Définir les Types TypeScript

**Actions**:
- [ ] Créer `TranslationContext` interface
- [ ] Créer `ResolvedTranslations` interface
- [ ] Créer `HierarchyEntry` interface
- [ ] Importer types Prisma (`TranslationCategory`, `TranslationLevel`)

**Fichiers**: `server/types/translations.types.ts`

### Étape 2: Implémenter resolveTranslations()

**Actions**:
- [ ] Construction dynamique du WHERE avec OR conditions
- [ ] Requête unique Prisma avec `orderBy: [{ priority: 'desc' }]`
- [ ] Résolution en mémoire avec Map (O(n))
- [ ] Logging performance avec console.info
- [ ] Warning si durée > 100ms

**Fichiers**: `server/services/translations.service.ts`

**Critères de validation**:
- Performance < 100ms en cold
- Les overrides écrasent correctement les niveaux inférieurs
- Les logs sont clairs

### Étape 3: Implémenter getTranslationHierarchy()

**Actions**:
- [ ] Récupérer toutes les entrées d'une clé spécifique
- [ ] Trier par `priority: 'asc'` (ordre hiérarchique)
- [ ] Retourner l'arbre avec métadonnées (level, isOverride, lastModified)

**Fichiers**: `server/services/translations.service.ts`

**Critères de validation**:
- L'arbre affiche tous les niveaux
- Le flag `isOverride` est correct

### Étape 4: Implémenter createOverride()

**Actions**:
- [ ] Validation : vérifier que la clé existe au niveau parent
- [ ] Calculer priority (2 pour HACK, 3 pour UNIVERSE)
- [ ] Upsert Prisma avec contrainte unique
- [ ] Gérer les erreurs (clé inexistante, permissions, etc.)

**Fichiers**: `server/services/translations.service.ts`

**Critères de validation**:
- Impossible de créer override sans parent
- L'upsert évite les doublons
- Les erreurs sont explicites

### Étape 5: Implémenter removeOverride()

**Actions**:
- [ ] Construire le WHERE clause (key, level, hackId/universeId)
- [ ] Delete Prisma avec `deleteMany`
- [ ] Retourner le count de suppressions

**Fichiers**: `server/services/translations.service.ts`

**Critères de validation**:
- La suppression retourne au niveau parent
- Impossible de supprimer niveau SYSTEM
- Le count est correct

### Étape 6: Tests Unitaires

**Actions**:
- [ ] Setup DB test avec données de seed
- [ ] Tester résolution simple (System only)
- [ ] Tester résolution avec overrides (Hack, Universe)
- [ ] Tester validation (clé inexistante)
- [ ] Tester performance (< 100ms)

**Fichiers**: `tests/services/translations.service.spec.ts`

## Tests

### Tests Unitaires

- [ ] Test `resolveTranslations()` - System only
- [ ] Test `resolveTranslations()` - Avec Hack override
- [ ] Test `resolveTranslations()` - Avec Universe override
- [ ] Test `getTranslationHierarchy()` - Arbre complet
- [ ] Test `createOverride()` - Création valide
- [ ] Test `createOverride()` - Erreur clé inexistante
- [ ] Test `removeOverride()` - Suppression valide
- [ ] Test performance < 100ms avec 100 clés

### Tests d'Intégration

- [ ] Test du flow complet : Create → Resolve → Remove → Resolve
- [ ] Test cascade delete : Suppression System supprime overrides

### Tests Manuels

- [ ] Logger les requêtes SQL générées
- [ ] Vérifier avec EXPLAIN ANALYZE PostgreSQL
- [ ] Tester avec Postman/curl les API routes (TASK-023)

## Dépendances

### Bloqueurs

- [ ] TASK-2025-01-20-021 (Schema Prisma) doit être terminé

### Dépendances Externes

- [ ] Prisma Client généré (`pnpm prisma generate`)
- [ ] Base de données PostgreSQL avec tables créées

### Tâches Liées

- **TASK-2025-01-20-021** : Bloqueur (schema Prisma)
- **TASK-2025-01-20-023** : Dépend de cette tâche (API routes)
- **TASK-2025-01-20-024** : Dépend de cette tâche (composable)

## Critères d'Acceptation

- [ ] Le code respecte SOLID (S = service unique responsabilité)
- [ ] Les tests passent avec succès (> 90% couverture)
- [ ] Performance < 100ms sans cache (validé par tests)
- [ ] Les erreurs sont gérées et explicites
- [ ] Le code suit les conventions TypeScript strictes
- [ ] Aucune requête N+1 (1 seule requête par résolution)
- [ ] Le logging permet de debugger facilement
- [ ] La validation empêche les états incohérents

## Risques & Contraintes

### Risques Identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Performance > 100ms avec bcp de clés | Moyen | Moyen | Index PostgreSQL optimisés, cache Redis si besoin |
| Requêtes Prisma complexes (OR, orderBy) | Faible | Faible | Tester avec EXPLAIN ANALYZE |
| Validation trop stricte | Faible | Moyen | Permettre création sans parent si level=SYSTEM |

### Contraintes

- **Technique**: Doit fonctionner avec Prisma 5+, Nitro server
- **Temporelle**: Maximum 4h
- **Performance**: < 100ms cold, < 20ms avec cache

## Documentation

### Documentation à Créer

- [ ] JSDoc complet pour chaque fonction
- [ ] Exemples d'usage dans commentaires
- [ ] Documentation des cas d'erreur

### Documentation à Mettre à Jour

- [ ] `documentation/ARCHITECTURE/11-systeme-traductions-multi-niveaux.md` - Section Service

## Revue & Validation

### Reviewers

- [ ] Technical Architect
- [ ] Senior Code Reviewer

## Références

- `documentation/ARCHITECTURE/11-systeme-traductions-multi-niveaux.md` - Architecture complète
- [Prisma findMany](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#findmany)
