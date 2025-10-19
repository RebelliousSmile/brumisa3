import { prisma } from '#imports'
import { requireAuthenticatedUser } from '../../../utils/litm/auth'

/**
 * GET /api/litm/characters
 *
 * Récupère tous les personnages LITM de l'utilisateur connecté
 */
export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const userId = await requireAuthenticatedUser(event)

    // Récupérer tous les personnages de l'utilisateur avec leurs relations
    const characters = await prisma.litmCharacter.findMany({
      where: {
        userId,
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
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return characters
  } catch (error: any) {
    // Si c'est une erreur déjà formattée (401, 403, etc.)
    if (error.statusCode) {
      throw error
    }

    // Erreur serveur non gérée
    console.error('[API LITM] Error fetching characters:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des personnages',
    })
  }
})
