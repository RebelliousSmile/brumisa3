export default defineNuxtPlugin(async () => {
  // Import explicite des stores avec chemins absolus
  const { useUiStore } = await import('../../shared/stores/ui') 
  const { usePdfStore } = await import('../../shared/stores/pdf')

  try {
    const uiStore = useUiStore()
    const pdfStore = usePdfStore()
    
    uiStore.chargerPreferencesTheme()
    
    pdfStore.chargerHistorique()
    
    // Ne pas initialiser le store auth ici car il dépend de useUserSession
    // qui n'est disponible que côté client après hydratation
    
    console.log('Stores initialized successfully (auth store skipped)')
  } catch (error) {
    console.error('Erreur initialisation stores:', error)
  }
})