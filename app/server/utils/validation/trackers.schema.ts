/**
 * Validation Schemas - Trackers
 * Schemas Zod pour validation API routes Trackers
 */

import { z } from 'zod'

/**
 * Schema validation : Status
 */
export const statusSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  tier: z.number()
    .int('Le tier doit être un entier')
    .min(1, 'Le tier minimum est 1')
    .max(5, 'Le tier maximum est 5')
    .default(1),

  positive: z.boolean({
    errorMap: () => ({ message: 'positive doit être un booléen' })
  }).default(true)
})

/**
 * Schema validation : Story Tag
 */
export const storyTagSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères')
})

/**
 * Schema validation : Story Theme
 */
export const storyThemeSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères')
})

/**
 * Schema validation : Mise à jour Trackers
 *
 * Note : Les trackers sont créés automatiquement avec le personnage.
 * Cette route permet de mettre à jour les listes de status/story tags/themes.
 */
export const updateTrackersSchema = z.object({
  statuses: z.array(statusSchema).optional(),
  storyTags: z.array(storyTagSchema).optional(),
  storyThemes: z.array(storyThemeSchema).optional()
})

/**
 * Schema validation : Ajout Status
 */
export const addStatusSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  tier: z.number()
    .int('Le tier doit être un entier')
    .min(1, 'Le tier minimum est 1')
    .max(5, 'Le tier maximum est 5')
    .default(1),

  positive: z.boolean({
    errorMap: () => ({ message: 'positive doit être un booléen' })
  }).default(true),

  trackersId: z.string()
    .cuid('ID trackers invalide (doit être un CUID)')
})

/**
 * Schema validation : Ajout Story Tag
 */
export const addStoryTagSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),

  trackersId: z.string()
    .cuid('ID trackers invalide (doit être un CUID)')
})

/**
 * Schema validation : Ajout Story Theme
 */
export const addStoryThemeSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),

  trackersId: z.string()
    .cuid('ID trackers invalide (doit être un CUID)')
})

/**
 * Schema validation : ID Trackers (params)
 */
export const trackersIdSchema = z.string()
  .cuid('ID trackers invalide (doit être un CUID)')

/**
 * Types dérivés TypeScript
 */
export type UpdateTrackersInput = z.infer<typeof updateTrackersSchema>
export type AddStatusInput = z.infer<typeof addStatusSchema>
export type AddStoryTagInput = z.infer<typeof addStoryTagSchema>
export type AddStoryThemeInput = z.infer<typeof addStoryThemeSchema>
