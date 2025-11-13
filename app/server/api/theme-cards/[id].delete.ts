/**
 * DELETE /api/theme-cards/[id]
 * Delete a theme card
 *
 * Business Rule: Minimum 2 theme cards required per character (City of Mist rule)
 */

import { prisma } from '~/server/utils/prisma'
import { themeCardIdSchema } from '~/server/utils/validation/theme-card.schema'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log('[API] DELETE /api/theme-cards/[id]', {
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

    // Fetch theme card for authorization check
    const themeCard = await prisma.themeCard.findUnique({
      where: { id: themeCardId },
      include: {
        character: {
          include: {
            playspace: {
              select: { userId: true }
            },
            _count: {
              select: { themeCards: true }
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

    // Validate minimum theme cards (City of Mist rule: min 2)
    const currentCount = themeCard.character._count.themeCards
    if (currentCount <= 2) {
      throw createError({
        statusCode: 400,
        message: 'Impossible de supprimer : minimum 2 Theme Cards requis par personnage'
      })
    }

    // Delete theme card (cascade will delete associated tags)
    await prisma.themeCard.delete({
      where: { id: themeCardId }
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn('[API SLOW] DELETE /api/theme-cards/[id]', { requestId, duration, threshold: 500 })
    }

    console.log('[API SUCCESS] Theme card deleted', { requestId, themeCardId })

    return { success: true, message: 'Theme card supprimée avec succès' }
  } catch (error: any) {
    console.error('[API ERROR] DELETE /api/theme-cards/[id]', {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
