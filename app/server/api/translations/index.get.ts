/**
 * GET /api/translations
 *
 * Liste toutes les traductions pour une categorie (pour l'admin).
 *
 * Query params:
 * - category: string (required) - Categorie de traductions
 * - locale: string (required) - Langue
 * - level: string (optional) - Filtrer par niveau (SYSTEM, HACK, UNIVERSE)
 * - hackId: string (optional) - Filtrer par hack
 * - universeId: string (optional) - Filtrer par univers
 *
 * @returns TranslationEntry[] - Liste des traductions
 */

import { defineEventHandler, getQuery, createError } from 'h3'
import { listTranslations, getAvailableCategories } from '../../services/translations.service'
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
  const category = query.category as TranslationCategory | undefined
  const locale = query.locale as string

  // Si pas de categorie, retourner la liste des categories disponibles
  if (!category) {
    return {
      categories: getAvailableCategories()
    }
  }

  if (!locale) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameter: locale'
    })
  }

  if (!VALID_CATEGORIES.includes(category)) {
    throw createError({
      statusCode: 400,
      message: `Invalid category. Valid values: ${VALID_CATEGORIES.join(', ')}`
    })
  }

  // Filtres optionnels
  const level = query.level as TranslationLevel | undefined
  const hackId = query.hackId as string | undefined
  const universeId = query.universeId as string | undefined

  if (level && !VALID_LEVELS.includes(level)) {
    throw createError({
      statusCode: 400,
      message: `Invalid level. Valid values: ${VALID_LEVELS.join(', ')}`
    })
  }

  try {
    const translations = await listTranslations(category, locale, {
      level,
      hackId,
      universeId
    })

    return {
      category,
      locale,
      filters: { level, hackId, universeId },
      count: translations.length,
      translations
    }
  } catch (err) {
    console.error('[API] /translations GET error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to list translations'
    })
  }
})
