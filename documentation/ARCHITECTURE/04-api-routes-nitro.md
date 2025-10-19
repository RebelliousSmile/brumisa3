# API Routes Nitro - Design et Implémentation

## Principes de Design

### 1. RESTful API
- Routes conformes aux standards REST
- Codes HTTP appropriés (200, 201, 400, 404, 500)
- Verbes HTTP significatifs (GET, POST, PATCH, DELETE)

### 2. Performance First
- Pagination systématique pour les listes
- Index DB optimisés
- Caching stratégique avec `defineCachedEventHandler`

### 3. Validation Stricte
- Validation des inputs avec Zod
- TypeScript strict
- Gestion d'erreurs exhaustive

### 4. Logging Modulaire
- Logs structurés pour debugging
- Logs de performance (requêtes DB lentes)
- Logs d'erreurs avec contexte

## Structure des API Routes

```
server/
├── api/
│   ├── auth/
│   │   ├── login.post.ts
│   │   ├── register.post.ts
│   │   └── logout.post.ts
│   │
│   ├── characters/
│   │   ├── index.get.ts              # Liste paginée
│   │   ├── index.post.ts             # Créer
│   │   ├── [id].get.ts               # Récupérer un
│   │   ├── [id].patch.ts             # Mettre à jour
│   │   ├── [id].delete.ts            # Supprimer
│   │   └── [id]/
│   │       ├── themes.post.ts        # Ajouter un thème
│   │       ├── statuses.post.ts      # Ajouter un statut
│   │       └── roll.post.ts          # Faire un jet
│   │
│   ├── themes/
│   │   ├── [id].get.ts
│   │   ├── [id].patch.ts
│   │   ├── [id].delete.ts
│   │   ├── [id]/tags.post.ts         # Ajouter tag
│   │   ├── [id]/attention.post.ts    # Ajouter attention
│   │   └── [id]/improve.post.ts      # Gagner amélioration
│   │
│   ├── tags/
│   │   ├── [id].patch.ts             # Modifier tag
│   │   ├── [id].delete.ts            # Supprimer tag
│   │   └── [id]/burn.post.ts         # Brûler tag
│   │
│   ├── statuses/
│   │   ├── [id].patch.ts
│   │   └── [id].delete.ts
│   │
│   ├── rolls/
│   │   ├── execute.post.ts           # Exécuter un jet
│   │   └── history/
│   │       └── [characterId].get.ts  # Historique paginé
│   │
│   └── themebooks/
│       ├── index.get.ts              # Liste des themebooks
│       └── [id].get.ts               # Détails d'un themebook
│
├── middleware/
│   ├── auth.ts                       # Vérification authentification
│   └── logger.ts                     # Logger requêtes
│
└── utils/
    ├── prisma.ts                     # Client Prisma singleton
    ├── auth.ts                       # Helpers auth
    ├── validation.ts                 # Schémas Zod
    └── errors.ts                     # Gestion erreurs
```

## Exemples d'Implémentation

### 1. Utilitaires Communs

#### server/utils/prisma.ts
```typescript
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
```

#### server/utils/validation.ts
```typescript
import { z } from 'zod';

export const characterSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['PLAYER', 'DANGER', 'CREW', 'EXTRA']),
  gameSystem: z.enum(['CITY_OF_MIST', 'LEGENDS_IN_MIST', 'OTHERSCAPE']),
  description: z.string().optional(),
  avatar: z.string().url().optional(),
});

export const themeSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum([
    'MYTHOS',
    'LOGOS',
    'MIST',
    'BASTION',
    'LEGEND_ORIGIN',
    'LEGEND_ADVENTURE',
    'LEGEND_GREATNESS'
  ]),
  mystery: z.string().optional(),
  identity: z.string().optional(),
});

export const tagSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['POWER', 'WEAKNESS', 'STORY', 'LOADOUT', 'HERO_TAG']),
  question: z.string().optional(),
  subtags: z.array(z.string()).default([]),
});

export const rollExecuteSchema = z.object({
  characterId: z.string().cuid(),
  moveId: z.string().cuid().optional(),
  moveName: z.string().optional(),
  modifiers: z.number().int(),
  tagsUsed: z.array(z.string().cuid()).default([]),
  statusesUsed: z.array(z.string().cuid()).default([]),
  wasDynamite: z.boolean().default(false),
  notes: z.string().optional(),
});
```

#### server/utils/errors.ts
```typescript
import type { H3Error } from 'h3';

export class AppError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number = 500, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown) => {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    throw createError({
      statusCode: error.statusCode,
      message: error.message,
      data: error.data,
    });
  }

  if (error instanceof Error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }

  throw createError({
    statusCode: 500,
    message: 'Une erreur inconnue est survenue',
  });
};
```

### 2. Middleware d'Authentification

```typescript
// server/middleware/auth.ts
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  // Ignorer les routes publiques
  const publicRoutes = ['/api/auth/', '/api/public/'];
  const path = event.path;

  if (publicRoutes.some(route => path.startsWith(route))) {
    return;
  }

  // Vérifier la session
  const session = await getServerSession(event);

  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié',
    });
  }

  // Ajouter l'utilisateur au contexte
  event.context.userId = session.user.id;
});
```

### 3. Routes CRUD Personnages

#### server/api/characters/index.get.ts
```typescript
export default defineEventHandler(async (event) => {
  const userId = event.context.userId;

  // Query params pour pagination et filtres
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.pageSize as string) || 20;
  const type = query.type as string | undefined;
  const gameSystem = query.gameSystem as string | undefined;

  try {
    const [characters, total] = await Promise.all([
      prisma.character.findMany({
        where: {
          userId,
          ...(type && { type: type as any }),
          ...(gameSystem && { gameSystem: gameSystem as any }),
        },
        include: {
          themes: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          _count: {
            select: {
              statuses: true,
              rollHistory: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.character.count({
        where: {
          userId,
          ...(type && { type: type as any }),
          ...(gameSystem && { gameSystem: gameSystem as any }),
        },
      }),
    ]);

    return {
      data: characters,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    return handleError(error);
  }
});
```

#### server/api/characters/index.post.ts
```typescript
export default defineEventHandler(async (event) => {
  const userId = event.context.userId;
  const body = await readBody(event);

  try {
    // Validation
    const validatedData = characterSchema.parse(body);

    // Création
    const character = await prisma.character.create({
      data: {
        userId,
        ...validatedData,
      },
      include: {
        themes: true,
        statuses: true,
      },
    });

    // Log
    console.log(`Character created: ${character.id} by user ${userId}`);

    return character;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Données invalides',
        data: error.errors,
      });
    }

    return handleError(error);
  }
});
```

#### server/api/characters/[id].get.ts
```typescript
export default defineEventHandler(async (event) => {
  const userId = event.context.userId;
  const characterId = getRouterParam(event, 'id');

  if (!characterId) {
    throw createError({
      statusCode: 400,
      message: 'ID manquant',
    });
  }

  try {
    const character = await prisma.character.findFirst({
      where: {
        id: characterId,
        userId, // Sécurité: seulement ses propres personnages
      },
      include: {
        themes: {
          include: {
            tags: {
              where: { burned: false },
              orderBy: { type: 'asc' },
            },
            improvements: {
              where: { active: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        statuses: {
          where: { temporary: true },
          orderBy: { tier: 'desc' },
        },
        moves: {
          orderBy: { order: 'asc' },
        },
        rollHistory: {
          take: 10,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!character) {
      throw createError({
        statusCode: 404,
        message: 'Personnage non trouvé',
      });
    }

    return character;
  } catch (error) {
    return handleError(error);
  }
});
```

#### server/api/characters/[id].patch.ts
```typescript
export default defineEventHandler(async (event) => {
  const userId = event.context.userId;
  const characterId = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!characterId) {
    throw createError({
      statusCode: 400,
      message: 'ID manquant',
    });
  }

  try {
    // Validation partielle
    const validatedData = characterSchema.partial().parse(body);

    // Vérifier ownership
    const existing = await prisma.character.findFirst({
      where: { id: characterId, userId },
      select: { id: true },
    });

    if (!existing) {
      throw createError({
        statusCode: 404,
        message: 'Personnage non trouvé',
      });
    }

    // Mise à jour
    const character = await prisma.character.update({
      where: { id: characterId },
      data: validatedData,
    });

    return character;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Données invalides',
        data: error.errors,
      });
    }

    return handleError(error);
  }
});
```

### 4. Route de Jet de Dés

#### server/api/rolls/execute.post.ts
```typescript
import { rollExecuteSchema } from '~/server/utils/validation';

enum RollOutcome {
  CRITICAL_SUCCESS = 'CRITICAL_SUCCESS',
  SUCCESS = 'SUCCESS',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
  FAILURE = 'FAILURE',
}

const determineOutcome = (total: number, isDynamite: boolean): RollOutcome => {
  if (total >= 12 && isDynamite) return RollOutcome.CRITICAL_SUCCESS;
  if (total >= 10) return RollOutcome.SUCCESS;
  if (total >= 7) return RollOutcome.PARTIAL_SUCCESS;
  return RollOutcome.FAILURE;
};

export default defineEventHandler(async (event) => {
  const userId = event.context.userId;
  const body = await readBody(event);

  try {
    // Validation
    const data = rollExecuteSchema.parse(body);

    // Vérifier ownership du personnage
    const character = await prisma.character.findFirst({
      where: {
        id: data.characterId,
        userId,
      },
      select: { id: true },
    });

    if (!character) {
      throw createError({
        statusCode: 404,
        message: 'Personnage non trouvé',
      });
    }

    // Génération des dés (cryptographiquement sûr)
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const diceTotal = die1 + die2;
    const finalTotal = diceTotal + data.modifiers;

    // Déterminer l'outcome
    const outcome = determineOutcome(finalTotal, data.wasDynamite);

    // Enregistrer en DB
    const rollRecord = await prisma.rollHistory.create({
      data: {
        characterId: data.characterId,
        die1,
        die2,
        diceTotal,
        modifiers: data.modifiers,
        finalTotal,
        outcome,
        moveId: data.moveId,
        moveName: data.moveName,
        tagsUsed: data.tagsUsed,
        statusesUsed: data.statusesUsed,
        wasDynamite: data.wasDynamite,
        notes: data.notes,
      },
    });

    // Brûler les tags si nécessaire
    if (data.tagsUsed.length > 0) {
      // Logique de burn à implémenter selon les règles
    }

    // Ajouter attention aux thèmes si weakness utilisée
    // Logique à implémenter

    // Log performance
    console.log(`Roll executed: ${rollRecord.id} - Total: ${finalTotal} - Outcome: ${outcome}`);

    return {
      id: rollRecord.id,
      dice: {
        die1,
        die2,
        total: diceTotal,
      },
      modifiers: data.modifiers,
      finalTotal,
      outcome,
      timestamp: rollRecord.timestamp,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Données invalides',
        data: error.errors,
      });
    }

    return handleError(error);
  }
});
```

### 5. Routes pour Thèmes

#### server/api/themes/[id]/attention.post.ts
```typescript
export default defineEventHandler(async (event) => {
  const userId = event.context.userId;
  const themeId = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!themeId) {
    throw createError({
      statusCode: 400,
      message: 'ID manquant',
    });
  }

  const points = parseInt(body.points) || 1;

  try {
    // Vérifier ownership via character
    const theme = await prisma.theme.findFirst({
      where: {
        id: themeId,
        character: {
          userId,
        },
      },
      select: {
        id: true,
        attention: true,
      },
    });

    if (!theme) {
      throw createError({
        statusCode: 404,
        message: 'Thème non trouvé',
      });
    }

    // Ajouter l'attention
    const updatedTheme = await prisma.theme.update({
      where: { id: themeId },
      data: {
        attention: {
          increment: points,
        },
      },
    });

    return updatedTheme;
  } catch (error) {
    return handleError(error);
  }
});
```

### 6. Caching Stratégique

```typescript
// server/api/themebooks/index.get.ts
export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const gameSystem = query.gameSystem as string | undefined;

    try {
      const themebooks = await prisma.themebook.findMany({
        where: {
          ...(gameSystem && { gameSystem: gameSystem as any }),
        },
        orderBy: [
          { official: 'desc' },
          { name: 'asc' },
        ],
      });

      return themebooks;
    } catch (error) {
      return handleError(error);
    }
  },
  {
    maxAge: 60 * 60, // Cache 1 heure
    name: 'themebooks',
    getKey: (event) => {
      const query = getQuery(event);
      return `themebooks-${query.gameSystem || 'all'}`;
    },
  }
);
```

## Logging Stratégie

```typescript
// server/utils/logger.ts
interface LogContext {
  userId?: string;
  route: string;
  method: string;
  duration?: number;
  error?: Error;
}

export const logger = {
  info: (message: string, context?: LogContext) => {
    console.log(`[INFO] ${message}`, context || '');
  },

  error: (message: string, context?: LogContext) => {
    console.error(`[ERROR] ${message}`, context || '');
  },

  performance: (message: string, duration: number, context?: LogContext) => {
    if (duration > 1000) { // > 1s = slow query
      console.warn(`[PERF] ${message} took ${duration}ms`, context || '');
    }
  },
};

// Utilisation dans une route
export default defineEventHandler(async (event) => {
  const start = Date.now();

  try {
    // ... logique

    const duration = Date.now() - start;
    logger.performance('Character fetch', duration, {
      userId: event.context.userId,
      route: event.path,
      method: event.method,
    });
  } catch (error) {
    logger.error('Failed to fetch character', {
      userId: event.context.userId,
      route: event.path,
      method: event.method,
      error: error as Error,
    });

    throw error;
  }
});
```

## Tests des API Routes

```typescript
// tests/api/characters.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';

describe('Characters API', async () => {
  await setup();

  it('should create a character', async () => {
    const response = await $fetch('/api/characters', {
      method: 'POST',
      body: {
        name: 'Test Character',
        type: 'PLAYER',
        gameSystem: 'LEGENDS_IN_MIST',
      },
    });

    expect(response).toHaveProperty('id');
    expect(response.name).toBe('Test Character');
  });

  it('should validate character data', async () => {
    await expect(
      $fetch('/api/characters', {
        method: 'POST',
        body: {
          name: '', // Invalid
          type: 'INVALID',
        },
      })
    ).rejects.toThrow();
  });
});
```

## Prochaines Étapes

Voir `05-state-management-pinia.md` pour l'intégration côté client.
