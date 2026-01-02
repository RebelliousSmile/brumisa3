/**
 * GET /api/translations/hierarchy
 *
 * Recupere la hierarchie complete d'une traduction.
 * Montre toutes les sources: SYSTEM, HACK, UNIVERSE avec leurs valeurs.
 * Utile pour l'editeur de traductions.
 *
 * Query params:
 * - key: string (required) - Cle de traduction
 * - locale: string (required) - Langue
 * - hackId: string (required) - Identifiant du hack
 * - universeId: string (optional) - Identifiant de l'univers custom
 * - category: string (required) - Categorie de traductions
 *
 * @returns TranslationHierarchy - Hierarchie avec valeurs a chaque niveau
 */

import { defineEventHandler, getQuery, createError } from 'h3'
import { getTranslationHierarchy } from '../../services/translations.service'
import type { TranslationCategory } from '@prisma/client'

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

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // Validation des parametres requis
  const key = query.key as string
  const locale = query.locale as string
  const hackId = query.hackId as string
  const category = query.category as TranslationCategory
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

  if (!hackId) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameter: hackId'
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

  try {
    const hierarchy = await getTranslationHierarchy(
      key,
      { locale, hackId, universeId: universeId || null },
      category
    )

    if (!hierarchy) {
      throw createError({
        statusCode: 404,
        message: `Translation not found: ${key}`
      })
    }

    return hierarchy
  } catch (err: any) {
    if (err.statusCode) throw err

    console.error('[API] /translations/hierarchy error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to get translation hierarchy'
    })
  }
})
