/**
 * GET /api/playspaces/[id]/characters
 * List all characters in a playspace
 */

import { prisma } from '~/server/utils/prisma'
import { playspaceIdSchema } from '~/server/utils/validation/playspace.schema'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log('[API] GET /api/playspaces/[id]/characters', {
    requestId,
    timestamp: new Date().toISOString()
  })

  try {
    // Validate playspace ID
    const playspaceId = event.context.params?.id
    const validationResult = playspaceIdSchema.safeParse(playspaceId)

    if (!validationResult.success) {
      throw createError({
        statusCode: 400,
        message: 'ID playspace invalide',
        data: validationResult.error.flatten()
      })
    }

    // Verify playspace exists and belongs to user
    const playspace = await prisma.playspace.findUnique({
      where: { id: playspaceId },
      select: { userId: true, hackId: true }
    })

    if (!playspace) {
      throw createError({
        statusCode: 404,
        message: 'Playspace non trouvé'
      })
    }

    // Check user authorization
    const userId = event.context.user?.id
    if (!userId || playspace.userId !== userId) {
      throw createError({
        statusCode: 403,
        message: 'Non autorisé'
      })
    }

    // Fetch characters with counts
    const characters = await prisma.character.findMany({
      where: { playspaceId },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            themeCards: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn('[API SLOW] GET /api/playspaces/[id]/characters', { requestId, duration, threshold: 500 })
    }

    return {
      playspaceId,
      hackId: playspace.hackId,
      characters,
      total: characters.length
    }
  } catch (error: any) {
    console.error('[API ERROR] GET /api/playspaces/[id]/characters', {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
