<script setup lang="ts">
/**
 * Indicateur de pips (points de progression) pour LITM
 *
 * Affiche une barre de pips cliquables avec labels optionnels
 * Utilisé pour les quêtes, trackers, etc.
 */

export interface PipIndicatorProps {
  current: number
  max?: number
  editable?: boolean
  labels?: Record<number, string>
  showPercentage?: boolean
}

const props = withDefaults(defineProps<PipIndicatorProps>(), {
  max: 4,
  editable: false,
  showPercentage: false,
})

const emit = defineEmits<{
  'update:current': [value: number]
}>()

const { pips, setPips, getLabel, percentage } = usePips({
  initialValue: props.current,
  max: props.max,
  labels: props.labels,
})

// Synchroniser avec le prop
watch(() => props.current, (newValue) => {
  if (newValue !== pips.value) {
    setPips(newValue)
  }
})

// Émettre les changements
watch(pips, (newValue) => {
  emit('update:current', newValue)
})

const handlePipClick = (index: number) => {
  if (props.editable) {
    // Si on clique sur un pip actif, on désactive jusqu'à ce pip
    // Si on clique sur un pip inactif, on active jusqu'à ce pip
    const newValue = index + 1
    if (newValue === pips.value) {
      // Si on clique sur le dernier pip actif, on décrémente
      setPips(Math.max(0, pips.value - 1))
    } else {
      setPips(newValue)
    }
  }
}

const getPipState = (index: number): 'active' | 'inactive' => {
  return index < pips.value ? 'active' : 'inactive'
}

const pipStateClasses = (state: 'active' | 'inactive') => {
  return state === 'active'
    ? 'bg-blue-600 border-blue-700'
    : 'bg-gray-200 border-gray-300'
}
</script>

<template>
  <div class="pip-indicator flex flex-col gap-2">
    <!-- Pips -->
    <div class="flex items-center gap-1">
      <button
        v-for="index in max"
        :key="index"
        type="button"
        :disabled="!editable"
        :class="[
          'pip w-8 h-8 rounded-full border-2 transition-all',
          pipStateClasses(getPipState(index - 1)),
          editable && 'cursor-pointer hover:scale-110',
          !editable && 'cursor-default',
        ]"
        @click="handlePipClick(index - 1)"
      >
        <span class="sr-only">Pip {{ index }}</span>
      </button>
    </div>

    <!-- Label ou pourcentage -->
    <div v-if="showPercentage || getLabel()" class="text-sm text-gray-600">
      <span v-if="showPercentage">{{ percentage }}%</span>
      <span v-else>{{ getLabel() }}</span>
    </div>
  </div>
</template>

<style scoped>
.pip {
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.pip:active {
  transform: scale(0.95);
}
</style>
