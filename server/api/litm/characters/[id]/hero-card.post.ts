import { prisma } from '#imports'
import { requireAuthenticatedUser, requireOwnership } from '../../../../utils/litm/auth'
import { createHeroCardSchema } from '../../../../utils/litm/validators'

/**
 * POST /api/litm/characters/[id]/hero-card
 *
 * Crée une hero card pour un personnage LITM
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
      select: { userId: true, heroCard: true },
    })

    if (!character) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Personnage non trouvé',
        message: 'Le personnage demandé n\'existe pas',
      })
    }

    requireOwnership(userId, character.userId)

    // Vérifier qu'il n'y a pas déjà une hero card
    if (character.heroCard) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Hero card existante',
        message: 'Ce personnage a déjà une hero card',
      })
    }

    // Lire et valider le body
    const body = await readBody(event)
    const validatedData = createHeroCardSchema.parse(body)

    // Créer la hero card
    const heroCard = await prisma.litmHeroCard.create({
      data: {
        characterId,
        name: validatedData.name,
        backstory: validatedData.backstory,
        birthright: validatedData.birthright,
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
    console.error('[API LITM] Error creating hero card:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la création de la hero card',
    })
  }
})
