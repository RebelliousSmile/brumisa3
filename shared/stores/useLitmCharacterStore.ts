import { defineStore } from 'pinia'
import type { Tracker } from '~/components/litm/TrackerList.vue'
import type { Relationship } from '~/components/litm/RelationshipList.vue'
import type { Quintessence } from '~/components/litm/QuintessenceList.vue'
import type { BackpackItem } from '~/components/litm/BackpackList.vue'
import type { ThemeCardTag, ThemeCardQuest } from '~/components/litm/ThemeCard.vue'

/**
 * Store Pinia pour gérer les personnages Legends in the Mist
 *
 * Gère l'état des personnages LITM, leurs cartes de thème, trackers, etc.
 * avec persistance via API Nitro
 */

// Types pour les entités LITM
export interface LitmCharacter {
  id: string
  userId: number
  name: string
  gameType: 'litm' | 'cotm'
  heroCard?: LitmHeroCard
  themeCards: LitmThemeCard[]
  trackers: Tracker[]
  createdAt: Date
  updatedAt: Date
}

export interface LitmHeroCard {
  id: string
  characterId: string
  name: string
  backstory?: string
  birthright?: string
  relationships: Relationship[]
  quintessences: Quintessence[]
  backpackItems: BackpackItem[]
  createdAt: Date
  updatedAt: Date
}

export interface LitmThemeCard {
  id: string
  characterId: string
  type: 'origin' | 'fellowship' | 'expertise' | 'mythos'
  themebook: string
  title: string
  mainTagText?: string
  tags: ThemeCardTag[]
  quest?: LitmQuest
  improvements: string[]
  createdAt: Date
  updatedAt: Date
}

export interface LitmQuest {
  id: string
  themeCardId: string
  text: string
  progressPips: number
  totalPips: number
  createdAt: Date
  updatedAt: Date
}

// Types pour la création et mise à jour
export interface CreateLitmCharacterData {
  name: string
  gameType?: 'litm' | 'cotm'
}

export interface UpdateLitmCharacterData {
  name?: string
  gameType?: 'litm' | 'cotm'
}

export interface CreateHeroCardData {
  name: string
  backstory?: string
  birthright?: string
}

export interface UpdateHeroCardData {
  name?: string
  backstory?: string
  birthright?: string
}

export interface CreateThemeCardData {
  type: 'origin' | 'fellowship' | 'expertise' | 'mythos'
  themebook: string
  title: string
  mainTagText?: string
}

export interface UpdateThemeCardData {
  type?: 'origin' | 'fellowship' | 'expertise' | 'mythos'
  themebook?: string
  title?: string
  mainTagText?: string
}

interface LitmCharacterStoreState {
  characters: LitmCharacter[]
  activeCharacter: LitmCharacter | null
  isLoading: boolean
  error: string | null
  filters: {
    gameType: 'litm' | 'cotm' | null
    search: string
  }
}

export const useLitmCharacterStore = defineStore('litmCharacters', {
  state: (): LitmCharacterStoreState => ({
    characters: [],
    activeCharacter: null,
    isLoading: false,
    error: null,
    filters: {
      gameType: null,
      search: '',
    },
  }),

  getters: {
    /**
     * Characters filtrés selon les critères actifs
     */
    filteredCharacters: (state): LitmCharacter[] => {
      let characters = [...state.characters]

      if (state.filters.gameType) {
        characters = characters.filter((c) => c.gameType === state.filters.gameType)
      }

      if (state.filters.search) {
        const term = state.filters.search.toLowerCase()
        characters = characters.filter((c) =>
          c.name.toLowerCase().includes(term)
        )
      }

      return characters.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    },

    /**
     * Nombre total de personnages
     */
    characterCount: (state): number => state.characters.length,

    /**
     * Cartes de thème du personnage actif
     */
    activeCharacterThemeCards: (state): LitmThemeCard[] => {
      return state.activeCharacter?.themeCards ?? []
    },

    /**
     * Trackers du personnage actif
     */
    activeCharacterTrackers: (state): Tracker[] => {
      return state.activeCharacter?.trackers ?? []
    },

    /**
     * Hero card du personnage actif
     */
    activeCharacterHeroCard: (state): LitmHeroCard | undefined => {
      return state.activeCharacter?.heroCard
    },

    /**
     * Cartes de thème groupées par type
     */
    themeCardsByType: (state) => {
      if (!state.activeCharacter) return {}

      const grouped: Record<string, LitmThemeCard[]> = {}

      state.activeCharacter.themeCards.forEach((card) => {
        if (!grouped[card.type]) {
          grouped[card.type] = []
        }
        grouped[card.type].push(card)
      })

      return grouped
    },

    /**
     * Trackers groupés par type
     */
    trackersByType: (state) => {
      if (!state.activeCharacter) return {}

      const grouped: Record<string, Tracker[]> = {}

      state.activeCharacter.trackers.forEach((tracker) => {
        if (!grouped[tracker.type]) {
          grouped[tracker.type] = []
        }
        grouped[tracker.type].push(tracker)
      })

      return grouped
    },
  },

  actions: {
    /**
     * Gestion du loading state
     */
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    /**
     * Gestion des erreurs
     */
    setError(error: string | null) {
      this.error = error
    },

    clearError() {
      this.error = null
    },

    /**
     * Gestion des filtres
     */
    setFilters(filters: Partial<LitmCharacterStoreState['filters']>) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = {
        gameType: null,
        search: '',
      }
    },

    /**
     * Charger tous les personnages LITM de l'utilisateur
     */
    async fetchCharacters() {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await $fetch<LitmCharacter[]>('/api/litm/characters')
        this.characters = response
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors du chargement des personnages')
        console.error('[useLitmCharacterStore] fetchCharacters error:', err)
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Charger un personnage spécifique par ID
     */
    async fetchCharacter(id: string) {
      this.setLoading(true)
      this.clearError()

      try {
        const character = await $fetch<LitmCharacter>(`/api/litm/characters/${id}`)
        this.activeCharacter = character

        // Mettre à jour dans la liste si déjà présent
        const index = this.characters.findIndex((c) => c.id === id)
        if (index !== -1) {
          this.characters[index] = character
        } else {
          this.characters.push(character)
        }

        return character
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors du chargement du personnage')
        console.error('[useLitmCharacterStore] fetchCharacter error:', err)
        return null
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Créer un nouveau personnage LITM
     */
    async createCharacter(data: CreateLitmCharacterData) {
      this.setLoading(true)
      this.clearError()

      try {
        const character = await $fetch<LitmCharacter>('/api/litm/characters', {
          method: 'POST',
          body: data,
        })

        this.characters.unshift(character)
        this.activeCharacter = character

        return character
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la création du personnage')
        console.error('[useLitmCharacterStore] createCharacter error:', err)
        return null
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Mettre à jour un personnage LITM
     */
    async updateCharacter(id: string, data: UpdateLitmCharacterData) {
      this.setLoading(true)
      this.clearError()

      try {
        const character = await $fetch<LitmCharacter>(`/api/litm/characters/${id}`, {
          method: 'PUT',
          body: data,
        })

        // Mise à jour dans la liste
        const index = this.characters.findIndex((c) => c.id === id)
        if (index !== -1) {
          this.characters[index] = character
        }

        // Mise à jour du personnage actif si c'est le même
        if (this.activeCharacter?.id === id) {
          this.activeCharacter = character
        }

        return character
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la mise à jour du personnage')
        console.error('[useLitmCharacterStore] updateCharacter error:', err)
        return null
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Supprimer un personnage LITM
     */
    async deleteCharacter(id: string) {
      this.setLoading(true)
      this.clearError()

      try {
        await $fetch(`/api/litm/characters/${id}`, {
          method: 'DELETE',
        })

        this.characters = this.characters.filter((c) => c.id !== id)

        if (this.activeCharacter?.id === id) {
          this.activeCharacter = null
        }

        return true
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la suppression du personnage')
        console.error('[useLitmCharacterStore] deleteCharacter error:', err)
        return false
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Créer une hero card pour un personnage
     */
    async createHeroCard(characterId: string, data: CreateHeroCardData) {
      this.setLoading(true)
      this.clearError()

      try {
        const heroCard = await $fetch<LitmHeroCard>(`/api/litm/characters/${characterId}/hero-card`, {
          method: 'POST',
          body: data,
        })

        // Mettre à jour le personnage
        const character = this.characters.find((c) => c.id === characterId)
        if (character) {
          character.heroCard = heroCard
        }

        if (this.activeCharacter?.id === characterId) {
          this.activeCharacter.heroCard = heroCard
        }

        return heroCard
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la création de la carte héros')
        console.error('[useLitmCharacterStore] createHeroCard error:', err)
        return null
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Mettre à jour une hero card
     */
    async updateHeroCard(characterId: string, data: UpdateHeroCardData) {
      this.setLoading(true)
      this.clearError()

      try {
        const heroCard = await $fetch<LitmHeroCard>(`/api/litm/characters/${characterId}/hero-card`, {
          method: 'PUT',
          body: data,
        })

        // Mettre à jour le personnage
        const character = this.characters.find((c) => c.id === characterId)
        if (character) {
          character.heroCard = heroCard
        }

        if (this.activeCharacter?.id === characterId) {
          this.activeCharacter.heroCard = heroCard
        }

        return heroCard
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la mise à jour de la carte héros')
        console.error('[useLitmCharacterStore] updateHeroCard error:', err)
        return null
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Créer une theme card
     */
    async createThemeCard(characterId: string, data: CreateThemeCardData) {
      this.setLoading(true)
      this.clearError()

      try {
        const themeCard = await $fetch<LitmThemeCard>(`/api/litm/characters/${characterId}/theme-cards`, {
          method: 'POST',
          body: data,
        })

        // Mettre à jour le personnage
        const character = this.characters.find((c) => c.id === characterId)
        if (character) {
          character.themeCards.push(themeCard)
        }

        // Mettre à jour le personnage actif seulement si ce n'est pas déjà le même objet
        if (this.activeCharacter?.id === characterId && this.activeCharacter !== character) {
          this.activeCharacter.themeCards.push(themeCard)
        }

        return themeCard
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la création de la carte de thème')
        console.error('[useLitmCharacterStore] createThemeCard error:', err)
        return null
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Mettre à jour une theme card
     */
    async updateThemeCard(characterId: string, themeCardId: string, data: UpdateThemeCardData) {
      this.setLoading(true)
      this.clearError()

      try {
        const themeCard = await $fetch<LitmThemeCard>(
          `/api/litm/characters/${characterId}/theme-cards/${themeCardId}`,
          {
            method: 'PUT',
            body: data,
          }
        )

        // Mettre à jour le personnage
        const character = this.characters.find((c) => c.id === characterId)
        if (character) {
          const index = character.themeCards.findIndex((tc) => tc.id === themeCardId)
          if (index !== -1) {
            character.themeCards[index] = themeCard
          }
        }

        if (this.activeCharacter?.id === characterId) {
          const index = this.activeCharacter.themeCards.findIndex((tc) => tc.id === themeCardId)
          if (index !== -1) {
            this.activeCharacter.themeCards[index] = themeCard
          }
        }

        return themeCard
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la mise à jour de la carte de thème')
        console.error('[useLitmCharacterStore] updateThemeCard error:', err)
        return null
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Supprimer une theme card
     */
    async deleteThemeCard(characterId: string, themeCardId: string) {
      this.setLoading(true)
      this.clearError()

      try {
        await $fetch(`/api/litm/characters/${characterId}/theme-cards/${themeCardId}`, {
          method: 'DELETE',
        })

        // Mettre à jour le personnage
        const character = this.characters.find((c) => c.id === characterId)
        if (character) {
          character.themeCards = character.themeCards.filter((tc) => tc.id !== themeCardId)
        }

        if (this.activeCharacter?.id === characterId) {
          this.activeCharacter.themeCards = this.activeCharacter.themeCards.filter(
            (tc) => tc.id !== themeCardId
          )
        }

        return true
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la suppression de la carte de thème')
        console.error('[useLitmCharacterStore] deleteThemeCard error:', err)
        return false
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Mettre à jour les trackers d'un personnage
     */
    async updateTrackers(characterId: string, trackers: Tracker[]) {
      this.setLoading(true)
      this.clearError()

      try {
        const updatedTrackers = await $fetch<Tracker[]>(
          `/api/litm/characters/${characterId}/trackers`,
          {
            method: 'PUT',
            body: { trackers },
          }
        )

        // Mettre à jour le personnage
        const character = this.characters.find((c) => c.id === characterId)
        if (character) {
          character.trackers = updatedTrackers
        }

        if (this.activeCharacter?.id === characterId) {
          this.activeCharacter.trackers = updatedTrackers
        }

        return updatedTrackers
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la mise à jour des trackers')
        console.error('[useLitmCharacterStore] updateTrackers error:', err)
        return null
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Définir le personnage actif
     */
    setActiveCharacter(character: LitmCharacter | null) {
      this.activeCharacter = character
    },

    /**
     * Réinitialiser le store
     */
    reset() {
      this.characters = []
      this.activeCharacter = null
      this.error = null
      this.isLoading = false
      this.clearFilters()
    },
  },
})
