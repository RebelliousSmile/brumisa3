/**
 * POST /api/playspaces
 * Create a new playspace
 * - Si connecte : sauvegarde en BDD
 * - Si non connecte : retourne les donnees validees (stockage local cote client)
 */

import { prisma } from '~/server/utils/prisma'
import { createPlayspaceSchema } from '../../utils/validation/playspace.schema'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log('[API] POST /api/playspaces', {
    requestId,
    userId: event.context.user?.id,
    timestamp: new Date().toISOString()
  })

  try {
    // Validate request body
    const body = await readBody(event)
    const result = createPlayspaceSchema.safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: 'Validation echouee',
        data: result.error.flatten()
      })
    }

    const { name, description, hackId, universeId, isGM } = result.data

    // Get user from session (optionnel)
    const userId = event.context.user?.id

    // Si connecte : sauvegarder en BDD
    if (userId) {
      const playspace = await prisma.playspace.create({
        data: {
          name,
          description,
          hackId,
          universeId: universeId || null,
          isGM: isGM || false,
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

      console.log('[API SUCCESS] Playspace created in DB', { requestId, playspaceId: playspace.id })

      return { ...playspace, persisted: true }
    }

    // Si non connecte : retourner les donnees validees avec ID temporaire
    const tempPlayspace = {
      id: `local_${crypto.randomUUID()}`,
      name,
      description: description || null,
      hackId,
      universeId: universeId || null,
      isGM: isGM || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      persisted: false
    }

    console.log('[API SUCCESS] Playspace created locally', { requestId, playspaceId: tempPlayspace.id })

    return tempPlayspace
  } catch (error: any) {
    console.error('[API ERROR] POST /api/playspaces', {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
