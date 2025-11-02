/**
 * DELETE /api/characters/[id]
 * Delete a character (cascade deletes theme cards, tags, hero card, trackers)
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

    // Check character exists and ownership
    const existing = await prisma.character.findUnique({
      where: { id },
      include: {
        playspace: {
          select: { userId: true }
        },
        _count: {
          select: {
            themeCards: true
          }
        }
      }
    })

    if (!existing) {
      throw createError({ statusCode: 404, message: 'Character not found' })
    }

    if (existing.playspace.userId !== userId) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    // Warn if character has theme cards
    if (existing._count.themeCards > 0) {
      console.warn(`[API WARNING] Deleting character with ${existing._count.themeCards} theme cards`, {
        requestId,
        characterId: id
      })
    }

    // Delete character (cascade deletes relations)
    await prisma.character.delete({
      where: { id }
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn(`[API SLOW] DELETE /api/characters/${id}`, { requestId, duration })
    }

    console.log('[API SUCCESS] Character deleted', { requestId, characterId: id })

    return { success: true, message: 'Character deleted' }
  } catch (error) {
    console.error(`[API ERROR] DELETE /api/characters/${id}`, {
      requestId,
      error: error.message
    })
    throw error
  }
})
