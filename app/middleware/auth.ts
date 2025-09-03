export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  
  if (!loggedIn.value) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentification requise'
    })
  }
})