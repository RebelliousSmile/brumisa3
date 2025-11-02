<template>
  <div
    class="character-card"
    :class="{ 'active': isActive }"
    @click="$emit('select')"
  >
    <!-- Header -->
    <div class="card-header">
      <h3 class="font-bold text-lg">{{ character.name }}</h3>
      <span v-if="character._count" class="badge">
        {{ character._count.themeCards }} theme cards
      </span>
    </div>

    <!-- Description -->
    <p v-if="character.description" class="text-sm text-gray-600 mb-3">
      {{ character.description }}
    </p>

    <!-- Meta info -->
    <div class="text-xs text-gray-500">
      Created {{ formatDate(character.createdAt) }}
    </div>

    <!-- Actions -->
    <div class="card-actions">
      <button class="btn-sm btn-secondary" @click.stop="$emit('edit')">
        Edit
      </button>
      <button class="btn-sm btn-danger" @click.stop="$emit('delete')">
        Delete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '~/shared/stores/character'

defineProps<{
  character: Character
  isActive: boolean
}>()

defineEmits<{
  select: []
  edit: []
  delete: []
}>()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.character-card {
  @apply border rounded-lg p-4 cursor-pointer hover:shadow-lg transition;
  @apply bg-white border-gray-200;
}

.character-card.active {
  @apply border-blue-500 bg-blue-50;
}

.card-header {
  @apply flex justify-between items-start mb-3;
}

.badge {
  @apply px-2 py-1 rounded text-xs bg-gray-100 text-gray-700;
}

.card-actions {
  @apply flex gap-2 mt-4 pt-3 border-t border-gray-200;
}

.btn-sm {
  @apply px-3 py-1 rounded text-sm transition;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}

.btn-danger {
  @apply bg-red-100 text-red-700 hover:bg-red-200;
}
</style>
