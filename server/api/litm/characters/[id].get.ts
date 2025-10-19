import { prisma } from '#imports'
import { requireAuthenticatedUser, requireOwnership } from '../../../utils/litm/auth'

/**
 * GET /api/litm/characters/[id]
 *
 * Récupère un personnage LITM spécifique par son ID
 */
export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const userId = await requireAuthenticatedUser(event)

    // Récupérer l'ID depuis les paramètres de route
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID manquant',
        message: 'L\'ID du personnage est requis',
      })
    }

    // Récupérer le personnage
    const character = await prisma.litmCharacter.findUnique({
      where: {
        id,
      },
      include: {
        heroCard: {
          include: {
            relationships: true,
            quintessences: true,
            backpackItems: true,
          },
        },
        themeCards: {
          include: {
            tags: true,
            quest: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        trackers: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!character) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Personnage non trouvé',
        message: 'Le personnage demandé n\'existe pas',
      })
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    requireOwnership(userId, character.userId)

    return character
  } catch (error: any) {
    // Si c'est une erreur déjà formattée (400, 401, 403, 404, etc.)
    if (error.statusCode) {
      throw error
    }

    // Erreur serveur non gérée
    console.error('[API LITM] Error fetching character:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération du personnage',
    })
  }
})
