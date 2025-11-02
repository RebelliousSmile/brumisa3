<template>
  <div class="theme-card-list">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold">Theme Cards</h3>
      <button
        v-if="canAddCard"
        class="btn-primary btn-sm"
        @click="$emit('add')"
      >
        Add Theme Card
      </button>
      <span v-else class="text-xs text-red-500">
        Max {{ maxCards }} cards reached
      </span>
    </div>

    <!-- Empty State -->
    <div v-if="!themeCards || themeCards.length === 0" class="text-center py-8 border-2 border-dashed border-gray-300 rounded">
      <p class="text-gray-500 mb-2">No theme cards yet</p>
      <button class="btn-primary btn-sm" @click="$emit('add')">
        Add First Theme Card
      </button>
    </div>

    <!-- Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ThemeCard
        v-for="card in themeCards"
        :key="card.id"
        :theme-card="card"
        @edit="$emit('edit', card)"
        @delete="$emit('delete', card)"
      />
    </div>

    <!-- Counter -->
    <p class="text-xs text-gray-500 mt-2">
      {{ themeCards?.length || 0 }} / {{ maxCards }} theme cards
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ThemeCard } from '~/shared/stores/character'
import { getHackRules } from '#shared/config/systems.config'

const props = defineProps<{
  themeCards?: ThemeCard[]
  hackId: string
}>()

defineEmits<{
  add: []
  edit: [card: ThemeCard]
  delete: [card: ThemeCard]
}>()

// Max cards selon hackId
const maxCards = computed(() => {
  const rules = getHackRules(props.hackId)
  return rules?.themeCardsRange.max || 4
})

const canAddCard = computed(() => {
  return (props.themeCards?.length || 0) < maxCards.value
})
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition;
}

.btn-sm {
  @apply px-3 py-1 text-sm;
}
</style>
