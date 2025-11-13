/**
 * Composable useRadialMenu - État partagé pour menus radiaux
 *
 * Features:
 * - État global partagé entre RadialPlayspaceMenu et RadialActionMenu
 * - Ferme automatiquement l'autre menu quand l'un s'ouvre (UX)
 * - Gestion keyboard navigation globale
 * - Tracking analytics (ouverture/fermeture menus)
 *
 * Usage:
 * ```ts
 * const { openMenu, closeMenu, isMenuOpen, activeMenu } = useRadialMenu()
 *
 * openMenu('playspace') // Ouvre playspace, ferme action
 * closeMenu() // Ferme tous les menus
 * isMenuOpen('playspace') // true si playspace ouvert
 * ```
 */

type MenuType = 'playspace' | 'action'

interface RadialMenuState {
  activeMenu: MenuType | null
  lastOpenedAt: Date | null
}

// Global state (shared across components)
const state = ref<RadialMenuState>({
  activeMenu: null,
  lastOpenedAt: null
})

export const useRadialMenu = () => {
  /**
   * Ouvre un menu radial (ferme l'autre automatiquement)
   */
  const openMenu = (menuType: MenuType) => {
    if (state.value.activeMenu === menuType) {
      // Already open, do nothing
      return
    }

    // Close other menu and open requested one
    state.value.activeMenu = menuType
    state.value.lastOpenedAt = new Date()

    // TODO: Track analytics
    // useAnalytics().track('radial_menu_opened', { menuType })
  }

  /**
   * Ferme tous les menus radiaux
   */
  const closeMenu = () => {
    if (!state.value.activeMenu) {
      return
    }

    const previousMenu = state.value.activeMenu
    state.value.activeMenu = null

    // TODO: Track analytics (calculate time open)
    // const timeOpen = Date.now() - state.value.lastOpenedAt.getTime()
    // useAnalytics().track('radial_menu_closed', { menuType: previousMenu, timeOpen })
  }

  /**
   * Toggle un menu (ouvre si fermé, ferme si ouvert)
   */
  const toggleMenu = (menuType: MenuType) => {
    if (state.value.activeMenu === menuType) {
      closeMenu()
    } else {
      openMenu(menuType)
    }
  }

  /**
   * Vérifie si un menu spécifique est ouvert
   */
  const isMenuOpen = (menuType: MenuType): boolean => {
    return state.value.activeMenu === menuType
  }

  /**
   * Computed: Est-ce qu'un menu est ouvert (peu importe lequel)
   */
  const isAnyMenuOpen = computed(() => state.value.activeMenu !== null)

  /**
   * Computed: Menu actif
   */
  const activeMenu = computed(() => state.value.activeMenu)

  /**
   * Ferme les menus quand Escape est pressé (global handler)
   */
  const handleGlobalKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isAnyMenuOpen.value) {
      closeMenu()
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
    // State
    activeMenu: readonly(activeMenu),
    isAnyMenuOpen: readonly(isAnyMenuOpen),

    // Methods
    openMenu,
    closeMenu,
    toggleMenu,
    isMenuOpen
  }
}
