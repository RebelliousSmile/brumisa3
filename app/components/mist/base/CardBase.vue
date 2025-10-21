<script setup lang="ts">
/**
 * Composant de base pour toutes les cartes LITM
 *
 * Fournit un wrapper réutilisable avec:
 * - En-tête avec titre/sous-titre
 * - Contenu principal via slot
 * - Actions via slot
 * - Support du mode flip (optionnel)
 */

export interface CardBaseProps {
  title?: string
  subtitle?: string
  flippable?: boolean
  elevation?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<CardBaseProps>(), {
  flippable: false,
  elevation: 'md',
})

const isFlipped = ref(false)

const toggleFlip = () => {
  if (props.flippable) {
    isFlipped.value = !isFlipped.value
  }
}

const elevationClasses = computed(() => {
  const elevations = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  }
  return elevations[props.elevation]
})
</script>

<template>
  <div
    :class="[
      'litm-card',
      'bg-white rounded-lg border border-gray-200',
      'overflow-hidden',
      elevationClasses,
      flippable && 'cursor-pointer',
    ]"
    @click="flippable ? toggleFlip() : undefined"
  >
    <!-- En-tête -->
    <div
      v-if="title || subtitle || $slots.header"
      class="border-b border-gray-200 bg-gray-50 px-4 py-3"
    >
      <slot name="header">
        <h3 v-if="title" class="text-lg font-semibold text-gray-900">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="text-sm text-gray-600">
          {{ subtitle }}
        </p>
      </slot>
    </div>

    <!-- Contenu principal -->
    <div class="p-4">
      <div v-if="!isFlipped">
        <slot name="front">
          <slot />
        </slot>
      </div>

      <div v-else>
        <slot name="back">
          <p class="text-gray-500 italic">Verso de la carte</p>
        </slot>
      </div>
    </div>

    <!-- Actions -->
    <div
      v-if="$slots.actions"
      class="border-t border-gray-200 bg-gray-50 px-4 py-3"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.litm-card {
  transition: all 0.3s ease;
}

.litm-card:hover {
  transform: translateY(-2px);
}
</style>
