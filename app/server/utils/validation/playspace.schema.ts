/**
 * Validation Schemas - Playspace
 * Schemas Zod pour validation API routes Playspaces
 */

import { z } from 'zod'
import { HACKS } from '~/server/config/systems.config'

/**
 * Schema validation : Création Playspace
 */
export const createPlayspaceSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),

  hackId: z.enum(['city-of-mist', 'litm', 'otherlands'], {
    errorMap: () => ({ message: 'Hack invalide. Valeurs autorisées : city-of-mist, litm, otherlands' })
  }),

  universeId: z.string()
    .min(1, 'L\'ID univers ne peut pas être vide')
    .max(100, 'L\'ID univers ne peut pas dépasser 100 caractères')
    .optional()
    .nullable(),

  isGM: z.boolean({
    errorMap: () => ({ message: 'isGM doit être un booléen' })
  }).default(false) // false = PC mode, true = GM mode
})

/**
 * Schema validation : Mise à jour Playspace
 *
 * Notes :
 * - hackId non modifiable après création (règle business)
 * - universeId modifiable (changement univers custom autorisé)
 */
export const updatePlayspaceSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .optional(),

  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .nullable(),

  universeId: z.string()
    .min(1)
    .max(100)
    .optional()
    .nullable(),

  isGM: z.boolean({
    errorMap: () => ({ message: 'isGM doit être un booléen' })
  }).optional()
})

/**
 * Schema validation : ID Playspace (params)
 */
export const playspaceIdSchema = z.string()
  .cuid('ID playspace invalide (doit être un CUID)')

/**
 * Types dérivés TypeScript
 */
export type CreatePlayspaceInput = z.infer<typeof createPlayspaceSchema>
export type UpdatePlayspaceInput = z.infer<typeof updatePlayspaceSchema>
