import type { SystemConfig } from '~/server/config/systems'
import type { HackConfig } from '~/server/config/hacks'

interface SystemeJeu {
  id: string
  nomComplet: string
  description: string
  siteOfficiel?: string
  versionSupportee?: string
  actif: boolean
  couleurPrimaire?: string
  couleurSecondaire?: string
  pictogramme?: string
  univers?: UniversJeu[]
  config?: SystemConfig
}

interface UniversJeu {
  id: string
  nomComplet: string
  description?: string
  siteOfficiel?: string
  actif: boolean
  couleurPrimaire?: string
  couleurSecondaire?: string
  pictogramme?: string
}

interface SystemCard {
  code: string
  nom: string
  description: string
  icon: string
  classes: {
    bg: string
    border: string
    text: string
    badgeBg: string
    badgeBorder: string
  }
  univers?: Array<{
    code: string
    nom: string
    icon?: string
  }>
}

/**
 * Composable pour la gestion des systèmes de jeu
 */
export const useSystemes = () => {
  const systemes = ref<SystemeJeu[]>([])
  const systemesCards = ref<{ mainColumn: SystemCard[]; secondColumn: SystemCard[] }>({
    mainColumn: [],
    secondColumn: []
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Charge tous les systèmes disponibles
   */
  const chargerSystemes = async () => {
    try {
      loading.value = true
      error.value = null
      
      const data = await $fetch('/api/systems')
      systemes.value = data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des systèmes'
      console.error('Erreur chargement systèmes:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Charge les cartes systèmes pour l'affichage page d'accueil
   */
  const chargerSystemesCards = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data } = await $fetch('/api/systems/cards')
      systemesCards.value = data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des cartes systèmes'
      console.error('Erreur chargement cartes systèmes:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Récupère un système par son ID
   */
  const obtenirSysteme = async (id: string): Promise<SystemeJeu | null> => {
    try {
      const systeme = await $fetch(`/api/systems/${id}`)
      return systeme
    } catch (err: any) {
      console.error('Erreur récupération système:', err)
      return null
    }
  }

  /**
   * Récupère un univers par son ID
   */
  const obtenirUnivers = async (systemeId: string, universId: string): Promise<UniversJeu | null> => {
    try {
      const univers = await $fetch(`/api/systems/${systemeId}/univers/${universId}`)
      return univers
    } catch (err: any) {
      console.error('Erreur récupération univers:', err)
      return null
    }
  }

  /**
   * Obtient les couleurs pour un système donné
   */
  const getCouleursPourSysteme = (systemeId: string) => {
    const couleursSystmes: Record<string, { primary: string; secondary: string; classes: any }> = {
      mistengine: {
        primary: '#8b5cf6', // violet-500
        secondary: '#7c3aed', // violet-600
        classes: {
          bg: 'bg-violet-500/20',
          border: 'border-violet-500/30',
          text: 'text-violet-400',
          badgeBg: 'bg-violet-500/20',
          badgeBorder: 'border-violet-500/30'
        }
      }
    }

    return couleursSystmes[systemeId] || {
      primary: '#6b7280', // gray-500
      secondary: '#4b5563', // gray-600
      classes: {
        bg: 'bg-gray-500/20',
        border: 'border-gray-500/30',
        text: 'text-gray-400',
        badgeBg: 'bg-gray-500/20',
        badgeBorder: 'border-gray-500/30'
      }
    }
  }

  /**
   * Obtient l'icône pour un système donné
   */
  const getIconPourSysteme = (systemeId: string): string => {
    const icons: Record<string, string> = {
      mistengine: 'ra:ra-fog'
    }
    return icons[systemeId] || 'ra:ra-dice'
  }

  /**
   * Obtient le nom complet d'un système
   */
  const getNomCompletSysteme = (systemeId: string): string => {
    const noms: Record<string, string> = {
      mistengine: 'Mist Engine'
    }
    return noms[systemeId] || systemeId
  }

  /**
   * Vérifie si un système est supporté
   */
  const estSystemeSupporte = (systemeId: string): boolean => {
    return ['mistengine'].includes(systemeId)
  }

  /**
   * Récupère la configuration d'un type de document pour un système/univers
   */
  const obtenirConfigurationDocument = async (
    systemeId: string, 
    universId?: string, 
    typeDocument?: string
  ) => {
    try {
      const query: Record<string, string> = {}
      if (universId) query.univers = universId
      if (typeDocument) query.type = typeDocument
      
      const config = await $fetch(`/api/systems/${systemeId}/documents`, {
        query
      })
      return config
    } catch (err: any) {
      console.error('Erreur récupération configuration document:', err)
      return null
    }
  }

  /**
   * Filtre les systèmes actifs
   */
  const systemesActifs = computed(() => {
    return systemes.value.filter(s => s.actif)
  })

  /**
   * Recherche un système par nom
   */
  const rechercherSysteme = (terme: string): SystemeJeu[] => {
    const termeLower = terme.toLowerCase()
    return systemes.value.filter(s => 
      s.nomComplet.toLowerCase().includes(termeLower) ||
      s.id.toLowerCase().includes(termeLower) ||
      s.description?.toLowerCase().includes(termeLower)
    )
  }

  /**
   * Nettoie les erreurs
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Récupère la configuration programmatique d'un système
   */
  const getSystemConfig = (systemeId: string): SystemConfig | undefined => {
    const systeme = systemes.value.find(s => s.id === systemeId)
    return systeme?.config
  }

  /**
   * Récupère la configuration d'un hack
   * Note: Un hack hérite de la config de son système parent avec des overrides
   */
  const getHackConfig = async (hackId: string): Promise<HackConfig | null> => {
    try {
      const hack = await $fetch(`/api/hacks/${hackId}`)
      return hack
    } catch (err: any) {
      console.error('Erreur récupération hack:', err)
      return null
    }
  }

  /**
   * Récupère les types de thèmes pour un système
   */
  const getThemeTypes = (systemeId: string) => {
    const config = getSystemConfig(systemeId)
    return config?.themeTypes || []
  }

  /**
   * Récupère les règles de validation pour un système
   */
  const getValidationRules = (systemeId: string) => {
    const config = getSystemConfig(systemeId)
    return config?.validation
  }

  /**
   * Reset de tous les états
   */
  const reset = () => {
    systemes.value = []
    systemesCards.value = { mainColumn: [], secondColumn: [] }
    error.value = null
    loading.value = false
  }

  return {
    // State
    systemes: readonly(systemes),
    systemesCards: readonly(systemesCards),
    systemesActifs,
    loading: readonly(loading),
    error: readonly(error),
    
    // Actions
    chargerSystemes,
    chargerSystemesCards,
    obtenirSysteme,
    obtenirUnivers,
    obtenirConfigurationDocument,
    rechercherSysteme,
    
    // Utilities
    getCouleursPourSysteme,
    getIconPourSysteme,
    getNomCompletSysteme,
    estSystemeSupporte,
    getSystemConfig,
    getHackConfig,
    getThemeTypes,
    getValidationRules,
    clearError,
    reset
  }
}

// Export des types pour utilisation externe
export type { SystemeJeu, UniversJeu, SystemCard }