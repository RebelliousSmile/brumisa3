interface User {
  id: number
  email: string
  role: 'ADMIN' | 'UTILISATEUR'
  createdAt: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  confirmPassword: string
}

/**
 * Composable pour l'authentification
 */
export const useAuth = () => {
  const { data: session, signIn, signOut } = useUserSession()
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Utilisateur connecté
   */
  const user = computed<User | null>(() => {
    return session.value?.user || null
  })

  /**
   * Vérifie si l'utilisateur est connecté
   */
  const isLoggedIn = computed<boolean>(() => {
    return !!user.value
  })

  /**
   * Vérifie si l'utilisateur est administrateur
   */
  const isAdmin = computed<boolean>(() => {
    return user.value?.role === 'ADMIN'
  })

  /**
   * Connexion utilisateur
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null
      
      const result = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      
      if (result.success) {
        // Recharger la session
        await refreshCookie('nuxt-session')
        
        return true
      }
      
      return false
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Erreur de connexion'
      console.error('Erreur connexion:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Inscription utilisateur
   */
  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null
      
      if (data.password !== data.confirmPassword) {
        error.value = 'Les mots de passe ne correspondent pas'
        return false
      }
      
      const result = await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: data.email,
          password: data.password
        }
      })
      
      if (result.success) {
        // Connexion automatique après inscription
        return await login({
          email: data.email,
          password: data.password
        })
      }
      
      return false
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Erreur lors de l\'inscription'
      console.error('Erreur inscription:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Déconnexion utilisateur
   */
  const logout = async (): Promise<void> => {
    try {
      loading.value = true
      
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      // Nettoyer la session
      await signOut()
      
      // Rediriger vers l'accueil
      await navigateTo('/')
    } catch (err: any) {
      console.error('Erreur déconnexion:', err)
      // Déconnecter quand même côté client
      await signOut()
      await navigateTo('/')
    } finally {
      loading.value = false
    }
  }

  /**
   * Met à jour le profil utilisateur
   */
  const updateProfile = async (profileData: {
    email?: string
    password?: string
    currentPassword?: string
  }): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null
      
      const result = await $fetch('/api/auth/profile', {
        method: 'PUT',
        body: profileData
      })
      
      if (result.success) {
        // Recharger la session pour récupérer les nouvelles données
        await refreshCookie('nuxt-session')
        return true
      }
      
      return false
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Erreur lors de la mise à jour'
      console.error('Erreur mise à jour profil:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprime le compte utilisateur
   */
  const deleteAccount = async (password: string): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null
      
      const result = await $fetch('/api/auth/delete', {
        method: 'DELETE',
        body: { password }
      })
      
      if (result.success) {
        await signOut()
        await navigateTo('/')
        return true
      }
      
      return false
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Erreur lors de la suppression'
      console.error('Erreur suppression compte:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Vérifie les permissions pour une action
   */
  const canAccess = (requiredRole?: 'ADMIN' | 'UTILISATEUR'): boolean => {
    if (!requiredRole) return true
    if (!user.value) return false
    
    if (requiredRole === 'ADMIN') {
      return user.value.role === 'ADMIN'
    }
    
    return user.value.role === 'ADMIN' || user.value.role === 'UTILISATEUR'
  }

  /**
   * Middleware de protection des routes
   */
  const requireAuth = () => {
    if (!isLoggedIn.value) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentification requise'
      })
    }
  }

  /**
   * Middleware de protection admin
   */
  const requireAdmin = () => {
    requireAuth()
    
    if (!isAdmin.value) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Accès administrateur requis'
      })
    }
  }

  /**
   * Nettoie les erreurs
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Charge la session au démarrage
   */
  const initializeAuth = async () => {
    try {
      const sessionData = await $fetch('/api/auth/session')
      
      if (sessionData.loggedIn && sessionData.user) {
        // La session est déjà gérée par useUserSession
      }
    } catch (err) {
      console.error('Erreur initialisation auth:', err)
    }
  }

  // Auto-initialisation
  onMounted(() => {
    initializeAuth()
  })

  return {
    // State
    user: readonly(user),
    isLoggedIn: readonly(isLoggedIn),
    isAdmin: readonly(isAdmin),
    loading: readonly(loading),
    error: readonly(error),
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    canAccess,
    requireAuth,
    requireAdmin,
    clearError,
    initializeAuth
  }
}