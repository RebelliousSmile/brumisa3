export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event)
    
    if (!session?.user) {
      return {
        user: null,
        loggedIn: false
      }
    }
    
    return {
      user: session.user,
      loggedIn: true
    }
    
  } catch (error) {
    console.error('Erreur récupération session:', error)
    
    return {
      user: null,
      loggedIn: false
    }
  }
})