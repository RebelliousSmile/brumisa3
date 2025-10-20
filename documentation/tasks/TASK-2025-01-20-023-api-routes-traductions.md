# Task - API Routes Nitro pour Traductions Multi-Niveaux

## Métadonnées

- **ID**: TASK-2025-01-20-023
- **Date de création**: 2025-01-20
- **Créé par**: Claude (ana2task)
- **Priorité**: Haute
- **Statut**: À faire
- **Temps estimé**: 2h
- **Temps réel**: -

## Description

### Objectif

Créer les API routes Nitro pour exposer le service de traductions : résolution, hiérarchie, création/suppression d'overrides.

### Contexte

Le service backend (TASK-022) doit être exposé via des endpoints RESTful sécurisés et validés.

### Périmètre

**Inclus**:
- GET `/api/translations/resolve` - Résoudre traductions
- GET `/api/translations/hierarchy` - Visualiser héritage
- POST `/api/translations/override` - Créer override
- DELETE `/api/translations/override` - Supprimer override
- Validation Zod des query params et body
- Gestion d'erreurs HTTP (400, 404, 500)

**Exclu**:
- Authentification/autorisation (v1.1+)
- Rate limiting (v1.1+)
- Cache headers (optionnel)

## Plan d'Implémentation

### Étape 1: Route GET /api/translations/resolve

- Récupérer `systemId`, `hackId?`, `playspaceId?`, `category` depuis query
- Valider avec Zod schema
- Appeler `resolveTranslations(context)`
- Retourner JSON

### Étape 2: Route GET /api/translations/hierarchy

- Récupérer `key`, `systemId`, `hackId?`, `playspaceId?`, `category`
- Valider
- Appeler `getTranslationHierarchy(key, context)`
- Retourner array JSON

### Étape 3: Route POST /api/translations/override

- Récupérer body JSON
- Valider avec Zod (`key`, `value`, `level`, `systemId`, etc.)
- Appeler `createOverride(...)`
- Retourner 201 Created

### Étape 4: Route DELETE /api/translations/override

- Récupérer body JSON
- Valider
- Appeler `removeOverride(key, context)`
- Retourner 200 OK avec count

### Étape 5: Tests E2E

- Test résolution simple
- Test création override → résolution → suppression
- Test erreurs (400 si params manquants)

## Fichiers Concernés

**Nouveaux fichiers**:
- [ ] `server/api/translations/resolve.get.ts`
- [ ] `server/api/translations/hierarchy.get.ts`
- [ ] `server/api/translations/override.post.ts`
- [ ] `server/api/translations/override.delete.ts`

## Tests

- [ ] Test GET /api/translations/resolve avec params valides
- [ ] Test GET /api/translations/resolve sans systemId → 400
- [ ] Test POST /api/translations/override → 201
- [ ] Test DELETE /api/translations/override → 200

## Dépendances

- [ ] TASK-2025-01-20-022 (Service) doit être terminé

## Critères d'Acceptation

- [ ] Validation Zod pour tous les endpoints
- [ ] Gestion d'erreurs avec createError()
- [ ] Status codes HTTP corrects (200, 201, 400, 404, 500)
- [ ] Pas de secret en dur (utiliser DATABASE_URL)
- [ ] Documentation JSDoc sur chaque route

## Références

- [Nuxt Server Routes](https://nuxt.com/docs/guide/directory-structure/server)
