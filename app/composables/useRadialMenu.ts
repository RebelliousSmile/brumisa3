/**
 * Composable useRadialMenu - Etat partage pour menu radial playspace
 *
 * Features:
 * - Etat global du menu radial playspace
 * - Gestion keyboard navigation globale (Escape pour fermer)
 *
 * Usage:
 * ```ts
 * const { isOpen, open, close, toggle } = useRadialMenu()
 * ```
 */

interface RadialMenuState {
  isOpen: boolean
  lastOpenedAt: Date | null
}

// Global state (shared across components)
const state = ref<RadialMenuState>({
  isOpen: false,
  lastOpenedAt: null
})

export const useRadialMenu = () => {
  /**
   * Ouvre le menu radial playspace
   */
  const open = () => {
    if (state.value.isOpen) return
    state.value.isOpen = true
    state.value.lastOpenedAt = new Date()
  }

  /**
   * Ferme le menu radial
   */
  const close = () => {
    if (!state.value.isOpen) return
    state.value.isOpen = false
  }

  /**
   * Toggle le menu (ouvre si ferme, ferme si ouvert)
   */
  const toggle = () => {
    if (state.value.isOpen) {
      close()
    } else {
      open()
    }
  }

  /**
   * Computed: Est-ce que le menu est ouvert
   */
  const isOpen = computed(() => state.value.isOpen)

  /**
   * Ferme le menu quand Escape est presse (global handler)
   */
  const handleGlobalKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen.value) {
      close()
      event.preventDefault()
      event.stopPropagation()
    }
  }

  // Setup global keyboard handler on mount
  onMounted(() => {
    document.addEventListener('keydown', handleGlobalKeydown, { capture: true })
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleGlobalKeydown, { capture: true })
  })

  return {
    isOpen: readonly(isOpen),
    open,
    close,
    toggle
  }
}
