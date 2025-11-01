/**
 * GET /api/playspaces
 * List all playspaces for the authenticated user
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log('[API] GET /api/playspaces', {
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

    // Fetch user's playspaces
    const playspaces = await prisma.playspace.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        hackId: true,
        universeId: true,
        isGM: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { characters: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn('[API SLOW] GET /api/playspaces', { requestId, duration, threshold: 500 })
    }

    return playspaces
  } catch (error) {
    console.error('[API ERROR] GET /api/playspaces', {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
