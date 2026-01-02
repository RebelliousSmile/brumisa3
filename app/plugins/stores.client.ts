export default defineNuxtPlugin(async () => {
  // Import explicite des stores et composables
  const { useUiStore } = await import('../../shared/stores/ui')
  const { usePlayspaceStore } = await import('../../shared/stores/playspace')
  const { usePlayspaceData } = await import('../../shared/composables/usePlayspaceData')

  try {
    const uiStore = useUiStore()
    const playspaceStore = usePlayspaceStore()
    const { loadPlayspaceData, clearPlayspaceData } = usePlayspaceData()

    uiStore.chargerPreferencesTheme()

    // Initialiser le playspace store (charge les playspaces locaux et l'ID actif)
    playspaceStore.init()

    // Charger les donnees du playspace actif automatiquement
    playspaceStore.onPlayspaceChange(async (playspace) => {
      if (playspace) {
        console.log(`[Plugin] Loading data for playspace: ${playspace.name}`)
        try {
          await loadPlayspaceData(playspace)
          console.log('[Plugin] Playspace data loaded successfully')
        } catch (err) {
          console.error('[Plugin] Error loading playspace data:', err)
        }
      } else {
        console.log('[Plugin] No active playspace, clearing data')
        clearPlayspaceData()
      }
    })

    // Ne pas initialiser le store auth ici car il depend de useUserSession
    // qui n'est disponible que cote client apres hydratation

    console.log('[Plugin] Stores initialized: UI + Playspace')
  } catch (error) {
    console.error('[Plugin] Erreur initialisation stores:', error)
  }
})