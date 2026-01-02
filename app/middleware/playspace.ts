/**
 * Middleware playspace
 * Verifie que le playspace existe (local ou BDD)
 * Les playspaces locaux (id commence par "local_") ne necessitent pas d'auth
 */
export default defineNuxtRouteMiddleware((to) => {
  const playspaceId = to.params.id as string

  if (!playspaceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Playspace ID manquant'
    })
  }

  // Les playspaces locaux sont valides par defaut
  // La verification de leur existence se fait cote client
  if (playspaceId.startsWith('local_')) {
    return
  }

  // Pour les playspaces persistes, on laisse passer pour le MVP
  // La verification se fait via l'API
  return
})
