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
      monsterhearts: {
        primary: '#ec4899', // pink-500
        secondary: '#be185d', // pink-700
        classes: {
          bg: 'bg-pink-500/20',
          border: 'border-pink-500/30',
          text: 'text-pink-400',
          badgeBg: 'bg-pink-500/20',
          badgeBorder: 'border-pink-500/30'
        }
      },
      engrenages: {
        primary: '#f59e0b', // amber-500
        secondary: '#d97706', // amber-600
        classes: {
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          badgeBg: 'bg-amber-500/20',
          badgeBorder: 'border-amber-500/30'
        }
      },
      metro2033: {
        primary: '#10b981', // emerald-500
        secondary: '#059669', // emerald-600
        classes: {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/20',
          badgeBorder: 'border-emerald-500/30'
        }
      },
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
      },
      zombiology: {
        primary: '#ef4444', // red-500
        secondary: '#dc2626', // red-600
        classes: {
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          text: 'text-red-400',
          badgeBg: 'bg-red-500/20',
          badgeBorder: 'border-red-500/30'
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
      monsterhearts: 'ra:ra-heart',
      engrenages: 'ra:ra-gear',
      metro2033: 'ra:ra-tunnel',
      mistengine: 'ra:ra-fog',
      zombiology: 'ra:ra-skull'
    }
    return icons[systemeId] || 'ra:ra-dice'
  }

  /**
   * Obtient le nom complet d'un système
   */
  const getNomCompletSysteme = (systemeId: string): string => {
    const noms: Record<string, string> = {
      monsterhearts: 'Monsterhearts',
      engrenages: 'Engrenages & Sortilèges',
      metro2033: 'Metro 2033',
      mistengine: 'Mist Engine',
      zombiology: 'Zombiology'
    }
    return noms[systemeId] || systemeId
  }

  /**
   * Vérifie si un système est supporté
   */
  const estSystemeSupporte = (systemeId: string): boolean => {
    return ['monsterhearts', 'engrenages', 'metro2033', 'mistengine', 'zombiology'].includes(systemeId)
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
    clearError,
    reset
  }
}