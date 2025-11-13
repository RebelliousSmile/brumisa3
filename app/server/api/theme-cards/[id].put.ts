/**
 * PUT /api/theme-cards/[id]
 * Update a theme card
 */

import { prisma } from '~/server/utils/prisma'
import { themeCardIdSchema, updateThemeCardSchema, validateThemeTypeForHack } from '~/server/utils/validation/theme-card.schema'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log('[API] PUT /api/theme-cards/[id]', {
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
    const bodyValidation = updateThemeCardSchema.safeParse(body)

    if (!bodyValidation.success) {
      throw createError({
        statusCode: 400,
        message: 'Validation échouée',
        data: bodyValidation.error.flatten()
      })
    }

    // Fetch theme card for authorization and hack validation
    const existingThemeCard = await prisma.themeCard.findUnique({
      where: { id: themeCardId },
      include: {
        character: {
          include: {
            playspace: {
              select: {
                userId: true,
                hackId: true
              }
            }
          }
        }
      }
    })

    if (!existingThemeCard) {
      throw createError({
        statusCode: 404,
        message: 'Theme card non trouvée'
      })
    }

    // Check user authorization
    const userId = event.context.user?.id
    if (!userId || existingThemeCard.character.playspace.userId !== userId) {
      throw createError({
        statusCode: 403,
        message: 'Non autorisé'
      })
    }

    // Validate theme type against hack if type is being updated
    if (bodyValidation.data.type) {
      const hackId = existingThemeCard.character.playspace.hackId
      if (!validateThemeTypeForHack(hackId, bodyValidation.data.type)) {
        throw createError({
          statusCode: 400,
          message: `Type de thème ${bodyValidation.data.type} invalide pour le hack ${hackId}`
        })
      }
    }

    // Update theme card
    const updatedThemeCard = await prisma.themeCard.update({
      where: { id: themeCardId },
      data: bodyValidation.data,
      include: {
        tags: {
          orderBy: [
            { type: 'asc' },
            { createdAt: 'asc' }
          ]
        }
      }
    })

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn('[API SLOW] PUT /api/theme-cards/[id]', { requestId, duration, threshold: 500 })
    }

    console.log('[API SUCCESS] Theme card updated', { requestId, themeCardId })

    return updatedThemeCard
  } catch (error: any) {
    console.error('[API ERROR] PUT /api/theme-cards/[id]', {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
