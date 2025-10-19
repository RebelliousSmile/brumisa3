import { prisma } from '#imports'
import { requireAuthenticatedUser, requireOwnership } from '../../../../utils/litm/auth'
import { updateHeroCardSchema } from '../../../../utils/litm/validators'

/**
 * PUT /api/litm/characters/[id]/hero-card
 *
 * Met à jour la hero card d'un personnage LITM
 */
export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const userId = await requireAuthenticatedUser(event)

    // Récupérer l'ID du personnage
    const characterId = getRouterParam(event, 'id')

    if (!characterId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID manquant',
        message: 'L\'ID du personnage est requis',
      })
    }

    // Vérifier que le personnage existe et appartient à l'utilisateur
    const character = await prisma.litmCharacter.findUnique({
      where: { id: characterId },
      select: { userId: true, heroCard: { select: { id: true } } },
    })

    if (!character) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Personnage non trouvé',
        message: 'Le personnage demandé n\'existe pas',
      })
    }

    requireOwnership(userId, character.userId)

    if (!character.heroCard) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Hero card non trouvée',
        message: 'Ce personnage n\'a pas de hero card',
      })
    }

    // Lire et valider le body
    const body = await readBody(event)
    const validatedData = updateHeroCardSchema.parse(body)

    // Mettre à jour la hero card
    const heroCard = await prisma.litmHeroCard.update({
      where: { id: character.heroCard.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.backstory !== undefined && { backstory: validatedData.backstory }),
        ...(validatedData.birthright !== undefined && { birthright: validatedData.birthright }),
      },
      include: {
        relationships: true,
        quintessences: true,
        backpackItems: true,
      },
    })

    return heroCard
  } catch (error: any) {
    // Erreur de validation Zod
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation échouée',
        message: error.errors.map((e: any) => e.message).join(', '),
        data: error.errors,
      })
    }

    // Si c'est une erreur déjà formattée
    if (error.statusCode) {
      throw error
    }

    // Erreur serveur non gérée
    console.error('[API LITM] Error updating hero card:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour de la hero card',
    })
  }
})
