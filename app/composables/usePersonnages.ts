interface Personnage {
  id: number
  titre: string
  systemeJeu: string
  universJeu?: string
  contenu: Record<string, any>
  statut: string
  dateModification: string
  nombreVues: number
  utilisateur?: {
    id: number
    nom: string
  }
}

interface CreatePersonnageData {
  nom: string
  systemeJeu: string
  universJeu?: string
  contenu: Record<string, any>
}

interface UpdatePersonnageData {
  nom?: string
  contenu?: Record<string, any>
  statut?: string
}

/**
 * Composable pour la gestion des personnages
 */
export const usePersonnages = () => {
  const personnages = ref<Personnage[]>([])
  const personnage = ref<Personnage | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Charge tous les personnages de l'utilisateur connecté
   */
  const chargerPersonnages = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data } = await $fetch('/api/personnages')
      personnages.value = data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des personnages'
      console.error('Erreur chargement personnages:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Charge un personnage spécifique par ID
   */
  const chargerPersonnage = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const data = await $fetch(`/api/personnages/${id}`)
      personnage.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement du personnage'
      console.error('Erreur chargement personnage:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Crée un nouveau personnage
   */
  const creerPersonnage = async (data: CreatePersonnageData): Promise<Personnage | null> => {
    try {
      loading.value = true
      error.value = null
      
      const nouveauPersonnage = await $fetch('/api/personnages', {
        method: 'POST',
        body: data
      })
      
      // Ajouter à la liste locale
      personnages.value.unshift(nouveauPersonnage)
      
      return nouveauPersonnage
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création du personnage'
      console.error('Erreur création personnage:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Met à jour un personnage existant
   */
  const mettreAJourPersonnage = async (
    id: number, 
    data: UpdatePersonnageData
  ): Promise<Personnage | null> => {
    try {
      loading.value = true
      error.value = null
      
      const personnageMisAJour = await $fetch(`/api/personnages/${id}`, {
        method: 'PUT',
        body: data
      })
      
      // Mettre à jour dans la liste locale
      const index = personnages.value.findIndex(p => p.id === id)
      if (index !== -1) {
        personnages.value[index] = personnageMisAJour
      }
      
      // Mettre à jour le personnage courant si c'est celui-ci
      if (personnage.value?.id === id) {
        personnage.value = personnageMisAJour
      }
      
      return personnageMisAJour
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour du personnage'
      console.error('Erreur mise à jour personnage:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprime un personnage
   */
  const supprimerPersonnage = async (id: number): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null
      
      await $fetch(`/api/personnages/${id}`, {
        method: 'DELETE'
      })
      
      // Supprimer de la liste locale
      personnages.value = personnages.value.filter(p => p.id !== id)
      
      // Nettoyer le personnage courant si c'est celui-ci
      if (personnage.value?.id === id) {
        personnage.value = null
      }
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression du personnage'
      console.error('Erreur suppression personnage:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Change la visibilité d'un personnage (public/privé)
   */
  const changerVisibilite = async (id: number, estPublic: boolean): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null
      
      const personnageMisAJour = await $fetch(`/api/personnages/${id}/visibilite`, {
        method: 'PATCH',
        body: { estPublic }
      })
      
      // Mettre à jour dans la liste locale
      const index = personnages.value.findIndex(p => p.id === id)
      if (index !== -1) {
        personnages.value[index] = personnageMisAJour
      }
      
      // Mettre à jour le personnage courant
      if (personnage.value?.id === id) {
        personnage.value = personnageMisAJour
      }
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du changement de visibilité'
      console.error('Erreur changement visibilité:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Recherche des personnages
   */
  const rechercherPersonnages = async (
    terme: string, 
    systemeJeu?: string
  ): Promise<Personnage[]> => {
    try {
      loading.value = true
      error.value = null
      
      const { data } = await $fetch('/api/personnages/rechercher', {
        query: {
          terme,
          systeme: systemeJeu
        }
      })
      
      return data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la recherche'
      console.error('Erreur recherche personnages:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Charge les personnages publics par système
   */
  const chargerPersonnagesPublics = async (systemeJeu: string): Promise<Personnage[]> => {
    try {
      loading.value = true
      error.value = null
      
      const { data } = await $fetch('/api/personnages/publics', {
        query: { systeme: systemeJeu }
      })
      
      return data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des personnages publics'
      console.error('Erreur chargement personnages publics:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Génère un PDF pour un personnage
   */
  const genererPdf = async (personnageData: Personnage): Promise<string | null> => {
    try {
      loading.value = true
      error.value = null
      
      const result = await $fetch('/api/pdf/generate', {
        method: 'POST',
        body: {
          type: 'CHARACTER',
          donnees: {
            titre: personnageData.titre,
            ...personnageData.contenu
          },
          systeme: personnageData.systemeJeu
        }
      })
      
      return result.downloadUrl
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la génération du PDF'
      console.error('Erreur génération PDF:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Nettoie les données
   */
  const reset = () => {
    personnages.value = []
    personnage.value = null
    error.value = null
    loading.value = false
  }

  return {
    // State
    personnages: readonly(personnages),
    personnage: readonly(personnage),
    loading: readonly(loading),
    error: readonly(error),
    
    // Actions
    chargerPersonnages,
    chargerPersonnage,
    creerPersonnage,
    mettreAJourPersonnage,
    supprimerPersonnage,
    changerVisibilite,
    rechercherPersonnages,
    chargerPersonnagesPublics,
    genererPdf,
    reset
  }
}