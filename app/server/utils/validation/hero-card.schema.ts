/**
 * Validation Schemas - Hero Card
 * Schemas Zod pour validation API routes Hero Card
 */

import { z } from 'zod'

/**
 * Schema validation : Mise à jour Hero Card
 *
 * Notes :
 * - Identity : Personnalité mundane (CoM/LITM) ou Self (Otherscape)
 * - Mystery : Essence mystique (CoM/LITM) ou Itch (Otherscape)
 */
export const updateHeroCardSchema = z.object({
  identity: z.string()
    .min(2, 'L\'identité doit contenir au moins 2 caractères')
    .max(500, 'L\'identité ne peut pas dépasser 500 caractères')
    .optional(),

  mystery: z.string()
    .min(2, 'Le mystère doit contenir au moins 2 caractères')
    .max(500, 'Le mystère ne peut pas dépasser 500 caractères')
    .optional()
})

/**
 * Schema validation : Création Relationship
 */
export const createRelationshipSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .nullable(),

  heroCardId: z.string()
    .cuid('ID hero card invalide (doit être un CUID)')
})

/**
 * Schema validation : Mise à jour Relationship
 */
export const updateRelationshipSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .optional(),

  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .nullable()
})

/**
 * Schema validation : ID Hero Card (params)
 */
export const heroCardIdSchema = z.string()
  .cuid('ID hero card invalide (doit être un CUID)')

/**
 * Types dérivés TypeScript
 */
export type UpdateHeroCardInput = z.infer<typeof updateHeroCardSchema>
export type CreateRelationshipInput = z.infer<typeof createRelationshipSchema>
export type UpdateRelationshipInput = z.infer<typeof updateRelationshipSchema>
