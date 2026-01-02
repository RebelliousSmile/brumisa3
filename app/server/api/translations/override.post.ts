/**
 * POST /api/translations/override
 *
 * Cree ou met a jour un override de traduction.
 *
 * Body:
 * - key: string (required) - Cle de traduction
 * - value: string (required) - Nouvelle valeur
 * - locale: string (required) - Langue
 * - category: TranslationCategory (required)
 * - level: TranslationLevel (required) - SYSTEM, HACK, ou UNIVERSE
 * - description: string (optional) - Description pour les editeurs
 * - systemId: string (conditional) - Requis si level=SYSTEM
 * - hackId: string (conditional) - Requis si level=HACK
 * - universeId: string (conditional) - Requis si level=UNIVERSE
 *
 * @returns TranslationEntry - L'entry creee ou mise a jour
 */

import { defineEventHandler, readBody, createError } from 'h3'
import { createOrUpdateTranslation } from '../../services/translations.service'
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

interface OverrideBody {
  key: string
  value: string
  locale: string
  category: TranslationCategory
  level: TranslationLevel
  description?: string
  systemId?: string
  hackId?: string
  universeId?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<OverrideBody>(event)

  // Validation des champs requis
  if (!body.key?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Missing required field: key'
    })
  }

  if (body.value === undefined || body.value === null) {
    throw createError({
      statusCode: 400,
      message: 'Missing required field: value'
    })
  }

  if (!body.locale?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Missing required field: locale'
    })
  }

  if (!body.category) {
    throw createError({
      statusCode: 400,
      message: 'Missing required field: category'
    })
  }

  if (!VALID_CATEGORIES.includes(body.category)) {
    throw createError({
      statusCode: 400,
      message: `Invalid category. Valid values: ${VALID_CATEGORIES.join(', ')}`
    })
  }

  if (!body.level) {
    throw createError({
      statusCode: 400,
      message: 'Missing required field: level'
    })
  }

  if (!VALID_LEVELS.includes(body.level)) {
    throw createError({
      statusCode: 400,
      message: `Invalid level. Valid values: ${VALID_LEVELS.join(', ')}`
    })
  }

  // Validation conditionnelle selon le level
  if (body.level === 'SYSTEM' && !body.systemId) {
    throw createError({
      statusCode: 400,
      message: 'systemId is required when level=SYSTEM'
    })
  }

  if (body.level === 'HACK' && !body.hackId) {
    throw createError({
      statusCode: 400,
      message: 'hackId is required when level=HACK'
    })
  }

  if (body.level === 'UNIVERSE' && !body.universeId) {
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

    const entry = await createOrUpdateTranslation({
      key: body.key.trim(),
      value: body.value,
      locale: body.locale.trim(),
      category: body.category,
      level: body.level,
      description: body.description?.trim(),
      systemId: body.level === 'SYSTEM' ? body.systemId : undefined,
      hackId: body.level === 'HACK' ? body.hackId : undefined,
      universeId: body.level === 'UNIVERSE' ? body.universeId : undefined
      // TODO: Ajouter createdBy depuis la session
    })

    return {
      success: true,
      entry
    }
  } catch (err) {
    console.error('[API] /translations/override POST error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to create/update translation override'
    })
  }
})
