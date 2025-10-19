# Task - Lanceur de Dés (Phase 4 - Optionnel)

## Métadonnées
- **ID**: TASK-2025-01-19-017
- **Priorité**: Basse | **Temps estimé**: 5h | **Statut**: À faire

## Description
Créer le système de lanceur de dés avec tags (power/weakness) et animation.

## Fichiers
- `app/components/multiplayer/DiceRoller.vue`
- `app/composables/useDiceRoller.ts`
- `server/socket/dice.ts`

## Fonctionnalités
- Jet de dés LITM (pool de d6)
- Application de tags (+/-)
- Animation des résultats
- Historique des jets
- Broadcast aux joueurs

## Bloqueurs
- TASK-015 (WebSocket)
