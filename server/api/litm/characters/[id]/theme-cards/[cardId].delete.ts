import { prisma } from '#imports'
import { requireAuthenticatedUser, requireOwnership } from '../../../../../utils/litm/auth'

/**
 * DELETE /api/litm/characters/[id]/theme-cards/[cardId]
 *
 * Supprime une theme card spécifique
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
      select: {
        id: true,
        characterId: true,
        title: true,
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

    // Supprimer la theme card (cascade delete des tags et quest via Prisma)
    await prisma.litmThemeCard.delete({
      where: { id: cardId },
    })

    return {
      success: true,
      message: `La theme card "${themeCard.title}" a été supprimée avec succès`,
    }
  } catch (error: any) {
    // Si c'est une erreur déjà formattée
    if (error.statusCode) {
      throw error
    }

    // Erreur serveur non gérée
    console.error('[API LITM] Error deleting theme card:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la suppression de la theme card',
    })
  }
})
