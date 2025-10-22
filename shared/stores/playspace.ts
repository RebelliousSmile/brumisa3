import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Playspace {
  id: string
  nom: string
  systeme: 'Mist Engine' | 'City of Mist'
  hack: 'LITM' | 'Otherscape' | 'Custom'
  univers: string
  role: 'MJ' | 'PJ'
  actif: boolean
  dateCreation: string
  dateModification: string
}

export const usePlayspaceStore = defineStore('playspace', () => {
  // State
  const playspaces = ref<Playspace[]>([])
  const activePlayspaceId = ref<string | null>(null)

  // Getters
  const activePlayspace = computed(() => {
    if (!activePlayspaceId.value) return null
    return playspaces.value.find(p => p.id === activePlayspaceId.value) || null
  })

  const hasPlayspaces = computed(() => playspaces.value.length > 0)

  const isMJ = computed(() => activePlayspace.value?.role === 'MJ')

  // Actions
  function setActivePlayspace(id: string) {
    activePlayspaceId.value = id
  }

  function addPlayspace(playspace: Playspace) {
    playspaces.value.push(playspace)
    if (playspaces.value.length === 1) {
      setActivePlayspace(playspace.id)
    }
  }

  function removePlayspace(id: string) {
    const index = playspaces.value.findIndex(p => p.id === id)
    if (index !== -1) {
      playspaces.value.splice(index, 1)
      if (activePlayspaceId.value === id) {
        activePlayspaceId.value = playspaces.value.length > 0 ? playspaces.value[0].id : null
      }
    }
  }

  // TODO: Implémenter la persistance (localStorage pour guest, API pour authentifié)
  function loadPlayspaces() {
    // Mock data pour test
    // En production, charger depuis localStorage ou API
  }

  return {
    playspaces,
    activePlayspaceId,
    activePlayspace,
    hasPlayspaces,
    isMJ,
    setActivePlayspace,
    addPlayspace,
    removePlayspace,
    loadPlayspaces
  }
})
