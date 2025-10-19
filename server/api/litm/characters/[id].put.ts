import { prisma } from '#imports'
import { requireAuthenticatedUser, requireOwnership } from '../../../utils/litm/auth'
import { updateCharacterSchema } from '../../../utils/litm/validators'

/**
 * PUT /api/litm/characters/[id]
 *
 * Met à jour un personnage LITM existant
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

    // Vérifier que le personnage existe et appartient à l'utilisateur
    const existingCharacter = await prisma.litmCharacter.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existingCharacter) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Personnage non trouvé',
        message: 'Le personnage demandé n\'existe pas',
      })
    }

    requireOwnership(userId, existingCharacter.userId)

    // Lire et valider le body
    const body = await readBody(event)
    const validatedData = updateCharacterSchema.parse(body)

    // Mettre à jour le personnage
    const character = await prisma.litmCharacter.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.gameType && { gameType: validatedData.gameType }),
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

    return character
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

    // Si c'est une erreur déjà formattée (400, 401, 403, 404, etc.)
    if (error.statusCode) {
      throw error
    }

    // Erreur serveur non gérée
    console.error('[API LITM] Error updating character:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour du personnage',
    })
  }
})
