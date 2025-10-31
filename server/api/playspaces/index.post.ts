/**
 * POST /api/playspaces
 * Create a new playspace for the authenticated user
 */

import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const CreatePlayspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  description: z.string().optional(),
  systemId: z.enum(['city-of-mist', 'litm'], {
    errorMap: () => ({ message: 'System must be city-of-mist or litm' })
  })
})

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
    const result = CreatePlayspaceSchema.safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: 'Validation failed',
        data: result.error.flatten()
      })
    }

    const { name, description, systemId } = result.data

    // Create playspace
    const playspace = await prisma.playspace.create({
      data: {
        name,
        description,
        systemId,
        userId
      },
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
