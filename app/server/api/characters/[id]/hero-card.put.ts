/**
 * PUT /api/characters/[id]/hero-card
 * Update character's hero card
 *
 * Notes:
 * - Hero Card is automatically created when character is created
 * - Identity: Mundane self (CoM/LITM) or Self (Otherscape)
 * - Mystery: Mythical self (CoM/LITM) or Itch (Otherscape)
 */

import { prisma } from '~/server/utils/prisma'
import { characterIdSchema } from '~/server/utils/validation/character.schema'
import { updateHeroCardSchema } from '~/server/utils/validation/hero-card.schema'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  console.log('[API] PUT /api/characters/[id]/hero-card', {
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
    const bodyValidation = updateHeroCardSchema.safeParse(body)

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
        heroCard: true,
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

    // Update or create hero card
    let heroCard
    if (character.heroCard) {
      heroCard = await prisma.heroCard.update({
        where: { id: character.heroCard.id },
        data: bodyValidation.data,
        include: {
          relationships: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })
    } else {
      // Create hero card if it doesn't exist (fallback)
      heroCard = await prisma.heroCard.create({
        data: {
          characterId,
          identity: bodyValidation.data.identity || '',
          mystery: bodyValidation.data.mystery || ''
        },
        include: {
          relationships: true
        }
      })
    }

    const duration = Date.now() - startTime
    if (duration > 500) {
      console.warn('[API SLOW] PUT /api/characters/[id]/hero-card', { requestId, duration, threshold: 500 })
    }

    console.log('[API SUCCESS] Hero card updated', { requestId, heroCardId: heroCard.id })

    return heroCard
  } catch (error: any) {
    console.error('[API ERROR] PUT /api/characters/[id]/hero-card', {
      requestId,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
})
