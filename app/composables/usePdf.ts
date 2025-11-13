interface PdfGenerationRequest {
  type: 'CHARACTER' | 'TOWN' | 'GROUP' | 'ORGANIZATION' | 'DANGER' | 'GENERIQUE'
  donnees: Record<string, any>
  systeme: string
}

interface PdfGenerationResult {
  success: boolean
  documentId: number
  downloadUrl: string
  message: string
}

/**
 * Composable pour la génération et gestion des PDFs
 */
export const usePdf = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const progress = ref(0)

  /**
   * Génère un PDF
   */
  const genererPdf = async (request: PdfGenerationRequest): Promise<PdfGenerationResult | null> => {
    try {
      loading.value = true
      error.value = null
      progress.value = 0
      
      // Simuler la progression
      const progressInterval = setInterval(() => {
        if (progress.value < 90) {
          progress.value += Math.random() * 20
        }
      }, 200)
      
      const result = await $fetch('/api/pdf/generate', {
        method: 'POST',
        body: request
      })
      
      clearInterval(progressInterval)
      progress.value = 100
      
      return result
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Erreur lors de la génération du PDF'
      console.error('Erreur génération PDF:', err)
      return null
    } finally {
      loading.value = false
      setTimeout(() => {
        progress.value = 0
      }, 1000)
    }
  }

  /**
   * Télécharge un PDF par son ID
   */
  const telechargerPdf = async (documentId: number): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(`/api/pdf/download/${documentId}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement')
      }
      
      // Créer un blob et déclencher le téléchargement
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `document-${documentId}.pdf`
      document.body.appendChild(a)
      a.click()
      
      // Nettoyer
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du téléchargement'
      console.error('Erreur téléchargement PDF:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Génère et télécharge directement un PDF (mode anonyme)
   */
  const genererEtTelecharger = async (request: PdfGenerationRequest): Promise<boolean> => {
    const result = await genererPdf(request)
    
    if (result?.success) {
      return await telechargerPdf(result.documentId)
    }
    
    return false
  }

  /**
   * Valide les données avant génération
   */
  const validerDonneesPdf = (request: PdfGenerationRequest): string[] => {
    const erreurs: string[] = []
    
    if (!request.type) {
      erreurs.push('Le type de document est requis')
    }
    
    if (!request.systeme) {
      erreurs.push('Le système de jeu est requis')
    }
    
    if (!request.donnees || Object.keys(request.donnees).length === 0) {
      erreurs.push('Les données du document sont requises')
    }
    
    // Validations spécifiques par type
    switch (request.type) {
      case 'CHARACTER':
        if (!request.donnees.nom && !request.donnees.titre) {
          erreurs.push('Le nom du personnage est requis')
        }
        break
        
      case 'ORGANIZATION':
        if (!request.donnees.nom && !request.donnees.titre) {
          erreurs.push('Le nom de l\'organisation est requis')
        }
        break
        
      case 'TOWN':
        if (!request.donnees.nom && !request.donnees.titre) {
          erreurs.push('Le nom du lieu est requis')
        }
        break
        
      default:
        if (!request.donnees.titre) {
          erreurs.push('Le titre du document est requis')
        }
    }
    
    return erreurs
  }

  /**
   * Estime la durée de génération selon la complexité
   */
  const estimerDureeGeneration = (request: PdfGenerationRequest): number => {
    let dureeEstimee = 2000 // 2 secondes de base
    
    // Ajouter du temps selon la complexité des données
    const nombreChamps = Object.keys(request.donnees).length
    dureeEstimee += nombreChamps * 100
    
    // Ajouter du temps pour certains types
    if (['ORGANIZATION', 'TOWN'].includes(request.type)) {
      dureeEstimee += 1000
    }
    
    return dureeEstimee
  }

  /**
   * Prévisualise les données qui seront dans le PDF
   */
  const previsualiserContenu = (request: PdfGenerationRequest) => {
    const contenu = {
      titre: request.donnees.titre || request.donnees.nom || 'Document sans titre',
      type: request.type,
      systeme: request.systeme,
      sections: [] as Array<{ titre: string; contenu: string }>
    }
    
    // Extraire les sections selon le type
    switch (request.type) {
      case 'CHARACTER':
        if (request.donnees.concept) {
          contenu.sections.push({ titre: 'Concept', contenu: request.donnees.concept })
        }
        if (request.donnees.description) {
          contenu.sections.push({ titre: 'Description', contenu: request.donnees.description })
        }
        if (request.donnees.caracteristiques) {
          const stats = Object.entries(request.donnees.caracteristiques)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
          contenu.sections.push({ titre: 'Caractéristiques', contenu: stats })
        }
        break
        
      case 'ORGANIZATION':
        if (request.donnees.description) {
          contenu.sections.push({ titre: 'Description', contenu: request.donnees.description })
        }
        if (request.donnees.membres) {
          const membres = Array.isArray(request.donnees.membres) 
            ? request.donnees.membres.map((m: any) => m.nom || m).join(', ')
            : request.donnees.membres
          contenu.sections.push({ titre: 'Membres', contenu: membres })
        }
        break
        
      default:
        // Contenu générique
        Object.entries(request.donnees).forEach(([key, value]) => {
          if (key !== 'titre' && typeof value === 'string' && value.length > 0) {
            contenu.sections.push({ titre: key, contenu: value })
          }
        })
    }
    
    return contenu
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
    loading.value = false
    error.value = null
    progress.value = 0
  }

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    progress: readonly(progress),
    
    // Actions
    genererPdf,
    telechargerPdf,
    genererEtTelecharger,
    validerDonneesPdf,
    estimerDureeGeneration,
    previsualiserContenu,
    clearError,
    reset
  }
}