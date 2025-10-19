<script setup lang="ts">
/**
 * Toggle pour activer/désactiver le mode édition global LITM
 *
 * Utilise le composable useEditMode pour partager l'état entre tous les composants
 */

export interface EditModeToggleProps {
  showLabel?: boolean
}

const props = withDefaults(defineProps<EditModeToggleProps>(), {
  showLabel: true,
})

const { isEditMode, toggleEditMode } = useEditMode()
</script>

<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center gap-2 px-3 py-2 rounded-md',
      'border transition-all duration-200',
      isEditMode
        ? 'bg-blue-600 text-white border-blue-700'
        : 'bg-gray-100 text-gray-700 border-gray-300',
      'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500',
    ]"
    @click="toggleEditMode"
  >
    <!-- Icône -->
    <svg
      class="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        v-if="isEditMode"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
      <path
        v-else
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>

    <!-- Label -->
    <span v-if="showLabel" class="text-sm font-medium">
      {{ isEditMode ? 'Mode Lecture' : 'Mode Edition' }}
    </span>
  </button>
</template>
