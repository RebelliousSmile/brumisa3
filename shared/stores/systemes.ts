import { defineStore } from 'pinia'
import type { SystemeJeu, UniversJeu, SystemCard } from '~/composables/useSystemes'

interface SystemesState {
  systemes: SystemeJeu[]
  systemesCards: { mainColumn: SystemCard[]; secondColumn: SystemCard[] }
  systemeActuel: SystemeJeu | null
  universActuel: UniversJeu | null
  isLoading: boolean
  error: string | null
}

export const useSystemesStore = defineStore('systemes', {
  state: (): SystemesState => ({
    systemes: [],
    systemesCards: { mainColumn: [], secondColumn: [] },
    systemeActuel: null,
    universActuel: null,
    isLoading: false,
    error: null
  }),

  getters: {
    systemesActifs: (state) => state.systemes.filter(s => s.actif),
    
    systemesSupportes: () => {
      const { estSystemeSupporte } = useSystemes()
      return ['monsterhearts', 'engrenages', 'metro2033', 'mistengine', 'zombiology'].filter(estSystemeSupporte)
    },

    systemeParId: (state) => (id: string) => 
      state.systemes.find(s => s.id === id),

    universParId: (state) => (systemeId: string, universId: string) => {
      const systeme = state.systemes.find(s => s.id === systemeId)
      return systeme?.univers?.find(u => u.id === universId)
    },

    nombreSystemes: (state) => state.systemes.length,
    nombreSystemesActifs: (state) => state.systemes.filter(s => s.actif).length
  },

  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    clearError() {
      this.error = null
    },

    async chargerSystemes() {
      const { chargerSystemes } = useSystemes()

      this.setLoading(true)
      this.clearError()

      try {
        await chargerSystemes()
        const { systemes } = useSystemes()
        this.systemes = systemes.value
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors du chargement des systèmes')
      } finally {
        this.setLoading(false)
      }
    },

    async chargerSystemesCards() {
      const { chargerSystemesCards } = useSystemes()

      this.setLoading(true)
      this.clearError()

      try {
        await chargerSystemesCards()
        const { systemesCards } = useSystemes()
        this.systemesCards = systemesCards.value
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors du chargement des cartes')
      } finally {
        this.setLoading(false)
      }
    },

    async obtenirSysteme(id: string) {
      const { obtenirSysteme } = useSystemes()

      this.setLoading(true)
      this.clearError()

      try {
        const systeme = await obtenirSysteme(id)
        if (systeme) {
          this.systemeActuel = systeme
        }
        return systeme
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la récupération du système')
        return null
      } finally {
        this.setLoading(false)
      }
    },

    async obtenirUnivers(systemeId: string, universId: string) {
      const { obtenirUnivers } = useSystemes()

      this.setLoading(true)
      this.clearError()

      try {
        const univers = await obtenirUnivers(systemeId, universId)
        if (univers) {
          this.universActuel = univers
        }
        return univers
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la récupération de l\'univers')
        return null
      } finally {
        this.setLoading(false)
      }
    },

    async obtenirConfigurationDocument(
      systemeId: string, 
      universId?: string, 
      typeDocument?: string
    ) {
      const { obtenirConfigurationDocument } = useSystemes()

      this.setLoading(true)
      this.clearError()

      try {
        const config = await obtenirConfigurationDocument(systemeId, universId, typeDocument)
        return config
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la récupération de la configuration')
        return null
      } finally {
        this.setLoading(false)
      }
    },

    rechercherSysteme(terme: string) {
      const { rechercherSysteme } = useSystemes()
      return rechercherSysteme(terme)
    },

    getCouleursPourSysteme(systemeId: string) {
      const { getCouleursPourSysteme } = useSystemes()
      return getCouleursPourSysteme(systemeId)
    },

    getIconPourSysteme(systemeId: string) {
      const { getIconPourSysteme } = useSystemes()
      return getIconPourSysteme(systemeId)
    },

    getNomCompletSysteme(systemeId: string) {
      const { getNomCompletSysteme } = useSystemes()
      return getNomCompletSysteme(systemeId)
    },

    estSystemeSupporte(systemeId: string) {
      const { estSystemeSupporte } = useSystemes()
      return estSystemeSupporte(systemeId)
    },

    setSystemeActuel(systeme: SystemeJeu | null) {
      this.systemeActuel = systeme
    },

    setUniversActuel(univers: UniversJeu | null) {
      this.universActuel = univers
    },

    reset() {
      this.systemes = []
      this.systemesCards = { mainColumn: [], secondColumn: [] }
      this.systemeActuel = null
      this.universActuel = null
      this.error = null
      this.isLoading = false
    }
  }
})