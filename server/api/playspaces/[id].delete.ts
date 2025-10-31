/**
 * DELETE /api/playspaces/[id]
 * Delete a playspace (cascade deletes all characters)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  const id = getRouterParam(event, 'id')

  console.log(`[API] DELETE /api/playspaces/${id}`, {
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

    // Check playspace exists and ownership
    const existingPlayspace = await prisma.playspace.findUnique({
      where: { id },
      select: {
        userId: true,
        _count: {
          select: { characters: true }
        }
      }
    })

    if (!existingPlayspace) {
      throw createError({ statusCode: 404, message: 'Playspace not found' })
    }

    if (existingPlayspace.userId !== userId) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    // Warn if playspace has characters
    if (existingPlayspace._count.characters > 0) {
      console.warn(`[API WARNING] Deleting playspace with ${existingPlayspace._count.characters} characters`, {
        requestId,
        playspaceId: id
      })
    }

    // Delete playspace (cascade deletes characters, theme cards, etc.)
    await prisma.playspace.delete({
      where: { id }
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn(`[API SLOW] DELETE /api/playspaces/${id}`, { requestId, duration, threshold: 500 })
    }

    console.log('[API SUCCESS] Playspace deleted', { requestId, playspaceId: id })

    return { success: true, message: 'Playspace deleted' }
  } catch (error) {
    console.error(`[API ERROR] DELETE /api/playspaces/${id}`, {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
