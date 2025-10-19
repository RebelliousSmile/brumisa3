# Task - Système de Chat (Phase 4 - Optionnel)

## Métadonnées
- **ID**: TASK-2025-01-19-016
- **Priorité**: Basse | **Temps estimé**: 6h | **Statut**: À faire

## Description
Créer le chat temps réel pour les sessions multi-joueurs.

## Fichiers
- `app/components/multiplayer/ChatPanel.vue`
- `server/api/chat/messages.get.ts`
- Prisma: table ChatMessage

## Fonctionnalités
- Messages temps réel
- Historique persisté
- Notifications
- Markdown support (optionnel)

## Bloqueurs
- TASK-015 (WebSocket)
