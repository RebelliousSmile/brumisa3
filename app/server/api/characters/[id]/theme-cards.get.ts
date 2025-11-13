/**
 * GET /api/characters/[id]/theme-cards
 * Get all theme cards for a character
 */

import { prisma } from '~/server/utils/prisma'
import { characterIdSchema } from '~/server/utils/validation/character.schema'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log('[API] GET /api/characters/[id]/theme-cards', {
    requestId,
    timestamp: new Date().toISOString()
  })

  try {
    // Validate character ID
    const characterId = event.context.params?.id
    const validationResult = characterIdSchema.safeParse(characterId)

    if (!validationResult.success) {
      throw createError({
        statusCode: 400,
        message: 'ID personnage invalide',
        data: validationResult.error.flatten()
      })
    }

    // Verify character exists and belongs to user
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        playspace: {
          select: { userId: true }
        }
      }
    })

    if (!character) {
      throw createError({
        statusCode: 404,
        message: 'Personnage non trouvé'
      })
    }

    // Check user authorization
    const userId = event.context.user?.id
    if (!userId || character.playspace.userId !== userId) {
      throw createError({
        statusCode: 403,
        message: 'Non autorisé'
      })
    }

    // Fetch theme cards with tags
    const themeCards = await prisma.themeCard.findMany({
      where: { characterId },
      include: {
        tags: {
          orderBy: [
            { type: 'asc' }, // POWER first, then WEAKNESS, then STORY
            { createdAt: 'asc' }
          ]
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn('[API SLOW] GET /api/characters/[id]/theme-cards', { requestId, duration, threshold: 500 })
    }

    return themeCards
  } catch (error: any) {
    console.error('[API ERROR] GET /api/characters/[id]/theme-cards', {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
