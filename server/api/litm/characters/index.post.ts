import { prisma } from '#imports'
import { requireAuthenticatedUser } from '../../../utils/litm/auth'
import { createCharacterSchema } from '../../../utils/litm/validators'

/**
 * POST /api/litm/characters
 *
 * Crée un nouveau personnage LITM pour l'utilisateur connecté
 */
export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const userId = await requireAuthenticatedUser(event)

    // Lire et valider le body
    const body = await readBody(event)
    const validatedData = createCharacterSchema.parse(body)

    // Créer le personnage
    const character = await prisma.litmCharacter.create({
      data: {
        userId,
        name: validatedData.name,
        gameType: validatedData.gameType,
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
        },
        trackers: true,
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

    // Si c'est une erreur déjà formattée (401, 403, etc.)
    if (error.statusCode) {
      throw error
    }

    // Erreur serveur non gérée
    console.error('[API LITM] Error creating character:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la création du personnage',
    })
  }
})
