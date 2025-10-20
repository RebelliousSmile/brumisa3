# Modèles TypeScript et Validation Runtime

## Vue d'ensemble

Architecture **TypeScript-first** pour définir les modèles de données avec validation runtime automatique via Zod.

**Principe** : Les modèles sont définis en TypeScript comme source de vérité pour la logique métier, la validation et la documentation. Le `schema.prisma` reste la source de vérité pour la base de données.

**Avantages** :
- Documentation vivante et type-safe
- Validation runtime automatique
- Génération de schémas Zod
- Single source of truth pour la logique métier
- Pas de duplication entre validation et types

---

## Architecture

### Structure des Fichiers

```
server/
  ├── config/
  │   └── models/
  │       ├── types.ts              # Types de base et enums
  │       ├── user.model.ts         # Définition modèle User
  │       ├── document.model.ts     # Définition modèle Document
  │       ├── validator.ts          # Helpers validation Zod
  │       └── index.ts              # Registry des modèles
  └── utils/
      └── model-validator.ts        # Utilitaires pour API routes
```

---

## Définition des Types de Base

```typescript
// server/config/models/types.ts

// Types de champs disponibles
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'json'
  | 'uuid'
  | 'email'
  | 'url'
  | 'text'

// Enums globaux
export const Role = {
  UTILISATEUR: 'UTILISATEUR',
  MODERATEUR: 'MODERATEUR',
  ADMIN: 'ADMIN'
} as const
export type Role = typeof Role[keyof typeof Role]

export const StatutDocument = {
  ACTIF: 'ACTIF',
  ARCHIVE: 'ARCHIVE',
  SUPPRIME: 'SUPPRIME'
} as const
export type StatutDocument = typeof StatutDocument[keyof typeof StatutDocument]

// ... autres enums

/**
 * Définition d'un champ de modèle
 */
export interface FieldDefinition {
  type: FieldType | 'enum'
  required?: boolean
  unique?: boolean
  default?: any
  enum?: readonly string[]
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  description?: string
  example?: any
}

/**
 * Définition d'un modèle complet
 */
export interface ModelDefinition {
  name: string
  tableName?: string
  description?: string
  fields: Record<string, FieldDefinition>
  relations?: Record<string, RelationDefinition>
  indexes?: string[][]
  unique?: string[][]
}
```

---

## Exemple : Modèle User

```typescript
// server/config/models/user.model.ts

import type { ModelDefinition } from './types'
import { Role, StatutUtilisateur, TypeCompte } from './types'

export const USER_MODEL: ModelDefinition = {
  name: 'User',
  tableName: 'utilisateurs',
  description: 'Utilisateur de la plateforme',

  fields: {
    id: {
      type: 'number',
      required: true,
      description: 'Identifiant unique auto-incrémenté',
      example: 1
    },

    nom: {
      type: 'string',
      required: true,
      maxLength: 255,
      description: 'Nom complet de l\'utilisateur',
      example: 'Jean Dupont'
    },

    email: {
      type: 'email',
      required: false,
      unique: true,
      maxLength: 255,
      description: 'Adresse email (optionnelle pour invités)',
      example: 'jean.dupont@example.com'
    },

    role: {
      type: 'enum',
      enum: Object.values(Role),
      required: true,
      default: Role.UTILISATEUR,
      description: 'Rôle de l\'utilisateur',
      example: Role.UTILISATEUR
    },

    statut: {
      type: 'enum',
      enum: Object.values(StatutUtilisateur),
      required: true,
      default: StatutUtilisateur.ACTIF,
      description: 'Statut du compte',
      example: StatutUtilisateur.ACTIF
    },

    dateCreation: {
      type: 'datetime',
      required: true,
      default: () => new Date(),
      description: 'Date de création du compte'
    }
  },

  relations: {
    documents: {
      model: 'Document',
      type: 'many',
      description: 'Documents créés par cet utilisateur'
    }
  },

  indexes: [
    ['email'],
    ['role'],
    ['statut']
  ],

  unique: [
    ['email']
  ]
}
```

---

## Validation Runtime avec Zod

### Génération Automatique de Schémas

```typescript
// server/config/models/validator.ts

import { z } from 'zod'
import type { ModelDefinition } from './types'

/**
 * Génère un schéma Zod complet depuis une définition de modèle
 */
export function modelToZodSchema(model: ModelDefinition): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const [fieldName, fieldDef] of Object.entries(model.fields)) {
    shape[fieldName] = fieldToZodSchema(fieldDef)
  }

  return z.object(shape)
}

/**
 * Génère un schéma Zod pour la création (sans id, dates auto)
 */
export function modelToCreateSchema(model: ModelDefinition): z.ZodObject<any> {
  // Exclut id, dateCreation, dateModification
}

/**
 * Génère un schéma Zod pour la mise à jour (tous optionnels)
 */
export function modelToUpdateSchema(model: ModelDefinition): z.ZodObject<any> {
  // Tous les champs optionnels sauf id
}

/**
 * Valide des données contre un modèle
 */
export function validateData(
  model: ModelDefinition,
  data: unknown,
  mode: 'create' | 'update' | 'full' = 'full'
): { success: true; data: any } | { success: false; errors: z.ZodIssue[] } {
  // ...
}
```

---

## Utilisation dans les API Routes

### Helper de Validation

```typescript
// server/utils/model-validator.ts

import { createValidator } from '../config/models/validator'
import { getModel } from '../config/models'

/**
 * Valide le body d'une requête selon un modèle
 * Renvoie une erreur HTTP 400 si la validation échoue
 */
export async function validateBody(
  event: H3Event,
  modelName: string,
  mode: 'create' | 'update' = 'create'
) {
  const model = getModel(modelName)
  const body = await readBody(event)
  const validator = createValidator(model)

  const result = mode === 'create'
    ? validator.validateCreate(body)
    : validator.validateUpdate(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: { errors: result.errors }
    })
  }

  return result.data
}
```

### Exemple dans une API Route

```typescript
// server/api/users/index.post.ts

import { validateBody } from '~/server/utils/model-validator'
import { Role } from '~/server/config/models/types'

export default defineEventHandler(async (event) => {
  // Validation automatique du body selon USER_MODEL
  const validatedData = await validateBody(event, 'User', 'create')

  // validatedData est maintenant typé et validé !
  // - Champs requis garantis présents
  // - Enums vérifiés
  // - Longueurs max respectées
  // - Formats email validés

  try {
    const user = await prisma.utilisateurs.create({
      data: {
        nom: validatedData.nom,
        email: validatedData.email,
        role: validatedData.role || Role.UTILISATEUR,
        statut: validatedData.statut,
        dateCreation: new Date()
      }
    })

    return { success: true, data: user }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: 'Failed to create user'
    })
  }
})
```

### Mise à Jour

```typescript
// server/api/users/[id].patch.ts

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')

  // Validation pour mise à jour (tous les champs optionnels)
  const validatedData = await validateBody(event, 'User', 'update')

  const user = await prisma.utilisateurs.update({
    where: { id: parseInt(userId!) },
    data: validatedData
  })

  return { success: true, data: user }
})
```

---

## Registry des Modèles

```typescript
// server/config/models/index.ts

import { USER_MODEL } from './user.model'
import { DOCUMENT_MODEL } from './document.model'

export const MODELS = {
  User: USER_MODEL,
  Document: DOCUMENT_MODEL
} as const

export type ModelName = keyof typeof MODELS

export function getModel(modelName: string): ModelDefinition | undefined {
  return MODELS[modelName as ModelName]
}

export function getAllModels(): ModelDefinition[] {
  return Object.values(MODELS)
}
```

---

## Workflow de Développement

### 1. Définir le Modèle TypeScript

```typescript
// server/config/models/product.model.ts

export const PRODUCT_MODEL: ModelDefinition = {
  name: 'Product',
  tableName: 'produits',

  fields: {
    id: { type: 'uuid', required: true },
    nom: { type: 'string', required: true, maxLength: 255 },
    prix: { type: 'number', required: true, min: 0 },
    stock: { type: 'number', required: true, min: 0, default: 0 }
  }
}
```

### 2. Enregistrer dans le Registry

```typescript
// server/config/models/index.ts

import { PRODUCT_MODEL } from './product.model'

export const MODELS = {
  User: USER_MODEL,
  Document: DOCUMENT_MODEL,
  Product: PRODUCT_MODEL  // Ajouter ici
}
```

### 3. Créer/Mettre à Jour schema.prisma

```prisma
model produits {
  id    String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  nom   String  @db.VarChar(255)
  prix  Decimal @db.Decimal(10, 2)
  stock Int     @default(0)
}
```

### 4. Migration Prisma

```bash
npx prisma migrate dev --name add_products
```

### 5. Utiliser dans les API Routes

```typescript
// server/api/products/index.post.ts

export default defineEventHandler(async (event) => {
  const validatedData = await validateBody(event, 'Product', 'create')

  const product = await prisma.produits.create({
    data: validatedData
  })

  return { success: true, data: product }
})
```

---

## Avantages de cette Architecture

### 1. Documentation Vivante
- Chaque champ a une description
- Exemples de valeurs
- Types clairement définis
- Relations documentées

### 2. Type Safety
- Types TypeScript générés
- Enums partagés entre validation et code
- Autocomplétion IDE

### 3. Validation Automatique
- Génération Zod depuis les définitions
- Pas de duplication de règles
- Messages d'erreur clairs

### 4. DRY (Don't Repeat Yourself)
- Une seule définition pour :
  - Validation
  - Documentation
  - Types TypeScript
  - Messages d'erreur

### 5. Maintenabilité
- Modification centralisée
- Facile à comprendre
- Testable

---

## Comparaison avec Approches Alternatives

| Aspect | TypeScript Models | Prisma Seul | Drizzle |
|--------|------------------|-------------|---------|
| **Source de vérité** | TypeScript + Prisma | Prisma | TypeScript |
| **Validation runtime** | Zod (auto-généré) | Manuel | Zod manuel |
| **Documentation** | Inline + types | Commentaires | Inline |
| **Type safety** | ✅ Excellent | ✅ Excellent | ✅ Excellent |
| **DRY** | ✅ Maximum | ⚠️ Duplication validation | ✅ Bon |
| **Courbe d'apprentissage** | Moyenne | Faible | Moyenne |
| **Flexibilité** | ✅ Haute | ⚠️ Limitée | ✅ Haute |

---

## Tests

### Test de Validation

```typescript
// tests/models/user.validation.test.ts

import { describe, it, expect } from 'vitest'
import { createValidator } from '~/server/config/models/validator'
import { USER_MODEL } from '~/server/config/models'
import { Role, StatutUtilisateur } from '~/server/config/models/types'

describe('User Model Validation', () => {
  const validator = createValidator(USER_MODEL)

  it('should validate correct user data', () => {
    const userData = {
      nom: 'Jean Dupont',
      email: 'jean@example.com',
      role: Role.UTILISATEUR,
      statut: StatutUtilisateur.ACTIF
    }

    const result = validator.validateCreate(userData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const userData = {
      nom: 'Jean Dupont',
      email: 'invalid-email',
      role: Role.UTILISATEUR
    }

    const result = validator.validateCreate(userData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].path).toEqual(['email'])
    }
  })

  it('should reject invalid enum value', () => {
    const userData = {
      nom: 'Jean Dupont',
      role: 'INVALID_ROLE'
    }

    const result = validator.validateCreate(userData)
    expect(result.success).toBe(false)
  })
})
```

---

## Migration depuis l'Existant

### Étape 1 : Créer les Modèles TypeScript

Pour chaque table Prisma existante, créer un fichier modèle :

```typescript
// server/config/models/actualite.model.ts

export const ACTUALITE_MODEL: ModelDefinition = {
  name: 'Actualite',
  tableName: 'actualites',

  fields: {
    id: { type: 'number', required: true },
    titre: { type: 'string', required: true, maxLength: 255 },
    contenu: { type: 'text', required: true },
    type: { type: 'enum', enum: ['NOUVEAUTE', 'MAINTENANCE', 'EVENEMENT'] },
    // ...
  }
}
```

### Étape 2 : Remplacer Validation Manuelle

**Avant** :
```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validation manuelle
  if (!body.titre || body.titre.length > 255) {
    throw createError({ statusCode: 400, message: 'Invalid titre' })
  }
  if (!body.type || !['NOUVEAUTE', 'MAINTENANCE'].includes(body.type)) {
    throw createError({ statusCode: 400, message: 'Invalid type' })
  }

  // ...
})
```

**Après** :
```typescript
export default defineEventHandler(async (event) => {
  // Validation automatique
  const validatedData = await validateBody(event, 'Actualite', 'create')

  // Data déjà validée !
  // ...
})
```

### Étape 3 : Tests

Ajouter des tests de validation pour chaque modèle.

---

## Roadmap

### Phase 1 : Fondations (DONE)
- [x] Créer structure `server/config/models/`
- [x] Définir types de base et enums
- [x] Créer modèles User et Document
- [x] Créer helpers de validation Zod
- [x] Créer utilitaires API routes

### Phase 2 : Migration Modèles Existants (TODO)
- [ ] Créer modèles pour toutes les tables existantes
- [ ] Migrer validation API routes vers validateBody()
- [ ] Tests de validation pour chaque modèle

### Phase 3 : Modèles LITM (TODO)
- [ ] Créer modèles LitmCharacter, LitmThemeCard, etc.
- [ ] Intégrer avec systèmes de jeu
- [ ] API routes LITM avec validation

### Phase 4 : Génération Automatique (FUTURE)
- [ ] Script pour générer migrations Prisma depuis modèles
- [ ] Vérification cohérence modèles ↔ schema.prisma
- [ ] Génération formulaires frontend depuis modèles

---

## Ressources

### Documentation Liée
- [12-configuration-systemes-jeu.md](./12-configuration-systemes-jeu.md) - Configuration systèmes

### Code Source
- `server/config/models/` - Définitions modèles
- `server/utils/model-validator.ts` - Utilitaires validation

### Dépendances
- Zod - Validation runtime
- Prisma - ORM base de données

---

## Maintenance

Cette documentation doit être mise à jour lors de :
- Ajout de nouveaux types de champs
- Création de nouveaux modèles
- Modification des règles de validation
- Ajout de nouvelles fonctionnalités

**Dernière mise à jour** : 2025-01-20 (Création architecture modèles TypeScript)
