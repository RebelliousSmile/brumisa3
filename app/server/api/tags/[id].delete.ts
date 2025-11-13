/**
 * DELETE /api/tags/[id]
 * Delete a tag
 *
 * Business Rules (City of Mist):
 * - Power tags: minimum 3 per theme card
 * - Weakness tags: minimum 1 per theme card
 */

import { prisma } from '~/server/utils/prisma'
import { tagIdSchema, validateTagCount } from '~/server/utils/validation/tag.schema'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log('[API] DELETE /api/tags/[id]', {
    requestId,
    timestamp: new Date().toISOString()
  })

  try {
    // Validate tag ID
    const tagId = event.context.params?.id
    const validationResult = tagIdSchema.safeParse(tagId)

    if (!validationResult.success) {
      throw createError({
        statusCode: 400,
        message: 'ID tag invalide',
        data: validationResult.error.flatten()
      })
    }

    // Fetch tag with all theme card tags for validation
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        themeCard: {
          include: {
            tags: true,
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

    if (!tag) {
      throw createError({
        statusCode: 404,
        message: 'Tag non trouvé'
      })
    }

    // Check user authorization
    const userId = event.context.user?.id
    if (!userId || tag.themeCard.character.playspace.userId !== userId) {
      throw createError({
        statusCode: 403,
        message: 'Non autorisé'
      })
    }

    // Validate tag count after deletion
    const futureTagsRaw = tag.themeCard.tags.filter(t => t.id !== tagId)
    const futureTags = futureTagsRaw.map(t => ({ type: t.type as any }))
    const tagCountValidation = validateTagCount(futureTags)

    if (!tagCountValidation.valid) {
      throw createError({
        statusCode: 400,
        message: tagCountValidation.error
      })
    }

    // Delete tag
    await prisma.tag.delete({
      where: { id: tagId }
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn('[API SLOW] DELETE /api/tags/[id]', { requestId, duration, threshold: 500 })
    }

    console.log('[API SUCCESS] Tag deleted', { requestId, tagId })

    return { success: true, message: 'Tag supprimé avec succès' }
  } catch (error: any) {
    console.error('[API ERROR] DELETE /api/tags/[id]', {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
