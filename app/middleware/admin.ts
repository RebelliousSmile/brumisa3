export default defineNuxtRouteMiddleware(() => {
  const { user } = useUserSession()
  
  if (!user.value || user.value.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Accès administrateur requis'
    })
  }
})