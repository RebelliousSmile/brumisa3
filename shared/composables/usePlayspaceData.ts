/**
 * usePlayspaceData - Composable pour charger les donnees d'un playspace
 *
 * Un Playspace = ensemble des regles d'un systeme du Mist Engine
 * (LITM, Otherscape, City of Mist) necessaires pour creer des
 * personnages et dangers.
 *
 * Charge et nettoie les donnees lors du changement de playspace :
 * - Regles du systeme (types de themes, moves, statuts)
 * - Actions database (API)
 * - Personnages crees avec ce playspace (API)
 * - Dangers crees avec ce playspace (API)
 *
 * Utilise IndexedDB pour cacher les donnees et eviter les requetes API inutiles.
 */

import { ref, computed } from 'vue'
import type { Playspace } from '#shared/stores/playspace'
import * as cache from '#shared/services/indexeddb'

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
  isCacheHit: boolean
  error: string | null
}

// Configuration du cache
const CACHE_MAX_AGE_HOURS = 24 // Duree de validite du cache

// Etat global des donnees du playspace actif
const playspaceData = ref<PlayspaceData>({
  playspaceId: null,
  systemRules: null,
  actions: [],
  dangers: [],
  characters: [],
  isLoading: false,
  isCacheHit: false,
  error: null
})

/**
 * Charge les regles du systeme depuis la config statique ou le cache
 */
async function loadSystemRules(hackId: string, useCache: boolean = true): Promise<SystemRules | null> {
  try {
    // Verifier le cache d'abord
    if (useCache) {
      const cached = await cache.loadSystemRules(hackId)
      if (cached) {
        console.log(`[usePlayspaceData] System rules loaded from cache for ${hackId}`)
        return cached as SystemRules
      }
    }

    // Charger depuis la config statique
    const systemMap: Record<string, { systemId: string; name: string }> = {
      'litm': { systemId: 'mist-engine', name: 'Legends in the Mist' },
      'otherscape': { systemId: 'mist-engine', name: 'Tokyo:Otherscape' },
      'city-of-mist': { systemId: 'city-of-mist', name: 'City of Mist' }
    }

    const system = systemMap[hackId]
    if (!system) return null

    const rules: SystemRules = {
      systemId: system.systemId,
      hackId,
      name: system.name,
      moves: [], // TODO: Charger les moves depuis la config
      statuses: [], // TODO: Charger les statuts depuis la config
      mechanics: {} // TODO: Charger les mecaniques specifiques
    }

    // Sauvegarder dans le cache
    await cache.saveSystemRules(rules)

    return rules
  } catch (err) {
    console.error('[usePlayspaceData] Failed to load system rules:', err)
    return null
  }
}

/**
 * Charge les actions depuis l'API ou le cache
 */
async function loadActionsData(hackId: string, useCache: boolean = true): Promise<Action[]> {
  try {
    // Verifier le cache d'abord
    if (useCache) {
      const cached = await cache.loadActions(hackId)
      if (cached && cached.length > 0) {
        console.log(`[usePlayspaceData] Actions loaded from cache for ${hackId}: ${cached.length}`)
        return cached as Action[]
      }
    }

    // Charger depuis l'API
    // TODO: Activer quand l'API sera disponible
    // const actions = await $fetch<Action[]>(`/api/actions?hackId=${hackId}`)
    const actions: Action[] = []

    // Sauvegarder dans le cache si des donnees
    if (actions.length > 0) {
      await cache.saveActions(actions)
    }

    return actions
  } catch (err) {
    console.error('[usePlayspaceData] Failed to load actions:', err)
    return []
  }
}

/**
 * Charge les dangers depuis l'API ou le cache
 */
async function loadDangersData(playspaceId: string, useCache: boolean = true): Promise<Danger[]> {
  try {
    // Verifier le cache d'abord
    if (useCache) {
      const cached = await cache.loadDangers(playspaceId)
      if (cached && cached.length > 0) {
        console.log(`[usePlayspaceData] Dangers loaded from cache for ${playspaceId}: ${cached.length}`)
        return cached as Danger[]
      }
    }

    // Charger depuis l'API
    // TODO: Activer quand l'API sera disponible
    // const dangers = await $fetch<Danger[]>(`/api/playspaces/${playspaceId}/dangers`)
    const dangers: Danger[] = []

    // Sauvegarder dans le cache si des donnees
    if (dangers.length > 0) {
      await cache.saveDangers(dangers)
    }

    return dangers
  } catch (err) {
    console.error('[usePlayspaceData] Failed to load dangers:', err)
    return []
  }
}

/**
 * Charge les personnages depuis l'API ou le cache
 */
async function loadCharactersData(playspaceId: string, useCache: boolean = true): Promise<Character[]> {
  try {
    // Verifier le cache d'abord
    if (useCache) {
      const cached = await cache.loadCharacters(playspaceId)
      if (cached && cached.length > 0) {
        console.log(`[usePlayspaceData] Characters loaded from cache for ${playspaceId}: ${cached.length}`)
        return cached as Character[]
      }
    }

    // Charger depuis l'API
    // TODO: Activer quand l'API sera disponible
    // const characters = await $fetch<Character[]>(`/api/playspaces/${playspaceId}/characters`)
    const characters: Character[] = []

    // Sauvegarder dans le cache si des donnees
    if (characters.length > 0) {
      await cache.saveCharacters(characters)
    }

    return characters
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
    isCacheHit: false,
    error: null
  }
}

/**
 * Charge toutes les donnees pour un playspace (avec cache IndexedDB)
 */
async function loadPlayspaceData(playspace: Playspace, forceRefresh: boolean = false) {
  console.log('[usePlayspaceData] loadPlayspaceData called for:', playspace.name, playspace.id)

  // Nettoyer les anciennes donnees
  clearPlayspaceData()

  playspaceData.value.isLoading = true
  playspaceData.value.playspaceId = playspace.id
  playspaceData.value.error = null

  try {
    // Verifier si le cache est valide
    console.log('[usePlayspaceData] Checking cache validity...')
    const cacheValid = !forceRefresh && await cache.isCacheValid(playspace.id, CACHE_MAX_AGE_HOURS)
    playspaceData.value.isCacheHit = cacheValid

    console.log(`[usePlayspaceData] Loading data for playspace: ${playspace.name} (cache: ${cacheValid ? 'HIT' : 'MISS'})`)

    // Charger en parallele (le cache sera verifie dans chaque fonction)
    const [systemRules, actions, dangers, characters] = await Promise.all([
      loadSystemRules(playspace.hackId, cacheValid),
      loadActionsData(playspace.hackId, cacheValid),
      loadDangersData(playspace.id, cacheValid),
      loadCharactersData(playspace.id, cacheValid)
    ])

    playspaceData.value.systemRules = systemRules
    playspaceData.value.actions = actions
    playspaceData.value.dangers = dangers
    playspaceData.value.characters = characters

    // Mettre a jour les metadata du cache
    await cache.saveCacheMetadata({
      playspaceId: playspace.id,
      hackId: playspace.hackId,
      lastSync: Date.now(),
      version: 1
    })

    console.log(`[usePlayspaceData] Loaded data for playspace: ${playspace.name}`)
    console.log(`  - System: ${systemRules?.name || 'N/A'}`)
    console.log(`  - Actions: ${actions.length}`)
    console.log(`  - Dangers: ${dangers.length}`)
    console.log(`  - Characters: ${characters.length}`)
  } catch (err: any) {
    playspaceData.value.error = err.message || 'Failed to load playspace data'
    console.error('[usePlayspaceData] Error loading data:', err)
  } finally {
    playspaceData.value.isLoading = false
  }
}

/**
 * Force le rechargement des donnees depuis l'API (ignore le cache)
 */
async function refreshPlayspaceData(playspace: Playspace) {
  // Nettoyer le cache du playspace
  await cache.clearPlayspaceCache(playspace.id)

  // Recharger avec forceRefresh = true
  await loadPlayspaceData(playspace, true)
}

/**
 * Ajoute un personnage au cache et a l'etat local
 */
async function addCharacterToCache(character: Character) {
  playspaceData.value.characters.push(character)
  await cache.saveCharacters([character])
  console.log(`[usePlayspaceData] Character added to cache: ${character.name}`)
}

/**
 * Met a jour un personnage dans le cache et l'etat local
 */
async function updateCharacterInCache(character: Character) {
  const index = playspaceData.value.characters.findIndex(c => c.id === character.id)
  if (index !== -1) {
    playspaceData.value.characters[index] = character
  }
  await cache.saveCharacters([character])
  console.log(`[usePlayspaceData] Character updated in cache: ${character.name}`)
}

/**
 * Supprime un personnage du cache et de l'etat local
 */
async function removeCharacterFromCache(characterId: string) {
  playspaceData.value.characters = playspaceData.value.characters.filter(c => c.id !== characterId)
  // Note: La suppression individuelle dans IndexedDB necessite une implementation specifique
  // Pour l'instant, on recharge le cache complet lors du prochain refresh
  console.log(`[usePlayspaceData] Character removed from local state: ${characterId}`)
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
  const isCacheHit = computed(() => playspaceData.value.isCacheHit)

  // Helpers
  const hasData = computed(() => playspaceData.value.playspaceId !== null)
  const characterCount = computed(() => playspaceData.value.characters.length)
  const dangerCount = computed(() => playspaceData.value.dangers.length)

  return {
    // State
    isLoading,
    error,
    hasData,
    isCacheHit,

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
    clearPlayspaceData,
    refreshPlayspaceData,

    // Character cache management
    addCharacterToCache,
    updateCharacterInCache,
    removeCharacterFromCache
  }
}
