/**
 * Playspace Store - MVP v1.0
 * Gestion des playspaces (contextes de jeu)
 *
 * Architecture : hackId + universeId
 * - hackId : "city-of-mist" | "litm" | "otherscape"
 * - universeId : null (default) ou custom
 *
 * Support local (non-authentifie) et persiste (BDD)
 * - Local : id commence par "local_", stocke en localStorage
 * - Persiste : id UUID, stocke en BDD
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getVersionId, getUniverseName, getHackName } from '#shared/config/systems.config'

const LOCAL_STORAGE_KEY = 'brumisa3_local_playspaces'
const ACTIVE_PLAYSPACE_KEY = 'brumisa3_active_playspace'

/** Nombre maximum de playspaces par utilisateur */
export const MAX_PLAYSPACES = 7

export interface Playspace {
  id: string
  name: string
  description?: string
  hackId: string
  universeId: string | null
  isGM: boolean // false = PC (Player Character), true = GM (Game Master)
  userId?: string // Optional pour les playspaces locaux
  createdAt: string
  updatedAt: string
  persisted?: boolean // true = BDD, false = localStorage
  _count?: {
    characters: number
  }
}

/**
 * Verifie si un playspace est local (non persiste en BDD)
 */
export function isLocalPlayspace(id: string): boolean {
  return id.startsWith('local_')
}

export const usePlayspaceStore = defineStore('playspace', () => {
  // ============================================
  // STATE
  // ============================================

  const playspaces = ref<Playspace[]>([])
  const localPlayspaces = ref<Playspace[]>([])
  const activePlayspaceId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ============================================
  // LOCAL STORAGE HELPERS
  // ============================================

  /**
   * Charge les playspaces locaux depuis localStorage
   */
  function loadLocalPlayspaces() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        localPlayspaces.value = JSON.parse(stored)
      }
    } catch (err) {
      console.error('[PlayspaceStore] Failed to load local playspaces:', err)
      localPlayspaces.value = []
    }
  }

  /**
   * Sauvegarde les playspaces locaux dans localStorage
   */
  function saveLocalPlayspaces() {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localPlayspaces.value))
    } catch (err) {
      console.error('[PlayspaceStore] Failed to save local playspaces:', err)
    }
  }

  /**
   * Charge l'ID du playspace actif depuis localStorage
   */
  function loadActivePlayspaceId() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(ACTIVE_PLAYSPACE_KEY)
      if (stored) {
        activePlayspaceId.value = stored
      }
    } catch (err) {
      console.error('[PlayspaceStore] Failed to load active playspace ID:', err)
    }
  }

  /**
   * Sauvegarde l'ID du playspace actif dans localStorage
   */
  function saveActivePlayspaceId() {
    if (typeof window === 'undefined') return

    try {
      if (activePlayspaceId.value) {
        localStorage.setItem(ACTIVE_PLAYSPACE_KEY, activePlayspaceId.value)
      } else {
        localStorage.removeItem(ACTIVE_PLAYSPACE_KEY)
      }
    } catch (err) {
      console.error('[PlayspaceStore] Failed to save active playspace ID:', err)
    }
  }

  // Watch pour sauvegarder automatiquement le playspace actif
  watch(activePlayspaceId, saveActivePlayspaceId)

  /**
   * Ajoute un playspace local et l'active
   * @returns true si ajoute, false si limite atteinte
   */
  function addLocalPlayspace(playspace: Playspace): boolean {
    if (allPlayspaces.value.length >= MAX_PLAYSPACES) {
      error.value = `Limite de ${MAX_PLAYSPACES} playspaces atteinte`
      return false
    }
    localPlayspaces.value.push(playspace)
    saveLocalPlayspaces()
    // Auto-activer le nouveau playspace
    activePlayspaceId.value = playspace.id
    return true
  }

  /**
   * Recupere un playspace par ID (local ou persiste)
   */
  function getPlayspaceById(id: string): Playspace | null {
    if (isLocalPlayspace(id)) {
      return localPlayspaces.value.find(p => p.id === id) || null
    }
    return playspaces.value.find(p => p.id === id) || null
  }

  // Watch pour sauvegarder automatiquement les changements locaux
  watch(localPlayspaces, saveLocalPlayspaces, { deep: true })

  // ============================================
  // GETTERS
  // ============================================

  /** Tous les playspaces (locaux + persistes) */
  const allPlayspaces = computed(() => [...localPlayspaces.value, ...playspaces.value])

  const activePlayspace = computed(() => {
    if (!activePlayspaceId.value) return null
    return getPlayspaceById(activePlayspaceId.value)
  })

  const hasPlayspaces = computed(() => allPlayspaces.value.length > 0)

  /** Nombre de playspaces */
  const playspaceCount = computed(() => allPlayspaces.value.length)

  /** Verifie si la limite de playspaces est atteinte */
  const isMaxPlayspacesReached = computed(() => allPlayspaces.value.length >= MAX_PLAYSPACES)

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
   * Cree un nouveau playspace
   * Verifie la limite avant creation
   */
  async function createPlayspace(input: {
    name: string
    description?: string
    hackId: string
    universeId?: string | null
    isGM?: boolean
  }) {
    // Verifier la limite
    if (allPlayspaces.value.length >= MAX_PLAYSPACES) {
      error.value = `Limite de ${MAX_PLAYSPACES} playspaces atteinte`
      throw new Error(error.value)
    }

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
   * Change le playspace actif et charge ses donnees
   */
  async function switchPlayspace(id: string) {
    const playspace = getPlayspaceById(id)
    if (!playspace) {
      error.value = 'Playspace not found'
      return
    }

    // Changer le playspace actif (declenche le watch pour charger les donnees)
    activePlayspaceId.value = id
  }

  /**
   * Callback pour charger les donnees du playspace actif
   * Doit etre appele par un watch dans le composant/plugin qui utilise le store
   */
  function onPlayspaceChange(callback: (playspace: Playspace | null) => void) {
    watch(activePlayspace, (newPlayspace) => {
      callback(newPlayspace)
    }, { immediate: true })
  }

  /**
   * Initialise le store (charge les playspaces locaux et l'ID actif)
   */
  function init() {
    loadLocalPlayspaces()
    loadActivePlayspaceId()

    // Verifier que le playspace actif existe toujours
    if (activePlayspaceId.value) {
      const exists = getPlayspaceById(activePlayspaceId.value)
      if (!exists) {
        console.warn('[PlayspaceStore] Active playspace not found, resetting')
        activePlayspaceId.value = null
      }
    }

    // Auto-activer le premier playspace si aucun actif valide
    if (!activePlayspaceId.value && allPlayspaces.value.length > 0) {
      activePlayspaceId.value = allPlayspaces.value[0].id
    }
  }

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    playspaces,
    localPlayspaces,
    activePlayspaceId,
    loading,
    error,

    // Getters
    allPlayspaces,
    activePlayspace,
    hasPlayspaces,
    playspaceCount,
    isMaxPlayspacesReached,
    isGM,
    activeVersion,
    activeHackName,
    activeUniverseName,

    // Actions
    init,
    loadPlayspaces,
    loadLocalPlayspaces,
    createPlayspace,
    updatePlayspace,
    deletePlayspace,
    switchPlayspace,
    addLocalPlayspace,
    getPlayspaceById,
    onPlayspaceChange
  }
})
