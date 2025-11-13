export default defineNuxtRouteMiddleware((to) => {
  // TODO: Implement auth check when auth is fully configured
  // For MVP: Allow all access (guest mode)

  // const { loggedIn } = useUserSession()
  // if (!loggedIn.value) {
  //   throw createError({
  //     statusCode: 401,
  //     statusMessage: 'Authentification requise'
  //   })
  // }

  // MVP: Skip auth check, allow guest mode
  return
})