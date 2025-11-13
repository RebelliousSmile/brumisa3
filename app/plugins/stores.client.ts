export default defineNuxtPlugin(async () => {
  // Import explicite des stores avec chemins absolus
  const { useUiStore } = await import('../../shared/stores/ui')

  try {
    const uiStore = useUiStore()

    uiStore.chargerPreferencesTheme()

    // Ne pas initialiser le store auth ici car il dépend de useUserSession
    // qui n'est disponible que côté client après hydratation

    console.log('Stores initialized successfully (auth store skipped)')
  } catch (error) {
    console.error('Erreur initialisation stores:', error)
  }
})