/**
 * GET /api/characters
 * List all characters for a playspace
 */

import { prisma } from '~/server/utils/prisma'
import { z } from 'zod'

const QuerySchema = z.object({
  playspaceId: z.string().cuid()
})

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    // Auth
    const userId = event.context.user?.id
    if (!userId) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Validate query
    const query = getQuery(event)
    const result = QuerySchema.safeParse(query)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: 'playspaceId requis',
        data: result.error.flatten()
      })
    }

    const { playspaceId } = result.data

    // Check playspace ownership
    const playspace = await prisma.playspace.findUnique({
      where: { id: playspaceId },
      select: { userId: true }
    })

    if (!playspace) {
      throw createError({ statusCode: 404, message: 'Playspace not found' })
    }

    if (playspace.userId !== userId) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    // Fetch characters
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
      console.warn(`[API SLOW] GET /api/characters`, { requestId, duration })
    }

    return characters
  } catch (error) {
    console.error('[API ERROR] GET /api/characters', {
      requestId,
      error: error.message
    })
    throw error
  }
})
