# Task - Gestion de Sessions (Phase 4 - Optionnel)

## Métadonnées
- **ID**: TASK-2025-01-19-018
- **Priorité**: Basse | **Temps estimé**: 8h | **Statut**: À faire

## Description
Créer le système complet de gestion de sessions multi-joueurs.

## Fichiers
- `app/pages/univers/legends-in-the-mist/sessions/index.vue`
- `app/pages/univers/legends-in-the-mist/sessions/[id].vue`
- `server/api/sessions/[id].get.ts`
- Prisma: table Session, SessionPlayer

## Fonctionnalités
- Créer/rejoindre/quitter session
- Code d'invitation
- Liste des joueurs connectés
- Rôles (MJ/Joueur)
- Permissions
- Tableau de bord MJ

## Bloqueurs
- TASK-016 (Chat)
- TASK-017 (Dés)
