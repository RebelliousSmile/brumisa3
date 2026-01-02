/**
 * GET /api/translations/resolve
 *
 * Resout les traductions pour un contexte donne avec heritage en cascade.
 *
 * Query params:
 * - locale: string (required) - Langue (ex: "fr", "en")
 * - hackId: string (required) - Identifiant du hack
 * - universeId: string (optional) - Identifiant de l'univers custom
 * - category: string (required) - Categorie de traductions
 *
 * @returns Record<string, string> - Map cle -> valeur resolue
 */

import { defineEventHandler, getQuery, createError } from 'h3'
import { resolveTranslations } from '../../services/translations.service'
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
  const locale = query.locale as string
  const hackId = query.hackId as string
  const category = query.category as TranslationCategory
  const universeId = query.universeId as string | undefined

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
    const translations = await resolveTranslations(
      { locale, hackId, universeId: universeId || null },
      category
    )

    // Convertir Map en objet pour la reponse JSON
    const result: Record<string, string> = {}
    for (const [key, translation] of translations) {
      result[key] = translation.value
    }

    return {
      locale,
      hackId,
      universeId: universeId || null,
      category,
      count: translations.size,
      translations: result
    }
  } catch (err) {
    console.error('[API] /translations/resolve error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to resolve translations'
    })
  }
})
