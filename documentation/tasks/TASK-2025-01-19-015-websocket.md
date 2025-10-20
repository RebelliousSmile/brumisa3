# Task - Infrastructure WebSocket (REPORTÉ v2.5)

## Métadonnées
- **ID**: TASK-2025-01-19-015
- **Priorité**: P2 (Post-MVP) | **Temps estimé**: 8h | **Statut**: REPORTÉ v2.5
- **Version cible**: v2.5 (après Investigation Board v2.0)
- **Raison report**: Multi-joueurs hors scope MVP - Mode solo prioritaire pour v1.0

## Description
Configurer Socket.io avec Nitro pour le multi-joueurs : rooms, connexions, broadcasting.

## Fichiers
- `server/plugins/socket.io.ts`
- `server/socket/rooms.ts`
- `server/socket/handlers.ts`

## Package
- `socket.io`
- `socket.io-client`

## Fonctionnalités
- Rooms (sessions de jeu)
- Join/Leave rooms
- Broadcasting aux joueurs
- Gestion reconnexion
