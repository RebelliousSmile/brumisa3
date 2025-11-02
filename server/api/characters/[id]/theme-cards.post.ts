/**
 * POST /api/characters/[id]/theme-cards
 * Create a theme card for a character
 * Validates ThemeType based on playspace hackId
 */

import { PrismaClient, ThemeType } from '@prisma/client'
import { z } from 'zod'
import { validateThemeType, getHackRules } from '~/server/config/systems.config'

const prisma = new PrismaClient()

const CreateThemeCardSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.nativeEnum(ThemeType),
  description: z.string().max(500).optional()
})

export default defineEventHandler(async (event) => {
  const requestId = crypto.randomUUID()
  const characterId = getRouterParam(event, 'id')

  try {
    // Auth
    const userId = event.context.user?.id
    if (!userId) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Validate body
    const body = await readBody(event)
    const result = CreateThemeCardSchema.safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: 'Validation échouée',
        data: result.error.flatten()
      })
    }

    const { name, type, description } = result.data

    // Get character + playspace
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        playspace: {
          select: {
            userId: true,
            hackId: true
          }
        },
        _count: {
          select: { themeCards: true }
        }
      }
    })

    if (!character) {
      throw createError({ statusCode: 404, message: 'Character not found' })
    }

    // Check ownership
    if (character.playspace.userId !== userId) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    // Validate ThemeType selon hackId
    if (!validateThemeType(character.playspace.hackId, type)) {
      throw createError({
        statusCode: 400,
        message: `ThemeType ${type} not valid for hack ${character.playspace.hackId}`
      })
    }

    // Check max theme cards (règle Mist Engine : max 4)
    const rules = getHackRules(character.playspace.hackId)
    if (character._count.themeCards >= rules!.themeCardsRange.max) {
      throw createError({
        statusCode: 400,
        message: `Max ${rules!.themeCardsRange.max} theme cards per character`
      })
    }

    // Create theme card
    const themeCard = await prisma.themeCard.create({
      data: {
        name,
        type,
        description,
        characterId
      },
      include: {
        tags: true
      }
    })

    console.log('[API SUCCESS] Theme card created', { requestId, themeCardId: themeCard.id })

    return themeCard
  } catch (error) {
    console.error('[API ERROR] POST /api/characters/[id]/theme-cards', {
      requestId,
      error: error.message
    })
    throw error
  }
})
