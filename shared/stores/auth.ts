import { defineStore } from 'pinia'
import type { User } from '~/composables/useAuth'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isLoading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    userEmail: (state) => state.user?.email || null
  },

  actions: {
    setUser(user: User | null) {
      this.user = user
      this.error = null
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    clearError() {
      this.error = null
    },

    async login(email: string, password: string) {
      const { login } = useCustomAuth()
      
      this.setLoading(true)
      this.clearError()
      
      try {
        const success = await login({ email, password })
        if (success) {
          const { user } = useCustomAuth()
          this.setUser(user.value)
        }
        return success
      } catch (err: any) {
        this.setError(err.message || 'Erreur de connexion')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    async register(email: string, password: string, confirmPassword: string) {
      const { register } = useCustomAuth()
      
      this.setLoading(true)
      this.clearError()
      
      try {
        const success = await register({ email, password, confirmPassword })
        if (success) {
          const { user } = useCustomAuth()
          this.setUser(user.value)
        }
        return success
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de l\'inscription')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    async logout() {
      const { logout } = useCustomAuth()
      
      this.setLoading(true)
      
      try {
        await logout()
        this.setUser(null)
      } catch (err: any) {
        this.setError(err.message || 'Erreur de déconnexion')
      } finally {
        this.setLoading(false)
      }
    },

    async updateProfile(profileData: any) {
      const { updateProfile } = useCustomAuth()
      
      this.setLoading(true)
      this.clearError()
      
      try {
        const success = await updateProfile(profileData)
        if (success) {
          const { user } = useCustomAuth()
          this.setUser(user.value)
        }
        return success
      } catch (err: any) {
        this.setError(err.message || 'Erreur de mise à jour')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    canAccess(requiredRole?: 'ADMIN' | 'UTILISATEUR') {
      const { canAccess } = useCustomAuth()
      return canAccess(requiredRole)
    },

    async initializeAuth() {
      const { initializeAuth, user } = useCustomAuth()
      
      try {
        await initializeAuth()
        this.setUser(user.value)
      } catch (err: any) {
        console.error('Erreur initialisation auth store:', err)
        this.setError('Erreur d\'initialisation')
      }
    }
  }
})