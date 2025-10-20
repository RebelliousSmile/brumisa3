# Task - Composable useGameLabels pour Traductions de Jeu

## Métadonnées

- **ID**: TASK-2025-01-20-024
- **Date de création**: 2025-01-20
- **Créé par**: Claude (ana2task)
- **Priorité**: Haute
- **Statut**: À faire
- **Temps estimé**: 3h
- **Temps réel**: -

## Description

### Objectif

Créer le composable Vue `useGameLabels()` avec cache client pour les traductions de jeu personnalisables, distinct de `useI18n()` qui gère l'internationalisation classique FR/EN.

### Contexte

**Deux systèmes complémentaires** :
- `useI18n()` (@nuxtjs/i18n) : UI en FR/EN ("Sauvegarder", "Annuler")
- `useGameLabels()` (nouveau) : Labels de jeu ("Nom du Runner", "Gift Tags")

Le composable utilise automatiquement le playspace actif comme contexte.

### Périmètre

**Inclus**:
- Composable `useGameLabels(playspaceId?)`
- Fonction `t(key, category)` avec auto-loading
- Cache client (Map en mémoire, global partagé)
- Fonctions `loadCategory()`, `preloadCategories()`
- Fonctions `createOverride()`, `removeOverride()`
- Fonction `getHierarchy()` pour UI admin
- Invalidation cache `invalidateCache(category?)`

**Exclu**:
- Cache Redis (optionnel v1.1+)
- UI d'édition des traductions (v1.1+)

## Plan d'Implémentation

### Étape 1: Structure de Base

- Créer `composables/useGameLabels.ts`
- Définir types `TranslationCache`, `TranslationContext`
- Créer `ref` global `translationCache` et `loadingCategories`

### Étape 2: Fonction t() avec Auto-Loading

- Récupérer contexte depuis playspace actif
- Check cache hit
- Si miss : auto-load category
- Retourner valeur ou `[key]` si manquante

### Étape 3: Fonction loadCategory()

- Fetch `/api/translations/resolve` avec params
- Stocker dans cache
- Gérer loading state (éviter double-fetch)

### Étape 4: Fonctions CRUD

- `createOverride()` : POST `/api/translations/override` + invalidate cache
- `removeOverride()` : DELETE + invalidate
- `getHierarchy()` : GET `/api/translations/hierarchy`

### Étape 5: Tests Unitaires

- Mock playspace store
- Tester cache hit/miss
- Tester auto-loading
- Tester invalidation

## Fichiers Concernés

**Nouveaux fichiers**:
- [ ] `composables/useGameLabels.ts`
- [ ] `tests/composables/useGameLabels.spec.ts`

## Tests

- [ ] Test `t()` avec cache hit
- [ ] Test `t()` avec cache miss → auto-load
- [ ] Test `preloadCategories()` charge 3 catégories
- [ ] Test `createOverride()` invalide cache
- [ ] Test sans playspace actif → erreur

## Dépendances

- [ ] TASK-2025-01-20-023 (API routes) doit être terminé
- [ ] Playspace store doit exister (`usePlayspaceStore()`)

## Critères d'Acceptation

- [ ] Distinct de `useI18n()` (pas de confusion)
- [ ] Auto-loading transparent
- [ ] Cache partagé entre composants
- [ ] Performance < 1ms avec cache hit
- [ ] Erreurs claires si pas de playspace actif

## Références

- [Vue Composables](https://vuejs.org/guide/reusability/composables.html)
- [Nuxt Composables](https://nuxt.com/docs/guide/directory-structure/composables)
