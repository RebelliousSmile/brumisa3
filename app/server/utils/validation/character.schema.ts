/**
 * Validation Schemas - Character
 * Schemas Zod pour validation API routes Characters
 */

import { z } from 'zod'

/**
 * Schema validation : Création Character
 */
export const createCharacterSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional()
    .nullable(),

  playspaceId: z.string()
    .cuid('ID playspace invalide (doit être un CUID)')
})

/**
 * Schema validation : Mise à jour Character
 */
export const updateCharacterSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .optional(),

  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional()
    .nullable()
})

/**
 * Schema validation : ID Character (params)
 */
export const characterIdSchema = z.string()
  .cuid('ID personnage invalide (doit être un CUID)')

/**
 * Types dérivés TypeScript
 */
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>
