import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLitmCharacterStore } from '~/shared/stores/useLitmCharacterStore'
import type { LitmCharacter, LitmHeroCard, LitmThemeCard } from '~/shared/stores/useLitmCharacterStore'

/**
 * Tests du store Pinia pour les personnages LITM
 */

// Mock de $fetch
global.$fetch = vi.fn()

describe('useLitmCharacterStore', () => {
  beforeEach(() => {
    // Créer un nouveau pinia pour chaque test
    setActivePinia(createPinia())

    // Réinitialiser les mocks
    vi.clearAllMocks()
  })

  describe('State initialization', () => {
    it('should initialize with empty state', () => {
      const store = useLitmCharacterStore()

      expect(store.characters).toEqual([])
      expect(store.activeCharacter).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.filters).toEqual({
        gameType: null,
        search: '',
      })
    })
  })

  describe('Getters', () => {
    it('should count characters correctly', () => {
      const store = useLitmCharacterStore()

      store.characters = [
        { id: '1', name: 'Character 1', gameType: 'litm' } as LitmCharacter,
        { id: '2', name: 'Character 2', gameType: 'litm' } as LitmCharacter,
      ]

      expect(store.characterCount).toBe(2)
    })

    it('should filter characters by game type', () => {
      const store = useLitmCharacterStore()

      store.characters = [
        { id: '1', name: 'Character 1', gameType: 'litm' } as LitmCharacter,
        { id: '2', name: 'Character 2', gameType: 'cotm' } as LitmCharacter,
        { id: '3', name: 'Character 3', gameType: 'litm' } as LitmCharacter,
      ]

      store.filters.gameType = 'litm'

      const filtered = store.filteredCharacters
      expect(filtered).toHaveLength(2)
      expect(filtered.every((c) => c.gameType === 'litm')).toBe(true)
    })

    it('should filter characters by search term', () => {
      const store = useLitmCharacterStore()

      store.characters = [
        { id: '1', name: 'Aragorn', gameType: 'litm' } as LitmCharacter,
        { id: '2', name: 'Legolas', gameType: 'litm' } as LitmCharacter,
        { id: '3', name: 'Gimli', gameType: 'litm' } as LitmCharacter,
      ]

      store.filters.search = 'ara'

      const filtered = store.filteredCharacters
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Aragorn')
    })

    it('should return active character theme cards', () => {
      const store = useLitmCharacterStore()

      const themeCards: LitmThemeCard[] = [
        {
          id: '1',
          characterId: '1',
          type: 'origin',
          themebook: 'Book 1',
          title: 'Card 1',
          tags: [],
          improvements: [],
        } as LitmThemeCard,
      ]

      store.activeCharacter = {
        id: '1',
        name: 'Test',
        gameType: 'litm',
        themeCards,
        trackers: [],
      } as LitmCharacter

      expect(store.activeCharacterThemeCards).toEqual(themeCards)
    })

    it('should return empty array when no active character', () => {
      const store = useLitmCharacterStore()

      expect(store.activeCharacterThemeCards).toEqual([])
      expect(store.activeCharacterTrackers).toEqual([])
    })

    it('should group theme cards by type', () => {
      const store = useLitmCharacterStore()

      const themeCards: LitmThemeCard[] = [
        {
          id: '1',
          type: 'origin',
          title: 'Origin 1',
        } as LitmThemeCard,
        {
          id: '2',
          type: 'fellowship',
          title: 'Fellowship 1',
        } as LitmThemeCard,
        {
          id: '3',
          type: 'origin',
          title: 'Origin 2',
        } as LitmThemeCard,
      ]

      store.activeCharacter = {
        id: '1',
        name: 'Test',
        gameType: 'litm',
        themeCards,
        trackers: [],
      } as LitmCharacter

      const grouped = store.themeCardsByType

      expect(grouped.origin).toHaveLength(2)
      expect(grouped.fellowship).toHaveLength(1)
      expect(grouped.expertise).toBeUndefined()
    })
  })

  describe('Actions - Basic state management', () => {
    it('should set loading state', () => {
      const store = useLitmCharacterStore()

      store.setLoading(true)
      expect(store.isLoading).toBe(true)

      store.setLoading(false)
      expect(store.isLoading).toBe(false)
    })

    it('should set and clear error', () => {
      const store = useLitmCharacterStore()

      store.setError('Test error')
      expect(store.error).toBe('Test error')

      store.clearError()
      expect(store.error).toBeNull()
    })

    it('should set and clear filters', () => {
      const store = useLitmCharacterStore()

      store.setFilters({ gameType: 'litm', search: 'test' })
      expect(store.filters.gameType).toBe('litm')
      expect(store.filters.search).toBe('test')

      store.clearFilters()
      expect(store.filters.gameType).toBeNull()
      expect(store.filters.search).toBe('')
    })

    it('should set active character', () => {
      const store = useLitmCharacterStore()
      const character = { id: '1', name: 'Test' } as LitmCharacter

      store.setActiveCharacter(character)
      expect(store.activeCharacter).toStrictEqual(character)

      store.setActiveCharacter(null)
      expect(store.activeCharacter).toBeNull()
    })

    it('should reset store to initial state', () => {
      const store = useLitmCharacterStore()

      store.characters = [{ id: '1' } as LitmCharacter]
      store.activeCharacter = { id: '1' } as LitmCharacter
      store.error = 'Test error'
      store.isLoading = true
      store.filters.gameType = 'litm'

      store.reset()

      expect(store.characters).toEqual([])
      expect(store.activeCharacter).toBeNull()
      expect(store.error).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(store.filters.gameType).toBeNull()
    })
  })

  describe('Actions - API calls', () => {
    it('should fetch characters successfully', async () => {
      const store = useLitmCharacterStore()
      const mockCharacters: LitmCharacter[] = [
        { id: '1', name: 'Character 1', gameType: 'litm' } as LitmCharacter,
        { id: '2', name: 'Character 2', gameType: 'litm' } as LitmCharacter,
      ]

      vi.mocked($fetch).mockResolvedValueOnce(mockCharacters)

      await store.fetchCharacters()

      expect($fetch).toHaveBeenCalledWith('/api/litm/characters')
      expect(store.characters).toEqual(mockCharacters)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle fetch characters error', async () => {
      const store = useLitmCharacterStore()
      const error = new Error('Network error')

      vi.mocked($fetch).mockRejectedValueOnce(error)

      await store.fetchCharacters()

      expect(store.error).toBe('Network error')
      expect(store.isLoading).toBe(false)
      expect(store.characters).toEqual([])
    })

    it('should fetch single character successfully', async () => {
      const store = useLitmCharacterStore()
      const mockCharacter: LitmCharacter = {
        id: '1',
        name: 'Test Character',
        gameType: 'litm',
      } as LitmCharacter

      vi.mocked($fetch).mockResolvedValueOnce(mockCharacter)

      const result = await store.fetchCharacter('1')

      expect($fetch).toHaveBeenCalledWith('/api/litm/characters/1')
      expect(result).toEqual(mockCharacter)
      expect(store.activeCharacter).toEqual(mockCharacter)
      expect(store.characters).toHaveLength(1)
      expect(store.characters[0]).toEqual(mockCharacter)
    })

    it('should create character successfully', async () => {
      const store = useLitmCharacterStore()
      const createData = { name: 'New Character', gameType: 'litm' as const }
      const mockCharacter: LitmCharacter = {
        id: '1',
        ...createData,
      } as LitmCharacter

      vi.mocked($fetch).mockResolvedValueOnce(mockCharacter)

      const result = await store.createCharacter(createData)

      expect($fetch).toHaveBeenCalledWith('/api/litm/characters', {
        method: 'POST',
        body: createData,
      })
      expect(result).toEqual(mockCharacter)
      expect(store.characters[0]).toEqual(mockCharacter)
      expect(store.activeCharacter).toEqual(mockCharacter)
    })

    it('should update character successfully', async () => {
      const store = useLitmCharacterStore()
      const existingCharacter: LitmCharacter = {
        id: '1',
        name: 'Old Name',
        gameType: 'litm',
      } as LitmCharacter

      store.characters = [existingCharacter]
      store.activeCharacter = existingCharacter

      const updateData = { name: 'New Name' }
      const updatedCharacter: LitmCharacter = {
        ...existingCharacter,
        ...updateData,
      }

      vi.mocked($fetch).mockResolvedValueOnce(updatedCharacter)

      const result = await store.updateCharacter('1', updateData)

      expect($fetch).toHaveBeenCalledWith('/api/litm/characters/1', {
        method: 'PUT',
        body: updateData,
      })
      expect(result).toEqual(updatedCharacter)
      expect(store.characters[0].name).toBe('New Name')
      expect(store.activeCharacter?.name).toBe('New Name')
    })

    it('should delete character successfully', async () => {
      const store = useLitmCharacterStore()
      const character: LitmCharacter = {
        id: '1',
        name: 'To Delete',
        gameType: 'litm',
      } as LitmCharacter

      store.characters = [character]
      store.activeCharacter = character

      vi.mocked($fetch).mockResolvedValueOnce(undefined)

      const result = await store.deleteCharacter('1')

      expect($fetch).toHaveBeenCalledWith('/api/litm/characters/1', {
        method: 'DELETE',
      })
      expect(result).toBe(true)
      expect(store.characters).toEqual([])
      expect(store.activeCharacter).toBeNull()
    })

    it('should create hero card successfully', async () => {
      const store = useLitmCharacterStore()
      const character: LitmCharacter = {
        id: '1',
        name: 'Character',
        gameType: 'litm',
        themeCards: [],
        trackers: [],
      } as LitmCharacter

      store.characters = [character]
      store.activeCharacter = character

      const heroCardData = { name: 'Hero Name', backstory: 'Once upon a time...' }
      const mockHeroCard: LitmHeroCard = {
        id: '1',
        characterId: '1',
        ...heroCardData,
        relationships: [],
        quintessences: [],
        backpackItems: [],
      } as LitmHeroCard

      vi.mocked($fetch).mockResolvedValueOnce(mockHeroCard)

      const result = await store.createHeroCard('1', heroCardData)

      expect($fetch).toHaveBeenCalledWith('/api/litm/characters/1/hero-card', {
        method: 'POST',
        body: heroCardData,
      })
      expect(result).toEqual(mockHeroCard)
      expect(store.activeCharacter?.heroCard).toEqual(mockHeroCard)
    })

    it('should create theme card successfully', async () => {
      const store = useLitmCharacterStore()
      const character: LitmCharacter = {
        id: '1',
        name: 'Character',
        gameType: 'litm',
        themeCards: [],
        trackers: [],
      } as LitmCharacter

      store.characters = [character]
      store.activeCharacter = character

      const themeCardData = {
        type: 'origin' as const,
        themebook: 'Test Book',
        title: 'Test Card',
      }
      const mockThemeCard: LitmThemeCard = {
        id: '1',
        characterId: '1',
        ...themeCardData,
        tags: [],
        improvements: [],
      } as LitmThemeCard

      vi.mocked($fetch).mockResolvedValueOnce(mockThemeCard)

      const result = await store.createThemeCard('1', themeCardData)

      expect($fetch).toHaveBeenCalledWith('/api/litm/characters/1/theme-cards', {
        method: 'POST',
        body: themeCardData,
      })
      expect(result).toEqual(mockThemeCard)
      expect(store.activeCharacter?.themeCards).toHaveLength(1)
      expect(store.activeCharacter?.themeCards[0]).toEqual(mockThemeCard)
    })

    it('should delete theme card successfully', async () => {
      const store = useLitmCharacterStore()
      const themeCard: LitmThemeCard = {
        id: 'card-1',
        characterId: '1',
        type: 'origin',
        themebook: 'Book',
        title: 'Card',
        tags: [],
        improvements: [],
      } as LitmThemeCard

      const character: LitmCharacter = {
        id: '1',
        name: 'Character',
        gameType: 'litm',
        themeCards: [themeCard],
        trackers: [],
      } as LitmCharacter

      store.characters = [character]
      store.activeCharacter = character

      vi.mocked($fetch).mockResolvedValueOnce(undefined)

      const result = await store.deleteThemeCard('1', 'card-1')

      expect($fetch).toHaveBeenCalledWith('/api/litm/characters/1/theme-cards/card-1', {
        method: 'DELETE',
      })
      expect(result).toBe(true)
      expect(store.activeCharacter?.themeCards).toEqual([])
    })
  })
})
