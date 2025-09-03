import { defineStore } from 'pinia'
import type { Personnage, CreatePersonnageData, UpdatePersonnageData } from '~/composables/usePersonnages'

interface PersonnagesState {
  personnages: Personnage[]
  personnageActuel: Personnage | null
  isLoading: boolean
  error: string | null
  filtres: {
    systeme: string | null
    statut: string | null
    recherche: string
  }
}

export const usePersonnagesStore = defineStore('personnages', {
  state: (): PersonnagesState => ({
    personnages: [],
    personnageActuel: null,
    isLoading: false,
    error: null,
    filtres: {
      systeme: null,
      statut: null,
      recherche: ''
    }
  }),

  getters: {
    personnagesFiltres: (state) => {
      let personnages = [...state.personnages]

      if (state.filtres.systeme) {
        personnages = personnages.filter(p => p.systemeJeu === state.filtres.systeme)
      }

      if (state.filtres.statut) {
        personnages = personnages.filter(p => p.statut === state.filtres.statut)
      }

      if (state.filtres.recherche) {
        const terme = state.filtres.recherche.toLowerCase()
        personnages = personnages.filter(p =>
          p.titre.toLowerCase().includes(terme) ||
          JSON.stringify(p.contenu).toLowerCase().includes(terme)
        )
      }

      return personnages.sort((a, b) => 
        new Date(b.dateModification).getTime() - new Date(a.dateModification).getTime()
      )
    },

    nombrePersonnages: (state) => state.personnages.length,
    
    personnagesPublics: (state) => 
      state.personnages.filter(p => p.statut === 'PUBLIE'),
      
    personnagesBrouillon: (state) => 
      state.personnages.filter(p => p.statut === 'BROUILLON'),

    personnagesParSysteme: (state) => {
      const groupes: Record<string, Personnage[]> = {}
      
      state.personnages.forEach(personnage => {
        if (!groupes[personnage.systemeJeu]) {
          groupes[personnage.systemeJeu] = []
        }
        groupes[personnage.systemeJeu].push(personnage)
      })

      return groupes
    }
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

    setFiltres(filtres: Partial<PersonnagesState['filtres']>) {
      this.filtres = { ...this.filtres, ...filtres }
    },

    clearFiltres() {
      this.filtres = {
        systeme: null,
        statut: null,
        recherche: ''
      }
    },

    async chargerPersonnages() {
      const { chargerPersonnages } = usePersonnages()

      this.setLoading(true)
      this.clearError()

      try {
        await chargerPersonnages()
        const { personnages } = usePersonnages()
        this.personnages = personnages.value
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors du chargement')
      } finally {
        this.setLoading(false)
      }
    },

    async chargerPersonnage(id: number) {
      const { chargerPersonnage } = usePersonnages()

      this.setLoading(true)
      this.clearError()

      try {
        const personnage = await chargerPersonnage(id)
        if (personnage) {
          this.personnageActuel = personnage
        }
        return personnage
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors du chargement du personnage')
        return null
      } finally {
        this.setLoading(false)
      }
    },

    async creerPersonnage(data: CreatePersonnageData) {
      const { creerPersonnage } = usePersonnages()

      this.setLoading(true)
      this.clearError()

      try {
        const personnage = await creerPersonnage(data)
        if (personnage) {
          this.personnages.unshift(personnage)
          this.personnageActuel = personnage
        }
        return personnage
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la création')
        return null
      } finally {
        this.setLoading(false)
      }
    },

    async mettreAJourPersonnage(id: number, data: UpdatePersonnageData) {
      const { mettreAJourPersonnage } = usePersonnages()

      this.setLoading(true)
      this.clearError()

      try {
        const personnage = await mettreAJourPersonnage(id, data)
        if (personnage) {
          const index = this.personnages.findIndex(p => p.id === id)
          if (index !== -1) {
            this.personnages[index] = personnage
          }
          
          if (this.personnageActuel?.id === id) {
            this.personnageActuel = personnage
          }
        }
        return personnage
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la mise à jour')
        return null
      } finally {
        this.setLoading(false)
      }
    },

    async supprimerPersonnage(id: number) {
      const { supprimerPersonnage } = usePersonnages()

      this.setLoading(true)
      this.clearError()

      try {
        const success = await supprimerPersonnage(id)
        if (success) {
          this.personnages = this.personnages.filter(p => p.id !== id)
          
          if (this.personnageActuel?.id === id) {
            this.personnageActuel = null
          }
        }
        return success
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la suppression')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    async changerVisibilite(id: number, estPublic: boolean) {
      const { changerVisibilite } = usePersonnages()

      this.setLoading(true)
      this.clearError()

      try {
        const success = await changerVisibilite(id, estPublic)
        if (success) {
          const index = this.personnages.findIndex(p => p.id === id)
          if (index !== -1) {
            this.personnages[index].statut = estPublic ? 'PUBLIE' : 'BROUILLON'
          }
          
          if (this.personnageActuel?.id === id) {
            this.personnageActuel.statut = estPublic ? 'PUBLIE' : 'BROUILLON'
          }
        }
        return success
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors du changement de visibilité')
        return false
      } finally {
        this.setLoading(false)
      }
    },

    async rechercherPersonnages(terme: string, systemeJeu?: string) {
      const { rechercherPersonnages } = usePersonnages()

      this.setLoading(true)
      this.clearError()

      try {
        const resultats = await rechercherPersonnages(terme, systemeJeu)
        return resultats
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la recherche')
        return []
      } finally {
        this.setLoading(false)
      }
    },

    async genererPdf(personnage: Personnage) {
      const { genererPdf } = usePersonnages()

      this.setLoading(true)
      this.clearError()

      try {
        const downloadUrl = await genererPdf(personnage)
        return downloadUrl
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la génération PDF')
        return null
      } finally {
        this.setLoading(false)
      }
    },

    setPersonnageActuel(personnage: Personnage | null) {
      this.personnageActuel = personnage
    },

    reset() {
      this.personnages = []
      this.personnageActuel = null
      this.error = null
      this.isLoading = false
      this.clearFiltres()
    }
  }
})