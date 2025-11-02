/**
 * PUT /api/characters/[id]
 * Update a character
 */

import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const UpdateCharacterSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable()
})

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

    // Validate body
    const body = await readBody(event)
    const result = UpdateCharacterSchema.safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: 'Validation échouée',
        data: result.error.flatten()
      })
    }

    // Check character exists and ownership
    const existing = await prisma.character.findUnique({
      where: { id },
      include: {
        playspace: {
          select: { userId: true }
        }
      }
    })

    if (!existing) {
      throw createError({ statusCode: 404, message: 'Character not found' })
    }

    if (existing.playspace.userId !== userId) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    // Update character
    const character = await prisma.character.update({
      where: { id },
      data: result.data,
      include: {
        playspace: {
          select: {
            hackId: true,
            universeId: true,
            isGM: true
          }
        }
      }
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn(`[API SLOW] PUT /api/characters/${id}`, { requestId, duration })
    }

    console.log('[API SUCCESS] Character updated', { requestId, characterId: id })

    return character
  } catch (error) {
    console.error(`[API ERROR] PUT /api/characters/${id}`, {
      requestId,
      error: error.message
    })
    throw error
  }
})
