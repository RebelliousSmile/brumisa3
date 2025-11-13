/**
 * Validation Schemas - Theme Card
 * Schemas Zod pour validation API routes Theme Cards
 */

import { z } from 'zod'
import { ThemeType } from '@prisma/client'

/**
 * Validation Theme Type selon hack
 *
 * LITM: ORIGIN, ADVENTURE, GREATNESS, FELLOWSHIP, BACKPACK
 * Otherscape: NOISE, SELF, MYTHOS_OS, CREW_OS, LOADOUT
 * City of Mist: MYTHOS, LOGOS, MIST, CREW
 */
export const themeTypeSchema = z.nativeEnum(ThemeType, {
  errorMap: () => ({ message: 'Type de thème invalide' })
})

/**
 * Schema validation : Création Theme Card
 */
export const createThemeCardSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  type: themeTypeSchema,

  description: z.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional()
    .nullable(),

  attention: z.number()
    .int('L\'attention doit être un entier')
    .min(0, 'L\'attention ne peut pas être négative')
    .max(10, 'L\'attention ne peut pas dépasser 10')
    .default(0),

  characterId: z.string()
    .cuid('ID personnage invalide (doit être un CUID)')
})

/**
 * Schema validation : Mise à jour Theme Card
 */
export const updateThemeCardSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .optional(),

  type: themeTypeSchema.optional(),

  description: z.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional()
    .nullable(),

  attention: z.number()
    .int('L\'attention doit être un entier')
    .min(0, 'L\'attention ne peut pas être négative')
    .max(10, 'L\'attention ne peut pas dépasser 10')
    .optional()
})

/**
 * Schema validation : ID Theme Card (params)
 */
export const themeCardIdSchema = z.string()
  .cuid('ID theme card invalide (doit être un CUID)')

/**
 * Validation contextuelle : Theme Type selon Hack
 *
 * Vérifie que le type de thème est valide pour le hack actif
 */
export function validateThemeTypeForHack(hackId: string, themeType: ThemeType): boolean {
  const validTypes = {
    'litm': ['ORIGIN', 'ADVENTURE', 'GREATNESS', 'FELLOWSHIP', 'BACKPACK'],
    'otherscape': ['NOISE', 'SELF', 'MYTHOS_OS', 'CREW_OS', 'LOADOUT'],
    'city-of-mist': ['MYTHOS', 'LOGOS', 'MIST', 'CREW']
  }

  const valid = validTypes[hackId as keyof typeof validTypes] || []
  return valid.includes(themeType)
}

/**
 * Types dérivés TypeScript
 */
export type CreateThemeCardInput = z.infer<typeof createThemeCardSchema>
export type UpdateThemeCardInput = z.infer<typeof updateThemeCardSchema>
