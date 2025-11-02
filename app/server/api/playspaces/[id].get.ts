/**
 * GET /api/playspaces/[id]
 * Get a single playspace by ID
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  const id = getRouterParam(event, 'id')

  console.log(`[API] GET /api/playspaces/${id}`, {
    requestId,
    userId: event.context.user?.id,
    timestamp: new Date().toISOString()
  })

  try {
    // Get user from session
    const userId = event.context.user?.id
    if (!userId) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Fetch playspace
    const playspace = await prisma.playspace.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        hackId: true,
        universeId: true,
        isGM: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        characters: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!playspace) {
      throw createError({ statusCode: 404, message: 'Playspace not found' })
    }

    // Check ownership
    if (playspace.userId !== userId) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn(`[API SLOW] GET /api/playspaces/${id}`, { requestId, duration, threshold: 500 })
    }

    return playspace
  } catch (error) {
    console.error(`[API ERROR] GET /api/playspaces/${id}`, {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
