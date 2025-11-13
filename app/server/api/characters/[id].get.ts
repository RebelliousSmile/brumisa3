/**
 * GET /api/characters/[id]
 * Get a character with all details
 */

import { prisma } from '~/server/utils/prisma'

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

    // Check if full data is requested
    const query = getQuery(event)
    const full = query.full === 'true'

    // Fetch character with optimized select
    const character = await prisma.character.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        playspaceId: true,
        createdAt: true,
        updatedAt: true,
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
        ...(full && {
          themeCards: {
            include: {
              tags: {
                orderBy: [
                  { type: 'asc' },
                  { createdAt: 'asc' }
                ]
              }
            },
            orderBy: { createdAt: 'asc' }
          },
          heroCard: {
            include: {
              relationships: {
                orderBy: { createdAt: 'asc' }
              }
            }
          },
          trackers: {
            include: {
              statuses: {
                orderBy: { createdAt: 'asc' }
              },
              storyTags: {
                orderBy: { createdAt: 'asc' }
              },
              storyThemes: {
                orderBy: { createdAt: 'asc' }
              }
            }
          }
        }),
        ...(!full && {
          _count: {
            select: { themeCards: true }
          }
        })
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
