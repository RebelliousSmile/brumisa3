/**
 * GET /api/theme-cards/[id]
 * Get a single theme card with tags
 */

import { prisma } from '~/server/utils/prisma'
import { themeCardIdSchema } from '~/server/utils/validation/theme-card.schema'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log('[API] GET /api/theme-cards/[id]', {
    requestId,
    timestamp: new Date().toISOString()
  })

  try {
    // Validate theme card ID
    const themeCardId = event.context.params?.id
    const validationResult = themeCardIdSchema.safeParse(themeCardId)

    if (!validationResult.success) {
      throw createError({
        statusCode: 400,
        message: 'ID theme card invalide',
        data: validationResult.error.flatten()
      })
    }

    // Fetch theme card with authorization check
    const themeCard = await prisma.themeCard.findUnique({
      where: { id: themeCardId },
      include: {
        tags: {
          orderBy: [
            { type: 'asc' },
            { createdAt: 'asc' }
          ]
        },
        character: {
          include: {
            playspace: {
              select: { userId: true }
            }
          }
        }
      }
    })

    if (!themeCard) {
      throw createError({
        statusCode: 404,
        message: 'Theme card non trouvée'
      })
    }

    // Check user authorization
    const userId = event.context.user?.id
    if (!userId || themeCard.character.playspace.userId !== userId) {
      throw createError({
        statusCode: 403,
        message: 'Non autorisé'
      })
    }

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn('[API SLOW] GET /api/theme-cards/[id]', { requestId, duration, threshold: 500 })
    }

    // Remove nested character data before returning
    const { character, ...themeCardData } = themeCard

    return themeCardData
  } catch (error: any) {
    console.error('[API ERROR] GET /api/theme-cards/[id]', {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
