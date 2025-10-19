import { prisma } from '#imports'
import { requireAuthenticatedUser, requireOwnership } from '../../../../utils/litm/auth'
import { updateTrackersSchema } from '../../../../utils/litm/validators'

/**
 * PUT /api/litm/characters/[id]/trackers
 *
 * Met à jour tous les trackers d'un personnage LITM
 * (Remplace tous les trackers existants par les nouveaux)
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
    const validatedData = updateTrackersSchema.parse(body)

    // Supprimer tous les trackers existants
    await prisma.litmTracker.deleteMany({
      where: { characterId },
    })

    // Créer les nouveaux trackers
    const trackers = await prisma.litmTracker.createMany({
      data: validatedData.trackers.map((tracker) => ({
        id: tracker.id,
        characterId,
        type: tracker.type,
        name: tracker.name,
        totalPips: tracker.totalPips,
        activePips: tracker.activePips,
      })),
    })

    // Récupérer les trackers créés
    const updatedTrackers = await prisma.litmTracker.findMany({
      where: { characterId },
      orderBy: { createdAt: 'asc' },
    })

    return updatedTrackers
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
    console.error('[API LITM] Error updating trackers:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour des trackers',
    })
  }
})
