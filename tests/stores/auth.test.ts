import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'

// Mock useAuth composable
const mockLogin = vi.fn()
const mockLogout = vi.fn()
const mockUser = ref(null)

vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: mockLogout,
    user: mockUser,
    canAccess: vi.fn(() => true),
    initializeAuth: vi.fn()
  })
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockUser.value = null
  })

  it('should initialize with correct default state', () => {
    const store = useAuthStore()
    
    expect(store.user).toBe(null)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBe(null)
    expect(store.isLoggedIn).toBe(false)
    expect(store.isAdmin).toBe(false)
  })

  it('should update user state', () => {
    const store = useAuthStore()
    const mockUserData = {
      id: 1,
      email: 'test@example.com',
      role: 'ADMIN' as const,
      createdAt: '2023-01-01T00:00:00.000Z'
    }
    
    store.setUser(mockUserData)
    
    expect(store.user).toEqual(mockUserData)
    expect(store.isLoggedIn).toBe(true)
    expect(store.isAdmin).toBe(true)
    expect(store.userEmail).toBe('test@example.com')
  })

  it('should handle regular user role correctly', () => {
    const store = useAuthStore()
    const regularUser = {
      id: 2,
      email: 'user@example.com',
      role: 'UTILISATEUR' as const,
      createdAt: '2023-01-01T00:00:00.000Z'
    }
    
    store.setUser(regularUser)
    
    expect(store.isLoggedIn).toBe(true)
    expect(store.isAdmin).toBe(false)
  })

  it('should handle loading state', () => {
    const store = useAuthStore()
    
    store.setLoading(true)
    expect(store.isLoading).toBe(true)
    
    store.setLoading(false)
    expect(store.isLoading).toBe(false)
  })

  it('should handle error state', () => {
    const store = useAuthStore()
    const errorMessage = 'Authentication failed'
    
    store.setError(errorMessage)
    expect(store.error).toBe(errorMessage)
    
    store.clearError()
    expect(store.error).toBe(null)
  })

  it('should handle successful login', async () => {
    const store = useAuthStore()
    const mockUserData = {
      id: 1,
      email: 'test@example.com',
      role: 'UTILISATEUR' as const,
      createdAt: '2023-01-01T00:00:00.000Z'
    }
    
    mockLogin.mockResolvedValueOnce(true)
    mockUser.value = mockUserData
    
    const result = await store.login('test@example.com', 'password')
    
    expect(result).toBe(true)
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    })
    expect(store.user).toEqual(mockUserData)
  })

  it('should handle failed login', async () => {
    const store = useAuthStore()
    
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))
    
    const result = await store.login('test@example.com', 'wrong-password')
    
    expect(result).toBe(false)
    expect(store.error).toBe('Invalid credentials')
  })

  it('should handle logout', async () => {
    const store = useAuthStore()
    
    // Set user first
    store.setUser({
      id: 1,
      email: 'test@example.com',
      role: 'UTILISATEUR',
      createdAt: '2023-01-01T00:00:00.000Z'
    })
    
    mockLogout.mockResolvedValueOnce(undefined)
    
    await store.logout()
    
    expect(mockLogout).toHaveBeenCalled()
    expect(store.user).toBe(null)
  })
})