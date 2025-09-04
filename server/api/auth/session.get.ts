export default defineEventHandler(async (event) => {
  try {
    // Pour @sidebase/nuxt-auth, utiliser les cookies de session
    const sessionCookie = getCookie(event, 'nuxt-session')
    
    if (!sessionCookie) {
      return {
        data: {
          user: null,
          loggedIn: false
        }
      }
    }
    
    // Décoder la session depuis le cookie de façon sécurisée
    let session = null
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie))
    } catch (parseError) {
      console.warn('Erreur parsing session cookie:', parseError)
      return {
        data: {
          user: null,
          loggedIn: false
        }
      }
    }
    
    if (!session?.user) {
      return {
        data: {
          user: null,
          loggedIn: false
        }
      }
    }
    
    return {
      data: {
        user: session.user,
        loggedIn: true
      }
    }
    
  } catch (error) {
    console.error('Erreur récupération session:', error)
    
    return {
      data: {
        user: null,
        loggedIn: false
      }
    }
  }
})