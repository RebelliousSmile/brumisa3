import { prisma } from '#imports'
import { requireAuthenticatedUser, requireOwnership } from '../../../../utils/litm/auth'
import { createThemeCardSchema } from '../../../../utils/litm/validators'

/**
 * POST /api/litm/characters/[id]/theme-cards
 *
 * Crée une theme card pour un personnage LITM
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
      select: { userId: true },
    })

    if (!character) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Personnage non trouvé',
        message: 'Le personnage demandé n\'existe pas',
      })
    }

    requireOwnership(userId, character.userId)

    // Lire et valider le body
    const body = await readBody(event)
    const validatedData = createThemeCardSchema.parse(body)

    // Créer la theme card
    const themeCard = await prisma.litmThemeCard.create({
      data: {
        characterId,
        type: validatedData.type,
        themebook: validatedData.themebook,
        title: validatedData.title,
        mainTagText: validatedData.mainTagText,
      },
      include: {
        tags: true,
        quest: true,
      },
    })

    return themeCard
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
    console.error('[API LITM] Error creating theme card:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la création de la theme card',
    })
  }
})
