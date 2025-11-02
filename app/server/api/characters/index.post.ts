/**
 * POST /api/characters
 * Create a new character in a playspace
 */

import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const CreateCharacterSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
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

    // Validate body
    const body = await readBody(event)
    const result = CreateCharacterSchema.safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: 'Validation échouée',
        data: result.error.flatten()
      })
    }

    const { name, description, playspaceId } = result.data

    // Check playspace exists and ownership
    const playspace = await prisma.playspace.findUnique({
      where: { id: playspaceId },
      select: { userId: true, hackId: true }
    })

    if (!playspace) {
      throw createError({ statusCode: 404, message: 'Playspace not found' })
    }

    if (playspace.userId !== userId) {
      throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    // Create character
    const character = await prisma.character.create({
      data: {
        name,
        description,
        playspaceId
      },
      include: {
        playspace: {
          select: {
            id: true,
            name: true,
            hackId: true,
            universeId: true,
            isGM: true
          }
        }
      }
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn(`[API SLOW] POST /api/characters`, { requestId, duration })
    }

    console.log('[API SUCCESS] Character created', { requestId, characterId: character.id })

    return character
  } catch (error) {
    console.error('[API ERROR] POST /api/characters', {
      requestId,
      error: error.message
    })
    throw error
  }
})
