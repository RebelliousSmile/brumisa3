/**
 * PUT /api/playspaces/[id]
 * Update a playspace
 */

import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const UpdatePlayspaceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  systemId: z.enum(['city-of-mist', 'litm']).optional()
})

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  const id = getRouterParam(event, 'id')

  console.log(`[API] PUT /api/playspaces/${id}`, {
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
    const result = UpdatePlayspaceSchema.safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: 'Validation failed',
        data: result.error.flatten()
      })
    }

    // Check playspace exists and ownership
    const existingPlayspace = await prisma.playspace.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingPlayspace) {
      throw createError({ statusCode: 404, message: 'Playspace not found' })
    }

    if (existingPlayspace.userId !== userId) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    // Update playspace
    const playspace = await prisma.playspace.update({
      where: { id },
      data: result.data,
      select: {
        id: true,
        name: true,
        description: true,
        systemId: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn(`[API SLOW] PUT /api/playspaces/${id}`, { requestId, duration, threshold: 500 })
    }

    console.log('[API SUCCESS] Playspace updated', { requestId, playspaceId: id })

    return playspace
  } catch (error) {
    console.error(`[API ERROR] PUT /api/playspaces/${id}`, {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
