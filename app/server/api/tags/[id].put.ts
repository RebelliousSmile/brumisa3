/**
 * PUT /api/tags/[id]
 * Update a tag
 */

import { prisma } from '~/server/utils/prisma'
import { tagIdSchema, updateTagSchema } from '~/server/utils/validation/tag.schema'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log('[API] PUT /api/tags/[id]', {
    requestId,
    timestamp: new Date().toISOString()
  })

  try {
    // Validate tag ID
    const tagId = event.context.params?.id
    const idValidation = tagIdSchema.safeParse(tagId)

    if (!idValidation.success) {
      throw createError({
        statusCode: 400,
        message: 'ID tag invalide',
        data: idValidation.error.flatten()
      })
    }

    // Validate request body
    const body = await readBody(event)
    const bodyValidation = updateTagSchema.safeParse(body)

    if (!bodyValidation.success) {
      throw createError({
        statusCode: 400,
        message: 'Validation échouée',
        data: bodyValidation.error.flatten()
      })
    }

    // Fetch tag for authorization check
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        themeCard: {
          include: {
            character: {
              include: {
                playspace: {
                  select: { userId: true }
                }
              }
            }
          }
        }
      }
    })

    if (!existingTag) {
      throw createError({
        statusCode: 404,
        message: 'Tag non trouvé'
      })
    }

    // Check user authorization
    const userId = event.context.user?.id
    if (!userId || existingTag.themeCard.character.playspace.userId !== userId) {
      throw createError({
        statusCode: 403,
        message: 'Non autorisé'
      })
    }

    // Update tag
    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: bodyValidation.data
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn('[API SLOW] PUT /api/tags/[id]', { requestId, duration, threshold: 500 })
    }

    console.log('[API SUCCESS] Tag updated', { requestId, tagId })

    return updatedTag
  } catch (error: any) {
    console.error('[API ERROR] PUT /api/tags/[id]', {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
