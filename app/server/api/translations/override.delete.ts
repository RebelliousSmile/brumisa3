/**
 * DELETE /api/translations/override
 *
 * Supprime un override de traduction (retour a la valeur parente).
 *
 * Query params:
 * - key: string (required) - Cle de traduction
 * - locale: string (required) - Langue
 * - category: TranslationCategory (required)
 * - level: TranslationLevel (required) - SYSTEM, HACK, ou UNIVERSE
 * - hackId: string (required) - Identifiant du hack (pour contexte)
 * - universeId: string (optional) - Identifiant de l'univers (si level=UNIVERSE)
 *
 * @returns { success: boolean, message: string }
 */

import { defineEventHandler, getQuery, createError } from 'h3'
import { deleteTranslationOverride } from '../../services/translations.service'
import type { TranslationCategory, TranslationLevel } from '@prisma/client'

// Categories valides
const VALID_CATEGORIES: TranslationCategory[] = [
  'CHARACTER',
  'PLAYSPACE',
  'GAME_MECHANICS',
  'UI',
  'THEMES',
  'MOVES',
  'STATUSES',
  'TAGS'
]

// Niveaux valides
const VALID_LEVELS: TranslationLevel[] = ['SYSTEM', 'HACK', 'UNIVERSE']

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // Validation des parametres requis
  const key = query.key as string
  const locale = query.locale as string
  const category = query.category as TranslationCategory
  const level = query.level as TranslationLevel
  const hackId = query.hackId as string
  const universeId = query.universeId as string | undefined

  if (!key) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameter: key'
    })
  }

  if (!locale) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameter: locale'
    })
  }

  if (!category) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameter: category'
    })
  }

  if (!VALID_CATEGORIES.includes(category)) {
    throw createError({
      statusCode: 400,
      message: `Invalid category. Valid values: ${VALID_CATEGORIES.join(', ')}`
    })
  }

  if (!level) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameter: level'
    })
  }

  if (!VALID_LEVELS.includes(level)) {
    throw createError({
      statusCode: 400,
      message: `Invalid level. Valid values: ${VALID_LEVELS.join(', ')}`
    })
  }

  if (!hackId) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameter: hackId'
    })
  }

  // Validation conditionnelle
  if (level === 'UNIVERSE' && !universeId) {
    throw createError({
      statusCode: 400,
      message: 'universeId is required when level=UNIVERSE'
    })
  }

  try {
    // TODO: Ajouter verification des permissions
    // - SYSTEM: admin uniquement
    // - HACK: admin uniquement
    // - UNIVERSE: createur de l'univers ou admin

    const deleted = await deleteTranslationOverride(
      key,
      { locale, hackId, universeId: universeId || null },
      category,
      level
    )

    if (!deleted) {
      throw createError({
        statusCode: 404,
        message: `Translation override not found: ${key} (${level})`
      })
    }

    return {
      success: true,
      message: `Translation override deleted: ${key} (${level})`
    }
  } catch (err: any) {
    if (err.statusCode) throw err

    console.error('[API] /translations/override DELETE error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete translation override'
    })
  }
})
