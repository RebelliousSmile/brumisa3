/**
 * Validation Schemas - Tag
 * Schemas Zod pour validation API routes Tags
 */

import { z } from 'zod'
import { TagType } from '@prisma/client'

/**
 * Validation Tag Type
 * POWER, WEAKNESS, STORY (règles universelles Mist Engine)
 */
export const tagTypeSchema = z.nativeEnum(TagType, {
  errorMap: () => ({ message: 'Type de tag invalide. Valeurs autorisées : POWER, WEAKNESS, STORY' })
})

/**
 * Schema validation : Création Tag
 */
export const createTagSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),

  type: tagTypeSchema,

  burned: z.boolean({
    errorMap: () => ({ message: 'burned doit être un booléen' })
  }).default(false),

  inverted: z.boolean({
    errorMap: () => ({ message: 'inverted doit être un booléen' })
  }).default(false),

  themeCardId: z.string()
    .cuid('ID theme card invalide (doit être un CUID)')
})

/**
 * Schema validation : Mise à jour Tag
 */
export const updateTagSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères')
    .optional(),

  type: tagTypeSchema.optional(),

  burned: z.boolean({
    errorMap: () => ({ message: 'burned doit être un booléen' })
  }).optional(),

  inverted: z.boolean({
    errorMap: () => ({ message: 'inverted doit être un booléen' })
  }).optional()
})

/**
 * Schema validation : ID Tag (params)
 */
export const tagIdSchema = z.string()
  .cuid('ID tag invalide (doit être un CUID)')

/**
 * Validation nombre de tags par Theme Card
 *
 * Règles City of Mist (héritées par tous les hacks) :
 * - Power tags : 3-5 par Theme Card
 * - Weakness tags : 1-2 par Theme Card
 */
export function validateTagCount(tags: { type: TagType }[]): { valid: boolean; error?: string } {
  const powerTags = tags.filter(t => t.type === 'POWER').length
  const weaknessTags = tags.filter(t => t.type === 'WEAKNESS').length

  if (powerTags < 3) {
    return { valid: false, error: 'Minimum 3 Power tags requis' }
  }
  if (powerTags > 5) {
    return { valid: false, error: 'Maximum 5 Power tags autorisés' }
  }
  if (weaknessTags < 1) {
    return { valid: false, error: 'Minimum 1 Weakness tag requis' }
  }
  if (weaknessTags > 2) {
    return { valid: false, error: 'Maximum 2 Weakness tags autorisés' }
  }

  return { valid: true }
}

/**
 * Types dérivés TypeScript
 */
export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
