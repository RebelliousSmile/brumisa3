# Task - API Routes Cards & Trackers

## Métadonnées
- **ID**: TASK-2025-01-19-009B
- **Priorité**: Haute | **Temps estimé**: 3h | **Statut**: À faire

## Description
Créer les API routes pour gérer les cartes de thème, hero cards, et trackers avec leurs relations.

## Fichiers
- `server/api/litm/cards/[id].put.ts` (Mise à jour carte)
- `server/api/litm/cards/[id].delete.ts` (Suppression carte)
- `server/api/litm/cards/index.post.ts` (Création carte)
- `server/api/litm/trackers/[id].put.ts` (Mise à jour tracker)
- `server/api/litm/trackers/[id].delete.ts` (Suppression tracker)
- `server/api/litm/trackers/index.post.ts` (Création tracker)
- `server/api/litm/tags/[id].put.ts` (Mise à jour tag)
- `tests/api/litm-cards-trackers.spec.ts`

## Fonctionnalités
- CRUD pour ThemeCard, HeroCard
- CRUD pour Trackers (Status, StoryTag, StoryTheme)
- CRUD pour Tags (Power, Weakness)
- Validation des relations (characterId existe)
- Cascade delete géré par Prisma
- Tests d'intégration

## Schémas Zod
```typescript
export const createThemeCardSchema = z.object({
  characterId: z.string().uuid(),
  type: z.enum(['CHARACTER', 'FELLOWSHIP']),
  themeType: z.string(),
  themebook: z.string(),
  mainTag: z.string(),
  powerTags: z.array(z.string()).optional(),
  weaknessTags: z.array(z.string()).optional()
})

export const createTrackerSchema = z.object({
  characterId: z.string().uuid(),
  type: z.enum(['STATUS', 'STORY_TAG', 'STORY_THEME']),
  name: z.string().min(1),
  pips: z.number().int().min(0).max(4).default(0)
})
```

## Bloqueurs
- TASK-009A (API Characters doit être terminée)

## Critères d'Acceptation
- [ ] Tous les endpoints fonctionnent
- [ ] Les relations sont validées
- [ ] Tests d'intégration passent
- [ ] Cascade delete testé
