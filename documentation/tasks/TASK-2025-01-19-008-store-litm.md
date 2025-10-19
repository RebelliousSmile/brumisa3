# Task - Store Pinia pour personnages LITM

## Métadonnées
- **ID**: TASK-2025-01-19-008
- **Priorité**: Haute | **Temps estimé**: 3h | **Statut**: À faire

## Description
Créer le store Pinia pour gérer l'état des personnages LITM avec actions CRUD.

## Fichiers
- `shared/stores/useLitmCharacterStore.ts`
- `tests/stores/useLitmCharacterStore.spec.ts`

## Fonctionnalités
- State: characters, activeCharacter, loading, error
- Actions: fetchCharacters, createCharacter, updateCharacter, deleteCharacter
- Getters: activeCharacterCards, activeCharacterTrackers
- Persistance avec Prisma via API

## Bloqueurs
- TASK-004 (Modèle Prisma)
