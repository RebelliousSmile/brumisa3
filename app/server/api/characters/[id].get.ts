/**
 * GET /api/characters/[id]
 * Get a character with all details
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  const id = getRouterParam(event, 'id')

  try {
    // Auth
    const userId = event.context.user?.id
    if (!userId) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Fetch character
    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        playspace: {
          select: {
            id: true,
            name: true,
            hackId: true,
            universeId: true,
            isGM: true,
            userId: true
          }
        },
        themeCards: {
          include: {
            tags: true
          },
          orderBy: { createdAt: 'asc' }
        },
        heroCard: {
          include: {
            relationships: true
          }
        },
        trackers: {
          include: {
            statuses: true,
            storyTags: true,
            storyThemes: true
          }
        }
      }
    })

    if (!character) {
      throw createError({ statusCode: 404, message: 'Character not found' })
    }

    // Check ownership via playspace
    if (character.playspace.userId !== userId) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn(`[API SLOW] GET /api/characters/${id}`, { requestId, duration })
    }

    return character
  } catch (error) {
    console.error(`[API ERROR] GET /api/characters/${id}`, {
      requestId,
      error: error.message
    })
    throw error
  }
})
