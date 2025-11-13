import { ref, computed } from 'vue'

/**
 * Composable pour gérer le mode édition global LITM
 *
 * Permet de basculer entre mode lecture et édition pour tous les composants LITM.
 * L'état est partagé entre tous les composants utilisant ce composable.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { isEditMode, toggleEditMode, setEditMode } = useEditMode()
 * </script>
 *
 * <template>
 *   <button @click="toggleEditMode">
 *     {{ isEditMode ? 'Lecture' : 'Edition' }}
 *   </button>
 * </template>
 * ```
 */

const editModeState = ref(false)

export const useEditMode = () => {
  /**
   * État du mode édition (partagé globalement)
   */
  const isEditMode = computed(() => editModeState.value)

  /**
   * Active ou désactive le mode édition
   */
  const setEditMode = (value: boolean) => {
    editModeState.value = value

    // Sauvegarder la préférence dans localStorage
    if (import.meta.client) {
      try {
        localStorage.setItem('litm:editMode', JSON.stringify(value))
      } catch (error) {
        console.warn('Failed to save edit mode preference:', error)
      }
    }
  }

  /**
   * Bascule entre mode lecture et édition
   */
  const toggleEditMode = () => {
    setEditMode(!editModeState.value)
  }

  /**
   * Charge la préférence depuis localStorage au montage
   */
  const loadEditModePreference = () => {
    if (import.meta.client) {
      try {
        const saved = localStorage.getItem('litm:editMode')
        if (saved !== null) {
          editModeState.value = JSON.parse(saved)
        }
      } catch (error) {
        console.warn('Failed to load edit mode preference:', error)
      }
    }
  }

  // Charger la préférence au premier appel
  if (import.meta.client && !editModeState.value) {
    loadEditModePreference()
  }

  return {
    isEditMode,
    setEditMode,
    toggleEditMode,
    loadEditModePreference,
  }
}
