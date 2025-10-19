# Task - Composants Trackers

## Métadonnées
- **ID**: TASK-2025-01-19-007
- **Priorité**: Haute | **Temps estimé**: 4h | **Statut**: À faire

## Description
Créer les composants de suivi : Status, Story Tag, Story Theme avec système de pips.

## Fichiers
- `app/components/litm/StatusTracker.vue`
- `app/components/litm/StoryTagTracker.vue`
- `app/components/litm/StoryThemeTracker.vue`
- `app/components/litm/PipTracker.vue`
- `tests/components/litm/Trackers.spec.ts`

## Fonctionnalités
- Suivi de statut (nom + pips)
- Suivi de trait narratif (peut évoluer en thème)
- Système de pips (Abandon, Améliorer, Jalon, Promesse)
- Ajout/suppression de trackers

## Bloqueurs
- TASK-004 (Modèle Prisma)
