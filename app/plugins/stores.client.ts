export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const uiStore = useUiStore()
  const pdfStore = usePdfStore()

  try {
    uiStore.chargerPreferencesTheme()
    
    pdfStore.chargerHistorique()
    
    await authStore.initializeAuth()
    
    console.log('Stores initialized successfully')
  } catch (error) {
    console.error('Erreur initialisation stores:', error)
  }
})