# Task - Système Undo/Redo

## Métadonnées
- **ID**: TASK-2025-01-19-012
- **Priorité**: Moyenne | **Temps estimé**: 4h | **Statut**: À faire

## Description
Implémenter un système d'annulation/restauration avec historique et raccourcis clavier.

## Fichiers
- `app/composables/useHistory.ts`
- `tests/composables/useHistory.spec.ts`

## Fonctionnalités
- Historique des actions (max 50)
- Undo (Ctrl+Z)
- Redo (Ctrl+Y)
- Integration avec le store Pinia
- Stack d'actions typées

## Bloqueurs
- TASK-008 (Store)
