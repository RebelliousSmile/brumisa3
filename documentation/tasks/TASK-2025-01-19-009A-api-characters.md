# Task - API Routes Characters

## Métadonnées
- **ID**: TASK-2025-01-19-009A
- **Priorité**: Haute | **Temps estimé**: 3h | **Statut**: À faire

## Description
Créer les API routes Nitro pour la gestion CRUD des personnages LITM avec validation Zod et sécurité.

## Fichiers
- `server/api/litm/characters/index.get.ts` (Liste des personnages utilisateur)
- `server/api/litm/characters/index.post.ts` (Création)
- `server/api/litm/characters/[id].get.ts` (Détails)
- `server/api/litm/characters/[id].put.ts` (Mise à jour)
- `server/api/litm/characters/[id].delete.ts` (Suppression)
- `server/utils/litm/validators.ts` (Schémas Zod)
- `tests/api/litm-characters.spec.ts`

## Fonctionnalités
- CRUD complet pour LitmCharacter
- Validation avec Zod (schémas réutilisables)
- Vérification userId (auth)
- Gestion d'erreurs standardisée
- Tests unitaires pour chaque endpoint

## Schémas Zod
```typescript
// server/utils/litm/validators.ts
import { z } from 'zod'

export const createCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  game: z.enum(['LEGENDS', 'CITY', 'OTHERSCAPE']).default('LEGENDS')
})

export const updateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional()
})
```

## Bloqueurs
- TASK-004 (Modèle Prisma)
- TASK-008 (Store Pinia)

## Critères d'Acceptation
- [ ] Tous les endpoints fonctionnent
- [ ] Validation Zod en place
- [ ] Auth vérifiée (userId)
- [ ] Tests unitaires passent
- [ ] Gestion d'erreurs standardisée (400, 401, 404, 500)
