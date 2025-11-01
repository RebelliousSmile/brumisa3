/**
 * Playspace Store - MVP v1.0
 * Gestion des playspaces (contextes de jeu)
 *
 * Architecture : hackId + universeId
 * - hackId : "city-of-mist" | "litm" | "otherlands"
 * - universeId : null (default) ou custom
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getVersionId, getUniverseName, getHackName } from '~/server/config/systems.config'

export interface Playspace {
  id: string
  name: string
  description?: string
  hackId: string
  universeId: string | null
  isGM: boolean // false = PC (Player Character), true = GM (Game Master)
  userId: string
  createdAt: string
  updatedAt: string
  _count?: {
    characters: number
  }
}

export const usePlayspaceStore = defineStore('playspace', () => {
  // ============================================
  // STATE
  // ============================================

  const playspaces = ref<Playspace[]>([])
  const activePlayspaceId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ============================================
  // GETTERS
  // ============================================

  const activePlayspace = computed(() => {
    if (!activePlayspaceId.value) return null
    return playspaces.value.find(p => p.id === activePlayspaceId.value) || null
  })

  const hasPlayspaces = computed(() => playspaces.value.length > 0)

  /** Vérifie si le playspace actif est en mode GM (Game Master) */
  const isGM = computed(() => activePlayspace.value?.isGM === true)

  /** Récupère le nom de la version du playspace actif */
  const activeVersion = computed(() => {
    if (!activePlayspace.value) return null
    return getVersionId(activePlayspace.value.hackId)
  })

  /** Récupère le nom du hack du playspace actif */
  const activeHackName = computed(() => {
    if (!activePlayspace.value) return null
    return getHackName(activePlayspace.value.hackId)
  })

  /** Récupère le nom de l'univers du playspace actif */
  const activeUniverseName = computed(() => {
    if (!activePlayspace.value) return null
    return getUniverseName(activePlayspace.value.hackId, activePlayspace.value.universeId)
  })

  // ============================================
  // ACTIONS - API CALLS
  // ============================================

  /**
   * Charge tous les playspaces de l'utilisateur depuis l'API
   */
  async function loadPlayspaces() {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<Playspace[]>('/api/playspaces')
      playspaces.value = data

      // Auto-select premier playspace si aucun actif
      if (!activePlayspaceId.value && data.length > 0) {
        activePlayspaceId.value = data[0].id
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load playspaces'
      console.error('[PlayspaceStore] loadPlayspaces error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Crée un nouveau playspace
   */
  async function createPlayspace(input: {
    name: string
    description?: string
    hackId: string
    universeId?: string | null
    isGM?: boolean
  }) {
    loading.value = true
    error.value = null

    try {
      const newPlayspace = await $fetch<Playspace>('/api/playspaces', {
        method: 'POST',
        body: input
      })

      playspaces.value.push(newPlayspace)

      // Auto-select si premier playspace
      if (playspaces.value.length === 1) {
        activePlayspaceId.value = newPlayspace.id
      }

      return newPlayspace
    } catch (err: any) {
      error.value = err.message || 'Failed to create playspace'
      console.error('[PlayspaceStore] createPlayspace error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Met à jour un playspace existant
   */
  async function updatePlayspace(id: string, input: {
    name?: string
    description?: string
    universeId?: string | null
    isGM?: boolean
  }) {
    loading.value = true
    error.value = null

    try {
      const updated = await $fetch<Playspace>(`/api/playspaces/${id}`, {
        method: 'PUT',
        body: input
      })

      const index = playspaces.value.findIndex(p => p.id === id)
      if (index !== -1) {
        playspaces.value[index] = updated
      }

      return updated
    } catch (err: any) {
      error.value = err.message || 'Failed to update playspace'
      console.error('[PlayspaceStore] updatePlayspace error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprime un playspace
   */
  async function deletePlayspace(id: string) {
    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/playspaces/${id}`, {
        method: 'DELETE'
      })

      const index = playspaces.value.findIndex(p => p.id === id)
      if (index !== -1) {
        playspaces.value.splice(index, 1)
      }

      // Si playspace actif supprimé, sélectionner le premier disponible
      if (activePlayspaceId.value === id) {
        activePlayspaceId.value = playspaces.value.length > 0 ? playspaces.value[0].id : null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete playspace'
      console.error('[PlayspaceStore] deletePlayspace error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Change le playspace actif
   */
  async function switchPlayspace(id: string) {
    const playspace = playspaces.value.find(p => p.id === id)
    if (!playspace) {
      error.value = 'Playspace not found'
      return
    }

    // TODO: Sauvegarder l'état du playspace actuel avant switch

    activePlayspaceId.value = id

    // TODO: Charger les characters du nouveau playspace
  }

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    playspaces,
    activePlayspaceId,
    loading,
    error,

    // Getters
    activePlayspace,
    hasPlayspaces,
    isGM,
    activeVersion,
    activeHackName,
    activeUniverseName,

    // Actions
    loadPlayspaces,
    createPlayspace,
    updatePlayspace,
    deletePlayspace,
    switchPlayspace
  }
})
