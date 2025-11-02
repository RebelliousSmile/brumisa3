export default defineEventHandler(async (event) => {
  try {
    await clearUserSession(event)
    
    return {
      success: true,
      message: 'Déconnexion réussie'
    }
    
  } catch (error) {
    console.error('Erreur logout:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la déconnexion'
    })
  }
})