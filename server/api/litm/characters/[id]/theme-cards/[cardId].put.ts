import { prisma } from '#imports'
import { requireAuthenticatedUser, requireOwnership } from '../../../../../utils/litm/auth'
import { updateThemeCardSchema } from '../../../../../utils/litm/validators'

/**
 * PUT /api/litm/characters/[id]/theme-cards/[cardId]
 *
 * Met à jour une theme card spécifique
 */
export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const userId = await requireAuthenticatedUser(event)

    // Récupérer les IDs
    const characterId = getRouterParam(event, 'id')
    const cardId = getRouterParam(event, 'cardId')

    if (!characterId || !cardId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID manquant',
        message: 'Les IDs du personnage et de la carte sont requis',
      })
    }

    // Vérifier que la theme card existe et appartient au bon personnage
    const themeCard = await prisma.litmThemeCard.findUnique({
      where: { id: cardId },
      include: {
        character: {
          select: { userId: true },
        },
      },
    })

    if (!themeCard) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Theme card non trouvée',
        message: 'La theme card demandée n\'existe pas',
      })
    }

    if (themeCard.characterId !== characterId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'IDs incompatibles',
        message: 'Cette theme card n\'appartient pas à ce personnage',
      })
    }

    requireOwnership(userId, themeCard.character.userId)

    // Lire et valider le body
    const body = await readBody(event)
    const validatedData = updateThemeCardSchema.parse(body)

    // Mettre à jour la theme card
    const updatedThemeCard = await prisma.litmThemeCard.update({
      where: { id: cardId },
      data: {
        ...(validatedData.type && { type: validatedData.type }),
        ...(validatedData.themebook && { themebook: validatedData.themebook }),
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.mainTagText !== undefined && { mainTagText: validatedData.mainTagText }),
      },
      include: {
        tags: true,
        quest: true,
      },
    })

    return updatedThemeCard
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
    console.error('[API LITM] Error updating theme card:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour de la theme card',
    })
  }
})
