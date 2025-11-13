/**
 * Character Store - MVP v1.0
 * Unified store for all Mist Engine characters (City of Mist, LITM, Otherlands)
 *
 * Uses Prisma models (Character, ThemeCard, Tag, HeroCard, Trackers)
 * Validation based on playspace.hackId
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePlayspaceStore } from './playspace'

export interface Character {
  id: string
  name: string
  description?: string
  playspaceId: string
  createdAt: string
  updatedAt: string
  themeCards?: ThemeCard[]
  heroCard?: HeroCard
  trackers?: Trackers
  playspace?: {
    hackId: string
    universeId: string | null
    isGM: boolean
  }
}

export interface ThemeCard {
  id: string
  name: string
  type: string // ThemeType enum
  description?: string
  attention: number
  characterId: string
  tags?: Tag[]
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  type: string // TagType enum: POWER, WEAKNESS, STORY
  burned: boolean
  inverted: boolean
  themeCardId: string
  createdAt: string
  updatedAt: string
}

export interface HeroCard {
  id: string
  identity: string
  mystery: string
  characterId: string
  relationships?: Relationship[]
  createdAt: string
  updatedAt: string
}

export interface Relationship {
  id: string
  name: string
  description?: string
  heroCardId: string
  createdAt: string
  updatedAt: string
}

export interface Trackers {
  id: string
  characterId: string
  statuses?: Status[]
  storyTags?: StoryTag[]
  storyThemes?: StoryTheme[]
  createdAt: string
  updatedAt: string
}

export interface Status {
  id: string
  name: string
  tier: number
  positive: boolean
  trackersId: string
}

export interface StoryTag {
  id: string
  name: string
  trackersId: string
}

export interface StoryTheme {
  id: string
  name: string
  trackersId: string
}

export const useCharacterStore = defineStore('character', () => {
  // ============================================
  // STATE
  // ============================================

  const characters = ref<Character[]>([])
  const activeCharacterId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const playspaceStore = usePlayspaceStore()

  // ============================================
  // GETTERS
  // ============================================

  const activeCharacter = computed(() => {
    if (!activeCharacterId.value) return null
    return characters.value.find(c => c.id === activeCharacterId.value) || null
  })

  const hasCharacters = computed(() => characters.value.length > 0)

  /** Characters du playspace actif uniquement */
  const currentPlayspaceCharacters = computed(() => {
    if (!playspaceStore.activePlayspaceId) return []
    return characters.value.filter(c => c.playspaceId === playspaceStore.activePlayspaceId)
  })

  // ============================================
  // ACTIONS - API CALLS
  // ============================================

  /**
   * Load all characters for a playspace
   */
  async function loadCharacters(playspaceId: string) {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<Character[]>('/api/characters', {
        query: { playspaceId }
      })

      characters.value = data

      // Auto-select first character if none active
      if (!activeCharacterId.value && data.length > 0) {
        activeCharacterId.value = data[0].id
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load characters'
      console.error('[CharacterStore] loadCharacters error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create new character
   */
  async function createCharacter(input: {
    name: string
    description?: string
    playspaceId: string
  }) {
    loading.value = true
    error.value = null

    try {
      const newCharacter = await $fetch<Character>('/api/characters', {
        method: 'POST',
        body: input
      })

      characters.value.push(newCharacter)

      // Auto-select if first character
      if (characters.value.length === 1) {
        activeCharacterId.value = newCharacter.id
      }

      return newCharacter
    } catch (err: any) {
      error.value = err.message || 'Failed to create character'
      console.error('[CharacterStore] createCharacter error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update character
   */
  async function updateCharacter(id: string, input: {
    name?: string
    description?: string
  }) {
    loading.value = true
    error.value = null

    try {
      const updated = await $fetch<Character>(`/api/characters/${id}`, {
        method: 'PUT',
        body: input
      })

      const index = characters.value.findIndex(c => c.id === id)
      if (index !== -1) {
        characters.value[index] = updated
      }

      return updated
    } catch (err: any) {
      error.value = err.message || 'Failed to update character'
      console.error('[CharacterStore] updateCharacter error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete character
   */
  async function deleteCharacter(id: string) {
    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/characters/${id}`, {
        method: 'DELETE'
      })

      const index = characters.value.findIndex(c => c.id === id)
      if (index !== -1) {
        characters.value.splice(index, 1)
      }

      // If active character deleted, select first available
      if (activeCharacterId.value === id) {
        activeCharacterId.value = characters.value.length > 0 ? characters.value[0].id : null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete character'
      console.error('[CharacterStore] deleteCharacter error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get full character with relations
   */
  async function getCharacter(id: string, full: boolean = true) {
    loading.value = true
    error.value = null

    try {
      const url = full ? `/api/characters/${id}?full=true` : `/api/characters/${id}`
      const character = await $fetch<Character>(url)
      return character
    } catch (err: any) {
      error.value = err.message || 'Failed to get character'
      console.error('[CharacterStore] getCharacter error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    characters,
    activeCharacterId,
    loading,
    error,

    // Getters
    activeCharacter,
    hasCharacters,
    currentPlayspaceCharacters,

    // Actions
    loadCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacter
  }
})
