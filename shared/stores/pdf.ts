import { defineStore } from 'pinia'
import type { PdfGenerationRequest, PdfGenerationResult } from '~/composables/usePdf'

interface PdfState {
  isGenerating: boolean
  progress: number
  error: string | null
  historique: Array<{
    id: string
    titre: string
    type: string
    systeme: string
    dateGeneration: Date
    downloadUrl?: string
  }>
  resultatsRecents: PdfGenerationResult[]
}

export const usePdfStore = defineStore('pdf', {
  state: (): PdfState => ({
    isGenerating: false,
    progress: 0,
    error: null,
    historique: [],
    resultatsRecents: []
  }),

  getters: {
    peutGenerer: (state) => !state.isGenerating,
    
    historiqueParType: (state) => {
      const groupes: Record<string, PdfState['historique']> = {}
      
      state.historique.forEach(item => {
        if (!groupes[item.type]) {
          groupes[item.type] = []
        }
        groupes[item.type].push(item)
      })

      return groupes
    },

    historiqueRecent: (state) => 
      [...state.historique]
        .sort((a, b) => b.dateGeneration.getTime() - a.dateGeneration.getTime())
        .slice(0, 10),

    nombreGenerations: (state) => state.historique.length,
    
    dernierResultat: (state) => 
      state.resultatsRecents.length > 0 ? state.resultatsRecents[0] : null
  },

  actions: {
    setGenerating(generating: boolean) {
      this.isGenerating = generating
    },

    setProgress(progress: number) {
      this.progress = Math.max(0, Math.min(100, progress))
    },

    setError(error: string | null) {
      this.error = error
    },

    clearError() {
      this.error = null
    },

    async genererPdf(request: PdfGenerationRequest) {
      const { genererPdf, validerDonneesPdf } = usePdf()

      this.setGenerating(true)
      this.setProgress(0)
      this.clearError()

      try {
        const erreurs = validerDonneesPdf(request)
        if (erreurs.length > 0) {
          throw new Error(erreurs.join(', '))
        }

        const result = await genererPdf(request)
        
        if (result?.success) {
          this.ajouterAHistorique({
            id: result.documentId.toString(),
            titre: request.donnees.titre || request.donnees.nom || 'Document sans titre',
            type: request.type,
            systeme: request.systeme,
            dateGeneration: new Date(),
            downloadUrl: result.downloadUrl
          })

          this.resultatsRecents.unshift(result)
          if (this.resultatsRecents.length > 20) {
            this.resultatsRecents = this.resultatsRecents.slice(0, 20)
          }
        }

        return result
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la génération')
        return null
      } finally {
        this.setGenerating(false)
        setTimeout(() => {
          this.setProgress(0)
        }, 1000)
      }
    },

    async telechargerPdf(documentId: number) {
      const { telechargerPdf } = usePdf()

      this.clearError()

      try {
        const success = await telechargerPdf(documentId)
        
        if (success) {
          const item = this.historique.find(h => h.id === documentId.toString())
          if (item) {
            item.dateGeneration = new Date()
          }
        }

        return success
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors du téléchargement')
        return false
      }
    },

    async genererEtTelecharger(request: PdfGenerationRequest) {
      const { genererEtTelecharger } = usePdf()

      this.setGenerating(true)
      this.setProgress(0)
      this.clearError()

      try {
        const success = await genererEtTelecharger(request)
        
        if (success) {
          this.ajouterAHistorique({
            id: `temp-${Date.now()}`,
            titre: request.donnees.titre || request.donnees.nom || 'Document sans titre',
            type: request.type,
            systeme: request.systeme,
            dateGeneration: new Date()
          })
        }

        return success
      } catch (err: any) {
        this.setError(err.message || 'Erreur lors de la génération et téléchargement')
        return false
      } finally {
        this.setGenerating(false)
        setTimeout(() => {
          this.setProgress(0)
        }, 1000)
      }
    },

    previsualiserContenu(request: PdfGenerationRequest) {
      const { previsualiserContenu } = usePdf()
      return previsualiserContenu(request)
    },

    estimerDureeGeneration(request: PdfGenerationRequest) {
      const { estimerDureeGeneration } = usePdf()
      return estimerDureeGeneration(request)
    },

    ajouterAHistorique(item: PdfState['historique'][0]) {
      this.historique.unshift(item)
      
      if (this.historique.length > 100) {
        this.historique = this.historique.slice(0, 100)
      }
      
      this.sauvegarderHistorique()
    },

    supprimerDeHistorique(id: string) {
      this.historique = this.historique.filter(h => h.id !== id)
      this.sauvegarderHistorique()
    },

    viderHistorique() {
      this.historique = []
      this.resultatsRecents = []
      this.sauvegarderHistorique()
    },

    chargerHistorique() {
      if (process.client) {
        try {
          const historique = localStorage.getItem('pdf-historique')
          if (historique) {
            const data = JSON.parse(historique)
            this.historique = data.map((item: any) => ({
              ...item,
              dateGeneration: new Date(item.dateGeneration)
            }))
          }
        } catch (err) {
          console.warn('Erreur lors du chargement de l\'historique:', err)
        }
      }
    },

    sauvegarderHistorique() {
      if (process.client) {
        try {
          localStorage.setItem('pdf-historique', JSON.stringify(this.historique))
        } catch (err) {
          console.warn('Erreur lors de la sauvegarde de l\'historique:', err)
        }
      }
    },

    reset() {
      this.isGenerating = false
      this.progress = 0
      this.error = null
      this.historique = []
      this.resultatsRecents = []
    }
  }
})