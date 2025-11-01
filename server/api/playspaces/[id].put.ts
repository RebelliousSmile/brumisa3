/**
 * PUT /api/playspaces/[id]
 * Update a playspace
 */

import { PrismaClient } from '@prisma/client'
import { updatePlayspaceSchema, playspaceIdSchema } from '~/server/utils/validation/playspace.schema'

const prisma = new PrismaClient()

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

    // Validate playspace ID
    const idValidation = playspaceIdSchema.safeParse(id)
    if (!idValidation.success) {
      throw createError({
        statusCode: 400,
        message: 'ID playspace invalide',
        data: idValidation.error.flatten()
      })
    }

    // Validate request body
    const body = await readBody(event)
    const result = updatePlayspaceSchema.safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: 'Validation échouée',
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
        hackId: true,
        universeId: true,
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
