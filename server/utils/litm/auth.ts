import type { H3Event } from 'h3'

/**
 * Récupère l'ID de l'utilisateur authentifié depuis la session
 * Lance une erreur 401 si l'utilisateur n'est pas authentifié
 */
export async function requireAuthenticatedUser(event: H3Event): Promise<number> {
  const sessionCookie = getCookie(event, 'nuxt-session')

  if (!sessionCookie) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié',
      message: 'Vous devez être connecté pour effectuer cette action',
    })
  }

  let session: any = null
  try {
    session = JSON.parse(decodeURIComponent(sessionCookie))
  } catch (parseError) {
    console.warn('Erreur parsing session cookie:', parseError)
    throw createError({
      statusCode: 401,
      statusMessage: 'Session invalide',
      message: 'La session est invalide ou corrompue',
    })
  }

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié',
      message: 'Aucun utilisateur trouvé dans la session',
    })
  }

  return session.user.id
}

/**
 * Vérifie que l'utilisateur est le propriétaire de la ressource
 * Lance une erreur 403 si ce n'est pas le cas
 */
export function requireOwnership(userId: number, resourceOwnerId: number): void {
  if (userId !== resourceOwnerId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Accès refusé',
      message: 'Vous n\'avez pas les permissions pour accéder à cette ressource',
    })
  }
}
