# Task - Seeds de Données de Test pour Traductions

## Métadonnées

- **ID**: TASK-2025-01-20-025
- **Date de création**: 2025-01-20
- **Créé par**: Claude (ana2task)
- **Priorité**: Moyenne
- **Statut**: À faire
- **Temps estimé**: 2h
- **Temps réel**: -

## Description

### Objectif

Créer les scripts de seed pour populer la base de données avec des données de test pour le système de traductions multi-niveaux.

### Contexte

Pour tester et développer, nous avons besoin de :
- Systèmes : LITM, City of Mist, Otherscape
- Hacks : Cyberpunk City (LITM), Night's Black Agents (LITM)
- Traductions de base en FR et EN
- Quelques overrides pour démonstration

### Périmètre

**Inclus**:
- Script seed `seedTranslations()`
- Création des systèmes (LITM, City of Mist)
- Création de hacks exemples
- Traductions SYSTEM level (FR + EN)
- Quelques overrides HACK level
- Script exécutable `pnpm tsx server/database/seeds/translations.seed.ts`

**Exclu**:
- Migration de données production (TASK-026 si nécessaire)
- Traductions complètes (seulement exemples)

## Plan d'Implémentation

### Étape 1: Créer le Script de Base

- Créer `server/database/seeds/translations.seed.ts`
- Importer PrismaClient
- Fonction `seedTranslations()` avec try/catch

### Étape 2: Seeder les Systèmes

- Upsert System "LITM" (code: `litm`, version: `1.0.0`)
- Upsert System "City of Mist" (code: `city-of-mist`)
- Upsert System "Otherscape" (code: `otherscape`)

### Étape 3: Seeder les Hacks

- Upsert Hack "Cyberpunk City" (systemId: LITM)
- Upsert Hack "Night's Black Agents" (systemId: LITM)

### Étape 4: Traductions System Level

- FR : `character.name` → "Nom", `character.mythos` → "Mythos"
- EN : `character.name` → "Name", `character.mythos` → "Mythos"
- Catégorie CHARACTER, level SYSTEM, priority 1

### Étape 5: Overrides Hack Level

- Hack "Cyberpunk City" : `character.name` → "Nom du Runner" (FR), "Runner Name" (EN)
- Catégorie CHARACTER, level HACK, priority 2

### Étape 6: Tester le Script

- Exécuter `pnpm tsx server/database/seeds/translations.seed.ts`
- Vérifier les données dans PostgreSQL
- Tester idempotence (relancer le script → pas de doublon)

## Fichiers Concernés

**Nouveaux fichiers**:
- [ ] `server/database/seeds/translations.seed.ts`

**Fichiers à modifier**:
- [ ] `package.json` - Ajouter script `"seed:translations"`

## Tests

- [ ] Test exécution du script sans erreur
- [ ] Test idempotence (2e exécution OK)
- [ ] Test données créées dans DB
- [ ] Test upsert évite doublons

## Dépendances

- [ ] TASK-2025-01-20-021 (Schema Prisma) doit être terminé
- [ ] Migration Prisma appliquée

## Critères d'Acceptation

- [ ] Script exécutable `pnpm seed:translations`
- [ ] Idempotent (pas d'erreur si déjà seedé)
- [ ] Au moins 3 systèmes créés
- [ ] Au moins 10 traductions de base
- [ ] FR et EN pour chaque clé
- [ ] Logs clairs pendant l'exécution

## Références

- [Prisma Seeding](https://www.prisma.io/docs/guides/database/seed-database)
