/**
 * POST /api/theme-cards/[id]/tags
 * Add a tag to a theme card
 *
 * Business Rules (City of Mist):
 * - Power tags: 3-5 per theme card
 * - Weakness tags: 1-2 per theme card
 */

import { prisma } from '~/server/utils/prisma'
import { themeCardIdSchema } from '~/server/utils/validation/theme-card.schema'
import { createTagSchema, validateTagCount } from '~/server/utils/validation/tag.schema'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log('[API] POST /api/theme-cards/[id]/tags', {
    requestId,
    timestamp: new Date().toISOString()
  })

  try {
    // Validate theme card ID
    const themeCardId = event.context.params?.id
    const idValidation = themeCardIdSchema.safeParse(themeCardId)

    if (!idValidation.success) {
      throw createError({
        statusCode: 400,
        message: 'ID theme card invalide',
        data: idValidation.error.flatten()
      })
    }

    // Validate request body
    const body = await readBody(event)
    const tagData = { ...body, themeCardId }
    const bodyValidation = createTagSchema.safeParse(tagData)

    if (!bodyValidation.success) {
      throw createError({
        statusCode: 400,
        message: 'Validation échouée',
        data: bodyValidation.error.flatten()
      })
    }

    // Fetch theme card with existing tags for authorization and validation
    const themeCard = await prisma.themeCard.findUnique({
      where: { id: themeCardId },
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
    })

    if (!themeCard) {
      throw createError({
        statusCode: 404,
        message: 'Theme card non trouvée'
      })
    }

    // Check user authorization
    const userId = event.context.user?.id
    if (!userId || themeCard.character.playspace.userId !== userId) {
      throw createError({
        statusCode: 403,
        message: 'Non autorisé'
      })
    }

    // Validate tag count after addition
    const futureTagsRaw = [...themeCard.tags, { type: bodyValidation.data.type }]
    const futureTags = futureTagsRaw.map(t => ({ type: t.type as any }))
    const tagCountValidation = validateTagCount(futureTags)

    if (!tagCountValidation.valid) {
      throw createError({
        statusCode: 400,
        message: tagCountValidation.error
      })
    }

    // Create tag
    const tag = await prisma.tag.create({
      data: bodyValidation.data
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn('[API SLOW] POST /api/theme-cards/[id]/tags', { requestId, duration, threshold: 500 })
    }

    console.log('[API SUCCESS] Tag created', { requestId, tagId: tag.id })

    return tag
  } catch (error: any) {
    console.error('[API ERROR] POST /api/theme-cards/[id]/tags', {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
