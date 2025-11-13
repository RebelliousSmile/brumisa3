/**
 * PUT /api/characters/[id]/trackers
 * Update character's trackers (statuses, story tags, story themes)
 *
 * Notes:
 * - Trackers are automatically created when character is created
 * - This route replaces all statuses/story tags/story themes
 * - For incremental updates, use specific routes (to be implemented if needed)
 */

import { prisma } from '~/server/utils/prisma'
import { characterIdSchema } from '~/server/utils/validation/character.schema'
import { updateTrackersSchema } from '~/server/utils/validation/trackers.schema'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log('[API] PUT /api/characters/[id]/trackers', {
    requestId,
    timestamp: new Date().toISOString()
  })

  try {
    // Validate character ID
    const characterId = event.context.params?.id
    const idValidation = characterIdSchema.safeParse(characterId)

    if (!idValidation.success) {
      throw createError({
        statusCode: 400,
        message: 'ID personnage invalide',
        data: idValidation.error.flatten()
      })
    }

    // Validate request body
    const body = await readBody(event)
    const bodyValidation = updateTrackersSchema.safeParse(body)

    if (!bodyValidation.success) {
      throw createError({
        statusCode: 400,
        message: 'Validation échouée',
        data: bodyValidation.error.flatten()
      })
    }

    // Fetch character for authorization check
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        trackers: true,
        playspace: {
          select: { userId: true }
        }
      }
    })

    if (!character) {
      throw createError({
        statusCode: 404,
        message: 'Personnage non trouvé'
      })
    }

    // Check user authorization
    const userId = event.context.user?.id
    if (!userId || character.playspace.userId !== userId) {
      throw createError({
        statusCode: 403,
        message: 'Non autorisé'
      })
    }

    // Ensure trackers exist
    let trackersId = character.trackers?.id
    if (!trackersId) {
      const newTrackers = await prisma.trackers.create({
        data: { characterId }
      })
      trackersId = newTrackers.id
    }

    // Update trackers (replace all)
    const updates = []

    if (bodyValidation.data.statuses) {
      // Delete existing statuses
      await prisma.status.deleteMany({ where: { trackersId } })
      // Create new statuses
      if (bodyValidation.data.statuses.length > 0) {
        updates.push(
          prisma.status.createMany({
            data: bodyValidation.data.statuses.map(s => ({
              ...s,
              trackersId
            }))
          })
        )
      }
    }

    if (bodyValidation.data.storyTags) {
      // Delete existing story tags
      await prisma.storyTag.deleteMany({ where: { trackersId } })
      // Create new story tags
      if (bodyValidation.data.storyTags.length > 0) {
        updates.push(
          prisma.storyTag.createMany({
            data: bodyValidation.data.storyTags.map(st => ({
              ...st,
              trackersId
            }))
          })
        )
      }
    }

    if (bodyValidation.data.storyThemes) {
      // Delete existing story themes
      await prisma.storyTheme.deleteMany({ where: { trackersId } })
      // Create new story themes
      if (bodyValidation.data.storyThemes.length > 0) {
        updates.push(
          prisma.storyTheme.createMany({
            data: bodyValidation.data.storyThemes.map(st => ({
              ...st,
              trackersId
            }))
          })
        )
      }
    }

    // Execute all updates
    await Promise.all(updates)

    // Fetch updated trackers
    const updatedTrackers = await prisma.trackers.findUnique({
      where: { id: trackersId },
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
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn('[API SLOW] PUT /api/characters/[id]/trackers', { requestId, duration, threshold: 500 })
    }

    console.log('[API SUCCESS] Trackers updated', { requestId, trackersId })

    return updatedTrackers
  } catch (error: any) {
    console.error('[API ERROR] PUT /api/characters/[id]/trackers', {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
