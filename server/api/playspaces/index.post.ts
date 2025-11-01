/**
 * POST /api/playspaces
 * Create a new playspace for the authenticated user
 */

import { PrismaClient } from '@prisma/client'
import { createPlayspaceSchema } from '../../utils/validation/playspace.schema'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log('[API] POST /api/playspaces', {
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

    // Validate request body
    const body = await readBody(event)
    const result = createPlayspaceSchema.safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: 'Validation échouée',
        data: result.error.flatten()
      })
    }

    const { name, description, hackId, universeId } = result.data

    // Create playspace
    const playspace = await prisma.playspace.create({
      data: {
        name,
        description,
        hackId,
        universeId: universeId || null,
        userId
      },
      select: {
        id: true,
        name: true,
        description: true,
        hackId: true,
        universeId: true,
        isGM: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn('[API SLOW] POST /api/playspaces', { requestId, duration, threshold: 500 })
    }

    console.log('[API SUCCESS] Playspace created', { requestId, playspaceId: playspace.id })

    return playspace
  } catch (error) {
    console.error('[API ERROR] POST /api/playspaces', {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
