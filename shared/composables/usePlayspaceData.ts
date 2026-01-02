/**
 * usePlayspaceData - Composable pour charger les donnees d'un playspace
 *
 * Charge et nettoie les donnees lors du changement de playspace :
 * - Regles du systeme (config statique)
 * - Actions database (API)
 * - Dangers partages (API)
 * - Personnages du playspace (API)
 */

import { ref, computed, watch } from 'vue'
import type { Playspace } from '#shared/stores/playspace'

// Types pour les donnees du playspace
export interface SystemRules {
  systemId: string
  hackId: string
  name: string
  moves: Move[]
  statuses: Status[]
  mechanics: Record<string, any>
}

export interface Move {
  id: string
  name: string
  description: string
  type: 'basic' | 'special' | 'downtime'
  tags?: string[]
}

export interface Status {
  id: string
  name: string
  description: string
  spectrum?: string // Pour City of Mist
  tier?: number
}

export interface Action {
  id: string
  name: string
  description: string
  category: string
  hackId: string
}

export interface Danger {
  id: string
  name: string
  description: string
  type: string
  playspaceId: string
}

export interface Character {
  id: string
  name: string
  hackId: string
  playspaceId: string
  isNPC: boolean
  createdAt: string
  updatedAt: string
}

export interface PlayspaceData {
  playspaceId: string | null
  systemRules: SystemRules | null
  actions: Action[]
  dangers: Danger[]
  characters: Character[]
  isLoading: boolean
  error: string | null
}

// Etat global des donnees du playspace actif
const playspaceData = ref<PlayspaceData>({
  playspaceId: null,
  systemRules: null,
  actions: [],
  dangers: [],
  characters: [],
  isLoading: false,
  error: null
})

/**
 * Charge les regles du systeme depuis la config statique
 */
async function loadSystemRules(hackId: string): Promise<SystemRules | null> {
  try {
    // TODO: Charger depuis les fichiers de config selon le hackId
    // Pour l'instant, retourne une structure de base
    const systemMap: Record<string, { systemId: string; name: string }> = {
      'litm': { systemId: 'mist-engine', name: 'Legends in the Mist' },
      'otherscape': { systemId: 'mist-engine', name: 'Tokyo:Otherscape' },
      'city-of-mist': { systemId: 'city-of-mist', name: 'City of Mist' }
    }

    const system = systemMap[hackId]
    if (!system) return null

    return {
      systemId: system.systemId,
      hackId,
      name: system.name,
      moves: [], // TODO: Charger les moves depuis la config
      statuses: [], // TODO: Charger les statuts depuis la config
      mechanics: {} // TODO: Charger les mecaniques specifiques
    }
  } catch (err) {
    console.error('[usePlayspaceData] Failed to load system rules:', err)
    return null
  }
}

/**
 * Charge les actions depuis l'API
 */
async function loadActions(hackId: string): Promise<Action[]> {
  try {
    // TODO: Appeler l'API quand elle sera disponible
    // const actions = await $fetch<Action[]>(`/api/actions?hackId=${hackId}`)
    return []
  } catch (err) {
    console.error('[usePlayspaceData] Failed to load actions:', err)
    return []
  }
}

/**
 * Charge les dangers partages depuis l'API
 */
async function loadDangers(playspaceId: string): Promise<Danger[]> {
  try {
    // TODO: Appeler l'API quand elle sera disponible
    // const dangers = await $fetch<Danger[]>(`/api/playspaces/${playspaceId}/dangers`)
    return []
  } catch (err) {
    console.error('[usePlayspaceData] Failed to load dangers:', err)
    return []
  }
}

/**
 * Charge les personnages du playspace depuis l'API
 */
async function loadCharacters(playspaceId: string): Promise<Character[]> {
  try {
    // TODO: Appeler l'API quand elle sera disponible
    // const characters = await $fetch<Character[]>(`/api/playspaces/${playspaceId}/characters`)
    return []
  } catch (err) {
    console.error('[usePlayspaceData] Failed to load characters:', err)
    return []
  }
}

/**
 * Nettoie toutes les donnees du playspace
 */
function clearPlayspaceData() {
  playspaceData.value = {
    playspaceId: null,
    systemRules: null,
    actions: [],
    dangers: [],
    characters: [],
    isLoading: false,
    error: null
  }
}

/**
 * Charge toutes les donnees pour un playspace
 */
async function loadPlayspaceData(playspace: Playspace) {
  // Nettoyer les anciennes donnees
  clearPlayspaceData()

  playspaceData.value.isLoading = true
  playspaceData.value.playspaceId = playspace.id
  playspaceData.value.error = null

  try {
    // Charger en parallele
    const [systemRules, actions, dangers, characters] = await Promise.all([
      loadSystemRules(playspace.hackId),
      loadActions(playspace.hackId),
      loadDangers(playspace.id),
      loadCharacters(playspace.id)
    ])

    playspaceData.value.systemRules = systemRules
    playspaceData.value.actions = actions
    playspaceData.value.dangers = dangers
    playspaceData.value.characters = characters

    console.log(`[usePlayspaceData] Loaded data for playspace: ${playspace.name}`)
  } catch (err: any) {
    playspaceData.value.error = err.message || 'Failed to load playspace data'
    console.error('[usePlayspaceData] Error loading data:', err)
  } finally {
    playspaceData.value.isLoading = false
  }
}

/**
 * Composable principal
 */
export function usePlayspaceData() {
  // Computed pour acces facile
  const isLoading = computed(() => playspaceData.value.isLoading)
  const error = computed(() => playspaceData.value.error)
  const systemRules = computed(() => playspaceData.value.systemRules)
  const actions = computed(() => playspaceData.value.actions)
  const dangers = computed(() => playspaceData.value.dangers)
  const characters = computed(() => playspaceData.value.characters)
  const currentPlayspaceId = computed(() => playspaceData.value.playspaceId)

  // Helpers
  const hasData = computed(() => playspaceData.value.playspaceId !== null)
  const characterCount = computed(() => playspaceData.value.characters.length)
  const dangerCount = computed(() => playspaceData.value.dangers.length)

  return {
    // State
    isLoading,
    error,
    hasData,

    // Data
    systemRules,
    actions,
    dangers,
    characters,
    currentPlayspaceId,

    // Counts
    characterCount,
    dangerCount,

    // Actions
    loadPlayspaceData,
    clearPlayspaceData
  }
}
