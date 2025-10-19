import { prisma } from '#imports'
import { requireAuthenticatedUser, requireOwnership } from '../../../utils/litm/auth'

/**
 * DELETE /api/litm/characters/[id]
 *
 * Supprime un personnage LITM existant
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
      select: { userId: true, name: true },
    })

    if (!existingCharacter) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Personnage non trouvé',
        message: 'Le personnage demandé n\'existe pas',
      })
    }

    requireOwnership(userId, existingCharacter.userId)

    // Supprimer le personnage (cascade delete automatique via Prisma)
    await prisma.litmCharacter.delete({
      where: { id },
    })

    return {
      success: true,
      message: `Le personnage "${existingCharacter.name}" a été supprimé avec succès`,
    }
  } catch (error: any) {
    // Si c'est une erreur déjà formattée (400, 401, 403, 404, etc.)
    if (error.statusCode) {
      throw error
    }

    // Erreur serveur non gérée
    console.error('[API LITM] Error deleting character:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la suppression du personnage',
    })
  }
})
